## Purpose

The version menu of the documentation site and the per-version address the documentation is published under.

## ADDED Requirements

### Requirement: Version menu title

The menu SHALL say which documentation is being read and whether it is current, judged when the page is opened and not when it was built.

#### Scenario: Development docs
- **WHEN** a reader opens the documentation built from the default branch
- **THEN** the menu is titled "Development (master)"

#### Scenario: The latest release
- **WHEN** the documentation being read is of the version npm currently tags `latest`
- **THEN** the menu is titled "Latest (x.y.z)"

#### Scenario: An older release
- **WHEN** the documentation being read is of an older version, even one that was the latest when it was built
- **THEN** the menu is titled "x.y.z (outdated)"

#### Scenario: A prerelease
- **WHEN** the documentation being read is of a prerelease, published under `/docs/next/`
- **THEN** the menu is titled "x.y.z-pre (next)" while npm tags that prerelease `next`, and "x.y.z-pre (outdated)" otherwise

### Requirement: Version menu entries

The menu SHALL offer the development docs, the latest docs, the newest patch of every minor release from 2.6 on, and the release notes of the five latest releases.

#### Scenario: Opening the menu
- **WHEN** the reader opens the menu
- **THEN** it lists Development (master), Latest version, one entry per minor release from 2.6 on (prereleases have no entry: they are published under `/docs/next/`), and the five latest releases' notes

#### Scenario: Picking a version
- **WHEN** the reader picks another version
- **THEN** that version's documentation loads

#### Scenario: Release notes
- **WHEN** the reader picks a release-notes entry
- **THEN** that release's page on GitHub opens in a new tab

#### Scenario: The version list is unreachable
- **WHEN** the list of published versions cannot be fetched in the browser
- **THEN** the menu still offers master, latest and the versions known when the site was built

### Requirement: Per-version address

Documentation SHALL be built so that every internal link and asset is under the address of the version it is built for.

#### Scenario: Building for the default branch
- **WHEN** the docs are built for master
- **THEN** every internal link and asset is under `/docs/master/`

#### Scenario: Building a release
- **WHEN** the docs are built for release `x.y.z`, for the latest tag, or for a prerelease
- **THEN** every internal link and asset is under `/docs/x.y.z/`, `/docs/latest/` or `/docs/next/` respectively
