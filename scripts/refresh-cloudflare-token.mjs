import { appendFileSync } from 'node:fs';

const workerUrl = 'https://halalniaga-admin.wm-mustaffa.workers.dev';
const ciToken = process.env.ADMIN_CI_TOKEN;

if (!ciToken) {
  console.error('ADMIN_CI_TOKEN is missing.');
  process.exit(1);
}

const response = await fetch(`${workerUrl}/api/cloudflare-token`, {
  method: 'POST',
  headers: { 'X-CI-Token': ciToken },
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
