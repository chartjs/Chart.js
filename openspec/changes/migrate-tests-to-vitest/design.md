## Context

State of `master` when this was written (2026-11-22). Nothing here has been executed under Vitest yet; statements about how Vitest will behave are marked *unverified* and assigned to the piece that proves them.

**What runs the tests today**

| Place | What it decides |
| --- | --- |
| `karma.conf.cjs` | Spec glob `test/specs/**/*<grep>*.js`. Builds `src/index.umd.ts` with the rollup config entry for the minified UMD bundle and loads it into `window.Chart`. Loads `moment`, `moment-timezone` and `chartjs-adapter-moment` as scripts. Istanbul coverage through `rollup-plugin-istanbul`, one lcov per browser under `coverage/<browser>/`. Launch flags that keep the canvas on the CPU in Chrome and Firefox. |
| `test/index.js` | Pins `window.devicePixelRatio = 1`, sets the helper globals (`acquireChart`, `releaseChart`, `afterEvent`, `waitForResize`, `createMockContext`), `jasmine.fixture.specs`, `jasmine.triggerMouseEvent`, the default time zone `Etc/UTC`, disables the colors plugin, registers matchers per spec. |
| `test/BasicChartWebWorker.js` | `importScripts('../src/chart.umd.min.js')`; works only because Karma serves the built bundle under that name. Used by one test in `platform.basic.tests.js`. |
| `package.json` | `test-ci` runs every `test-ci-*` script through `concurrently "pnpm:test-ci-*"`, so a new `test-ci-<name>` script joins CI without a workflow edit. `dev` and `dev:ff` start Karma in watch mode. |
| `.github/workflows/ci.yml` | Runs `xvfb-run pnpm run test-ci` on Ubuntu; uploads `coverage/chrome/lcov.info` and `coverage/firefox/lcov.info` to Coveralls as parallel jobs with a `finish` job. The `test` paths filter names `karma.conf.js`, but the file is `karma.conf.cjs`. |
| `test/.eslintrc.yml` | `env: jasmine` and the helper globals. |
| `docs/developers/contributing.md` | The only contributor documentation for running tests and adding image tests. |

**Size of the suite**

- 54 spec files, 26,558 lines; 30 of them (8,393 lines) are touched by no open pull request, 24 (18,165 lines) by one or more.
- 667 reference PNGs with 527 `.js` and 140 `.json` fixture configs in 26 fixture directories.
- Lines that carry a Jasmine idiom are few: about 225 in the 30 free files and about 330 in the 24 held files. Counts across all specs: `spyOn(` 57, `.calls.*` 73, `.and.callThrough()` 6, `jasmine.createSpy` 5, `jasmine.objectContaining` 75, `jasmine.any(` 11, `jasmine.triggerMouseEvent` 106 (all already awaited), `jasmine.fixture.specs` 25, `toBeTrue`/`toBeFalse` 49/41, `withContext` 48, `done` tests 32 (22 in `core.controller`), `this.<x>` in hooks and tests on 164 lines in 11 files, `pending(` 1, `fail(` 5.

**Facts that shape the design**

1. `chartjs-test-utils` 1.x imports `vitest` at module top level (`src/index.js`, `src/fixtures.js`) and has no `addMatchers`, `specsFromFixtures` or `injectWrapperCSS`. Karma cannot bundle it. 0.4 calls `jasmine.addMatchers`, `pending()` and `__karma__.files`. The chart helpers (`acquireChart`, `afterEvent`, `waitForResize`, `triggerMouseEvent`) behave the same in both.
2. All 527 `.js` fixtures are CommonJS (`module.exports`), evaluated today with `new Function`, and they use page globals (`Chart`, `moment`). Vite does not transform CommonJS in source files.
3. Four fixtures call `jasmine.triggerMouseEvent`.
4. `test/fixtures/scale.timeseries` has no spec line of its own. It runs today only because 0.4 matches fixture paths by prefix, so the line for `scale.time` also picks it up. 1.x matches by directory and would drop it silently.
5. Jasmine's `spyOn` replaces the method with a stub; Vitest's `vi.spyOn` calls the original.
6. Vitest calls hooks and tests without a `this`, so the 164 `this.<x>` lines fail as written.

## Goals / Non-Goals

**Goals:**

