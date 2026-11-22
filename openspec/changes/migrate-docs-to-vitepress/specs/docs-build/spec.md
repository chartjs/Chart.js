## Purpose

The commands that build and serve the documentation, and what they leave behind.

## ADDED Requirements

### Requirement: Docs commands

`pnpm run docs` SHALL build the complete static site and `pnpm run docs:dev` SHALL serve it locally, on a current Node release and with no setup step.

#### Scenario: Building
- **WHEN** a contributor runs `pnpm run docs` in a fresh checkout after installing dependencies
- **THEN** the library is built and a complete static site for the master address, API reference included, appears in `dist/docs`

#### Scenario: Developing
- **WHEN** a contributor runs `pnpm run docs:dev` and saves a change to a page
- **THEN** the change appears in the browser without a restart

#### Scenario: Current Node
- **WHEN** either command runs on the Node release the repository requires
- **THEN** it succeeds without any Node compatibility flag

### Requirement: Release isolation

The documentation build MUST NOT add files to the published npm package.

#### Scenario: Packing after a docs build
- **WHEN** the package is packed after a docs build
- **THEN** no documentation file is in the tarball

### Requirement: Version selection changes one file

Once the VuePress configuration is removed, selecting the docs version for a build SHALL change no tracked file other than the version marker.

#### Scenario: Selecting a release
- **WHEN** the release tooling selects version `x.y.z` for the docs
- **THEN** `git status` shows the version marker as the only modified file
