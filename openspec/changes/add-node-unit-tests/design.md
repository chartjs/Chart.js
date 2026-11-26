## Context

The Karma-to-Vitest migration (archived as `2026-11-26-migrate-tests-to-vitest`) left one Vitest config, `vitest.config.js`, with browser mode on. It runs `test/specs/**/*.spec.js` in Chromium and Firefox, with `fileParallelism: false`, `globals`, `restoreMocks`, `sequence.shuffle`, istanbul coverage of `src/**` into `coverage/vitest`, and `setupFiles: ['test/setup.js']`. That setup writes the helper globals (`acquireChart`, `afterEvent`, `releaseChart`, `waitForResize`, `createMockContext`, `triggerMouseEvent`) onto `window`. It also calls `setup()` from `chartjs-test-utils`, which injects CSS through `document`. No file uses a `@vitest-environment` marker.

These read or decide where a spec runs:

- `vitest.config.js`: `include`, the browser instances (only Chromium when `UPDATE_FIXTURES=1`), coverage, and the `*.tests.js` guard.
- `test/setup.js`, and `test/specs/vitest.setup.spec.js`, which pins it.
- `package.json`:
  - `dev` = `vitest --project chromium`, `dev:ff` = `vitest --project firefox`;
  - `fixtures:update`;
  - `test-ci-vitest` = `vitest run --coverage --browser.headless`;
  - `test-ci-umd`;
  - `test-ci-integration` = `pnpm --filter "./test/integration/**" test`. That script runs the consumer packages, and it is what "integration" already names in this repository.
- `.github/workflows/ci.yml`:
  - the `test` paths filter covers `test/**` and `vitest*.config.js`;
  - Playwright install and `pnpm run test-ci` run only when `runner.os != 'Windows'`, so the Windows job runs no tests;
  - Coveralls uploads `./coverage/vitest/lcov.info`.
- `test/.eslintrc.yml`: the override for the Vitest globals lists `specs/**/*.spec.js`, `setup.js`, `vitest.shared.js`, `umd/**/*.spec.js` and `setup.umd.js`.
- `docs/developers/contributing.md`: the command list (:32-37), "The specs … run in Vitest browser mode, in Chromium and Firefox" (:40), filtering (:44), the seed (:48), and the commands the `.tests.js` guard stops (:52).

**What runs in Node today.** Every spec was run with `environment: 'node'` and a setup of `expect.extend(matchers)` from `chartjs-test-utils`, `globalThis.Chart` from `src/index.umd.ts` and the colors plugin disabled.

- **Pass unchanged, 14 files, 215 of 215 tests, in 0.85 s:** `core.animation`, `core.defaults`, `core.element`, `core.registry`, `element.bar`, `global.namespace`, and `helpers.collection`, `core`, `easing`, `math`, `options`, `segment`, `config` and `interpolation`.
  - `src/` imports in Node without a shim.
  - The `matchers` export of `chartjs-test-utils` 1.1.2 loads in Node; only `setup()` needs the DOM.
- **Pass after a one-line edit:** `core.helpers` and `helpers.curve`. Each reads `helpers = window.Chart.helpers` in `beforeAll`, which throws in Node. Vitest then reports the tests as skipped, with a file error. With `Chart.helpers` they pass.
- **Need a browser for some tests:** `helpers.color`, `core.ticks`, `core.animations`, `element.point`, `element.line`, `core.animator`, `helpers.canvas` and `element.arc` each have tests that need `window`, `Image`, a gradient or `acquireChart`.

**A full split run** used `unit` for the 14 files and the browser project with the same files excluded.

- **Tests:** 3,569 (215 + 2 × 1,677), against 3,784 (2 × 1,892) before. Every test still runs, and the 14 files lose only their two browser copies.
- **Time:** about 51 s against 57 s.
- **Coverage:** istanbul statements 97.07% against 97.05% before. One lcov held hits from both environments: `_factorize` from Node, `getRelativePosition` from the browsers.
- **Fixtures:** 15 image fixtures failed on the Mac used, before and after the split alike. They are local rendering differences and unrelated to this change.

## Goals / Non-Goals

**Goals:**

