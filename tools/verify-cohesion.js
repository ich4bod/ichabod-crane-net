/*
 * Verifies card c46b8a63: the creations index, the nav that reaches it from
 * every page, and the back-link on every deployed app.
 *
 * Checks what a real Chromium renders — element visibility and bounding
 * boxes, not the presence of a string in the HTML source — and follows every
 * link it finds to confirm it answers 200.
 *
 *   docker run --rm --ipc=host \
 *     -e NODE_PATH=/w/node_modules \
 *     -v /srv/ichabod/apps/ichabod-crane-net/.verify:/w \
 *     -v /srv/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
 *     -v /srv/ichabod/apps/ichabod-crane-net/proof:/proof \
 *     mcr.microsoft.com/playwright:v1.55.0-noble \
 *     node /tools/verify-cohesion.js
 *
 * NODE_PATH is not optional: the image ships the browsers but not the npm
 * package, and node resolves modules from the script's directory rather than
 * cwd, so the mounted install has to be named explicitly.
 */
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('playwright-core').chromium; }

const SITE = 'https://ichabod-crane.net';
const MINES = 'https://minesweeper.ichabod-crane.net';
const OUT = process.env.OUT_DIR || '/proof';

let passed = 0;
const failures = [];

function check(name, cond, detail) {
  const line = name + (detail ? '  [' + detail + ']' : '');
  if (cond) { passed++; console.log('  PASS  ' + line); }
  else { failures.push(line); console.log('  FAIL  ' + line); }
}

const offsite = [];
const consoleErrors = [];
const allLinks = new Set();

async function open(browser, url, scheme) {
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    colorScheme: scheme || 'dark',
  });
  const page = await ctx.newPage();
  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith('data:') && !u.includes('ichabod-crane.net')) offsite.push(u);
  });
  // Tagged with the page they came from: navigating deliberately to a
  // missing URL makes Chromium log the main document's own 404 as a console
  // error, and that one is the point of the test rather than a defect.
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push({ page: url, text: m.text() });
  });
  page.on('pageerror', (e) => consoleErrors.push({ page: url, text: String(e) }));
  const resp = await page.goto(url, { waitUntil: 'load' });
  return { ctx, page, status: resp ? resp.status() : 0 };
}

// Every href on a page, absolute, minus mailto/anchors.
async function hrefs(page) {
  return page.$$eval('a[href]', (as) => as.map((a) => a.href))
    .then((list) => list.filter((h) => /^https?:/.test(h)));
}

async function isVisible(page, selector) {
  const el = await page.$(selector);
  if (!el) return { ok: false, why: 'no such element' };
  const box = await el.boundingBox();
  const shown = await el.isVisible();
  if (!shown) return { ok: false, why: 'not visible' };
  if (!box || box.width < 1 || box.height < 1) return { ok: false, why: 'zero box' };
  return { ok: true, box, text: (await el.innerText()).trim() };
}

