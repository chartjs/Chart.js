const pw = require(process.env.PW);
const path = require('path');
const variants = require('./variants.js');
const [engine, headed, variant, n, datasets, bw, br] = process.argv.slice(2);
(async () => {
  const browser = await pw[engine].launch({headless: headed !== '1', args: engine === 'chromium' && headed === '1' ? ['--enable-gpu-rasterization','--ignore-gpu-blocklist'] : []});
  const page = await browser.newPage({viewport: {width: 1700, height: 900}});
  await page.goto('file://' + path.join(__dirname, 'page.html'));
  await page.evaluate(c => setup(c), {n: +n, datasets: +datasets, borderWidth: +bw, borderRadius: +br});
  if (variants[variant]) await page.evaluate(variants[variant]);
  const r = await page.evaluate(() => bench(60));
  console.log([engine, headed === '1' ? 'headed' : 'headless', variant, `bars=${n*datasets}`, `bw=${bw}`, `br=${br}`, `median=${r.median.toFixed(2)}ms`].join('\t'));
  await browser.close();
})();
