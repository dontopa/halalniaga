import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright-core';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const OUT = 'docs/screenshots';

const noMotion = `
  *, *::before, *::after { animation: none !important; transition: none !important; }
  .reveal { opacity: 1 !important; transform: none !important; }
`;

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({
  executablePath: CHROME,
  headless: true,
});

const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
});

const errors = [];
page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

const shot = async (
  name,
  path,
  { fullPage = false, scrollTo = null, viewport = null } = {},
) => {
  if (viewport) await page.setViewportSize(viewport);
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: noMotion });
  if (scrollTo) {
    await page.evaluate((selector) => {
      document.querySelector(selector)?.scrollIntoView({ block: 'start' });
    }, scrollTo);
    await page.waitForTimeout(350);
  }
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage });
  console.log(`saved ${name}.png`);
};

await shot('landing-hero', '/');
await shot('landing-modules', '/', { scrollTo: '#modules' });
await shot('landing-trust', '/', { scrollTo: '#trust' });
await shot('landing-pilot', '/', { scrollTo: '#pilot' });
await shot('landing-full', '/', { fullPage: true });
await shot('signin', '/signin');
await shot('app-dashboard', '/app');
await shot('app-suppliers', '/app/suppliers');
await shot('app-academy', '/app/academy');
await shot('app-purchases', '/app/purchases');
await shot('app-assessment', '/app/assessment');
await shot('app-verification', '/app/verification');
await shot('app-monitoring', '/app/monitoring');
await shot('app-community', '/app/community');
await shot('app-scanner', '/app/scanner');
await shot('app-mentor', '/app/mentor');
await shot('public-vendor', '/vendor/dapur-kak-nur');

await shot('mobile-landing', '/', { viewport: { width: 390, height: 844 } });
await shot('mobile-dashboard', '/app', { viewport: { width: 390, height: 844 } });

await browser.close();

if (errors.length) {
  console.log('\nBrowser issues:');
  for (const error of [...new Set(errors)]) console.log(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log('\nNo console or page errors.');
}
