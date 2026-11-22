## Purpose

The addresses, navigation, search and content features that a reader of the Chart.js documentation site can rely on.

## ADDED Requirements

### Requirement: Existing page addresses keep working

The site SHALL serve every documentation page at the address it had before the move to VitePress: `<path>.html` for a page and `<dir>/` for a directory index, under `/docs/<version>/`.

#### Scenario: A page address
- **WHEN** a reader opens `/docs/latest/charts/bar.html`
- **THEN** the bar chart page is shown

#### Scenario: A directory address
- **WHEN** a reader opens `/docs/latest/getting-started/`
- **THEN** the getting started page is shown

#### Scenario: Redirected directories
- **WHEN** a reader opens `/docs/<version>/charts/`, `/docs/<version>/general/`, `/docs/<version>/samples/` or `/docs/<version>/getting-started/v3-migration/`
- **THEN** they land on the line chart page, the data structures page, the samples information page and the v3 migration guide respectively

#### Scenario: A heading address
- **WHEN** a reader opens `/docs/latest/configuration/animations.html#animations-2`
- **THEN** the page scrolls to the second heading named "animations"

### Requirement: Include partials are not pages

The site MUST NOT publish the shared fragments that pages include as pages of their own.

#### Scenario: A partial's address
- **WHEN** a reader opens `/docs/<version>/axes/_common.html`
- **THEN** the not-found page is shown

### Requirement: Navigation

The site SHALL offer the same top navigation and the same sidebar sections, pages, order and titles as before the move.

#### Scenario: A guide page
- **WHEN** a reader opens any guide page
- **THEN** the page shows when it was last updated, the top navigation offers Home, API, Samples, Ecosystem (Awesome, Discord, Stack Overflow) and a link to the GitHub repository, and the sidebar lists the guide sections with every guide page in it

#### Scenario: A samples page
- **WHEN** a reader opens a samples page
- **THEN** the sidebar lists the sample groups instead of the guide

### Requirement: Search

The site SHALL offer full-text search that works without contacting a third-party service.

#### Scenario: Searching for a heading
- **WHEN** a reader types a term that appears in a page title or heading into the search box
- **THEN** the matching pages are offered

### Requirement: Content features

The site SHALL render callouts, tabs, copyable code blocks and embedded source files.

#### Scenario: A callout
- **WHEN** a page contains a tip or warning block
- **THEN** it is shown as a titled callout

#### Scenario: Tabs
- **WHEN** a page contains tabs
- **THEN** one tab's content is shown at a time and the reader can switch between them

#### Scenario: Copying code
- **WHEN** a reader hovers a code block
- **THEN** a copy button is offered

#### Scenario: An embedded source file
- **WHEN** a page embeds a source file from the repository
- **THEN** the file's content at build time is shown

### Requirement: Appearance

The site SHALL use the Chart.js logo and brand colours on the standard VitePress layout, in a light colour scheme only.

#### Scenario: Opening the site
- **WHEN** a reader whose system prefers a dark scheme opens the site
- **THEN** the site is shown in its light scheme with the Chart.js logo, and no scheme switch is offered

### Requirement: No broken internal links

The docs build MUST fail when a page links to a documentation page that does not exist.

#### Scenario: A dead link
- **WHEN** a change adds a link to a page that does not exist
- **THEN** the docs build fails and names the link
