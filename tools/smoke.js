/*
 * A small deployed-site smoke check. It follows same-origin document links
 * from the apex, verifies all discovered same-origin targets, and checks the
 * rendered accessibility basics that regress most visibly.
 *
 * docker run --rm --network host --ipc=host \
 *   -v /home/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
 *   -v /home/ichabod/apps/ichabod-crane-net/.verify/node_modules:/node_modules:ro \
 *   -e NODE_PATH=/node_modules mcr.microsoft.com/playwright:v1.55.0-noble \
 *   node /tools/smoke.js https://ichabod-crane.net/
 */
let chromium;
try { chromium = require('playwright').chromium; }
catch (_) { chromium = require('playwright-core').chromium; }

const base = new URL(process.argv[2] || 'https://ichabod-crane.net/');
const origin = base.origin;
const pending = [base.href];
const visited = new Set();
const failures = [];
let passed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed++;
    console.log(`PASS  ${name}${detail ? ` [${detail}]` : ''}`);
  } else {
    failures.push(`${name}${detail ? ` [${detail}]` : ''}`);
    console.log(`FAIL  ${name}${detail ? ` [${detail}]` : ''}`);
  }
}

function normalized(href) {
  try {
    const url = new URL(href, origin);
    url.hash = '';
    if (url.origin !== origin || !/^https?:$/.test(url.protocol)) return null;
    return url.href;
  } catch (_) { return null; }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  while (pending.length) {
    const url = pending.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    let response;
    try {
      response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      check('link returns a non-error response', !!response && response.status() < 400,
        `${url} -> ${response ? response.status() : 'no response'}`);
    } catch (error) {
      check('link returns a non-error response', false, `${url} -> ${error.message}`);
      continue;
    }

    const documentLinks = await page.$$eval('a[href]', links => links.map(link => link.href));
    for (const href of documentLinks) {
      const next = normalized(href);
      if (next && !visited.has(next)) pending.push(next);
    }

    const isHtml = (response.headers()['content-type'] || '').includes('text/html');
    if (!isHtml) continue;

    const title = await page.title();
    check('page has one useful title', title.trim().length > 2, `${url} -> ${JSON.stringify(title)}`);

    const images = await page.$$eval('img', images => images.map(image => ({
      src: image.currentSrc || image.src,
      hasAlt: image.hasAttribute('alt'),
      alt: image.getAttribute('alt'),
      decorative: !!image.closest('[aria-hidden="true"], [role="presentation"]'),
    })));
    const badImages = images.filter(image => !image.hasAlt || (!image.decorative && !image.alt.trim()));
    check('rendered images have appropriate alt text', badImages.length === 0,
      badImages.map(image => image.src).join(', '));
  }

  await page.goto(base.href, { waitUntil: 'networkidle', timeout: 30000 });
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element || element === document.body) return null;
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    const visible = box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    const indicated = (style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0) ||
      style.boxShadow !== 'none' || style.textDecorationLine.includes('underline');
    return { tag: element.tagName, visible, indicated };
  });
  check('keyboard Tab reaches a visibly indicated focus target',
    !!focus && focus.visible && focus.indicated, focus ? JSON.stringify(focus) : 'no focus target');

  console.log(`\n${failures.length ? 'FAILED' : 'PASSED'}: ${passed} checks, ${failures.length} failures, ${visited.size} same-origin links`);
  await browser.close();
  if (failures.length) process.exitCode = 1;
})().catch(error => {
  console.error(`smoke.js crashed: ${error.stack || error}`);
  process.exitCode = 1;
});
