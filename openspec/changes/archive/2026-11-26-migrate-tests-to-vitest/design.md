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
- Keep the cost to open pull requests small: a mechanical conversion and a recipe for rebasing.
- End with no Karma or Jasmine package in the lockfile.

**Non-Goals:**

- No change under `src/`, to `rollup.config.js`, or to the published package.
- No WebKit run (D14).
- No rewrite of fixtures to ES modules, and no replacement of the helper globals with imports. Both can follow as separate mechanical changes.
- No removal of unused dev dependencies that are unrelated to Karma (`@rollup/plugin-inject`, `esm`, `glob`).
- No migration of the docs toolchain or of ESLint.

## Decisions

Notes from building P1:

- What fails without P1: Karma's old glob (`*.js`) also matched `*.spec.js`, so before P1 Karma ran the converted `global.defaults.spec.js` and failed on `vi`; after P1 Karma skips it and Vitest runs its 5 tests.
- Unbundled, `Chart.register(namespace)` registered nothing at first, because `isObject()` rejected a real module namespace (`[object Module]`); the bundle has plain objects there. `test/setup.js` worked around it by registering `Object.values()` of each of `registerables` itself (D7). `Registry._each` now loops `Object.values(arg)` for anything that is not an array (#12438), so the workaround is gone and `test/specs/vitest.setup.spec.js` pins the case with real namespaces.

Notes from building P2:

- `test/fixtures/scale.linear/grace/grace-10%.{js,png}` is renamed `grace-10-percent`: Vite puts the `%` raw into the import URL, its server rejects the request as a malformed URI, and the whole fixture spec fails to load.
- `test/.eslintrc.yml` gains an override that declares `triggerMouseEvent` for `fixtures/**/*.js`; without it the D5 replacement in the four fixtures fails `no-undef`.
- D7's identity question had a real answer: `moment` was not pre-bundled, so the excluded adapter imported its own copy beside the one inside the `moment-timezone` pre-bundle, and formatted dates in the machine's zone instead of `Etc/UTC`. `optimizeDeps.include` lists `moment`; a test in `test/specs/vitest.setup.spec.js` pins it in any zone. On a machine whose clock is UTC, as CI's is, the time-scale fixtures cannot show this.
- Local image results differ from CI's: on macOS, Karma itself fails 6 to 7 fixtures on `master`. The D11 count is taken from the pull request's CI run on Ubuntu; local results are listed beside Karma's local failures for comparison only.
- `controller.line/point-style-offscreen-canvas` failed in both browsers with `chartjs-test-utils` 1.1.1, whose image matcher accepted only a `CanvasRenderingContext2D`, not the `OffscreenCanvasRenderingContext2D` of a chart on an `OffscreenCanvas`. `chartjs-test-utils` 1.1.2 (https://github.com/chartjs/chartjs-test-utils/pull/45) accepts it, and the fixture passes against its existing reference image in both browsers.
- D11's premise, that 1.x compares with pixelmatch 8 blending against white as pixelmatch 5 did, holds only for the blending. Pixelmatch 8 also measures colour difference in OKLab instead of YIQ, so each fixture's `threshold`, tuned for pixelmatch 5, now admits a different difference. On the same Vitest render, `controller.doughnut/doughnut-circumference-over-2pi` differs by 0 pixels under pixelmatch 5 and by 1306 (0.5%) under pixelmatch 8; `controller.doughnut/single-slice-opacity` and `scale.linear/min-max-skip/no-collision` go from 0.09% to just over their 0.1% tolerance in Firefox. The maintainers kept pixelmatch 8 and update references as needed: `doughnut-circumference-over-2pi.png` is regenerated from Chromium, and the two Firefox-only fixtures, whose Chromium render already matches, get a `tolerance` of 0.0012 instead of the default 0.001.

Notes from building P9:

- The web-worker test moved to the smoke suite needs two files beyond the row. `test/.eslintrc.yml` gains an override with the `worker` environment for `test/umd/worker.js`, which calls `importScripts` and `postMessage`. The smoke-suite paragraph of `docs/developers/contributing.md` now says the suite creates a chart in a web worker.
- The moved test drops the `pending()` guard for a missing `transferControlToOffscreen`: both browsers of D14 have it. It rejects on the worker's `error` event, since a bundle that does not load throws in the worker before it can post a message.
- After the move nothing loads `test/BasicChartWebWorker.js`; the file and its `karma.conf.cjs` entry go with Karma in P12.

### D1. Both runners side by side; free files first, in large pieces
Decided by the maintainers. Spec files no open pull request touches are converted first, grouped by area into large pieces, because a conversion edits only 2-3% of a file's lines and is mechanical. Files that open pull requests touch follow straight after (D13).
*Alternatives:* a compatibility layer that runs the specs unedited (keeps Jasmine vocabulary indefinitely); one conversion of everything at once (conflicts with about 65 open pull requests).

### D2. Specs run against source; a smoke suite covers the built bundle
Decided by the maintainers. The main suite imports `src/index.umd.ts`, the same entry the UMD bundle is built from, so `Chart` has the same shape (`Chart.helpers`, `Chart._adapters`, ...) that specs and fixtures use. A second Vitest config runs a small suite in `test/umd/` against `dist/chart.umd.min.js`: the namespace assertions, about ten existing fixtures named one by one (one per controller, one filler, one legend, one `core.interaction` fixture that drives mouse events, none with a time scale because that would need the adapter as a script), and the web-worker test, which needs the built bundle by nature. It has its own setup file, `test/setup.umd.js`, which loads the bundle with a script tag and calls `setup({Chart: window.Chart, ...})`; it does not use `test/setup.js` or the `src` alias. Like `test/setup.js`, the setup pins `window.devicePixelRatio = 1`, sets the `triggerMouseEvent` global and disables the colors plugin; it sets no `moment` and no time zone, since no smoke fixture has a time scale. `vitest.umd.config.js` stops at startup when `dist/chart.umd.min.js` does not exist, and the script tag's `onerror` rejects if it still cannot load. The smoke suite collects no coverage: the bundle is minified, coverage measures `src/` through the main suite (D8), and Vitest would clean `coverage/vitest` while the main suite writes it in the same `pnpm test-ci` run. This is a narrower guarantee than today: a minification fault in code these tests do not reach (most of the tooltip, animation and scale code) passes. Running every fixture against the bundle in Chromium is one glob away if that proves too thin.
*Alternative:* run everything against the minified bundle as today (needs a build before every run and coverage through source maps).

### D3. Two versions of `chartjs-test-utils` during the migration
`chartjs-test-utils` becomes `^1.1.1` in the first piece. Karma keeps 0.4 through an npm alias, `"chartjs-test-utils-karma": "npm:chartjs-test-utils@^0.4.0"`, imported by `test/index.js`. The last piece deletes the alias. Follows from fact 1.
*Unverified:* that Karma's rollup preprocessor resolves the alias. P1 proves it by Karma staying green.

### D4. A file name suffix tells the runners apart
Karma's glob becomes `test/specs/**/*.tests.js`, including its `--grep` form (`test/specs/**/*<grep>*.tests.js`); Vitest's is `test/specs/**/*.spec.js`. Converting a file is `git mv x.tests.js x.spec.js` plus the idiom edits, so no shared list exists and conversion pieces never touch a common file. After Karma is removed, the Vitest config fails at startup if any `*.tests.js` remains, naming the file.
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
| `jasmine.createSpy(...).and.returnValue(v)` | `vi.fn(() => v)` |
| `.calls.count()` / `.calls.argsFor(i)` / `.calls.first().args` / `.calls.all()` / `.calls.reset()` | `.mock.calls.length` / `.mock.calls[i]` / `.mock.calls[0]` / `.mock.calls` / `.mockClear()` |
| `.calls.mostRecent().args` | `.mock.lastCall` |
| `.calls.first().object` | `.mock.contexts[0]` |
| `.calls.all()[i].object` | `.mock.contexts[i]` |
| `jasmine.objectContaining` / `jasmine.any` | `expect.objectContaining` / `expect.any` |
| `toBeTrue()` / `toBeFalse()` | `toBe(true)` / `toBe(false)` |
| `expect(x).withContext(m)` | `expect(x, m)` |
| `expect(x).withContext(i)` with a number `i` | ``expect(x, `${i}`)`` |
| `function(done)` | an `async` test awaiting a Promise; `done.fail(m)` rejects |
| `fail(m)` | `expect.unreachable(m)` |
| `fail(m)` in a callback that must not run | a flag the callback sets, and `expect(flag, m).toBe(false)` after the wait (a throw from an observer or timer callback is not attributed to the test) |
| `pending()` | `ctx.skip()` |
| `this.x` in hooks and tests | a `let` in the enclosing `describe` |
| `jasmine.addMatchers({...})` | `expect.extend({...})` in that spec |
| `jasmine.clock().withMock(fn)` | `vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']})`, then the body in `try { ... } finally { vi.useRealTimers(); }` (the timers Jasmine's clock mocks; Vitest's default would also fake `requestAnimationFrame` and stall the animator, and `restoreMocks` does not restore timers) |
| `jasmine.clock().tick(n)` | `vi.advanceTimersByTime(n)` |
| `toBe(0)` / `toEqual(0)` on a value that can be -0 | `toBeCloseTo(0)` (Jasmine's `toBe` is `===`; Vitest's `toBe` and `toEqual` use `Object.is`) |
| `toBeGreaterThan(m)` / `toBeLessThan(m)` and the other comparison matchers given a non-number such as a moment | pass `m.valueOf()` (Jasmine coerces with `>` / `<`; Vitest requires a number or bigint) |

Config that keeps Jasmine's implicit behaviour: `restoreMocks: true` (Jasmine removes spies after each spec), `fileParallelism: false` (Karma ran one page serially; animation and resize specs need unthrottled frames), an explicit `browser.viewport` (Vitest's default is 414x896; Karma ran in a full window), and shuffled test order with the seed printed, as Jasmine does today.

A recorded `this` can differ: Jasmine's spy is sloppy-mode code, so a call with `this` of `undefined` or `null` records `window`, while `vi.fn()` is strict and records the value passed; assert that value. Vitest drops a falsy message, so a numeric context such as a loop index `0` is turned into a string.

`toEqual` stays `toEqual`. Vitest's is slightly looser than Jasmine's (it ignores `undefined` properties and constructors); converting to `toStrictEqual` would change meaning in the other direction and is not mechanical.

### D6. Fixtures run from one spec and stay CommonJS
`test/specs/fixtures.spec.js` holds the `import.meta.glob` calls and `createFixtures`, and registers one `describe` per top-level fixture directory, derived from the globbed keys. This keeps `scale.timeseries` covered (fact 4), loads the 1,334 fixture modules once per browser instead of once per spec file, and lets new fixture directories run without a spec line. A small Vite transform wraps `test/fixtures/**/*.js` files that contain `module.exports` as ES modules, so fixtures in open pull requests keep working. If the transform does not work out in P2, the same piece switches to globbing with `?raw` and evaluating as 0.4 does; only one of the two mechanisms is merged. The transform exists only because Karma must read the same files. Rewriting the fixtures to `export default` and deleting the transform is a follow-up change after Karma is gone, not part of this one.

The per-directory `describe` blocks are what let a contributor run one area's fixtures (`-t controller.bar`), since all fixtures now live in one spec file and a file-path filter no longer selects them.

Ownership of fixtures moves in one piece: when `fixtures.spec.js` lands, `jasmine.fixture.specs` in `test/index.js` becomes a stub that registers one placeholder spec (Jasmine rejects an empty `describe`), so each fixture has exactly one runner and no held spec file is edited.

Update mode follows the plugins: `UPDATE_FIXTURES=1` registers the `saveFixtureImage` command from `chartjs-test-utils/node` and narrows the run to Chromium; the script is `fixtures:update`.
*Alternatives:* a fixture line in each converted spec (drops `scale.timeseries`, 25 eager globs); rewriting all 527 fixtures to `export default` (Karma could no longer read them during the migration).

### D7. Setup reproduces `test/index.js`
`test/setup.js` imports `Chart` from `src/index.umd.ts`, pins `window.devicePixelRatio = 1`, and calls `setup({Chart, devicePixelRatio: Chart.defaults.devicePixelRatio})`. The second argument stops 1.x from overwriting the scriptable default, which `core.controller` specs rely on when they set `window.devicePixelRatio = 3`. It imports `moment-timezone`, sets `window.moment` and the default zone, imports `chartjs-adapter-moment`, and disables the colors plugin. The Vitest config aliases `chart.js` to `src/index.ts` and keeps the adapter out of dependency pre-bundling so that the adapter registers on the same module instances the specs use.
*Unverified:* the adapter and moment identity. P2's 41 time-scale fixtures fail if it is wrong.

### D8. Coverage with the istanbul provider, one report per runner
`@vitest/coverage-istanbul` (v8 coverage is refused once a non-Chromium browser is configured), `include: src/**`, lcov and HTML reports into `coverage/vitest/` (its own directory, because Vitest cleans its reports directory and Karma writes `coverage/chrome` and `coverage/firefox` in the same run). During the migration a third parallel Coveralls step uploads it with flag `<os>-vitest`; at the end it is the only upload. The per-browser flags disappear because Vitest merges browsers into one report. Branch protection on `master` requires only `build (ubuntu-latest)` and `build (windows-latest)`, so no Coveralls check blocks this.

### D9. Browsers and CI
Chromium and Firefox through `@vitest/browser-playwright`, with the launch options Karma uses today set on the provider (Vitest ignores them on an instance). CI installs browsers with an explicit `pnpm exec playwright install --with-deps chromium firefox` step, under the same condition as the test step (not on Windows, where tests do not run); locally it is a documented one-time command, not chained into scripts. The `test` paths filter in `ci.yml` gains `vitest*.config.js`, so that a change to a Vitest config alone still runs the tests, and its `karma.conf.js` entry is corrected to `karma.conf.cjs`. P3 also adds `rollup.config.js` to it: the smoke suite tests rollup's output, so a change to the bundle's build config runs the tests. xvfb stays only while Karma exists.

### D10. Config files are JavaScript
`vitest.config.js` and `vitest.umd.config.js`, not `.ts`: `tsconfig.json` includes only `src` and nothing typechecks root tooling. What both configs need is written once, in `test/vitest.shared.js`: the Playwright provider with its launch options, the viewport, and from P2 the fixture transform. The smoke config imports those and nothing else from the main config, so it never inherits the `src` alias or `test/setup.js`.

### D11. Reference images are not regenerated in bulk
1.x compares with pixelmatch 8 blending against white, as pixelmatch 5 did. P2 runs all 667 images under Playwright's browsers for the first time. If more than a handful fail, P2 stops and brings the list to the maintainers instead of regenerating. The maintainers chose this over the alternative below. What unblocks it is a decision per failing fixture: raise its tolerance, or regenerate its image from Chromium with the update command after looking at the difference. No fixture stays behind on Karma.
*Alternative:* a per-directory ownership list, so that directories whose images pass move to Vitest while the rest stay on Karma. It would let the conversion pieces start before every image is settled, at the cost of a second mechanism that every later piece has to consult; the failing images have to pass under Vitest in the end either way.

### D12. Script names during the migration
`dev` and `dev:ff` stay Karma and `dev:vitest` is added; the last piece makes `dev` and `dev:ff` the Vitest commands and removes `dev:vitest`.

### D13. Held spec files are converted right after the free ones, without waiting
Decided by the maintainers, after review of this design asked for a more aggressive rule than the first draft's 30-day wait. Open pull requests do not hold a spec file. The files that open pull requests touch (P7-P11) are converted as soon as the free ones (P4-P6) are in, so that Karma can be removed without an open-ended wait. A conversion edits 2-3% of a file's lines and git follows the rename, so a pull request conflicts only where it touches one of those lines. Open pull requests that touch a converted file get no comment (D15); the rebase recipe is the conversion table in `docs/developers/contributing.md`, which is the table in D5. Converting the free files first still matters: it proves the recipe on files nobody else is editing. A new `*.tests.js` file that a pull request adds during the migration runs under Karma until P12, which converts whatever is left.
*Alternatives:* wait until a file is free or for a fixed period (the first draft; 74 open pull requests touch test or tooling files, 20 of them not updated in three months, so the wait would mostly be for pull requests that are not moving); wait for every pull request (no end date for removing Karma).

### D14. Chromium and Firefox only
Decided by the maintainers. The same browsers CI uses today. WebKit can be tried as a follow-up with image fixtures excluded, because its text rendering will not match the reference images.

### D15. No rebase-recipe comments on open pull requests
Decided by the user on 2026-11-26. The per-pull-request comments with the rebase recipe that D13 first planned are dropped, and none were posted. A pull request that still adds or edits a `*.tests.js` file finds the recipe through the test command, which fails and names the file, and the conversion table in `docs/developers/contributing.md`.

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
- **Alerts do not fall until the last piece.**
- **Open pull requests may need a rebase** when P7-P11 convert the files they touch (D13) → the recipe is the conversion table in the contributing docs; no comments are posted (D15).
- **P2 gates everything after it.** If many reference images fail under Playwright's browsers, P3-P12 wait until the list is settled (D11).
- **Vitest's shuffled order and seed output are unverified** → P1 checks that the seed is printed and can be replayed, because `test/seed-reporter.cjs` goes away in P12.

## Pieces

"Lines" are hand-written changed lines; lockfile, images and unedited renamed content are excluded. Conversion pieces are exempt from the usual size limit (D1).

| Piece | Builds | Files | Fails without it | Lines | Waits on |
| --- | --- | --- | --- | --- | --- |
| P1 | Vitest beside Karma: main config, shared config module, setup, suffix rule, 0.4 alias, CI wiring, one converted spec (`global.defaults`) | `package.json`, `pnpm-lock.yaml`, `vitest.config.js`, `test/vitest.shared.js`, `test/setup.js`, `test/index.js`, `karma.conf.cjs`, `test/.eslintrc.yml`, `.github/workflows/ci.yml`, `.gitignore`, `docs/developers/contributing.md`, `test/specs/global.defaults.spec.js` | `pnpm run test-ci-vitest` does not exist; with the rename alone `global.defaults` runs nowhere | ~190 | nothing |
| P2 | Fixtures under Vitest: central fixture spec, CommonJS transform, update mode, Karma stub, image-test docs | `test/specs/fixtures.spec.js`, `test/vitest.shared.js`, `vitest.config.js`, `package.json`, `test/index.js`, 4 fixture files, `docs/developers/contributing.md`; fixture configs or images that need attention: **wide** | after the stub no runner compares any image | ~100 + wide | P1 |
| P3 | Built-bundle smoke suite | `vitest.umd.config.js`, `test/setup.umd.js`, `test/umd/umd.spec.js`, `package.json`, `.github/workflows/ci.yml` (paths filter), `test/.eslintrc.yml`, `docs/developers/contributing.md` | a bundle with part of the namespace missing passes every test | ~130 | P1, P2 |
| P4 | Convert free specs: helpers, elements, small files (17 files, 3,047 spec lines) | `helpers.{canvas,collection,core,curve,easing,interpolation,options,segment}`, `element.{arc,bar,line,point}`, `global.namespace`, `mixed`, `plugin.colors`, `scale.radialLinear`; `plugin.subtitle.tests.js` deleted (only a fixture line) | those specs keep Karma alive | ~40 | P1, P2 |
| P5 | Convert free specs: controllers (3 files, 1,315 lines) | `controller.{bubble,polarArea,radar}` | as P4 | ~105 | P1, P2 |
| P6 | Convert free specs: core (9 files, 3,833 lines) | `core.{animator,datasetController,defaults,element,helpers,interaction,layouts,plugin,registry}` | as P4 | ~150 | P1, P2 |
| P7 | Convert specs that open pull requests touch: controllers (3,727 lines) | `controller.{bar,doughnut,line,scatter}` | as P4 | ~90 | P1, P2 |
| P8 | Convert specs that open pull requests touch: core (3,736 lines; 22 `done` tests) | `core.{animation,animations,controller,scale,ticks}` | as P4 | ~210 | P1, P2 |
| P9 | Convert specs that open pull requests touch: helpers and platform (2,145 lines); the worker test moves to the smoke suite | `helpers.{color,config,dom,math}`, `platform.{basic,dom}`, `test/umd/umd.spec.js`, `test/umd/worker.js` | as P4 | ~120 | P1, P2, P3 |
| P10 | Convert specs that open pull requests touch: plugins (4,044 lines) | `plugin.{decimation,filler,legend,title,tooltip}` | as P4 | ~85 | P1, P2 |
| P11 | Convert specs that open pull requests touch: scales (4,513 lines) | `scale.{category,linear,logarithmic,time}` | as P4 | ~75 | P1, P2 |
| P12 | Remove Karma: convert any `*.tests.js` added since; delete `karma.conf.cjs`, `test/index.js`, `test/seed-reporter.cjs`, `test/BasicChartWebWorker.js`; remove 15 dev dependencies (`karma`, `karma-chrome-launcher`, `karma-coverage`, `karma-edge-launcher`, `karma-firefox-launcher`, `karma-jasmine`, `karma-jasmine-html-reporter`, `karma-rollup-preprocessor`, `karma-safari-private-launcher`, `karma-spec-reporter`, `jasmine-core`, `rollup-plugin-istanbul`, `@rollup/plugin-commonjs`, `yargs`, `pixelmatch`) and the alias; `dev` scripts become Vitest; old-suffix guard; CI without xvfb and with one Coveralls upload; docs | `package.json`, `pnpm-lock.yaml`, `vitest.config.js`, `.github/workflows/ci.yml`, `test/.eslintrc.yml`, `docs/developers/contributing.md`, the four deleted files | `pnpm why karma` still lists it | ~110 edited, ~210 deleted | P3-P11; no `*.tests.js` left |

Check for every conversion piece (P4-P11): every test that leaves Karma arrives in Vitest. Counted without the fixture placeholders that the Karma stub registers (one per `jasmine.fixture.specs` line, removed with the line), Karma's test count falls by exactly the number Vitest's rises, per browser. `plugin.subtitle.tests.js` holds only a placeholder, so deleting it moves nothing. In P9 the worker test arrives in the smoke suite instead. Both totals, and the placeholders removed, go in the pull request description.

P3 follows P2, because it reuses the fixture transform and both edit `test/vitest.shared.js`. P3, P4, P5 and P6 share no file and can be built in parallel after P2. P7-P11 share no file with each other and can be built in parallel once P4-P6 have shown the recipe works.

Shared files with open pull requests: `package.json` (#12402, one line in `dependencies`), `.github/workflows/ci.yml` (#12305, #12392: one line each; #12315: already conflicts with `master`), `pnpm-lock.yaml` (regenerated on either side). None of these makes a piece wait; the other pull request rebases. No piece touches `rollup.config.js`.

Open pull requests that touch each piece's files as of 2026-11-22 (listed again when the piece starts):

| Piece | Touched by |
| --- | --- |
| P7 | #11898 #12331 #12334 #12335 #12243 #12347 |
| P8 | #12402 #11173 #12332 #12218 #12314 #12323 #12391 #12411 #12421 #12244 #12327 #12379 #12401 #12302 #12352 #12383 |
| P9 | #12402 #11105 #12388 #12277 #12293 #12314 #12343 #12398 #12421 #12266 #12158 #12337 |
| P10 | #12284 #12341 #12326 #12381 #11825 #12205 #12242 #12292 #12316 #12330 #12339 #12346 #12348 #12349 #11849 #12275 |
| P11 | #12344 #12405 #12414 #12185 #12225 #12237 #12282 #12288 #12415 #12390 #12287 #12289 #12406 |

## Contracts

- **P1 → all later pieces:** `test/vitest.shared.js` exports the browser provider with its launch options and the viewport; any `test/specs/**/*.spec.js` runs under Vitest with `globals: true`; the globals `Chart`, `moment`, `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize`, `createMockContext`, `triggerMouseEvent` exist; `restoreMocks` is on; coverage lands in `coverage/vitest/lcov.info`; a file named `*.tests.js` runs under Karma only.
- **P2 → P4-P11:** every fixture directory runs from `fixtures.spec.js`, so a conversion deletes the spec's `jasmine.fixture.specs` line rather than replacing it.
- **P2 → P3:** `test/vitest.shared.js` exports the fixture transform, so a second config can load `.js` fixtures. `createFixtures` selects by directory only, so the smoke spec builds its own `configs` and `images` maps from a literal list of fixture files.
- **P3 → P9:** the smoke suite exists in `test/umd/`, loads `dist/chart.umd.min.js` through `test/setup.umd.js` and is part of `pnpm test-ci`, so the worker test has somewhere to move.
- **P3-P11 → P12:** no `*.tests.js` file remains and the smoke suite is in `pnpm test-ci`.

## Open Questions

None.

## Review

Changes made after the design was reviewed, and why:

- **P3 now follows P2 and a shared config module exists (D10).** The smoke suite needs the fixture transform, the provider options and its own setup; without a shared module two configs would have carried copies that drift.
- **The smoke suite moved to `test/umd/`** from `test/integration/`, where every other directory is a workspace package.
- **The narrowed guarantee of the smoke suite is stated** (D2, proposal), and a mouse-driven fixture was added to it.
- **The time-zone requirement was removed from the spec.** The suite sets a default zone of UTC, as today, but nothing has ever verified that it passes on a non-UTC machine, and promising that would be a new guarantee nobody asked for.
- **A requirement and a task check that every fixture runs**, because `scale.timeseries` has already run only by accident once.
- **The count check for conversion pieces excludes the Karma stub's placeholders**; as first written it would have reported a false mismatch on almost every piece.
- **Fixture filtering by directory is specified and documented**, since a file-path filter no longer selects an area's fixtures.
- **The Karma-only dev dependencies are named**, and what contributors lose with Karma is listed in the proposal.
- **D11 says what unblocks P2** if many images fail, and records the per-directory alternative that was not taken.
- **CI details:** the paths filter names the Vitest configs, and the Playwright install is skipped on Windows.
- **D13 no longer waits for open pull requests.** A maintainer reviewing the design asked for a more aggressive rule; the 30-day wait would mostly have been for pull requests that are not moving.
