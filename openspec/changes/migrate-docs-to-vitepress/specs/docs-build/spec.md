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

### Requirement: Pull request preview

A pull request that changes what the documentation is built from SHALL get a link to a preview of the built site, whether it comes from a branch of the repository or from a fork.

#### Scenario: A docs pull request from a fork
- **WHEN** a contributor opens a pull request from a fork that changes a documentation page
- **THEN** a link to a preview of the built site appears on the pull request, and the changed page is shown there under the path it has in production

#### Scenario: A pull request that does not touch the docs
- **WHEN** a pull request changes only tests
- **THEN** no preview is built
