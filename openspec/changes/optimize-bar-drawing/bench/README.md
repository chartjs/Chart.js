# Bar drawing bench

The measurements in `design.md` come from these scripts. They are not part of the test suite.

1. Build master and the branch (`pnpm build`) and keep each `dist/chart.umd.js` under its own name, for example `master.umd.js` and `branch.umd.js`.
2. Point `PW` at the repository's Playwright package: `PW=$(pwd)/node_modules/.pnpm/playwright@<version>/node_modules/playwright`.
3. Run each build in its own process:
   - `node run.cjs master.umd.js chromium 1000 5 2 0` prints the median frame for 5000 bars with `borderWidth: 2`. Use `firefox` for Firefox, and borders `0 0`, `2 0` and `2 6` for the three cases in `design.md`.
   - `DEBUG=pw:browser node gc.cjs master.umd.js 1000 5 2 0 2>&1 | grep -c -E 'Scavenge|Mark-Compact'` counts garbage collections over 300 frames.
