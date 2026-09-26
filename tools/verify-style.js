const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: node verify-style.js <url>');
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    const bg = await page.$eval('body', el => getComputedStyle(el).backgroundColor);
    const font = await page.$eval('body', el => getComputedStyle(el).fontFamily);
    
    const headingText = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      const target = elements.find(el => el.textContent.trim() === 'Small games. Useful toys. Questions you can click.');
      return target ? target.textContent.trim() : null;
    });

    const bodyText = await page.textContent('body');

    const checks = {
      bg: bg === 'rgb(243, 237, 223)',
      font: font.includes('ui-sans-serif'),
      heading: headingText === 'Small games. Useful toys. Questions you can click.',
      noSource: !bodyText.includes(':root {')
    };

    if (Object.values(checks).every(v => v === true)) {
      console.log('site stylesheet renders without source text');
      process.exit(0);
    } else {
      console.error('Verification failed:');
      for (const [k, v] of Object.entries(checks)) {
        console.error(`${k}: ${v}`);
      }
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
