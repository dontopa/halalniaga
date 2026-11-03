/**
 * Compare the Malay and English renderings of each route.
 * Lines that are identical in both languages and long enough to be prose are
 * candidates for untranslated copy.
 */
import { chromium } from 'playwright-core';

const CHROME =
  process.env.CHROME_PATH ??
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173';

const routes = [
  '/',
  '/signin',
  '/vendor/dapur-kak-nur',
  '/credits',
  '/admin',
  '/admin/guide',
  '/app',
  '/app/suppliers',
  '/app/purchases',
  '/app/academy',
  '/app/assessment',
  '/app/verification',
  '/app/monitoring',
  '/app/community',
  '/app/scanner',
  '/app/starter-kit',
  '/app/mentor',
];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });

const linesFor = async (route, lang) => {
  const context = await browser.newContext();
  await context.addInitScript(
    ([key, value]) => localStorage.setItem(key, value),
    ['halalniaga.lang', lang],
  );
  const page = await context.newPage();
  await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(350);
  const text = await page.evaluate(() => document.body.innerText);
  const langAttr = await page.evaluate(() => document.documentElement.lang);
  await context.close();
  const lines = text
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return { lines, langAttr };
};

const properNoun = [
  /HALALNiaga/,
  /JAKIM/,
  /MAIN\/JAIN/,
  /SPHM/,
  /UMS/,
  /Kota Kinabalu/i,
  /Sandakan/i,
  /Tawau/i,
  /Keningau/i,
  /Lahad Datu/i,
  /Tanjung Aru/i,
  /Gaya Street|Jalan Gaya/i,
  /Sepanggar/i,
  /Likas/i,
  /Api-Api/i,
  /Inanam/i,
  /Kolombong/i,
  /Putatan/i,
  /Papar/i,
  /Wikimedia/i,
  /Creative Commons/,
  /CC BY/,
  /Bahnfrend|Uwe Aranas|Francisco Anzola/,
  /^Lot \d/,
  /^Block [A-Z]/,
  /^Kampung /,
  /^Jalan /,
  /^Pasar Besar/,
  /^Kawasan /,
  /^Bandar /,
  /^Stall \d/,
  /^https?:/,
  /\.webp|\.jpg|\.png/,
  /^Filipino market/,
  /^Kota Kinabalu Sabah/,
  /^Sandakan Sabah/,
  /^Poultry Market/,
  /^Sri Tanjung|Borneo Halal Meats|Sabah Fresh Produce|Kinabalu Dairy|Sazarah|Papar Valley|Tawau Sea Harvest|Sandakan Spice/,
  /^Dapur Kak Nur/,
  /^Nurul Huda|^Hafiz Roslan|^Aisyah|^Daniel|^Rohana|^Jefri|^Kak Nur|^Farah/,
  /^HN-/,
  /^RM\s?[\d.,]+$/,
];

const isCandidate = (line) => {
  const words = line.split(' ').filter((word) => /[A-Za-z]{2,}/.test(word));
  if (words.length < 4) return false;
  if (!/[a-z]{3}/.test(line)) return false;
  if (properNoun.some((pattern) => pattern.test(line))) return false;
  return true;
};

let totalFlags = 0;
for (const route of routes) {
  const ms = await linesFor(route, 'ms');
  const en = await linesFor(route, 'en');
  const enSet = new Set(en.lines);
  const same = ms.lines.filter((line) => enSet.has(line) && isCandidate(line));
  const unique = [...new Set(same)];
  if (unique.length) {
    totalFlags += unique.length;
    console.log(`\n${route}  (html lang: ms=${ms.langAttr} en=${en.langAttr})`);
    for (const line of unique) console.log(`  UNTRANSLATED? ${JSON.stringify(line)}`);
  }
}

console.log(`\nTotal identical candidate lines: ${totalFlags}`);
await browser.close();