- Run every existing spec and every image fixture under Vitest browser mode in Chromium and Firefox, against `src/`.
- Keep a test that fails when the minified UMD bundle is broken.
- Keep `master` green and releasable after every piece, with both runners side by side until the last piece.
- Keep open pull requests mergeable for as long as practical.
- End with no Karma or Jasmine package in the lockfile.

**Non-Goals:**

- No change under `src/`, to `rollup.config.js`, or to the published package.
- No WebKit run (see Open Questions).
- No rewrite of fixtures to ES modules, and no replacement of the helper globals with imports. Both can follow as separate mechanical changes.
- No removal of unused dev dependencies that are unrelated to Karma (`@rollup/plugin-inject`, `esm`, `glob`).
- No migration of the docs toolchain or of ESLint.

## Decisions

### D1. Both runners side by side; free files first, in large pieces
Decided by the maintainers. Spec files no open pull request touches are converted first, grouped by area into large pieces, because a conversion edits only 2-3% of a file's lines and is mechanical. Files held by open pull requests follow under the rule in Open Questions.
*Alternatives:* a compatibility layer that runs the specs unedited (keeps Jasmine vocabulary indefinitely); one conversion of everything at once (conflicts with about 65 open pull requests).

### D2. Specs run against source; a smoke suite covers the built bundle
Decided by the maintainers. The main suite imports `src/index.umd.ts`, the same entry the UMD bundle is built from, so `Chart` has the same shape (`Chart.helpers`, `Chart._adapters`, ...) that specs and fixtures use. A second Vitest config runs a small suite against `dist/chart.umd.min.js`: the namespace assertions, about eight existing fixtures (one per controller, one filler, one legend, none with a time scale), and the web-worker test, which needs the built bundle by nature.
*Alternative:* run everything against the minified bundle as today (needs a build before every run and coverage through source maps).

### D3. Two versions of `chartjs-test-utils` during the migration
`chartjs-test-utils` becomes `^1.1.1` in the first piece. Karma keeps 0.4 through an npm alias, `"chartjs-test-utils-karma": "npm:chartjs-test-utils@^0.4.0"`, imported by `test/index.js`. The last piece deletes the alias. Follows from fact 1.
*Unverified:* that Karma's rollup preprocessor resolves the alias. P1 proves it by Karma staying green.

### D4. A file name suffix tells the runners apart
Karma's glob becomes `test/specs/**/*.tests.js`; Vitest's is `test/specs/**/*.spec.js`. Converting a file is `git mv x.tests.js x.spec.js` plus the idiom edits, so no shared list exists and conversion pieces never touch a common file. After Karma is removed, the Vitest config fails at startup if any `*.tests.js` remains, naming the file.
*Alternatives:* include lists in both configs (every conversion edits two shared files); a separate directory (moves fixtures' relative paths for no gain).

### D5. Converted specs use native Vitest idioms; helper globals stay
No `jasmine` compatibility object. Vitest runs with `globals: true`, and `test/setup.js` keeps the globals `Chart`, `moment`, `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize`, `createMockContext` and adds `triggerMouseEvent`. Converted specs therefore gain no import lines and the conversion diff is idioms only. Every conversion piece applies this table:

| Jasmine | Vitest |
| --- | --- |
| `describe('auto', jasmine.fixture.specs('x'))` | delete the line (D6) |
| `jasmine.triggerMouseEvent(` | `triggerMouseEvent(` |
| `spyOn(o, 'm')` | `vi.spyOn(o, 'm').mockImplementation(() => {})` |
| `spyOn(o, 'm').and.callThrough()` | `vi.spyOn(o, 'm')` |
| `jasmine.createSpy(...)` | `vi.fn()` |
| `.calls.count()` / `.calls.argsFor(i)` / `.calls.first().args` / `.calls.all()` / `.calls.reset()` | `.mock.calls.length` / `.mock.calls[i]` / `.mock.calls[0]` / `.mock.calls` / `.mockClear()` |
| `.calls.first().object` | `.mock.contexts[0]` |
| `jasmine.objectContaining` / `jasmine.any` | `expect.objectContaining` / `expect.any` |
| `toBeTrue()` / `toBeFalse()` | `toBe(true)` / `toBe(false)` |
| `expect(x).withContext(m)` | `expect(x, m)` |
| `function(done)` | an `async` test awaiting a Promise; `done.fail(m)` rejects |
| `fail(m)` | `expect.unreachable(m)` |
| `pending()` | `ctx.skip()` |
| `this.x` in hooks and tests | a `let` in the enclosing `describe` |
| `jasmine.addMatchers({...})` | `expect.extend({...})` in that spec |

Config that keeps Jasmine's implicit behaviour: `restoreMocks: true` (Jasmine removes spies after each spec), `fileParallelism: false` (Karma ran one page serially; animation and resize specs need unthrottled frames), an explicit `browser.viewport` (Vitest's default is 414x896; Karma ran in a full window), and shuffled test order with the seed printed, as Jasmine does today.

