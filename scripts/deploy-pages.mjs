import { spawnSync } from 'node:child_process';

// Cloudflare Pages cannot select an account from a Pages config file, and this
// machine has more than one account. Pinning it here keeps `npm run deploy`
// non-interactive while leaving wrangler.jsonc to the Workers fallback.
process.env.CLOUDFLARE_ACCOUNT_ID ||= '42e6d6fbb5199a87cbf2d8c077395d6e';

const result = spawnSync(
  'npx',
  [
    'wrangler',
    'pages',
    'deploy',
    'dist',
    '--project-name',
    'halalniaga',
    '--branch',
    'main',
    '--commit-dirty=true',
  ],
  { stdio: 'inherit', shell: true },
);

process.exit(result.status ?? 1);
