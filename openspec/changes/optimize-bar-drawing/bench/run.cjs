// node run.cjs <chart.umd.js> <chromium|firefox> <bars per dataset> <datasets> <borderWidth> <borderRadius>
// Prints the median frame of the bar controllers' draw(). Run each build in its own process.
const path = require('path');
const pw = require(process.env.PW);
const [lib, engine, n, datasets, bw, br] = process.argv.slice(2);
(async () => {
  const browser = await pw[engine].launch();
  const page = await browser.newPage({viewport: {width: 1700, height: 900}});
  await page.goto('file://' + path.join(__dirname, 'page.html'));
  await page.addScriptTag({path: path.resolve(lib)});
  await page.evaluate(c => setup(c), {n: +n, datasets: +datasets, borderWidth: +bw, borderRadius: +br});
  const median = await page.evaluate(() => bench(60));
  console.log([path.basename(lib), engine, `bars=${n * datasets}`, `bw=${bw}`, `br=${br}`, `median=${median.toFixed(2)}ms`].join('\t'));
  await browser.close();
})();
