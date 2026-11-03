import { chromium } from 'playwright-core';
import { pathToFileURL } from 'node:url';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
});
await page.goto(
  pathToFileURL('docs/og-source.html').href,
  { waitUntil: 'networkidle' },
);
await page.evaluate(async () => {
  await document.fonts.ready;
});
await page.waitForTimeout(600);
await page.screenshot({ path: 'public/og.png' });
await browser.close();
console.log('Created public/og.png (1200x630).');
