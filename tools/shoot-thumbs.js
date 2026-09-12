/*
 * Shoots the /creations/ thumbnails in static/thumbs/.
 *
 * Every shot lands on exactly WIDTH x WIDTH*5/8 with no resize step, because
 * there is no ImageMagick on this box and none is wanted. A shot either uses a
 * viewport already at that ratio or names a clip in CSS pixels that has it, and
 * the rasterisation scale falls out of the width — so Chromium downscales while
 * it paints, at the resolution the file is going to be, instead of painting big
 * and resampling after.
 *
 * Each app is played before it is photographed. An app in its empty state
 * photographs as an empty state, and Minesweeper's blank grid and Shape Maker's
 * blank floor both looked like a page that had failed to load.
 *
 * There is deliberately no shot of this site: the only entry without one is the
 * self entry, and a picture of the page being read is not information. Its
 * absence is also the live proof that the template's no-thumb branch works.
 *
 *   docker run --rm --network host \
 *     -v /srv/ichabod/apps/ichabod-crane-net/tools:/tools:ro \
 *     -v /srv/ichabod/apps/ichabod-crane-net/.verify/node_modules:/node_modules:ro \
 *     -v /srv/ichabod/apps/ichabod-crane-net/static/thumbs:/out \
 *     mcr.microsoft.com/playwright:v1.55.0-noble \
 *     node /tools/shoot-thumbs.js /out
 */
let chromium;
try { chromium = require('playwright').chromium; }
catch (e) { chromium = require('playwright-core').chromium; }

const OUT = process.argv[2] || '/out';
const WIDTH = 480;

const SHOTS = [
  {
    slug: 'minesweeper',
    url: 'https://minesweeper.ichabod-crane.net',
    // The page is a 271px column centred on a wide dark field, so a landscape
    // crop is always going to carry background at the sides — the question is
    // only how much. Framed on .frame (315,154,271x365) rather than on the
    // whole title-through-board run, which put the board at 158 of 480 px and
    // photographed as a web page with a game somewhere in it. The top edge is
    // 140 and not 137 because the difficulty row ends at 138 and left a blue
    // sliver along the top of the picture.
    viewport: { width: 900, height: 560 },
    clip: { x: 130, y: 140, width: 640, height: 400 },
    prep: async (page) => {
      // The first click is always safe, so this opens a flood of numbers
      // rather than ending the game inside the thumbnail.
      await page.click('.cell[data-i="40"]');
      await page.click('.cell[data-i="8"]');
      // The flag is the only red on the board. A fixed index sometimes lands
      // on a square the flood already opened, which cannot be flagged, so the
      // shot came back without it and said nothing — hence a covered square,
      // a couple of attempts, and a check that the counter actually moved.
      // 010 is ten mines and no flags: the right-click did not land.
      for (let try_ = 0; try_ < 3; try_++) {
        const covered = await page.$$('.cell:not(.revealed):not(.flagged)');
        await covered[try_].click({ button: 'right' });
        await page.waitForTimeout(200);
        if ((await page.textContent('#mine-count')).trim() !== '010') break;
        if (try_ === 2) throw new Error('flag never registered; board left unflagged');
      }
    },
  },
  {
    slug: 'shape-maker',
    url: 'https://cad.ichabod-crane.net',
    viewport: { width: 1000, height: 625 },
    prep: async (page) => {
      // Block, ball, cone: three shapes and three colours, which is the whole
      // point of the toy and reads at 480px.
      const shapes = await page.$$('#palette .shape');
      for (const i of [0, 1, 3]) {
        await shapes[i].click();
        await page.waitForTimeout(400);
      }
    },
  },
];

(async () => {
  const browser = await chromium.launch();

  for (const shot of SHOTS) {
    const frame = shot.clip || Object.assign({ x: 0, y: 0 }, shot.viewport);
    const ctx = await browser.newContext({
      viewport: shot.viewport,
      deviceScaleFactor: WIDTH / frame.width,
      colorScheme: 'dark',
      reducedMotion: 'reduce',
    });
    const page = await ctx.newPage();
    await page.goto(shot.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(1500);
    await shot.prep(page);
    // Clicking scrolls its target into view, which would otherwise photograph
    // the page halfway down itself.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    await page.screenshot({ path: OUT + '/' + shot.slug + '.png', clip: frame });
    console.log('  ' + shot.slug + '.png  from ' + frame.width + 'x' + frame.height + ' css');
    await ctx.close();
  }

  await browser.close();
})();
