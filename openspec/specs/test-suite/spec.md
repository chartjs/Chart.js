# test-suite Specification

## Purpose

How the browser test suite of Chart.js is run: which runner executes a spec, what the specs run against, how image fixtures are found, compared and updated, and what CI reports.

## Requirements

### Requirement: Every spec runs under Vitest
The repository SHALL run every spec file under `test/specs` under Vitest, and the combined test command SHALL fail when any of its suites fails.

#### Scenario: Combined run
- **WHEN** a contributor runs `pnpm test-ci`
- **THEN** the Vitest suite, the built-bundle smoke suite and the integration packages all run
- **AND** the command fails if any of them fails

#### Scenario: Spec file
- **WHEN** a file named `*.spec.js` exists under `test/specs`
- **THEN** it runs under Vitest

#### Scenario: Unconverted spec
- **WHEN** a file named `*.tests.js` exists under `test/specs`
- **THEN** the main Vitest suite refuses to start and names the file, so `pnpm test` and `pnpm test-ci` fail

### Requirement: Specs run against source
The Vitest suite SHALL exercise the code under `src/` directly, without a build step.

#### Scenario: Source change without building
- **WHEN** a contributor changes a file under `src/` and runs the Vitest suite without building
- **THEN** the change is exercised by the specs

#### Scenario: Watch mode
- **WHEN** the watch command is running and a source or spec file is saved
- **THEN** the affected specs run again

#### Scenario: Filtering
- **WHEN** a contributor appends a string to the watch or run command
- **THEN** only spec files whose path contains that string run

### Requirement: Specs run in Chromium and Firefox
The Vitest suite MUST run every spec and every image fixture in both Chromium and Firefox in CI.

#### Scenario: Failure in one browser
- **WHEN** a spec or fixture fails in either browser in CI
- **THEN** the CI job fails

### Requirement: Image fixtures are discovered from the fixtures directory
The suite SHALL run one test for every fixture config found under the fixtures directory, comparing the rendered chart to the reference image of the same base name, without any per-fixture or per-directory registration in a spec.

#### Scenario: New fixture
- **WHEN** a config file and a PNG with the same base name are added anywhere under the fixtures directory
- **THEN** a test named after that path runs, with no line added to any spec

#### Scenario: Fixture in the CommonJS form
- **WHEN** a pull request adds a fixture written with `module.exports`
- **THEN** it runs unchanged

#### Scenario: Every fixture runs
- **WHEN** the suite runs
- **THEN** the number of fixture tests equals the number of fixture configs under the fixtures directory

#### Scenario: Filtering fixtures by area
- **WHEN** a contributor filters the fixture tests by a fixture directory name
- **THEN** only the fixtures in that directory run

#### Scenario: Missing reference image
- **WHEN** a fixture config has no PNG in a normal run
- **THEN** that test fails with a message naming the fixture

#### Scenario: Rendering differs
- **WHEN** a rendered chart differs from its PNG beyond the fixture's threshold and tolerance
- **THEN** the test fails and reports the difference

### Requirement: Reference images change only on request
Reference images SHALL be written only by an explicit update command, never by a normal test run.

#### Scenario: Update command
- **WHEN** a contributor runs the fixture-update command
- **THEN** only missing or changed PNGs are written, rendered by Chromium
- **AND** the command reports each file it wrote

#### Scenario: Normal run
- **WHEN** the normal test command runs
- **THEN** no PNG is written

### Requirement: The built bundle is tested
The test command SHALL fail when the minified UMD bundle does not load, lacks part of its namespace, or renders the smoke charts wrongly, even though the specs run against source.

#### Scenario: Broken bundle
- **WHEN** the minified UMD bundle fails to load, lacks part of the `Chart` namespace, or renders one of the smoke charts differently from its reference image
- **THEN** `pnpm test-ci` fails

#### Scenario: Bundle not built
- **WHEN** the smoke suite runs and the bundle has not been built
- **THEN** it fails with a message telling the contributor to build first

### Requirement: Coverage reaches Coveralls
CI SHALL upload the coverage of the Vitest suite, which runs the specs against source, to Coveralls. The built-bundle smoke suite runs against the minified bundle and reports no coverage.

#### Scenario: Source change
- **WHEN** CI runs on a change to `src/`
- **THEN** it uploads one coverage report, the Vitest suite's merged over Chromium and Firefox

### Requirement: Karma and Jasmine are gone at the end
After the migration the repository SHALL install and use no Karma or Jasmine package.

#### Scenario: Install
- **WHEN** a contributor runs `pnpm install` after the last piece
- **THEN** no `karma*`, `jasmine*` or `rollup-plugin-istanbul` package is installed
- **AND** `pnpm test`, `pnpm test-ci` and `pnpm run dev` work

### Requirement: Test code is linted
The lint command SHALL cover the specs, the Vitest setup and the smoke suite.

#### Scenario: Lint
- **WHEN** `pnpm run lint` runs
- **THEN** the specs, the setup file and the smoke spec are linted
