import { mkdir, readFile } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const jobs = [
  { source: 'public/favicon.svg', out: 'public/icons/icon-192.png', size: 192 },
  { source: 'public/favicon.svg', out: 'public/icons/icon-512.png', size: 512 },
  { source: 'public/icons/maskable.svg', out: 'public/icons/maskable-512.png', size: 512 },
  { source: 'public/icons/maskable.svg', out: 'public/icons/apple-touch-icon.png', size: 180 },
];

await mkdir('public/icons', { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});

for (const job of jobs) {
  const svg = await readFile(job.source, 'utf8');
  const page = await browser.newPage({
    viewport: { width: job.size, height: job.size },
    deviceScaleFactor: 1,
  });
  await page.setContent(
    `<style>html,body{margin:0;padding:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`,
  );
  await page.screenshot({
    path: job.out,
    omitBackground: true,
  });
  await page.close();
  console.log(`created ${job.out} (${job.size}x${job.size})`);
}

await browser.close();
