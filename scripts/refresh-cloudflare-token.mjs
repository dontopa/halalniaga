import { appendFileSync } from 'node:fs';

const clientId = '54d11594-84e4-41aa-b438-e81b8fa78ee7';
const refreshToken = process.env.CLOUDFLARE_REFRESH_TOKEN;

if (!refreshToken) {
  console.error('CLOUDFLARE_REFRESH_TOKEN is missing.');
  process.exit(1);
}

const response = await fetch('https://dash.cloudflare.com/oauth2/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: clientId,
    refresh_token: refreshToken,
  }),
});

const data = await response.json().catch(() => ({}));
if (!response.ok || !data.access_token) {
  console.error('Cloudflare token refresh failed:', response.status, data.error ?? '');
  process.exit(1);
}

console.log(`::add-mask::${data.access_token}`);
appendFileSync(
  process.env.GITHUB_ENV,
  `CLOUDFLARE_API_TOKEN=${data.access_token}\n`,
);
console.log('Cloudflare access token refreshed for this run.');