`toEqual` stays `toEqual`. Vitest's is slightly looser than Jasmine's (it ignores `undefined` properties and constructors); converting to `toStrictEqual` would change meaning in the other direction and is not mechanical.

### D6. Fixtures run from one spec and stay CommonJS
`test/specs/fixtures.spec.js` holds the `import.meta.glob` calls and `createFixtures`, and registers one `describe` per top-level fixture directory, derived from the globbed keys. This keeps `scale.timeseries` covered (fact 4), loads the 1,334 fixture modules once per browser instead of once per spec file, and lets new fixture directories run without a spec line. A small Vite transform in the Vitest config wraps `test/fixtures/**/*.js` files that contain `module.exports` as ES modules, so fixtures in open pull requests keep working. Fallback if the transform misbehaves: glob with `?raw` and evaluate as 0.4 does.

Ownership of fixtures moves in one piece: when `fixtures.spec.js` lands, `jasmine.fixture.specs` in `test/index.js` becomes a stub that registers one placeholder spec (Jasmine rejects an empty `describe`), so each fixture has exactly one runner and no held spec file is edited.

Update mode follows the plugins: `UPDATE_FIXTURES=1` registers the `saveFixtureImage` command from `chartjs-test-utils/node` and narrows the run to Chromium; the script is `fixtures:update`.
*Alternatives:* a fixture line in each converted spec (drops `scale.timeseries`, 25 eager globs); rewriting all 527 fixtures to `export default` (Karma could no longer read them during the migration).

### D7. Setup reproduces `test/index.js`
`test/setup.js` imports `Chart` from `src/index.umd.ts`, pins `window.devicePixelRatio = 1`, and calls `setup({Chart, devicePixelRatio: Chart.defaults.devicePixelRatio})`. The second argument stops 1.x from overwriting the scriptable default, which `core.controller` specs rely on when they set `window.devicePixelRatio = 3`. It imports `moment-timezone`, sets `window.moment` and the default zone, imports `chartjs-adapter-moment`, and disables the colors plugin. The Vitest config aliases `chart.js` to `src/index.ts` and keeps the adapter out of dependency pre-bundling so that the adapter registers on the same module instances the specs use.
*Unverified:* the adapter and moment identity. P2's 41 time-scale fixtures fail if it is wrong.

### D8. Coverage with the istanbul provider, one report per runner
`@vitest/coverage-istanbul` (v8 coverage is refused once a non-Chromium browser is configured), `include: src/**`, lcov into `coverage/vitest/` (its own directory, because Vitest cleans its reports directory and Karma writes `coverage/chrome` and `coverage/firefox` in the same run). During the migration a third parallel Coveralls step uploads it with flag `<os>-vitest`; at the end it is the only upload. The per-browser flags disappear because Vitest merges browsers into one report. Branch protection on `master` requires only `build (ubuntu-latest)` and `build (windows-latest)`, so no Coveralls check blocks this.

### D9. Browsers and CI
Chromium and Firefox through `@vitest/browser-playwright`, with the launch options Karma uses today set on the provider (Vitest ignores them on an instance). CI installs browsers with an explicit `pnpm exec playwright install --with-deps chromium firefox` step; locally it is a documented one-time command, not chained into scripts. xvfb stays only while Karma exists.

### D10. Config files are JavaScript
`vitest.config.js` and `vitest.umd.config.js`, not `.ts`: `tsconfig.json` includes only `src` and nothing typechecks root tooling.

### D11. Reference images are not regenerated in bulk
1.x compares with pixelmatch 8 blending against white, as pixelmatch 5 did. P2 runs all 667 images under Playwright's browsers for the first time. If more than a handful fail, P2 stops and brings the list to the maintainers instead of regenerating.

