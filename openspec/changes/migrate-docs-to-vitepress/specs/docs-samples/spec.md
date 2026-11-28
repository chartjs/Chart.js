## Purpose

How live, editable chart samples behave on documentation pages.

## ADDED Requirements

### Requirement: Live samples

A page with a sample SHALL draw the chart above an editor that shows the sample's code, and SHALL redraw the chart from the reader's edits.

#### Scenario: Opening a sample
- **WHEN** a reader opens a page with a sample
- **THEN** a chart is drawn above an editor showing the sample's code, split into the named tabs the sample declares, in the declared order

#### Scenario: Editing
- **WHEN** the reader edits the code and stops typing
- **THEN** the chart updates within about a second

#### Scenario: An error in the edited code
- **WHEN** the edited code throws
- **THEN** the last good chart stays and the error message is shown

#### Scenario: Actions
- **WHEN** a sample defines actions
- **THEN** one button per action is shown and pressing it runs the action against the chart

#### Scenario: Console output
- **WHEN** a sample declares console output
- **THEN** an output tab shows what the sample logs

### Requirement: Sample environment

Sample code SHALL be able to use `Chart`, `Utils`, `helpers` and `components` without importing them, and SHALL run in the page's own document.

#### Scenario: Shared utilities
- **WHEN** a sample calls `Utils.numbers(...)`
- **THEN** it runs without the sample importing anything

#### Scenario: Elements of the page
- **WHEN** a sample looks up an element that the page's own text defines, such as a legend container or a progress bar
- **THEN** it finds that element

#### Scenario: A time scale
- **WHEN** a sample uses a time scale
- **THEN** the chart renders, because the date adapter is registered on the same Chart.js the sample uses

#### Scenario: A sample inside a tab
- **WHEN** a reader switches to a tab that holds a sample
- **THEN** the chart is drawn at its full size

### Requirement: Source link

Each sample SHALL link to the markdown source of its page on the default branch.

#### Scenario: Following the link
- **WHEN** the reader uses the sample's GitHub link
- **THEN** the page's markdown source on the default branch opens

### Requirement: Readable without scripts

Page text and navigation MUST be present in the served HTML, so that a page with samples is readable before or without scripts running.

#### Scenario: Fetching without scripts
- **WHEN** a sample page is fetched without running scripts
- **THEN** its headings, text and navigation are present
