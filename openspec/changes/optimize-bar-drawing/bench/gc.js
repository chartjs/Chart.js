const {chromium} = require(process.env.PW);
const path = require('path');
const variants = require('./variants.js');
const [variant, n, datasets, bw, br] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({args: ['--js-flags=--trace-gc'], env: {...process.env}});
  const page = await browser.newPage({viewport: {width: 1700, height: 900}});
  await page.goto('file://' + path.join(__dirname, 'page.html'));
  await page.evaluate(c => setup(c), {n: +n, datasets: +datasets, borderWidth: +bw, borderRadius: +br});
  if (variants[variant]) await page.evaluate(variants[variant]);
  await page.evaluate(() => { const ctrls = chart.getSortedVisibleDatasetMetas().map(m => m.controller); for (let i = 0; i < 20; i++) for (const c of ctrls) c.draw(); });
  const t0 = Date.now();
  console.error('MARK-START');
  await page.evaluate((K) => { const ctrls = chart.getSortedVisibleDatasetMetas().map(m => m.controller); for (let i = 0; i < K; i++) for (const c of ctrls) c.draw(); }, Number(process.env.K));
  console.error('MARK-END');
  await browser.close();
})();