### D12. Script names during the migration
`dev` and `dev:ff` stay Karma and `dev:vitest` is added; the last piece makes `dev` and `dev:ff` the Vitest commands and removes `dev:vitest`.

## Risks / Trade-offs

- **Images under Playwright browsers and unminified source** → P2 exposes all 667 at once; D11 says what happens if many fail. Text-bearing fixtures are the likely casualties.
- **Compiler divergence**: the build compiles with swc at `es2022`; Vite would read `tsconfig.json` (`ES6`), which changes class-field semantics for the TypeScript element classes → `vitest.config.js` sets the transform target and `useDefineForClassFields` explicitly to match the build; the smoke suite is the backstop.
- **Cross-file state**: Karma runs all specs in one page, Vitest isolates files. A spec that relied on another file's side effect fails when converted → fixed in the conversion piece that meets it.
- **Spy semantics** (fact 5) → the table in D5; reviewers check every `spyOn` conversion.
- **`this` and `done`** are the non-mechanical part, concentrated in `core.controller`, `scale.time` and `core.interaction` → H2 is the largest piece.
- **Viewport and throttling** can break resize, DOM and animation specs → pinned viewport, no file parallelism; Firefox has no equivalent of Chromium's background-throttling flags.
- **CI load**: `pnpm test-ci` runs Karma, two Vitest processes and the integration packages concurrently → if timing-sensitive specs flake, the Vitest scripts move to their own CI step.
- **Coveralls percentage may move slightly** on conversion pull requests, because the two runners instrument differently.
- **A pull request merged with stale CI** can add Jasmine idioms to an already converted file and break `master` → maintainers re-run CI before merging pull requests that touch `test/specs` during the migration.
- **Alerts do not fall until the last piece**, which waits for the held files.

## Pieces

"Lines" are hand-written changed lines; lockfile, images and unedited renamed content are excluded. Conversion pieces are exempt from the usual size limit (D1).

| Piece | Builds | Files | Fails without it | Lines | Waits on |
| --- | --- | --- | --- | --- | --- |
| P1 | Vitest beside Karma: main config, setup, suffix rule, 0.4 alias, CI wiring, one converted spec (`global.defaults`) | `package.json`, `pnpm-lock.yaml`, `vitest.config.js`, `test/setup.js`, `test/index.js`, `karma.conf.cjs`, `test/.eslintrc.yml`, `.github/workflows/ci.yml`, `.gitignore`, `docs/developers/contributing.md`, `test/specs/global.defaults.spec.js` | `pnpm run test-ci-vitest` does not exist; with the rename alone `global.defaults` runs nowhere | ~190 | nothing |
| P2 | Fixtures under Vitest: central fixture spec, CommonJS transform, update mode, Karma stub, image-test docs | `test/specs/fixtures.spec.js`, `vitest.config.js`, `package.json`, `test/index.js`, 4 fixture files, `docs/developers/contributing.md`; fixture configs or images that need attention: **wide** | after the stub no runner compares any image | ~100 + wide | P1 |
| P3 | Built-bundle smoke suite | `vitest.umd.config.js`, `test/integration/umd-browser/umd.spec.js`, `package.json`, `test/.eslintrc.yml`, `docs/developers/contributing.md` | a bundle with part of the namespace missing passes every test | ~110 | P1 |
| P4 | Convert free specs: helpers, elements, small files (17 files, 3,047 spec lines) | `helpers.{canvas,collection,core,curve,easing,interpolation,options,segment}`, `element.{arc,bar,line,point}`, `global.namespace`, `mixed`, `plugin.colors`, `scale.radialLinear`; `plugin.subtitle.tests.js` deleted (only a fixture line) | those specs keep Karma alive | ~40 | P1, P2 |
| P5 | Convert free specs: controllers (3 files, 1,315 lines) | `controller.{bubble,polarArea,radar}` | as P4 | ~105 | P1, P2 |
| P6 | Convert free specs: core (9 files, 3,833 lines) | `core.{animator,datasetController,defaults,element,helpers,interaction,layouts,plugin,registry}` | as P4 | ~150 | P1, P2 |
| P7 | Convert held specs: controllers (3,727 lines) | `controller.{bar,doughnut,line,scatter}` | as P4 | ~90 | P1, P2, held-file rule |
| P8 | Convert held specs: core (3,736 lines; 22 `done` tests) | `core.{animation,animations,controller,scale,ticks}` | as P4 | ~210 | P1, P2, held-file rule |
| P9 | Convert held specs: helpers and platform (2,145 lines); the worker test moves to the smoke suite | `helpers.{color,config,dom,math}`, `platform.{basic,dom}`, `test/integration/umd-browser/worker.js` | as P4 | ~120 | P1, P2, P3, held-file rule |
| P10 | Convert held specs: plugins (4,044 lines) | `plugin.{decimation,filler,legend,title,tooltip}` | as P4 | ~85 | P1, P2, held-file rule |
| P11 | Convert held specs: scales (4,513 lines) | `scale.{category,linear,logarithmic,time}` | as P4 | ~75 | P1, P2, held-file rule |
| P12 | Remove Karma: delete `karma.conf.cjs`, `test/index.js`, `test/seed-reporter.cjs`, `test/BasicChartWebWorker.js`; remove 16 dev dependencies and the alias; `dev` scripts become Vitest; old-suffix guard; CI without xvfb and with one Coveralls upload; docs | `package.json`, `pnpm-lock.yaml`, `vitest.config.js`, `.github/workflows/ci.yml`, `test/.eslintrc.yml`, `docs/developers/contributing.md`, the four deleted files | `pnpm why karma` still lists it | ~110 edited, ~210 deleted | P3-P11; no `*.tests.js` left |

