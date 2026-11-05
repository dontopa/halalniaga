import { chromium } from 'playwright';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const base = process.env.BASE_URL || 'http://localhost:4173';
const out = path.resolve(
  process.env.OUT_DIR || 'docs/screenshots/client-update',
);
fs.mkdirSync(out, { recursive: true });

const invoiceSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200">
  <rect width="900" height="1200" fill="#f7f3e8"/>
  <rect x="48" y="48" width="804" height="1104" fill="none" stroke="#0b4f3c" stroke-width="3"/>
  <text x="90" y="140" font-family="Arial" font-size="46" font-weight="bold" fill="#0b4f3c">INVOIS / INVOICE</text>
  <text x="90" y="200" font-family="Arial" font-size="26" fill="#333">Kedai Ayam Acen</text>
  <text x="90" y="240" font-family="Arial" font-size="22" fill="#555">Inanam, Kota Kinabalu</text>
  <line x1="90" y1="280" x2="810" y2="280" stroke="#999" stroke-width="2"/>
  <text x="90" y="340" font-family="Arial" font-size="24" fill="#333">Ayam segar bersih</text>
  <text x="810" y="340" font-family="Arial" font-size="24" fill="#333" text-anchor="end">RM 46.00</text>
  <text x="90" y="390" font-family="Arial" font-size="22" fill="#666">4.6 kg x RM 10.00</text>
  <line x1="90" y1="430" x2="810" y2="430" stroke="#999" stroke-width="2"/>
  <text x="620" y="480" font-family="Arial" font-size="24" fill="#333">JUMLAH</text>
  <text x="810" y="480" font-family="Arial" font-size="26" fill="#0b4f3c" text-anchor="end">RM 46.00</text>
  <circle cx="720" cy="700" r="70" fill="none" stroke="#1d7a4f" stroke-width="6"/>
  <text x="720" y="710" font-family="Arial" font-size="28" font-weight="bold" fill="#1d7a4f" text-anchor="middle">HALAL</text>
  <text x="90" y="1080" font-family="Arial" font-size="20" fill="#777">Terima kasih / Thank you</text>
