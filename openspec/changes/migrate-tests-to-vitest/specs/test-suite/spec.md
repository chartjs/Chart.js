## Purpose

How the browser test suite of Chart.js is run: which runner executes a spec, what the specs run against, how image fixtures are found, compared and updated, and what CI reports.

## ADDED Requirements

### Requirement: Every spec runs under exactly one runner during the migration
While both runners exist, the repository SHALL run each spec file under exactly one of Karma and Vitest, decided by the spec file's name suffix, and the combined test command SHALL fail when any runner fails.

#### Scenario: Combined run
- **WHEN** a contributor runs `pnpm test-ci` during the migration
- **THEN** the Karma suite, the Vitest suite, the built-bundle smoke suite and the integration packages all run
- **AND** the command fails if any of them fails

#### Scenario: Unconverted spec
- **WHEN** a spec file has the unconverted suffix
- **THEN** it runs under Karma and not under Vitest

#### Scenario: Converted spec
- **WHEN** a spec file has the converted suffix
- **THEN** it runs under Vitest and not under Karma

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
The Vitest suite MUST run every converted spec and every image fixture in both Chromium and Firefox in CI.

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
The test command SHALL fail when the minified UMD bundle is broken, even though the specs run against source.

#### Scenario: Broken bundle
- **WHEN** the minified UMD bundle fails to load, lacks part of the `Chart` namespace, or renders one of the smoke charts differently from its reference image
- **THEN** `pnpm test-ci` fails

#### Scenario: Bundle not built
- **WHEN** the smoke suite runs and the bundle has not been built
- **THEN** it fails with a message telling the contributor to build first

### Requirement: Coverage reaches Coveralls from every runner
CI SHALL upload coverage from every runner that executed specs.

#### Scenario: Spec moves between runners
- **WHEN** CI runs on a change that moves a spec from Karma to Vitest
- **THEN** Coveralls receives coverage from both runners and the lines that spec covers are still reported as covered

#### Scenario: After Karma is removed
- **WHEN** CI runs after Karma has been removed
- **THEN** it uploads one coverage report

### Requirement: Results do not depend on the machine's time zone
The suite MUST produce the same results for time-scale specs and fixtures on a machine in any time zone.

#### Scenario: Non-UTC machine
- **WHEN** the suite runs on a machine whose time zone is not UTC
- **THEN** time-scale specs and fixtures pass as they do in UTC

### Requirement: Karma and Jasmine are gone at the end
After the migration the repository SHALL install and use no Karma or Jasmine package.

#### Scenario: Install
- **WHEN** a contributor runs `pnpm install` after the last piece
- **THEN** no `karma*`, `jasmine*` or `rollup-plugin-istanbul` package is installed
- **AND** `pnpm test`, `pnpm test-ci` and `pnpm run dev` work

#### Scenario: Leftover unconverted spec
- **WHEN** a spec file with the unconverted suffix exists after Karma is removed
- **THEN** the test command fails and names the file

### Requirement: Test code is linted
The lint command SHALL cover converted specs, the Vitest setup and the smoke suite.

#### Scenario: Lint
- **WHEN** `pnpm run lint` runs
- **THEN** converted specs, the setup file and the smoke spec are linted