Check for every conversion piece (P4-P11): the Vitest test count rises by exactly the number Karma's falls; both totals go in the pull request description.

P2 and P3 can be built in parallel after P1. P4, P5 and P6 share no file and can be built in parallel after P2. P7-P11 share no file with each other; a piece may be split by file when only some of its files are free.

Shared files with open pull requests: `package.json` (#12402, one line in `dependencies`), `.github/workflows/ci.yml` (#12305, #12392: one line each; #12315: already conflicts with `master`), `pnpm-lock.yaml` (regenerated on either side). None of these makes a piece wait; the other pull request rebases. No piece touches `rollup.config.js`.

Held spec files as of 2026-11-22 (re-evaluated when each piece starts):

| Piece | Held by |
| --- | --- |
| P7 | #11898 #12331 #12334 #12335 #12243 #12347 |
| P8 | #12402 #11173 #12332 #12218 #12314 #12323 #12391 #12411 #12421 #12244 #12327 #12379 #12401 #12302 #12352 #12383 |
| P9 | #12402 #11105 #12388 #12277 #12293 #12314 #12343 #12398 #12421 #12266 #12158 #12337 |
| P10 | #12284 #12341 #12326 #12381 #11825 #12205 #12242 #12292 #12316 #12330 #12339 #12346 #12348 #12349 #11849 #12275 |
| P11 | #12344 #12405 #12414 #12185 #12225 #12237 #12282 #12288 #12415 #12390 #12287 #12289 #12406 |

## Contracts

- **P1 → all later pieces:** any `test/specs/**/*.spec.js` runs under Vitest with `globals: true`; the globals `Chart`, `moment`, `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize`, `createMockContext`, `triggerMouseEvent` exist; `restoreMocks` is on; coverage lands in `coverage/vitest/lcov.info`; a file named `*.tests.js` runs under Karma only.
- **P2 → P4-P11:** every fixture directory runs from `fixtures.spec.js`, so a conversion deletes the spec's `jasmine.fixture.specs` line rather than replacing it.
- **P3 → P9:** the smoke suite exists and serves `dist/chart.umd.min.js`, so the worker test has somewhere to move.
- **P3-P11 → P12:** no `*.tests.js` file remains and the smoke suite is in `pnpm test-ci`.

## Open Questions

1. **Held files (P7-P11).** When is a spec file that open pull requests touch converted? Proposed: when no open pull request touches it, or 30 days after P6 merges, whichever comes first; pull requests opened before 2026 (#11105, #11140, #11173, #11188, #11825, #11849, #11898) and pull requests opened after P1 merges never hold a file. At the cut-off each affected pull request gets a comment with the rebase recipe (the table in D5).
2. **WebKit.** Chromium and Firefox only, as today, or WebKit as well? Proposed: not in this change; WebKit's text rendering will fail image fixtures, so it is a follow-up with fixtures excluded.
