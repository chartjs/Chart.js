## Why

Every spec under `test/specs` runs in a browser, twice: once in Chromium and once in Firefox. That includes the specs for pure helpers, option resolution and the registry, which need no DOM or canvas. Those specs cannot run without the Playwright browsers installed, and they get no feedback loop faster than the browser suite's.

## What Changes

- Add a second Vitest project, `unit`, that runs in Node with no browser. A spec runs there only if its path is on one explicit list in `vitest.config.js`. Every other spec runs in the `browser` project, in Chromium and Firefox as today. No spec file moves or is renamed.
- Put the 14 specs on the list that pass in Node unchanged (215 tests). Two more join after a one-line edit each.
- Add a Node setup file that registers the Chart.js test matchers and the `Chart` global, and throws a clear error from the browser-only helpers (`acquireChart` and others).
- Add the `test-unit` and `dev:unit` scripts. `dev` and `dev:ff` also watch the unit specs.
- `test-ci-vitest` stays one run, and its one coverage report is merged over Node, Chromium and Firefox. Coveralls is unchanged.
- Describe the unit and browser specs in `docs/developers/contributing.md`.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `test-suite`: specs run in exactly one of two Vitest projects, Node or the browsers. The coverage and lint requirements cover the Node project.

## Impact

- `vitest.config.js`, `package.json` scripts, a new `test/setup.node.js` and its pin spec, `test/.eslintrc.yml`, and `docs/developers/contributing.md`. Optionally `.github/workflows/ci.yml`.
- Two spec files get a one-line edit: `core.helpers` and `helpers.curve`.
- No change under `src/`, to the build or to the published package. No new release of `chartjs-test-utils` is needed.
- Open pull requests that add a spec are unaffected: a new spec runs in the browsers unless someone adds it to the list.
