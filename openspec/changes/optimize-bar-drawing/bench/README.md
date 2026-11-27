# Bar drawing bench

The measurements in `design.md` come from these scripts. They are not part of the test suite.

1. `pnpm build`, then copy `dist/chart.umd.js` next to `page.html`.
2. Point `PW` at the repository's Playwright package, for example `PW=$(pwd)/node_modules/.pnpm/playwright@<version>/node_modules/playwright`.
3. Run each variant in its own process, one per line:
   - `node run.js <variant> 1000 5 <borderWidth> <borderRadius> 0`: median frame in Chromium, plus the sampled bytes per bar.
   - `node run2.js firefox 0 <variant> 1000 5 <borderWidth> <borderRadius>`: median frame in Firefox (or `chromium 1` for headed Chromium).
   - `DEBUG=pw:browser K=300 node gc.js <variant> 1000 5 2 0 2>&1 | grep -c -E 'Scavenge|Mark-Compact'`: garbage collections over 300 frames.

`base` is the built `BarElement`. The other variants in `variants.js` replace its `draw` in the page: `noclip`, `fillrect`, `noclipsave`, `clipnosave`, `noclipfr`, `fillrectcache`, `noopctx`. After each piece, compare `base` built from master with `base` built from the branch.
