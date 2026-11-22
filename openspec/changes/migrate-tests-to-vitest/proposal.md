## Why

The test suite runs on Karma, which was deprecated in 2023, with Jasmine and `chartjs-test-utils` 0.4. That stack is where a large share of the repository's open Dependabot alerts come from (35 alerts are reachable from the `karma` packages by package name), and none of them can be fixed by an update because the packages no longer release. `chartjs-test-utils` 1.x already runs on Vitest browser mode and the chart plugins that use it have migrated.

## What Changes

- The unit and image tests move from Karma + Jasmine to Vitest browser mode (Chromium and Firefox through Playwright) with `chartjs-test-utils` 1.x.
- Specs run against `src/` through Vite instead of against the minified UMD build. A separate, small smoke suite loads `dist/chart.umd.min.js` so that a bundle broken by minification still fails the tests.
- During the migration both runners run side by side. A spec file runs under exactly one of them, decided by its file name suffix.
- Image fixtures are discovered from the fixtures directory and run from one place; a new fixture needs no line in a spec. Reference images are written by an explicit update command only.
- Coverage is produced by Vitest and uploaded to Coveralls as one report once Karma is gone.
- In the last piece Karma, its plugins, `jasmine-core`, `rollup-plugin-istanbul` and the other Karma-only dev dependencies leave `package.json` and the lockfile.
- Contributor documentation describes the new commands and the image-test workflow.

Nothing under `src/` changes and nothing in the published package changes.

## Capabilities

### New Capabilities

- `test-suite`: how the repository's browser tests are run, what they run against, how image fixtures are discovered and updated, and what CI reports.

### Modified Capabilities

None.

## Impact

- Contributors: new commands for running and watching tests, a one-time Playwright browser install, Node 22.12 or later. Pull requests open during the migration that touch a spec file may need a small rebase when that file is converted; the conversion table in `design.md` is the recipe.
- CI: a Playwright install step, a Vitest coverage upload, and at the end no xvfb and no Karma.
- Dev dependencies: adds `vitest`, `@vitest/browser`, `@vitest/browser-playwright`, `@vitest/coverage-istanbul`, `playwright`; removes 16 Karma-only packages at the end.
- Security alerts fall only when the last piece merges, because the lockfile carries both stacks until then.
