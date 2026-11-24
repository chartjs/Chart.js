## Purpose

Which elements are active, and when the active elements the pointer started end.

## ADDED Requirements

### Requirement: The pointer's active elements end outside the chart area

Elements that became active because of the pointer SHALL stop being active, in the chart and in the tooltip, when the pointer moves outside the chart area. Elements made active with `setActiveElements` SHALL stay active outside the chart area until they are changed.

#### Scenario: From a slice onto the legend

- **WHEN** the pointer hovers a pie slice and then moves onto a legend item
- **THEN** the tooltip is hidden
- **AND** the slice is no longer drawn in its hover style

#### Scenario: Back onto the same slice

- **WHEN** the pointer then moves back onto the same slice
- **THEN** the tooltip shows again

#### Scenario: Active elements set by code

- **WHEN** a legend `onHover` calls the tooltip's `setActiveElements` for its item
- **THEN** the tooltip shows for that item while the pointer is on the legend

#### Scenario: Code sets the element the pointer had made active

- **WHEN** the pointer hovers slice 0, then moves onto legend item 0, whose `onHover` sets slice 0 as the tooltip's active element
- **THEN** the tooltip stays open for slice 0

### Requirement: Hidden data is not active

A dataset or data item that is hidden SHALL NOT be active, in the chart or in the tooltip. Hiding it SHALL NOT start a hover or un-hover animation on it.

#### Scenario: Hide a hovered dataset

- **WHEN** a line dataset is hovered with interaction mode `'dataset'` and `intersect: false`, and it is hidden from the legend or with `hide()`
- **THEN** its colours fade towards transparent and do not become more opaque during the hide

#### Scenario: Hide a hovered slice

- **WHEN** a hovered pie slice is hidden from the legend
- **THEN** it is no longer active

#### Scenario: Show again

- **WHEN** a hidden dataset is shown again
- **THEN** it fades in and is not drawn in its hover style until it is hovered