</svg>`;

fs.writeFileSync(path.join(out, 'invoice-test.png'), await sharp(Buffer.from(invoiceSvg)).png().toBuffer());

const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH }
    : { channel: 'chrome' },
);
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'ms-MY',
});
const page = await context.newPage();
const results = [];
const check = (name, condition, detail = '') => {
  results.push({ name, ok: Boolean(condition), detail });
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

page.on('console', (msg) => {
  if (msg.type() === 'error') console.log('CONSOLE ERROR:', msg.text());
});
page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));

await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(800);

// Problem order
const problemTitles = await page
  .locator('#problem h3')
  .allInnerTexts();
check('problem order', problemTitles.length === 6 && /disahkan/i.test(problemTitles[0]) && /Bahan basah/i.test(problemTitles[1]), problemTitles.join(' | '));

const numbers = await page.locator('#problem h3').evaluateAll((nodes) =>
  nodes.map((node) =>
    node.closest('.group')?.querySelector('.font-mono')?.textContent?.trim(),
  ),
);
check('problem numbering 01-06', numbers.join(',') === '01,02,03,04,05,06', numbers.join(','));

// Design stance + lead
const problemSection = await page.locator('#problem').innerText();
check('new problem lead', problemSection.includes('sebenarnya berniat baik'));
check('new design stance', problemSection.includes('tidak seharusnya dibebani'));

// Steps
const steps = await page.locator('#how h3').allInnerTexts();
check('six steps with briefing first', steps.length === 6 && /Briefing/i.test(steps[0]) && /SSM/i.test(steps[1]), steps.join(' | '));

// Tier names
const tiers = await page.locator('#trust h3').allInnerTexts();
check('tier names', tiers.includes('Peserta') && tiers.includes('Pengesahan') && tiers.includes('Pemantauan'), tiers.join(' | '));

// Section screenshots after reveal
await page.locator('#problem').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '02a-landing-problem.png') });
await page.locator('#how').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '02b-landing-steps.png') });
await page.locator('#trust').scrollIntoViewIfNeeded();
await page.waitForTimeout(600);
await page.screenshot({ path: path.join(out, '02c-landing-tiers.png') });

// Packages
const pkgSection = page.locator('#packages');
await pkgSection.scrollIntoViewIfNeeded();
await page.waitForTimeout(400);
const pkgText = (await pkgSection.innerText()).toLowerCase();
check('packages section 08', pkgText.includes('pakej') && pkgText.includes('basic') && pkgText.includes('premium') && pkgText.includes('pro / biz'));
check('package prices', pkgText.includes('percuma') && pkgText.includes('rm30') && pkgText.includes('rm60–80'));
await page.screenshot({ path: path.join(out, '01-landing-packages.png'), fullPage: false });

await page.goto(base, { waitUntil: 'networkidle' });
const pageHeight = await page.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < pageHeight; y += 700) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(120);
}
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(400);
await page.screenshot({ path: path.join(out, '02-landing-full.png'), fullPage: true });

// Suppliers map
await page.goto(`${base}/app/suppliers`, { waitUntil: 'networkidle' });
await page.waitForTimeout(1800);
const pinCount = await page.locator('.leaflet-marker-icon').count();
check('map pins', pinCount >= 8, `${pinCount} pins`);
const tiles = await page.locator('.leaflet-tile-loaded').count();
check('openstreetmap tiles load', tiles > 0, `${tiles} tiles`);
await page.locator('.leaflet-marker-icon').first().click({ force: true });
await page.waitForTimeout(600);
const mapsHref = await page
  .locator('a:has-text("Buka dalam Google Maps")')
  .first()
  .getAttribute('href')
  .catch(() => null);
check('google maps link', Boolean(mapsHref && mapsHref.includes('google.com/maps')), mapsHref ?? 'none');
await page.screenshot({ path: path.join(out, '03-suppliers-map.png') });

// Manual purchase
await page.goto(`${base}/app/purchases`, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: /Rekod pembelian/ }).first().click();
await page.waitForTimeout(400);
await page.getByRole('button', { name: /Key in pembekal baharu/ }).click();
await page.fill('#manual-supplier', 'Kedai Ayam Acen');
await page.fill('#manual-product', 'Ayam segar');
await page.fill('#manual-price', '10');
await page.fill('#manual-quantity', '4.6');
await page.fill('#purchase-receipt', 'INV-ACEN-1105');
await page.locator('input[type="file"]').setInputFiles(path.join(out, 'invoice-test.png'));
await page.waitForTimeout(1200);
await page.getByText('Cap halal pada bungkusan').click();
await page.screenshot({ path: path.join(out, '04-manual-purchase-form.png') });
await page.getByRole('button', { name: /Simpan pembekal dan pembelian/ }).click();
await page.waitForTimeout(900);
const toast = await page.locator('body').innerText();
check('manual purchase saved', toast.includes('menunggu semakan program'));

const thumbs = await page.locator('button[title="Lihat bukti"]').count();
check('evidence thumbnail in purchases', thumbs > 0, `${thumbs} thumbnails`);
await page.locator('button[title="Lihat bukti"]').first().click();
await page.waitForTimeout(500);
const previewVisible = await page.locator('img[alt="Bukti pembelian"]').count();
check('evidence preview opens', previewVisible > 0);
await page.screenshot({ path: path.join(out, '05-evidence-preview.png') });
await page.keyboard.press('Escape');

// Public record
await page.goto(`${base}/vendor/dapur-kak-nur`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const publicText = await page.locator('body').innerText();
check('public record shows manual supplier', publicText.includes('Kedai Ayam Acen') && publicText.includes('menunggu semakan'));
const publicEvidence = await page.locator('img[alt="Bukti pembelian"]').count();
check('public record evidence photo', publicEvidence > 0, `${publicEvidence} images`);
await page.screenshot({ path: path.join(out, '06-public-vendor-evidence.png'), fullPage: true });

// Starter kit
await page.goto(`${base}/app/starter-kit`, { waitUntil: 'networkidle' });
await page.waitForTimeout(500);
const kitText = await page.locator('body').innerText();
check('weekly routine card', kitText.includes('Rutin mingguan') && kitText.includes('peti sejuk'));
await page.screenshot({ path: path.join(out, '07-starter-kit-weekly.png'), fullPage: true });

// Dashboard header menus and sidebar
await page.goto(`${base}/app`, { waitUntil: 'networkidle' });
await page.waitForTimeout(700);
const resetCount = await page.getByText('Set semula demo', { exact: false }).count();
check('reset demo removed', resetCount === 0);
await page.screenshot({ path: path.join(out, '09-dashboard-sidebar.png') });

await page.locator('button[aria-haspopup="menu"]').first().click();
await page.waitForTimeout(300);
const alertsPanel = page.getByRole('menu', { name: 'Amaran' });
check('alerts panel opens', await alertsPanel.isVisible());
await page.screenshot({ path: path.join(out, '10-alerts-menu.png') });
await page.keyboard.press('Escape');
await page.waitForTimeout(200);

await page.getByRole('link', { name: 'Peta pembekal' }).click();
await page.waitForTimeout(900);
const mapBox = await page.locator('#map').boundingBox();
check(
  'dashboard map shortcut',
  page.url().includes('/app/suppliers#map') && Boolean(mapBox),
  page.url(),
);

await page.goto(`${base}/app`, { waitUntil: 'networkidle' });
await page.waitForTimeout(400);
await page.getByRole('button', { name: 'Menu akaun' }).click();
await page.waitForTimeout(300);
const profileText = await page.getByRole('menu', { name: 'Menu akaun' }).innerText();
check(
  'profile menu has public profile and logout',
  profileText.includes('Profil awam peniaga') && profileText.includes('Log keluar'),
);
await page.screenshot({ path: path.join(out, '11-profile-menu.png') });
await page.getByText('Log keluar').click();
await page.waitForTimeout(500);
check('logout opens sign-in', page.url().includes('/signin'));

// Mobile landing
const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, locale: 'ms-MY' });
const mobilePage = await mobile.newPage();
await mobilePage.goto(base, { waitUntil: 'networkidle' });
await mobilePage.waitForTimeout(600);
const mobileHeight = await mobilePage.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < mobileHeight; y += 500) {
  await mobilePage.evaluate((top) => window.scrollTo(0, top), y);
  await mobilePage.waitForTimeout(100);
}
await mobilePage.evaluate(() => window.scrollTo(0, 0));
await mobilePage.waitForTimeout(400);
await mobilePage.screenshot({ path: path.join(out, '08-landing-mobile.png'), fullPage: true });
await mobile.close();

// English check
await page.goto(base, { waitUntil: 'networkidle' });
await page.getByRole('button', { name: 'EN' }).click();
await page.waitForTimeout(500);
const enText = await page.locator('body').innerText();
check('english tier names', enText.includes('Participant') && enText.includes('Verification') && enText.includes('Monitoring'));
check('english packages', enText.includes('Packages') && enText.includes('Start free'));

await browser.close();

const failed = results.filter((result) => !result.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log('Failed:', failed.map((item) => item.name).join(', '));
  process.exitCode = 1;
}
