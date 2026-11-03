import { chromium } from 'playwright-core';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const routes = ['/','/signin','/vendor/dapur-kak-nur','/credits','/admin','/admin/guide','/app','/app/suppliers','/app/purchases','/app/academy','/app/assessment','/app/verification','/app/monitoring','/app/community','/app/scanner','/app/starter-kit','/app/mentor'];
const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const STOP = /\b(the|and|with|your|you|from|this|that|these|those|is|are|was|were|will|would|should|could|has|have|had|not|for|of|to|in|on|at|by|or|if|but|all|can|any|more|most|only|also|when|what|which|who|how|why|days?|ago|left|due)\b/gi;
const ALLOW = [/HALALNiaga/,/JAKIM/,/CC BY/,/Wikimedia/,/Creative Commons/,/https?:/,/Kota Kinabalu/,/Sandakan/,/Tawau/,/Keningau/,/Lahad Datu/,/Tanjung Aru/,/Gaya Street/,/Sepanggar/,/Likas/,/Api-Api/,/Inanam/,/Kolombong/,/Putatan/,/Papar/,/^Lot \d/,/^Block /, /^Jalan /, /^Kampung /, /^Pasar /, /^Kawasan /, /^Bandar /, /^Stall /, /^Sri Tanjung/,/^Borneo Halal/,/^Sabah Fresh/,/^Kinabalu Dairy/,/^Sazarah/,/^Papar Valley/,/^Tawau Sea/,/^Sandakan Spice/,/^Dapur Kak/,/^HN-/];
let total = 0;
for (const route of routes) {
  const context = await browser.newContext();
  await context.addInitScript(() => localStorage.setItem('halalniaga.lang','ms'));
  const page = await context.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const lines = (await page.evaluate(() => document.body.innerText)).split('\n').map(l => l.replace(/\s+/g,' ').trim()).filter(Boolean);
  await context.close();
  const flagged = [...new Set(lines.filter(line => {
    if (ALLOW.some(p => p.test(line))) return false;
    const hits = line.match(STOP) ?? [];
    return hits.length >= 2;
  }))];
  if (flagged.length) { total += flagged.length; console.log(`\n${route}`); flagged.forEach(l => console.log('  ', JSON.stringify(l))); }
}
console.log('\nTotal:', total);
await browser.close();
