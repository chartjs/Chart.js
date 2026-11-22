## 1. P1: Vitest beside Karma

- [ ] 1.1 Rename `test/specs/global.defaults.tests.js` to `global.defaults.spec.js`, convert it with the table in design D5, and see it run under neither runner
- [ ] 1.2 Add `vitest`, `@vitest/browser`, `@vitest/browser-playwright`, `@vitest/coverage-istanbul`, `playwright`; set `chartjs-test-utils` to `^1.1.1`; add the alias `chartjs-test-utils-karma` for `^0.4.0` and import it in `test/index.js`
- [ ] 1.3 Write `vitest.config.js`: Chromium and Firefox, provider launch options from `karma.conf.cjs`, `globals`, `restoreMocks`, no file parallelism, explicit viewport, shuffled order, istanbul coverage into `coverage/vitest`, alias `chart.js` to `src/index.ts`, transform target matching the rollup build
- [ ] 1.4 Write `test/setup.js` as design D7 describes
- [ ] 1.5 Narrow Karma's spec glob to `*.tests.js`
- [ ] 1.6 Add scripts `test-ci-vitest` and `dev:vitest`
- [ ] 1.7 CI: Playwright install step, third Coveralls upload, corrected `test` paths filter
- [ ] 1.8 Lint override for `*.spec.js` and `test/setup.js`; ignore Vitest artefacts
- [ ] 1.9 Contributing docs: both runners, the suffix rule, the Playwright install, minimum Node
- [ ] 1.10 Confirm Karma is still green with the aliased 0.4 and report both runners' test counts

## 2. P2: Fixtures under Vitest

- [ ] 2.1 Write `test/specs/fixtures.spec.js` and see every `.js` fixture fail to load
- [ ] 2.2 Add the CommonJS fixture transform to `vitest.config.js`
- [ ] 2.3 Replace `jasmine.triggerMouseEvent` with the `triggerMouseEvent` global in the four fixtures
- [ ] 2.4 Make `jasmine.fixture.specs` in `test/index.js` a stub with one placeholder spec
- [ ] 2.5 Run all fixtures in both browsers; if more than a handful fail, stop and report the list (design D11)
- [ ] 2.6 Add the update mode and the `fixtures:update` script; check that a normal run writes no PNG
- [ ] 2.7 Contributing docs: the new image-test recipe

## 3. P3: Built-bundle smoke suite

- [ ] 3.1 Write `test/integration/umd-browser/umd.spec.js` (namespace assertions and about eight fixtures against `dist/chart.umd.min.js`) and see it fail without a config that runs it
- [ ] 3.2 Write `vitest.umd.config.js` and the script `test-ci-umd`
- [ ] 3.3 Check that it fails with a clear message when the bundle is not built, and when a namespace member is removed from the bundle
- [ ] 3.4 Lint override and one paragraph in the contributing docs

## 4. P4: Free specs, helpers, elements and small files

- [ ] 4.1 Record Karma's and Vitest's test counts before the change
- [ ] 4.2 Rename and convert the 16 files; delete `plugin.subtitle.tests.js`
- [ ] 4.3 Confirm the counts moved by the same number and put both in the pull request description

## 5. P5: Free specs, controllers

- [ ] 5.1 Record both test counts
- [ ] 5.2 Rename and convert `controller.{bubble,polarArea,radar}`
- [ ] 5.3 Confirm the counts

## 6. P6: Free specs, core

- [ ] 6.1 Record both test counts
- [ ] 6.2 Rename and convert the nine `core.*` files
- [ ] 6.3 Confirm the counts

## 7. P7: Held specs, controllers

- [ ] 7.1 Re-evaluate which files are free under the held-file rule
- [ ] 7.2 Record both test counts
- [ ] 7.3 Rename and convert `controller.{bar,doughnut,line,scatter}`
- [ ] 7.4 Confirm the counts

## 8. P8: Held specs, core

- [ ] 8.1 Re-evaluate which files are free under the held-file rule
- [ ] 8.2 Record both test counts
- [ ] 8.3 Rename and convert `core.{animation,animations,controller,scale,ticks}`, including the `done` tests and `this` state
- [ ] 8.4 Confirm the counts

## 9. P9: Held specs, helpers and platform

- [ ] 9.1 Re-evaluate which files are free under the held-file rule
- [ ] 9.2 Record both test counts
- [ ] 9.3 Rename and convert `helpers.{color,config,dom,math}` and `platform.{basic,dom}`
- [ ] 9.4 Move the web-worker test to the smoke suite with its own worker file
- [ ] 9.5 Confirm the counts

## 10. P10: Held specs, plugins

- [ ] 10.1 Re-evaluate which files are free under the held-file rule
- [ ] 10.2 Record both test counts
- [ ] 10.3 Rename and convert `plugin.{decimation,filler,legend,title,tooltip}`
- [ ] 10.4 Confirm the counts

## 11. P11: Held specs, scales

- [ ] 11.1 Re-evaluate which files are free under the held-file rule
- [ ] 11.2 Record both test counts
- [ ] 11.3 Rename and convert `scale.{category,linear,logarithmic,time}`, including the `toBeCloseToTime` matcher
- [ ] 11.4 Confirm the counts

## 12. P12: Remove Karma

- [ ] 12.1 Add the startup guard that fails when a `*.tests.js` spec exists, and see it pass
- [ ] 12.2 Delete `karma.conf.cjs`, `test/index.js`, `test/seed-reporter.cjs`, `test/BasicChartWebWorker.js`
- [ ] 12.3 Remove the Karma-only dev dependencies and the alias; make `dev` and `dev:ff` the Vitest commands; remove `test-ci-karma` and `dev:vitest`
- [ ] 12.4 CI: remove xvfb, the macOS branch and the per-browser Coveralls uploads
- [ ] 12.5 Lint config and contributing docs without Karma and Jasmine; add the conversion table for pull request authors
- [ ] 12.6 Confirm `git grep -i -E 'karma|jasmine'` outside the lockfile and `openspec` is empty, and that the lockfile has no `karma`, `jasmine` or `rollup-plugin-istanbul` entry
