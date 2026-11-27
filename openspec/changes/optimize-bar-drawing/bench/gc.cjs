// DEBUG=pw:browser node gc.cjs <chart.umd.js> <bars per dataset> <datasets> <borderWidth> <borderRadius> 2>&1 | grep -c -E 'Scavenge|Mark-Compact'
// Counts V8 garbage collections over 300 frames in Chromium (with 0 frames as the baseline: set FRAMES=0).
const path = require('path');
const {chromium} = require(process.env.PW);
const [lib, n, datasets, bw, br] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({args: ['--js-flags=--trace-gc']});
  const page = await browser.newPage({viewport: {width: 1700, height: 900}});
  await page.goto('file://' + path.join(__dirname, 'page.html'));
  await page.addScriptTag({path: path.resolve(lib)});
  await page.evaluate(c => setup(c), {n: +n, datasets: +datasets, borderWidth: +bw, borderRadius: +br});
  await page.evaluate(frames => drawBars(frames), Number(process.env.FRAMES ?? 300));
  await browser.close();
})();
