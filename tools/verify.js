/*
 * Loads the live site in a real Chromium and checks the card's acceptance
 * criteria against what actually renders — not against the HTML source, and
 * not against curl. Also asserts the README's claims: no JavaScript, no
 * external requests, no console errors.
 *
 *   docker run --rm --ipc=host \
 *     -v /srv/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
 *     -v /srv/ichabod/apps/ichabod-crane-net/proof:/proof \
 *     mcr.microsoft.com/playwright:v1.55.0-noble \
 *     node /tools/verify.js https://ichabod-crane.net/
 */
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('playwright-core').chromium; }

const BASE = (process.argv[2] || 'https://ichabod-crane.net/').replace(/\/$/, '');
const OUT = process.env.OUT_DIR || '/proof';

let passed = 0;
const failures = [];

function check(name, cond, detail) {
  if (cond) {
    passed++;
    console.log('  PASS  ' + name + (detail ? '  [' + detail + ']' : ''));
  } else {
    failures.push(name + (detail ? '  [' + detail + ']' : ''));
    console.log('  FAIL  ' + name + (detail ? '  [' + detail + ']' : ''));
  }
}

// Collected across every page load in the run.
const offsite = [];
const consoleErrors = [];
const badResponses = [];

async function open(browser, path, scheme) {
  const ctx = await browser.newContext({
    viewport: { width: 1100, height: 900 },
    colorScheme: scheme || 'dark',
  });
  const page = await ctx.newPage();

  page.on('request', (r) => {
    const u = r.url();
    if (!u.startsWith(BASE) && !u.startsWith('data:')) offsite.push(u);
  });
  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) badResponses.push(r.status() + ' ' + r.url());
  });

  const resp = await page.goto(BASE + path, {
    waitUntil: 'networkidle',
    timeout: 45000,
  });
  return { ctx, page, status: resp.status() };
}

async function styleOf(page, sel, prop) {
  return page.$eval(sel, (el, p) => getComputedStyle(el)[p], prop);
}

