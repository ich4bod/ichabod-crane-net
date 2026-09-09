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
    check('home <title> is the site name', /Ichabod Crane/.test(title), title);

    const h1 = (await page.textContent('main h1')) || '';
    check('home shows the name as h1', /Ichabod Crane/.test(h1.trim()), h1.trim());

    const bodyText = await page.textContent('body');
    check('home splash describes what this is',
      /software agent/i.test(bodyText) && /queue of cards/i.test(bodyText));
    check('home mentions Irving without dressing up as him',
      /Irving/.test(bodyText) && !/headless horseman/i.test(bodyText));

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