(async () => {
  const browser = await chromium.launch();
  let rc = 1;
  try {
    // ---- 1. the creations index ----------------------------------------
    console.log('\n/creations/ — the index');
    {
      const { ctx, page, status } = await open(browser, SITE + '/creations/');
      check('page answers 200', status === 200, 'status ' + status);
      check('title names the page', (await page.title()).startsWith('Creations'),
        await page.title());

      const items = await page.$$('ul.creations li.creation');
      check('index lists at least one creation', items.length >= 1,
        items.length + ' entries');

      // Every entry must render a name, a visible blurb, and a live URL.
      for (let i = 0; i < items.length; i++) {
        const name = await items[i].$eval('.creation-name a', (a) => a.textContent.trim())
          .catch(() => null);
        const href = await items[i].$eval('.creation-name a', (a) => a.href).catch(() => null);
        const blurb = await items[i].$eval('.creation-blurb', (p) => p.textContent.trim())
          .catch(() => '');
        const box = await items[i].boundingBox();
        check('entry ' + (i + 1) + ' has a name and link', !!name && !!href, name + ' -> ' + href);
        check('entry ' + (i + 1) + ' has a one-line description', blurb.length > 10,
          blurb.slice(0, 60));
        check('entry ' + (i + 1) + ' is rendered with real size',
          !!box && box.height > 40, box ? Math.round(box.height) + 'px tall' : 'no box');
      }

      // The card names minesweeper specifically.
      const mineEntry = await page.$('ul.creations a[href^="' + MINES + '"]');
      check('minesweeper is on the index', !!mineEntry);

      check('index page ships no JavaScript',
        (await page.$$('script')).length === 0);

      (await hrefs(page)).forEach((h) => allLinks.add(h));
      await page.screenshot({ path: OUT + '/01-creations-dark.png', fullPage: true });
      await ctx.close();
    }

    // Light mode, because the palette claims to invert.
    {
      const { ctx, page } = await open(browser, SITE + '/creations/', 'light');
      const bg = await page.evaluate(() =>
        getComputedStyle(document.body).backgroundColor);
      check('creations renders in light mode too', bg !== 'rgb(14, 17, 22)', bg);
      await page.screenshot({ path: OUT + '/02-creations-light.png', fullPage: true });
      await ctx.close();
    }

    // ---- 2. nav reaches the index from every page ----------------------
    console.log('\nnav — every page reaches /creations/');
    for (const path of ['/', '/about/', '/blog/', '/blog/the-first-click-is-always-safe/',
                        '/no-such-page-here/']) {
      const { ctx, page, status } = await open(browser, SITE + path);
      const link = await page.$('header nav a[href="/creations/"]');
      let visible = false;
      if (link) visible = await link.isVisible();
      check('nav link to creations on ' + path, visible,
        'http ' + status + (link ? '' : ', link absent'));
      // No duplicate nav entries — the menu is declared twice over.
      const navNames = await page.$$eval('header nav a', (as) =>
        as.map((a) => a.textContent.trim()));
      check('nav has no duplicates on ' + path,
        new Set(navNames).size === navNames.length, navNames.join(' | '));
      (await hrefs(page)).forEach((h) => allLinks.add(h));
      await ctx.close();
    }

    // ---- 3. the back-link on the deployed app --------------------------
    console.log('\nminesweeper — the back-link');
    {
      const { ctx, page, status } = await open(browser, MINES + '/');
      check('minesweeper answers 200', status === 200, 'status ' + status);

      const v = await isVisible(page, 'footer.home a');
      check('back-link is visible', v.ok, v.ok ? v.text : v.why);
      check('back-link names the parent site',
        v.ok && /ichabod-crane\.net/.test(v.text), v.text);

      const href = await page.$eval('footer.home a', (a) => a.href).catch(() => null);
      check('back-link points at the apex', href === SITE + '/', String(href));

      // It has to be reachable without scrolling past the game, so confirm
      // it sits inside the document rather than off-canvas.
      const off = await page.evaluate(() => {
        const a = document.querySelector('footer.home a');
        const r = a.getBoundingClientRect();
        return { left: r.left, right: r.right, w: document.documentElement.clientWidth };
      });
      check('back-link is inside the page horizontally',
        off.left >= 0 && off.right <= off.w + 1,
        Math.round(off.left) + '–' + Math.round(off.right) + ' of ' + off.w);

      await page.screenshot({ path: OUT + '/03-minesweeper-backlink.png', fullPage: true });
      await page.locator('footer.home a').first().scrollIntoViewIfNeeded();
      await page.screenshot({ path: OUT + '/04-minesweeper-backlink-closeup.png',
        clip: await page.locator('footer.home').boundingBox() });

      (await hrefs(page)).forEach((h) => allLinks.add(h));

      // Actually travel it.
      await Promise.all([
        page.waitForURL(SITE + '/', { timeout: 15000 }),
        page.locator('footer.home a').first().click(),
      ]).then(() => check('clicking the back-link lands on the apex', true, page.url()))
        .catch((e) => check('clicking the back-link lands on the apex', false,
          page.url() + ' — ' + e.message));

      // And from there the index is one click away.
      const toIndex = await page.$('header nav a[href="/creations/"]');
      check('apex offers creations in one more click', !!toIndex && await toIndex.isVisible());
      await ctx.close();
    }

    // ---- 4. every link resolves ----------------------------------------
    console.log('\nlinks — ' + allLinks.size + ' distinct, all must answer 200');
    for (const url of [...allLinks].sort()) {
      let code = 0, err = '';
      try {
        const r = await fetch(url, { redirect: 'follow' });
        code = r.status;
      } catch (e) { err = e.message; }
      check('200 ' + url, code === 200, err || String(code));
    }

    // ---- 5. link previews across the estate ----------------------------
    // Sharing any address under the domain should produce the same card:
    // pumpkin, name, one amber rule. This checks the tags on every host and
    // then draws all three previews side by side.
    console.log('\nlink previews — one card design across the estate');
    {
      const cards = [];
      for (const url of [SITE + '/', 'https://cad.ichabod-crane.net/', MINES + '/']) {
        const { ctx, page } = await open(browser, url);
        const meta = await page.evaluate(() => {
          const out = {};
          document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
            .forEach((m) => {
              out[m.getAttribute('property') || m.getAttribute('name')] = m.content;
            });
          return out;
        });
        const host = new URL(url).host;
        check(host + ' declares og:title', (meta['og:title'] || '').length > 2,
          meta['og:title']);
        check(host + ' declares og:description',
          (meta['og:description'] || '').length > 20, meta['og:description']);
        check(host + ' points og:image at its own host',
          (meta['og:image'] || '').startsWith('https://' + host + '/'), meta['og:image']);
        check(host + ' declares the card dimensions',
          meta['og:image:width'] === '1200' && meta['og:image:height'] === '630',
          meta['og:image:width'] + 'x' + meta['og:image:height']);
        check(host + ' asks for the large twitter card',
          meta['twitter:card'] === 'summary_large_image', meta['twitter:card']);
        check(host + ' files the card under the site name',
          /Ichabod Crane/.test(meta['og:site_name'] || ''), meta['og:site_name']);

        // Measure the image rather than believing the tags.
        const dims = await page.evaluate((src) => new Promise((res) => {
          const i = new Image();
          i.onload = () => res([i.naturalWidth, i.naturalHeight]);
          i.onerror = () => res([0, 0]);
          i.src = src;
        }), meta['og:image']);
        check(host + ' serves a real 1200x630 card',
          dims[0] === 1200 && dims[1] === 630, dims.join('x'));

        cards.push({ host, meta });
        await ctx.close();
      }

      const ctx = await browser.newContext({ viewport: { width: 1360, height: 480 } });
      const page = await ctx.newPage();
      await page.setContent(`<!doctype html><meta charset="utf-8">
        <body style="margin:0;background:#e6e9ee;padding:28px;display:flex;gap:22px;
                     align-items:flex-start;font:15px -apple-system,system-ui,sans-serif">
        ${cards.map((c) => `
          <div style="width:410px;border-radius:18px;overflow:hidden;background:#fff;
                      box-shadow:0 1px 3px rgba(0,0,0,.22)">
            <img src="${c.meta['og:image']}" style="display:block;width:100%">
            <div style="padding:11px 14px 13px">
              <div style="font-weight:600;line-height:1.3">${c.meta['og:title']}</div>
              <div style="color:#4c5257;line-height:1.35;margin-top:2px">${c.meta['og:description']}</div>
              <div style="color:#8b9196;margin-top:5px">${c.host}</div>
            </div>
          </div>`).join('')}
        </body>`, { waitUntil: 'networkidle' });
      await page.screenshot({ path: OUT + '/05-link-previews.png' });
      await ctx.close();
    }

    // ---- 6. house rules ------------------------------------------------
    console.log('\nhouse rules');
    check('no third-party requests from any page', offsite.length === 0,
      offsite.slice(0, 5).join(', '));
    const realErrors = consoleErrors.filter((e) => !/no-such-page-here/.test(e.page));
    check('no console errors on any page that should exist', realErrors.length === 0,
      realErrors.slice(0, 3).map((e) => e.page + ': ' + e.text).join(' | '));

    console.log('\n' + passed + ' passed, ' + failures.length + ' failed');
    if (failures.length) {
      console.log('\nFAILURES:');
      failures.forEach((f) => console.log('  - ' + f));
    } else {
      rc = 0;
    }
  } finally {
    await browser.close();
  }
  process.exit(rc);
})();
