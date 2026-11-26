## 1. P1: Vitest beside Karma

- [x] 1.1 Rename `test/specs/global.defaults.tests.js` to `global.defaults.spec.js`, convert it with the table in design D5, and see it run under neither runner
- [x] 1.2 Add `vitest`, `@vitest/browser`, `@vitest/browser-playwright`, `@vitest/coverage-istanbul`, `playwright`; set `chartjs-test-utils` to `^1.1.1`; add the alias `chartjs-test-utils-karma` for `^0.4.0` and import it in `test/index.js`
- [x] 1.3 Write `test/vitest.shared.js` (Playwright provider with the launch options from `karma.conf.cjs`, viewport) and `vitest.config.js` on top of it: Chromium and Firefox, `globals`, `restoreMocks`, no file parallelism, explicit viewport, shuffled order, istanbul coverage into `coverage/vitest`, alias `chart.js` to `src/index.ts`, transform target matching the rollup build
- [x] 1.4 Write `test/setup.js` as design D7 describes
- [x] 1.5 Narrow Karma's spec glob to `*.tests.js`, including the `--grep` form
- [x] 1.6 Add scripts `test-ci-vitest` and `dev:vitest`
- [x] 1.7 CI: Playwright install step (not on Windows), third Coveralls upload, `test` paths filter with `karma.conf.cjs` and `vitest*.config.js`
- [x] 1.8 Lint override for `*.spec.js` and `test/setup.js`; ignore Vitest artefacts
- [x] 1.9 Contributing docs: both runners, the suffix rule, the Playwright install, minimum Node
- [x] 1.10 Confirm Karma is still green with the aliased 0.4 and report both runners' test counts
- [x] 1.11 Confirm Vitest prints the shuffle seed and that a run can be replayed with it

## 2. P2: Fixtures under Vitest

- [x] 2.1 Save the list of fixture test names Karma runs today (per browser)
- [x] 2.1a Write `test/specs/fixtures.spec.js` and see every `.js` fixture fail to load
- [x] 2.2 Add the CommonJS fixture transform to `test/vitest.shared.js` and use it in `vitest.config.js`
- [x] 2.3 Replace `jasmine.triggerMouseEvent` with the `triggerMouseEvent` global in the four fixtures
- [x] 2.4 Make `jasmine.fixture.specs` in `test/index.js` a stub with one placeholder spec
- [x] 2.5 Run all fixtures in both browsers; if more than a handful fail, stop and report the list (design D11)
- [x] 2.5a Confirm the fixture tests Vitest registers are the same set as the list from 2.1, and that their number equals the number of fixture configs
- [x] 2.6 Add the update mode and the `fixtures:update` script; check that a normal run writes no PNG
- [x] 2.7 Contributing docs: the new image-test recipe, running one directory's fixtures with `-t`, and what `"debug": true` does now

## 3. P3: Built-bundle smoke suite

- [x] 3.1 Write `test/umd/umd.spec.js` (namespace assertions and about ten named fixtures, one of them mouse-driven) and see it fail without a config that runs it
- [x] 3.2 Write `test/setup.umd.js` (loads `dist/chart.umd.min.js`, calls `setup` with `window.Chart`), `vitest.umd.config.js` on top of `test/vitest.shared.js`, and the script `test-ci-umd`
- [x] 3.3 Check that it fails with a clear message when the bundle is not built, and when a namespace member is removed from the bundle
- [x] 3.4 Lint override, and a paragraph in the contributing docs that says `pnpm test-ci` needs a build

## 4. P4: Free specs, helpers, elements and small files

- [x] 4.1 Record Karma's and Vitest's test counts before the change, without fixture placeholders
- [x] 4.2 Rename and convert the 16 files; delete `plugin.subtitle.tests.js`
- [x] 4.3 Confirm the counts moved by the same number (design, Pieces) and put both, and the placeholders removed, in the pull request description

## 5. P5: Free specs, controllers

- [x] 5.1 Record both test counts
- [x] 5.2 Rename and convert `controller.{bubble,polarArea,radar}`
- [x] 5.3 Confirm the counts

## 6. P6: Free specs, core

- [x] 6.1 Record both test counts
- [x] 6.2 Rename and convert the nine `core.*` files
- [x] 6.3 Confirm the counts

## 7. P7: Specs open pull requests touch, controllers

- [ ] 7.1 List the open pull requests that touch the files of this piece; after the piece merges, comment on each with the rebase recipe (design D13)
- [x] 7.2 Record both test counts
- [x] 7.3 Rename and convert `controller.{bar,doughnut,line,scatter}`
- [x] 7.4 Confirm the counts

## 8. P8: Specs open pull requests touch, core

- [x] 8.1 List the open pull requests that touch the files of this piece; after the piece merges, comment on each with the rebase recipe (design D13)
- [x] 8.2 Record both test counts
- [x] 8.3 Rename and convert `core.{animation,animations,controller,scale,ticks}`, including the `done` tests and `this` state
- [x] 8.4 Confirm the counts

## 9. P9: Specs open pull requests touch, helpers and platform

- [ ] 9.1 List the open pull requests that touch the files of this piece; after the piece merges, comment on each with the rebase recipe (design D13)
- [x] 9.2 Record both test counts
- [x] 9.3 Rename and convert `helpers.{color,config,dom,math}` and `platform.{basic,dom}`
- [x] 9.4 Move the web-worker test to the smoke suite with its own worker file
- [x] 9.5 Confirm the counts

## 10. P10: Specs open pull requests touch, plugins

- [ ] 10.1 List the open pull requests that touch the files of this piece; after the piece merges, comment on each with the rebase recipe (design D13)
- [x] 10.2 Record both test counts
- [x] 10.3 Rename and convert `plugin.{decimation,filler,legend,title,tooltip}`
- [x] 10.4 Confirm the counts

## 11. P11: Specs open pull requests touch, scales

- [ ] 11.1 List the open pull requests that touch the files of this piece; after the piece merges, comment on each with the rebase recipe (design D13)
- [x] 11.2 Record both test counts
- [x] 11.3 Rename and convert `scale.{category,linear,logarithmic,time}`, including the `toBeCloseToTime` matcher
- [x] 11.4 Confirm the counts

## 12. P12: Remove Karma

- [ ] 12.1 Convert any `*.tests.js` file added since P11; add the startup guard that fails when a `*.tests.js` spec exists, see it fail with a stray file and pass without
- [ ] 12.2 Delete `karma.conf.cjs`, `test/index.js`, `test/seed-reporter.cjs`, `test/BasicChartWebWorker.js`
- [ ] 12.3 Remove the Karma-only dev dependencies and the alias; make `dev` and `dev:ff` the Vitest commands; remove `test-ci-karma` and `dev:vitest`
- [ ] 12.4 CI: remove xvfb, the macOS branch and the per-browser Coveralls uploads
- [ ] 12.5 Lint config and contributing docs without Karma and Jasmine; add the conversion table for pull request authors; say that the Safari and Edge launchers are gone
- [ ] 12.6 Confirm `git grep -i -E 'karma|jasmine'` outside the lockfile and `openspec` is empty, and that the lockfile has no `karma`, `jasmine` or `rollup-plugin-istanbul` entry and no `yargs`, `@rollup/plugin-commonjs` or `pixelmatch@5` that only the removed packages needed
