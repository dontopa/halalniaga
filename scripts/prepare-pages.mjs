import { mkdir, writeFile } from 'node:fs/promises';

// Cloudflare Pages needs an explicit SPA fallback. Workers static assets use
// not_found_handling in wrangler.jsonc instead and reject this file, so it is
// written into the build output only for the Pages deployment path.
await mkdir('dist', { recursive: true });
await writeFile('dist/_redirects', '/*    /index.html    200\n', 'utf8');
console.log('Wrote dist/_redirects for the Cloudflare Pages SPA fallback.');