- Run the specs that need no DOM in Node, fast, with no browser installed.
- Every spec runs in exactly one project. No spec can silently run in neither.
- One Vitest run in CI with one merged coverage report, so Coveralls does not change.
- No spec file moves or is renamed. About 40 open pull requests edit `test/specs/*.spec.js`.

**Non-Goals:**

- Splitting the browser-only tests out of the partly passing specs (Decision 6).
- Replacing the helper globals with imports, or converting specs or fixtures.
- Renaming `test/integration` or `test-ci-integration`.
- A `jsdom` or `happy-dom` environment. A fake DOM would judge layout and canvas code against something that is not a browser.

## Decisions

1. **One explicit list decides the project.** `const unitSpecs = [...]` in `vitest.config.js` is the `include` of the `unit` project and the `exclude` of the `browser` project. Because the same constant feeds both, a file is in exactly one project, and a new spec defaults to the browsers.
   - **Stale entries:** the config refuses to start when an entry names a file that does not exist, in the same way as the `.tests.js` guard. A typo cannot quietly send a file elsewhere.
   - *A `// @vitest-environment node` marker:* rejected. It edits 14 held spec files, and Vitest ignores the marker in browser mode, so the config would have to scan file heads anyway.
   - *A naming rule (`*.unit.spec.js`) or a `test/unit` directory:* rejected, because both need renames.
   - *A lint override with `env.browser: false` for the unit specs:* rejected. It would be a second copy of the list. The root ESLint config enables both the browser and Node environments, so lint cannot catch `window` in a unit spec. The runtime failure does that instead (Decision 4).
2. **Unit specs run only in Node.** Node and Chromium are both V8. The one thing the browser copies add is Firefox's engine on pure helpers, which every chart spec in Firefox already exercises indirectly. The browser copies cost about 4 s.
   - *Also run them in both browsers:* not chosen. It doubles the work for little gain.
3. **One config with two projects.** The root `test` keeps what both projects share: `globals`, `restoreMocks`, `sequence.shuffle` and `coverage`. The projects are:
   - `{extends: true, test: {name: 'unit', environment: 'node', include: unitSpecs, setupFiles: ['test/setup.node.js']}}`;
   - `{extends: true, test: {name: 'browser', include: ['test/specs/**/*.spec.js'], exclude: unitSpecs, setupFiles: ['test/setup.js'], fileParallelism: false, browser: {...}}}`. The browser instances are named explicitly `chromium` and `firefox`, so `--project chromium` keeps selecting one instance.
   - `extends: true` carries the `chart.js` alias, `oxc` (es2022, `useDefineForClassFields`) and the plugins into the Node project, so class fields compile as they do in the build.
   - The unit project keeps Vitest's default file parallelism. Its files are pure, and the throttling concern behind `fileParallelism: false` is about browser pages.
   - *A second config file* would need a second run and two lcov files to merge. Rejected.
4. **`test/setup.node.js` sets up the Node project.** It does the following:
   - registers `expect.extend(matchers)` from `chartjs-test-utils`;
   - sets `globalThis.Chart` from `../src/index.umd.ts` and disables the colors plugin;
   - sets `globalThis.createMockContext` from `chartjs-test-utils`, which needs no DOM (checked: `createMockContext().fillRect(0, 0, 1, 1)` records the call in Node);
   - defines `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize` and `triggerMouseEvent` as functions that throw `<name> needs a browser: take <file> off unitSpecs in vitest.config.js`.

   It does not define `window`, because `_isDomSupported` (`src/helpers/helpers.dom.ts`) and `src/index.umd.ts` read its presence as a browser. It loads no moment or date adapter, because no listed spec uses them. `test/specs/vitest.setup.node.spec.js` is on the list and pins the setup:
   - `typeof window === 'undefined'`;
   - `Chart` comes from source, with class fields as own properties;
   - both matchers are registered;
   - `createMockContext` records calls;
   - colors are off;
   - `restoreMocks` applies;
   - `acquireChart` throws the hint.
5. **Scripts.**
   - `dev` = `vitest --project unit --project chromium` and `dev:ff` = `vitest --project unit --project firefox`. Without `unit` there, `pnpm dev` would silently stop running the unit specs.
   - New `test-unit` = `vitest run --project unit` and `dev:unit` = `vitest --project unit`. They launch no browser. They are named so that they do not match `test-ci-*`; otherwise `pnpm test-ci` would run the unit specs twice and split the coverage.
   - `fixtures:update` adds `--project chromium`.
   - `test-ci-vitest` is unchanged: one run over all projects and one merged lcov.
