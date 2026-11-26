## Purpose

Where stacked and floating bars sit on the value axis, and which edges and corners of stacked bars are drawn.

## ADDED Requirements

### Requirement: Stack ends follow the visible segments

For each stack and index value, the innermost and outermost segments on each side of the base SHALL be found among the visible datasets with a non-zero value, whenever the chart updates, including after a dataset is hidden or shown.

#### Scenario: Rounded corners after hiding the top dataset

- **WHEN** two datasets are stacked with `borderRadius` and the default `borderSkipped`, and the upper dataset is hidden
- **THEN** the remaining bar has rounded corners at its far end

#### Scenario: The first dataset is empty

- **WHEN** bars are stacked with `borderSkipped: 'middle'`, dataset 0 is null at an index and datasets 1 and 2 have values there
- **THEN** dataset 1's bar keeps its base edge and corners, and dataset 2's bar keeps its far edge and corners

### Requirement: borderSkipped middle skips only edges that touch

With `borderSkipped: 'middle'`, a stacked bar SHALL skip an edge only where it touches another visible segment of the same stack. A lone segment SHALL keep both edges. Where segments on both sides meet at the base, the two edges that meet SHALL be skipped.

#### Scenario: A lone segment

- **WHEN** bars are stacked with `borderSkipped: 'middle'` and `borderRadius`, and only one dataset has a non-zero value at an index
- **THEN** that bar is rounded at both ends

#### Scenario: Several segments on one side

- **WHEN** three positive segments are stacked at an index with `borderSkipped: 'middle'`
- **THEN** the edges between segments are skipped, and the outer edges of the first and last are drawn

### Requirement: Floating bars keep their values in a stack

In a stacked chart, a floating bar SHALL be drawn at its own start and end. It SHALL take no room in the stack, SHALL NOT move other segments, and the value axis SHALL span its own extent.

#### Scenario: Two floating bars

- **WHEN** a stacked chart has dataset 0 `[[0, 5]]` and dataset 1 `[[5, 9]]`
- **THEN** dataset 1 is drawn from 5 to 9 and the value axis ends near 9

#### Scenario: A floating bar under a plain bar

- **WHEN** a stacked chart has dataset 0 `[[0, 5]]` and dataset 1 `[3]`
- **THEN** dataset 1 is drawn from 0 to 3
