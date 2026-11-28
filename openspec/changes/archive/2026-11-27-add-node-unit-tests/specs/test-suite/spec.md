## MODIFIED Requirements

### Requirement: Every spec runs under Vitest
The repository SHALL run every spec file under `test/specs` under Vitest, each in exactly one Vitest project. A file named `*.unit.spec.js` runs in the unit project, in Node. Every other file runs in the browser project. The combined test command SHALL fail when any of its suites fails.

#### Scenario: Combined run
- **WHEN** a contributor runs `pnpm test-ci`
- **THEN** the unit specs, the browser specs, the built-bundle smoke suite and the integration packages all run
- **AND** the command fails if any of them fails

#### Scenario: Spec file
- **WHEN** a file named `*.spec.js` exists under `test/specs` and is not named `*.unit.spec.js`
- **THEN** it runs under Vitest in the browser project and not in Node

#### Scenario: Unit spec
- **WHEN** a spec file is named `*.unit.spec.js`
- **THEN** it runs in Node and in no browser

#### Scenario: Unconverted spec
- **WHEN** a file named `*.tests.js` exists under `test/specs`
- **THEN** the main Vitest suite refuses to start and names the file, so `pnpm test` and `pnpm test-ci` fail

### Requirement: Specs run against source
Both projects of the Vitest suite SHALL exercise the code under `src/` directly, without a build step.

#### Scenario: Source change without building
- **WHEN** a contributor changes a file under `src/` and runs the Vitest suite without building
- **THEN** the change is exercised by the specs

#### Scenario: Watch mode
- **WHEN** `pnpm run dev` is running and a source or spec file is saved
- **THEN** the affected specs run again: the unit specs in Node, the others in Chromium

#### Scenario: Filtering
- **WHEN** a contributor appends a string to the watch or run command
- **THEN** only spec files whose path contains that string run, each in the project it belongs to

### Requirement: Specs run in Chromium and Firefox
The browser project MUST run, in CI, every spec that is not named `*.unit.spec.js` and every image fixture, in both Chromium and Firefox.

#### Scenario: Failure in one browser
- **WHEN** a browser spec or fixture fails in either browser in CI
- **THEN** the CI job fails

### Requirement: Coverage reaches Coveralls
CI SHALL upload the coverage of the Vitest suite to Coveralls. The Vitest suite runs the specs against source in Node, Chromium and Firefox. The built-bundle smoke suite runs against the minified bundle and reports no coverage.

#### Scenario: Source change
- **WHEN** CI runs on a change to `src/`
- **THEN** it uploads one coverage report, the Vitest suite's, merged over Node, Chromium and Firefox

### Requirement: Test code is linted
The lint command SHALL cover the specs, the Vitest setup files for the browsers and for Node, and the smoke suite.

#### Scenario: Lint
- **WHEN** `pnpm run lint` runs
- **THEN** the specs, both setup files and the smoke spec are linted

## ADDED Requirements

### Requirement: DOM-free specs run in Node
The unit project SHALL run the specs named `*.unit.spec.js` in Node, with no browser, DOM or canvas, against source, and with the Chart.js test matchers registered. A test in a unit spec that uses the DOM SHALL fail; it SHALL NOT be skipped.

#### Scenario: Without a browser
- **WHEN** a contributor who has not installed the Playwright browsers runs `pnpm run test-unit`
- **THEN** the unit specs run and no browser starts

#### Scenario: DOM in a unit spec
- **WHEN** a test in a spec named `*.unit.spec.js` uses `window`, `document`, `acquireChart` or another browser-only global
- **THEN** that test fails with an error naming the global
- **AND** for the chart helpers the error says to rename the file without `.unit`

#### Scenario: Matchers
- **WHEN** a unit spec uses `toEqualOptions` or `toBeCloseToPoint`
- **THEN** the assertion behaves as it does in the browser project

#### Scenario: New spec
- **WHEN** a spec file is added and not named `*.unit.spec.js`
- **THEN** it runs in the browser project

#### Scenario: Node setup pinned
- **WHEN** a setting of the Node setup is removed
- **THEN** the Node setup's own spec fails