6. **The partly passing specs stay in the browsers.** Splitting the DOM tests out of `helpers.color`, `core.ticks`, `core.animations` and the others would move about 20 tests into new files. Some of those files are held by open pull requests ([#12383](https://github.com/chartjs/Chart.js/pull/12383), [#12332](https://github.com/chartjs/Chart.js/pull/12332), [#11173](https://github.com/chartjs/Chart.js/pull/11173)). The docs say how to put a spec on the list when it becomes DOM-free.
7. **Words.** The Vitest projects are `unit` (Node) and `browser` (Chromium, Firefox). The docs say "unit specs" and "browser specs". "Integration" keeps meaning the consumer packages in `test/integration`.

8. **Plan review (architecture, complexity, scope) found no defect.** Two notes changed the design:
   - `createMockContext` was neither provided nor stubbed in Node. It works without a DOM, so the Node setup provides it (Decision 4) instead of leaving it as a bare `ReferenceError`.
   - The docs task now also extends the sentence at `contributing.md:52`, which lists the commands the `.tests.js` guard stops, to the stale-entry guard.

9. **The user's answers (2026-11-26).**
   - The Windows CI job runs the unit specs: P3 is in.
   - Unit specs run only in Node (Decision 2).
   - The names are `unit` and `browser`, with the scripts `test-unit` and `dev:unit` (Decision 7).

## Risks / Trade-offs

- **A test that guards itself** with `it.skipIf(typeof window === 'undefined')` would run nowhere. → The docs forbid it, and a reviewer sees it.
- **The list must be maintained by hand.** A DOM-free spec that is never added just runs in the browsers as before. That costs time, not correctness.
- **Watch mode with two projects** was not tried interactively. → P1's checks include running `pnpm dev`, saving a unit and a browser spec, and seeing each rerun.
- **`setup()` of `chartjs-test-utils`** might later register more than the matchers. The Node setup would then lack it. → The pin spec covers the matchers; a new global in `setup()` shows up as a failing unit spec.

## Pieces

Commit types `test:` and `ci:` release nothing. No issue is open for this work, so the Advances and Completes columns are empty.

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | `test: run the DOM-free specs in Node`: two projects, `unitSpecs` (14 specs and the pin spec), the stale-entry guard, the Node setup and its pin spec, the scripts, the lint override, and the contributing docs | `vitest.config.js`, `test/setup.node.js` (new), `test/specs/vitest.setup.node.spec.js` (new), `package.json` (scripts only), `test/.eslintrc.yml`, `docs/developers/contributing.md` | `pnpm exec vitest run --project unit` exits 1 on master with `No projects matched the filter "unit"`; with P1 it runs 15 files in Node and the pin spec passes | ~150 | | | |
| P2 | `test: run core.helpers and helpers.curve in Node` | `test/specs/core.helpers.spec.js`, `test/specs/helpers.curve.spec.js` (`window.Chart.helpers` → `Chart.helpers`), `vitest.config.js` (2 entries) | `pnpm test-unit core.helpers` finds no file | ~4 | P1 (the list; both change `vitest.config.js`) | | |
| P3 | `ci: run the unit specs on Windows` | `.github/workflows/ci.yml` (a step `pnpm run test-unit` with `if: runner.os == 'Windows'` and the src/test filter) | the Windows job runs no test; a failure that only shows on Windows goes unseen | ~8 | P1 (`test-unit`) | | |

P2 and P3 can be built in parallel after P1. No open pull request holds a file of any piece: `vitest.config.js`, `package.json`, `test/.eslintrc.yml`, `docs/developers/contributing.md`, `.github/workflows/ci.yml` and the two specs appear in none of the 70 open pull requests.

## Contracts

- **`unitSpecs`:** an array of repository-relative paths, `test/specs/<name>.spec.js`, exported from nowhere and read only in `vitest.config.js`. P2 appends to it.
- **Project names:** `unit`, `browser`, and the instances `chromium` and `firefox`.
- **Scripts:** `test-unit` and `dev:unit`, the names P3 and the docs use.

## Open Questions

None.
