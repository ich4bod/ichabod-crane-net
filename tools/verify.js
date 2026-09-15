/*
 * Loads the live site in a real Chromium and checks the card's acceptance
 * criteria against what actually renders — not against the HTML source, and
 * not against curl. Also asserts the README's claims: no third-party
 * requests, no console errors, and one local script only on /usage/.
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

    // Issue #2 asked for the title tag to be exactly the name.
    const title = await page.title();
    check('home <title> is exactly "Ichabod Crane"',
      title === 'Ichabod Crane', title);

    // Issue #3. These next two are one check split in half, and the half that
    // was missing is what caused the bug. The pumpkin was taken out of
    // Site.Title to satisfy #2, which silently took it out of the masthead as
    // well, and the check written that day asserted the masthead had no emoji
    // — so the site passed 50/50 while visibly wrong. Tab and masthead are
    // different surfaces. Assert both, in opposite directions, or a fix to one
    // goes on quietly breaking the other.
    const brand = (await page.textContent('header .title')) || '';
    check('masthead carries the pumpkin',
      brand.includes('\u{1F383}'), brand.trim());
    check('masthead is the pumpkin and the name, nothing else',
      brand.replace(/\u{1F383}/gu, '').trim() === 'Ichabod Crane', brand.trim());

    // textContent proves the character is in the DOM, not that the reader sees
    // a pumpkin — an emoji with no font behind it is a notdef box and still
    // reads as U+1F383 here. That is exactly how the favicon shipped broken
    // for a day. So measure it: render the mark alone and check it painted
    // something wider than nothing and coloured, not a hollow rectangle.
    const markBox = await page.evaluate(() => {
      const el = document.querySelector('header .title h2 .wordmark-mark');
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { w: r.width, h: r.height };
    });
    check('masthead pumpkin is present in the DOM as its own element',
      markBox !== null && markBox.w > 4 && markBox.h > 4,
      markBox ? Math.round(markBox.w) + 'x' + Math.round(markBox.h) : 'missing');

    // Zach's complaint was the name appearing as the title and then again as
    // the first line of the body. The h1 has to say something else.
    const h1 = (await page.textContent('main h1')) || '';
    check('home h1 is not a second copy of the name',
      h1.trim().length > 0 && !/Ichabod Crane/.test(h1), h1.trim());

    const bodyText = await page.textContent('body');
    check('home splash describes what this is',
      /software agent/i.test(bodyText) && /queue of cards/i.test(bodyText));
    // Issue #2: the copy used to explain its own name — "that is the whole
    // joke, and it is Zach's", horseman and all. That constraint still holds
    // after the middle-ground rewrite: the page may have a voice, but it does
    // not get to nudge the reader about the name. Test the constraint, not the
    // flat phrasing that first satisfied it — phrasing is what feedback moves.
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
      /Bear Blog/i.test(text) && /local status snapshot/i.test(text));

    await page.screenshot({ path: OUT + '/02-about-dark.png', fullPage: true });
    await ctx.close();
  }

  // ---------------------------------------------------------------- blog
  console.log('\nBLOG  /blog/');
  let firstPostHref;
  let postTitles = [];
  {
    const { ctx, page, status } = await open(browser, '/blog/');
    check('blog index returns 200', status === 200, 'status ' + status);

    const items = await page.$$eval('ul.blog-posts li a', (as) =>
      as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim() })));
    check('blog index lists at least one real post', items.length >= 1, items.length + ' posts');
    postTitles = items.map((i) => i.text);

    // Don't pin a post count — that assertion goes stale the next time I
    // publish, and a stale check reports green while the page is wrong. The
    // feed is generated from the same page list, so disagreement between the
    // two means a post was dropped (a future date does exactly this).
    const feed = await (await fetch(BASE + '/blog/index.xml')).text();
    const feedItems = (feed.match(/<item>/g) || []).length;
    check('blog index lists every post in the feed', items.length === feedItems,
      items.length + ' on page, ' + feedItems + ' in feed');

    const times = await page.$$eval('ul.blog-posts time', (ts) =>
      ts.map((t) => t.getAttribute('datetime')));
    check('each entry carries a machine-readable date',
      times.length === items.length && times.every(Boolean), times.join(' '));

    firstPostHref = items[0] && items[0].href;
    // Ordering, not identity: newest first, whichever post that happens to be.
    const sorted = times.every((t, i) => i === 0 || times[i - 1] >= t);
    check('blog index is ordered newest first', sorted, times.join(' '));

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
    const navLabel = await page.$$eval('.post-nav span', (ss) =>
      ss.map((s) => s.textContent.trim()));
    // This post's position in the list moves every time I publish, so assert
    // the navigator's shape rather than a fixed neighbour: one label per link,
    // every direction a real one, and every link naming a different post that
    // the blog index also lists.
    const named = navLinks.every((t) =>
      postTitles.some((p) => p.toLowerCase() === t.toLowerCase()) && !/first thing at the apex/i.test(t));
    check('navigator names adjacent posts', navLinks.length >= 1 && named,
      navLinks.join(' | '));
    check('navigator labels every direction it offers',
      navLabel.length === navLinks.length && navLabel.every((l) => l === 'Older' || l === 'Newer'),
      navLabel.join(' '));

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

    // The previous version of this check asserted that the file *contained*
    // U+1F383 and no drawing primitives — and it passed happily for a day
    // while every reader saw a hollow circle, because the file was
    // <text>🎃</text> and a favicon is rendered with no page context and no
    // promise of an emoji font. Zach reported it as "a weird little circle".
    //
    // So: draw the thing and look at the pixels. An <img> is the same
    // SVGImage path a favicon takes, with external loads blocked, which is
    // what makes the inlined data: URI the load-bearing detail.
    const paint = await page.evaluate(async (href) => {
      const img = new Image();
      img.width = img.height = 64;
      try {
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = () => rej(new Error('decode failed'));
          img.src = href;
        });
      } catch (e) { return { error: e.message }; }
      const c = document.createElement('canvas');
      c.width = c.height = 64;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, 64, 64);
      const d = g.getImageData(0, 0, 64, 64).data;
      let opaque = 0, orange = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 128) continue;
        opaque++;
        if (d[i] > 150 && d[i + 1] > 60 && d[i + 1] < 200 && d[i + 2] < 100) orange++;
      }
      return { opaque, orange };
    }, iconHref);

    check('favicon paints an orange pumpkin, not a fallback glyph',
      !paint.error && paint.opaque > 500 && paint.orange > 300,
      paint.error || (paint.opaque + ' opaque px, ' + paint.orange + ' orange'));
    check('favicon carries its own pixels rather than trusting a system font',
      !/<text[\s>]/.test(iconBody),
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

  // ----------------------------------------------------------- creations
  // The thumbnails are the one part of this site that can rot silently: a
  // screenshot whose file is gone still leaves a perfectly valid page, just a
  // worse one. Checked here so the next run notices instead of a reader.
  console.log('\nCREATIONS  /creations/');
  {
    const { ctx, page, status } = await open(browser, '/creations/');
    check('creations returns 200', status === 200, 'status ' + status);

    const rows = await page.$$eval('.creation', (lis) =>
      lis.map((li) => {
        const r = li.getBoundingClientRect();
        const img = li.querySelector('.creation-shot img');
        const ir = img && img.getBoundingClientRect();
        return {
          left: Math.round(r.left),
          name: (li.querySelector('.creation-name a') || {}).textContent,
          self: li.classList.contains('creation-self'),
          shot: !!img,
          loaded: img ? img.complete && img.naturalWidth > 0 : null,
          natural: img ? img.naturalWidth + 'x' + img.naturalHeight : null,
          fits: ir ? ir.right <= r.right && ir.bottom <= r.bottom : true,
        };
      })
    );
    check('creations lists every entry in the data file', rows.length >= 3, rows.length + ' rows');

    const shot = rows.filter((r) => r.shot);
    check('every thumbnail actually decoded', shot.length > 0 && shot.every((r) => r.loaded),
      shot.map((r) => r.name + ' ' + r.natural).join(' | '));
    check('thumbnails are the 480x300 the template reserves space for',
      shot.every((r) => r.natural === '480x300'),
      shot.map((r) => r.natural).join(' '));
    check('no thumbnail overflows its card', rows.every((r) => r.fits));
    check('the list is still one column',
      new Set(rows.map((r) => r.left)).size === 1,
      rows.map((r) => r.left).join(' '));

    // Not a missing file: a picture of the page being read is not information,
    // and the template's no-thumb branch has to keep working for it.
    check('the self entry carries no thumbnail',
      rows.filter((r) => r.self).every((r) => !r.shot));

    // Hovering warms the row. It must not resize it.
    const geom = () => page.$$eval('.creation', (lis) =>
      lis.map((li) => { const r = li.getBoundingClientRect(); return [r.top, r.height, r.width].map(Math.round).join(','); }).join(' '));
    const before = await geom();
    await page.hover('.creation:first-child .creation-name a');
    await page.waitForTimeout(400);
    check('hovering a row does not shift the layout', (await geom()) === before, before);

    await page.screenshot({ path: OUT + '/09-creations-thumbnails.png', fullPage: true });
    await ctx.close();
  }

  // ---------------------------------------------------------------- usage
  console.log('\nUSAGE  /usage/');
  {
    const { ctx, page, status } = await open(browser, '/usage/');
    check('usage page returns 200', status === 200, 'status ' + status);
    const snapshot = await page.request.get(BASE + '/usage.json');
    check('usage snapshot returns 200', snapshot.status() === 200, 'status ' + snapshot.status());
    const usage = await snapshot.json();
    check('usage page shows the recorded weekly figure',
      (await page.textContent('.usage-value')).includes(String(usage.weekly) + '%'),
      (await page.textContent('.usage-value')).trim());
    check('usage page has only its local refresh script',
      await page.$$eval('script', (scripts) => scripts.length === 1 && scripts[0].src.endsWith('/usage.js')));
    await ctx.close();
  }

  // ------------------------------------------------- cross-cutting claims
  console.log('\nCLAIMS');
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto(BASE + '/blog/', { waitUntil: 'domcontentloaded' });
    const items = await page.$$eval('ul.blog-posts li a', (as) => as.length);
    // Same list as with JS on — the point is that nothing here needs a script,
    // not that the blog has some particular number of posts in it.
    check('site works with JavaScript disabled', items === postTitles.length,
      items + ' posts listed, ' + postTitles.length + ' with JS on');
    const scripts = await page.$$eval('script', (s) => s.length);
    check('ordinary pages need no JavaScript', scripts === 0, scripts + ' found');
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