(async () => {
  console.log('Verifying ' + BASE + '\n');
  const browser = await chromium.launch();

  // ---------------------------------------------------------------- home
  console.log('HOME  /');
  {
    const { ctx, page, status } = await open(browser, '/');
    check('home returns 200', status === 200, 'status ' + status);

    const title = await page.title();
    check('home <title> carries the pumpkin before the name',
      /^🎃\s*Ichabod Crane/.test(title), title);

    const brand = (await page.textContent('header .title')) || '';
    check('masthead carries the pumpkin before the name',
      /^🎃\s*Ichabod Crane$/.test(brand.trim()), brand.trim());

    // Zach's complaint was the name appearing as the title and then again as
    // the first line of the body. The h1 has to say something else.
    const h1 = (await page.textContent('main h1')) || '';
    check('home h1 is not a second copy of the name',
      h1.trim().length > 0 && !/Ichabod Crane/.test(h1), h1.trim());

    const bodyText = await page.textContent('body');
    check('home splash describes what this is',
      /software agent/i.test(bodyText) && /queue of cards/i.test(bodyText));
    // Issue #2: the copy used to explain its own name — "that is the whole
    // joke, and it is Zach's", horseman and all. The register is meant to be
    // flat and factual now; the pumpkin survives as the title emoji only.
    check('home copy does not explain the name or tell the joke',
      !/\bjokes?\b/i.test(bodyText) && !/horseman/i.test(bodyText) &&
      !/headless/i.test(bodyText) && !/Irving/i.test(bodyText) &&
      !/schoolmaster/i.test(bodyText));

    // Nav must actually be navigable, not just present in markup.
    const navHrefs = await page.$$eval('header nav a', (as) => as.map((a) => a.getAttribute('href')));
    check('nav links to home, about and blog',
      navHrefs.some((h) => /\/$/.test(h)) &&
      navHrefs.some((h) => /about/.test(h)) &&
      navHrefs.some((h) => /blog/.test(h)),
      navHrefs.join(' '));

    // The stylesheet is the deliverable here, so prove it applied.
    const bg = await styleOf(page, 'body', 'backgroundColor');
    check('dark palette applied (night ground)', bg === 'rgb(14, 17, 22)', bg);
    const font = await styleOf(page, 'body', 'fontFamily');
    check('body set in a book serif', /Iowan|Palatino|Georgia|serif/i.test(font), font);
    const bgImage = await styleOf(page, 'body', 'backgroundImage');
    check('lantern gradient present', /radial-gradient/.test(bgImage));
    const accent = await styleOf(page, 'main a', 'color');
    check('lantern-amber accent on links', accent === 'rgb(201, 151, 63)', accent);

    const width = await page.$eval('body', (el) => el.getBoundingClientRect().width);
    check('measure is a reading column, not full-bleed', width <= 700, width + 'px');

    await page.screenshot({ path: OUT + '/01-home-dark.png', fullPage: true });
    await ctx.close();
  }

  // --------------------------------------------------------------- about
  console.log('\nABOUT  /about/');
  {
    const { ctx, page, status } = await open(browser, '/about/');
    check('about returns 200', status === 200, 'status ' + status);

    const h1 = (await page.textContent('main h1')) || '';
    check('about has an h1', /About/i.test(h1), h1.trim());

    const text = await page.textContent('body');
    check('about states the boundary explicitly',
      /ich4bod/.test(text) && /ichabod-crane\.net/.test(text) && /outside/i.test(text));
    check('about explains the working method',
      /acceptance criteria/i.test(text) && /Docker Compose/i.test(text));
    check('about carries the colophon',
      /Bear Blog/i.test(text) && /No JavaScript/i.test(text));

    await page.screenshot({ path: OUT + '/02-about-dark.png', fullPage: true });
    await ctx.close();
  }

  // ---------------------------------------------------------------- blog
  console.log('\nBLOG  /blog/');
  let firstPostHref;
  {
    const { ctx, page, status } = await open(browser, '/blog/');
    check('blog index returns 200', status === 200, 'status ' + status);

    const items = await page.$$eval('ul.blog-posts li a', (as) =>
      as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })));
    check('blog index lists at least one real post', items.length >= 1, items.length + ' posts');
    check('blog index lists both posts', items.length === 2,
      items.map((i) => i.text).join(' | '));

    const times = await page.$$eval('ul.blog-posts time', (ts) =>
      ts.map((t) => t.getAttribute('datetime')));
    check('each entry carries a machine-readable date',
      times.length === items.length && times.every(Boolean), times.join(' '));

    firstPostHref = items[0] && items[0].href;
    check('newest post is the apex piece',
      /the-first-thing-at-the-apex/.test(firstPostHref || ''), firstPostHref);

    await page.screenshot({ path: OUT + '/03-blog-index-dark.png', fullPage: true });
    await ctx.close();
  }

  // ---------------------------------------------------------------- post
  console.log('\nPOST  ' + firstPostHref);
  {
    const { ctx, page, status } = await open(browser, '/blog/the-first-thing-at-the-apex/');
    check('post returns 200', status === 200, 'status ' + status);

    const h1 = (await page.textContent('main h1')) || '';
    check('post renders its title', /first thing at the apex/i.test(h1), h1.trim());

    const dt = await page.getAttribute('main time', 'datetime');
    check('post shows its date', dt === '2026-09-09', dt);

    const text = await page.textContent('body');
    check('post body is real prose, not a stub', text.length > 1800, text.length + ' chars');
    check('post renders a code block', (await page.$$('pre code')).length >= 1);

    const tags = await page.$$eval('main a[href*="/tags/"]', (as) =>
      as.map((a) => a.textContent.trim()));
    check('post links its tags', tags.length >= 3, tags.join(' '));

    // The theme renders an unavailable direction as <strike>Next Post</strike>;
    // the override should show the adjacent post's title and omit the rest.
    const strikes = await page.$$eval('strike, s', (els) => els.length);
    check('no struck-through navigator', strikes === 0, strikes + ' found');
    const navLinks = await page.$$eval('.post-nav a', (as) =>
      as.map((a) => a.textContent.trim()));
    check('navigator names the adjacent post',
      navLinks.length === 1 && /first click is always safe/i.test(navLinks[0]),
      navLinks.join(' | '));
    const navLabel = await page.$$eval('.post-nav span', (ss) =>
      ss.map((s) => s.textContent.trim()));
    check('navigator labels the direction', navLabel.join('') === 'Older', navLabel.join(' '));

    // Tag pages are generated; make sure one actually resolves.
    const tagHref = await page.$eval('main a[href*="/tags/"]', (a) => a.href);
    const tagResp = await page.goto(tagHref, { waitUntil: 'domcontentloaded' });
    check('a tag page resolves', tagResp.status() === 200, tagHref + ' -> ' + tagResp.status());

    await page.goto(BASE + '/blog/the-first-thing-at-the-apex/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: OUT + '/04-post-dark.png', fullPage: true });
    await ctx.close();
  }

  // ------------------------------------------------- light mode (parchment)
  console.log('\nLIGHT MODE');
  {
    const { ctx, page } = await open(browser, '/', 'light');
    const bg = await styleOf(page, 'body', 'backgroundColor');
    check('light mode turns to parchment', bg === 'rgb(233, 226, 209)', bg);
    const fg = await styleOf(page, 'body', 'color');
    check('light mode text is ink', fg === 'rgb(42, 38, 32)', fg);
    await page.screenshot({ path: OUT + '/05-home-light.png', fullPage: true });
    await ctx.close();
  }

  // ----------------------------------------------------------------- 404
  console.log('\n404');
  {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    const resp = await page.goto(BASE + '/nothing-here/', { waitUntil: 'networkidle' });
    check('unknown path returns 404', resp.status() === 404, 'status ' + resp.status());
    const text = await page.textContent('body');
    check('404 is the custom page', /Nothing down this road/i.test(text));
    await page.screenshot({ path: OUT + '/06-404-dark.png', fullPage: true });
    await ctx.close();
  }

  // ------------------------------------------- favicon and link previews
  console.log('\nFAVICON AND LINK PREVIEW');
  {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });

    const iconHref = await page.$eval('link[rel~="icon"], link[rel="shortcut icon"]',
      (l) => l.href);
    const icon = await page.request.get(iconHref);
    const iconBody = await icon.text();
    check('favicon resolves', icon.status() === 200, iconHref + ' -> ' + icon.status());
    check('favicon is the pumpkin emoji and nothing else',
      /image\/svg/.test(icon.headers()['content-type'] || '') &&
      iconBody.includes('\u{1F383}') &&
      !/<circle|<rect|<path/.test(iconBody),
      (icon.headers()['content-type'] || '') + ', ' + iconBody.length + ' bytes');

    const meta = await page.evaluate(() => {
      const out = {};
      document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]')
        .forEach((m) => { out[m.getAttribute('property') || m.getAttribute('name')] = m.content; });
      return out;
    });
    check('og:title set', /Ichabod Crane/.test(meta['og:title'] || ''), meta['og:title']);
    check('og:description set', (meta['og:description'] || '').length > 30,
      meta['og:description']);
    check('og:image set', /\/og\.png$/.test(meta['og:image'] || ''), meta['og:image']);
    check('og:image dimensions declared',
      meta['og:image:width'] === '1200' && meta['og:image:height'] === '630',
      meta['og:image:width'] + 'x' + meta['og:image:height']);
    check('og:image has alt text', (meta['og:image:alt'] || '').length > 20,
      meta['og:image:alt']);
    check('twitter card is the large one',
      meta['twitter:card'] === 'summary_large_image', meta['twitter:card']);

    // The card is only a preview if the bytes are really there at the size
    // the tags claim, so load it and measure it rather than trusting them.
    const dims = await page.evaluate((src) => new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res([i.naturalWidth, i.naturalHeight]);
      i.onerror = () => rej(new Error('og:image failed to load'));
      i.src = src;
    }), meta['og:image']);
    check('og:image is really 1200x630',
      dims[0] === 1200 && dims[1] === 630, dims.join('x'));

    // Draw what a scraper has to work with. This is a mock of a preview
    // card, not a real one — it proves the tags and the image are sufficient
    // to build one, which is the part this site controls.
    await page.setContent(`<!doctype html><meta charset="utf-8">
      <body style="margin:0;background:#e6e9ee;font:15px -apple-system,system-ui,sans-serif;
                   padding:36px;width:492px">
      <div id="card" style="width:420px;border-radius:18px;overflow:hidden;background:#fff;
                  box-shadow:0 1px 3px rgba(0,0,0,.22)">
        <img src="${meta['og:image']}" style="display:block;width:100%">
        <div style="padding:11px 14px 13px">
          <div style="font-weight:600;line-height:1.3">${meta['og:title']}</div>
          <div style="color:#4c5257;line-height:1.35;margin-top:2px">${meta['og:description']}</div>
          <div style="color:#8b9196;margin-top:5px;text-transform:lowercase">${new URL(meta['og:url'] || BASE).host}</div>
        </div>
      </div></body>`, { waitUntil: 'networkidle' });
    await page.locator('#card').screenshot({ path: OUT + '/07-link-preview.png' });

    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.screenshot({ path: OUT + '/08-home-masthead.png', clip: { x: 0, y: 0, width: 1100, height: 300 } });
    await ctx.close();
  }

  // ------------------------------------------------- cross-cutting claims
  console.log('\nCLAIMS');
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(BASE + '/blog/', { waitUntil: 'domcontentloaded' });
    const items = await page.$$eval('ul.blog-posts li a', (as) => as.length);
    check('site works with JavaScript disabled', items === 2, items + ' posts listed');
    const scripts = await page.$$eval('script', (s) => s.length);
    check('no <script> tags anywhere', scripts === 0, scripts + ' found');
    await ctx.close();
  }

  check('no requests to third-party hosts', offsite.length === 0, offsite.join(' '));
  check('no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  check('no failed subresource requests',
    badResponses.filter((r) => !/nothing-here/.test(r)).length === 0,
    badResponses.join(' | '));

  await browser.close();

  console.log('\n' + '-'.repeat(60));
  console.log(passed + ' passed, ' + failures.length + ' failed');
  if (failures.length) {
    console.log('\nFAILURES:');
    failures.forEach((f) => console.log('  - ' + f));
    process.exit(1);
  }
  console.log('Screenshots in ' + OUT);
})().catch((e) => {
  console.error('\nverify.js crashed: ' + (e && e.stack || e));
  process.exit(1);
});
