## Purpose

How `minBarLength` lengthens and places short bars, and how zero-length bars are drawn.

## ADDED Requirements

### Requirement: Zero-length bars draw nothing

A bar whose length is zero and that `minBarLength` does not lengthen, or whose data item is hidden, SHALL draw nothing, whatever `barThickness` and `inflateAmount` are.

#### Scenario: barThickness with a zero value

- **WHEN** `barThickness` is 10 and the data is `[5, 0]`
- **THEN** nothing is drawn for the second value

### Requirement: Short stacked segments chain

When `minBarLength` lengthens a stacked segment, the next segment on the same side SHALL start where the lengthened one ends, whatever the datasets' `order`, and after any resize.

#### Scenario: A zero under a large value

- **WHEN** a stacked chart has `minBarLength: 10`, dataset 0 `[0]` and dataset 1 `[50]`
- **THEN** dataset 1's bar starts where dataset 0's bar ends

### Requirement: minBarLength is the visible length

`minBarLength` SHALL be the minimum length of the part of a bar inside the value range, measured from the edge where the bar enters it. A bar entirely outside the value range SHALL NOT be drawn inside the chart area. A hidden data item SHALL NOT be lengthened. Other datasets and the value range SHALL use the data values.

#### Scenario: Base below the axis minimum

- **WHEN** the value axis has `min: 10`, the data is `[10, 50]` and `minBarLength` is 5
- **THEN** the first bar shows 5 pixels from the bottom of the chart area

#### Scenario: Bar outside the range

- **WHEN** the value axis is 10 to 20, a floating bar is `[5, 5]` and `minBarLength` is 6
- **THEN** nothing is drawn inside the chart area for it

#### Scenario: Hidden item

- **WHEN** `minBarLength` is 5 and a data item is hidden with `toggleDataVisibility`
- **THEN** its bar has no length

### Requirement: Zero-length bars centre on their value

An unstacked bar of zero length that `minBarLength` lengthens SHALL be centred on its value. A stacked segment SHALL NOT be centred.

#### Scenario: A point in time on a timeline

- **WHEN** the value axis is 0 to 10, a floating bar is `[5, 5]` and `minBarLength` is 10
- **THEN** the bar reaches 5 pixels on each side of the value 5
