## Purpose

Where the legend places its items, their symbols and text, and its title, and how it wraps within its limits.

## ADDED Requirements

### Requirement: Items are drawn where their hit boxes are

The legend SHALL draw every item in the row or column its hit box belongs to, and at the hit box's position. The legend SHALL NOT measure or wrap its items again while drawing.

#### Scenario: End-aligned row whose width equals the available width

- **WHEN** a horizontal legend has `align: 'end'` and its items fill the row exactly
- **THEN** every item is drawn in that row
- **AND** no text is drawn at a non-finite position

#### Scenario: Default font changed after the update

- **WHEN** `Chart.defaults.font` is changed after a chart was updated and the chart is drawn again before the next update
- **THEN** drawing does not throw
- **AND** every item stays in its row or column

### Requirement: Item size follows its label

An item SHALL be as wide as its symbol, the gap and its widest text line, and as tall as the larger of its symbol and its text lines. A label SHALL be shown as several lines only when it is an array. Any other value SHALL be shown as one line of text.

#### Scenario: Multi-line labels in a horizontal legend

- **WHEN** a top or bottom legend has an item whose label has three lines
- **THEN** its row is tall enough for three lines
- **AND** the next row starts below it

#### Scenario: Numeric labels in a vertical legend

- **WHEN** a pie chart has `labels: [2010, 2011]` and its legend is on the left or right
- **THEN** the chart renders
- **AND** the legend shows `2010` and `2011`

### Requirement: The legend wraps within its limits

A top or bottom legend SHALL wrap its items into rows no wider than the smaller of the available width and `maxWidth`. A left or right legend SHALL wrap its items into columns no taller than the smaller of the available height and `maxHeight`. Rows and columns SHALL be aligned by `align` within the legend's box.

#### Scenario: maxHeight on a right legend

- **WHEN** a right legend has `maxHeight: 100` and its items need more than 100 pixels in one column
- **THEN** the items wrap into more columns
- **AND** the legend is at most 100 pixels tall

#### Scenario: maxWidth on a top legend

- **WHEN** a top legend has `maxWidth: 150` and its items need more than 150 pixels in one row
- **THEN** the items wrap into more rows within 150 pixels

### Requirement: The title fits and follows its padding

The legend SHALL be at least as wide as its title plus the title's left and right padding, limited by `maxWidth`. The title's left padding SHALL move a start-aligned title right, and its right padding SHALL move an end-aligned title left.

#### Scenario: Title wider than the items

- **WHEN** a right legend has a title wider than any of its items
- **THEN** the legend is at least as wide as the title

#### Scenario: Left padding on a start-aligned title

- **WHEN** the title has `position: 'start'` and `padding: {left: 50}`
- **THEN** the title text starts 50 pixels right of the legend's left edge

### Requirement: Hit boxes cover what is drawn

An item's hit box SHALL cover its symbol and its text wherever `textAlign` places the text, in left-to-right and right-to-left legends. The text of an item SHALL stay within its own column.

#### Scenario: Right-aligned text in a vertical legend

- **WHEN** a right legend has `labels.textAlign: 'right'`
- **THEN** clicking on the text of an item toggles that item

#### Scenario: Right-aligned text in several columns

- **WHEN** a vertical legend with two or more columns has `labels.textAlign: 'right'`
- **THEN** each item's text ends at its own column's right edge
- **AND** clicking an item in the second column toggles that item, not one in the first

### Requirement: Space around the legend

The legend SHALL keep `padding` (a number or an object with top, right, bottom and left) between its items and its edges, separate from `labels.padding`, which stays the gap between items. Without `padding`, the legend SHALL be laid out as before.

#### Scenario: Padding between the legend and the chart area

- **WHEN** a top legend has `padding: {bottom: 30}`
- **THEN** the chart area starts 30 pixels below the legend's last row plus the gap it had before

#### Scenario: No padding given

- **WHEN** a legend has no `padding` option
- **THEN** it is drawn exactly as in the previous release
