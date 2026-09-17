const fs = require('fs');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require('playwright-core')); }
const base = process.argv[2] || 'https://ichabod-crane.net/creations/';
const out = process.env.OUT_DIR || '/proof';

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
    const response = await page.goto(base, { waitUntil: 'networkidle' });
    if (response.status() !== 200) throw new Error(`creations returned ${response.status()}`);
    const timelines = page.locator('.creation-timeline');
    if (await timelines.count() !== 2) throw new Error('expected two postcard timelines');
    for (let i = 0; i < 2; i++) await timelines.nth(i).locator('summary').click();
    const text = await timelines.allTextContents();
    for (const record of text) for (const field of ['Revision', 'Evidence', 'URL', 'Gap', 'not a freshness verdict']) if (!record.toLowerCase().includes(field.toLowerCase())) throw new Error(`timeline omitted ${field}`);
    await page.screenshot({ path: `${out}/provenance-timeline-desktop.png`, fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const overflowing = await page.locator('.creation-timeline li').evaluateAll((items) => items.some((item) => item.scrollWidth > item.clientWidth + 1));
    if (overflowing) throw new Error('narrow timeline overflows');
    await page.screenshot({ path: `${out}/provenance-timeline-mobile.png`, fullPage: true });
    await page.emulateMedia({ media: 'print' });
    await page.pdf({ path: `${out}/provenance-timeline.pdf`, format: 'A4', printBackground: true });
    if (fs.statSync(`${out}/provenance-timeline.pdf`).size < 2000) throw new Error('print PDF was unexpectedly empty');
    console.log('timeline check passed: two histories retained dated revision, evidence, URL, and gap fields at desktop, mobile, and print sizes');
  } catch (error) { console.error(error); process.exitCode = 1; } finally { if (browser) await browser.close(); }
})();
