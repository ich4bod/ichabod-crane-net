/*
 * Screenshots the masthead at chosen points in the lantern flicker cycle.
 *
 * The glow animates, so an ordinary screenshot catches an arbitrary frame and
 * two runs never agree. This pauses the animation at a named offset instead,
 * which makes "brightest" and "dimmest" reproducible and lets a before/after
 * comparison mean something.
 *
 *   docker run --rm --ipc=host \
 *     -v /srv/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
 *     -v /srv/ichabod/apps/ichabod-crane-net/.verify/node_modules:/node_modules:ro \
 *     -v /tmp/glow-after:/proof \
 *     --network ichabod-proxy \
 *     mcr.microsoft.com/playwright:v1.55.0-noble \
 *     node /tools/shoot-masthead.js http://icn-glow-stage:3000/
 */
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('playwright-core').chromium; }

const BASE = (process.argv[2] || 'https://ichabod-crane.net/').replace(/\/$/, '');
const OUT = process.env.OUT_DIR || '/proof';

// Offsets into the 7.3s keyframe cycle. 0% is the resting value the
// reduced-motion still frame also shows; 9% is the peak; 36% is the trough.
const FRAMES = [
  ['rest', '0s'],
  ['bright', '-0.657s'],
  ['dim', '-2.628s'],
];

const CLIP = { x: 0, y: 0, width: 1100, height: 220 };

(async () => {
  const browser = await chromium.launch();

  for (const scheme of ['dark', 'light']) {
    for (const [label, delay] of FRAMES) {
      const ctx = await browser.newContext({
        viewport: { width: 1100, height: 900 },
        colorScheme: scheme,
      });
      const page = await ctx.newPage();
      await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
      await page.addStyleTag({
        content:
          'header .title h2 .wordmark-mark::before {' +
          '  animation-delay: ' + delay + ' !important;' +
          '  animation-play-state: paused !important;' +
          '}',
      });
      await page.waitForTimeout(120);
      const name = scheme + '-' + label + '.png';
      await page.screenshot({ path: OUT + '/' + name, clip: CLIP });
      console.log('  ' + name);
      await ctx.close();
    }
  }

  // Reduced motion: the still frame a reader who asked for no animation gets.
  for (const scheme of ['dark', 'light']) {
    const ctx = await browser.newContext({
      viewport: { width: 1100, height: 900 },
      colorScheme: scheme,
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(400);
    const name = scheme + '-reduced-motion.png';
    await page.screenshot({ path: OUT + '/' + name, clip: CLIP });

    // Assert it really is still, rather than trusting the media query: sample
    // the computed opacity twice, a second apart, and require them equal.
    const sample = () =>
      page.evaluate(() =>
        getComputedStyle(
          document.querySelector('header .title h2 .wordmark-mark'),
          '::before'
        ).opacity
      );
    const a = await sample();
    await page.waitForTimeout(1000);
    const b = await sample();
    console.log(
      '  ' + name + '  opacity ' + a + ' -> ' + b +
      (a === b ? '  STILL' : '  MOVING <-- FAIL')
    );
    await ctx.close();
  }

  await browser.close();
})();
