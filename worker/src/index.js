const REPO = 'dontopa/halalniaga';
const BRANCH = 'main';
const FILES = new Set(['site', 'vendor', 'suppliers', 'products']);
const DEFAULT_ORIGINS = [
  'https://halalniaga.pages.dev',
  'http://localhost:5173',
  'http://127.0.0.1:4173',
];

const corsHeaders = (request, env) => {
  const allowed = (env.ALLOWED_ORIGINS ?? DEFAULT_ORIGINS.join(','))
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': allowed.includes(origin) ? origin : allowed[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
};

const json = (data, status, headers) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' },
  });

const safeEqual = (a, b) => {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
};

const readJson = async (request) => {
  const text = await request.text();
  if (text.length > 250_000) {
    throw new Error('Request body is too large.');
  }
  return JSON.parse(text);
};

const githubHeaders = (env) => ({
  Authorization: `Bearer ${env.GITHUB_TOKEN}`,
  Accept: 'application/vnd.github+json',
  'User-Agent': 'HALALNiaga-Admin',
  'X-GitHub-Api-Version': '2022-11-28',
});

const commitFile = async (env, file, content) => {
  const path = `src/content/${file}.json`;
  const apiUrl = `https://api.github.com/repos/${REPO}/contents/${path}`;
  const headers = githubHeaders(env);

  const current = await fetch(`${apiUrl}?ref=${BRANCH}`, { headers });
  let sha;
  if (current.status === 200) {
    const data = await current.json();
    sha = data.sha;
  } else if (current.status !== 404) {
    const detail = await current.text();
    throw new Error(`GitHub read failed (${current.status}): ${detail.slice(0, 200)}`);
  }

  const jsonText = `${JSON.stringify(content, null, 2)}\n`;
  const bytes = new TextEncoder().encode(jsonText);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  const base64 = btoa(binary);

  const body = {
    message: `content: update ${file} via admin`,
    content: base64,
    branch: BRANCH,
    ...(sha ? { sha } : {}),
  };

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`GitHub write failed (${response.status}): ${detail.slice(0, 300)}`);
  }

  const result = await response.json();
  return result.commit?.sha ?? null;
};

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    const url = new URL(request.url);

    if (url.pathname === '/health') {
      return json({ ok: true, service: 'halalniaga-admin' }, 200, cors);
    }

    if (url.pathname === '/api/verify' && request.method === 'POST') {
      let body;
      try {
        body = await readJson(request);
      } catch {
        return json({ error: 'Invalid request.' }, 400, cors);
      }
      if (!safeEqual(body.pin, env.ADMIN_PIN)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return json({ error: 'PIN tidak sah.' }, 401, cors);
      }
      return json({ ok: true }, 200, cors);
    }

    if (url.pathname === '/api/save' && request.method === 'POST') {
      let body;
      try {
        body = await readJson(request);
      } catch {
        return json({ error: 'Invalid request.' }, 400, cors);
      }

      if (!safeEqual(body.pin, env.ADMIN_PIN)) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return json({ error: 'PIN tidak sah.' }, 401, cors);
      }

      if (!FILES.has(body.file)) {
        return json({ error: 'Fail tidak dibenarkan.' }, 400, cors);
      }

      if (!body.content || typeof body.content !== 'object') {
        return json({ error: 'Kandungan tidak sah.' }, 400, cors);
      }

      try {
        const commit = await commitFile(env, body.file, body.content);
        return json({ ok: true, file: body.file, commit }, 200, cors);
      } catch (error) {
        console.error(error);
        return json(
          { error: 'Gagal menyimpan. Sila cuba lagi atau hubungi developer.' },
          502,
          cors,
        );
      }
    }

    return json({ error: 'Not found.' }, 404, cors);
  },
};
