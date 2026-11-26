## Purpose

How the axis of a scale (`x`, `y` or `r`) is decided.

## ADDED Requirements

### Requirement: The axis of a scale

The axis of a scale given in `options.scales` SHALL be the first of: the id when it is exactly `x`, `y` or `r`; the scale's `axis` option; the axis of its `position`; the axis by which the first dataset that names the id binds it (`xAxisID`, `yAxisID` or `rAxisID`); the first letter of the id when it is `x`, `y` or `r`; an `axis` that the defaults of the scale's type declare. When none applies, creating the chart SHALL fail with a message that asks for `axis` or `position`.

#### Scenario: Bound id that starts with r

- **WHEN** a scale `ramazan` has no `axis` and no `position`, and a dataset has `yAxisID: 'ramazan'`
- **THEN** it is a vertical cartesian axis and the dataset is drawn on it

#### Scenario: Bound id that starts with the other axis letter

- **WHEN** a scale `yFoo` has no `axis` and no `position`, and a dataset has `xAxisID: 'yFoo'`
- **THEN** it is a horizontal axis and the dataset is drawn on it

#### Scenario: Radial binding

- **WHEN** a radar chart has a scale `foo` of type `radialLinear` and a dataset with `rAxisID: 'foo'`
- **THEN** `foo` is the radial axis and the dataset is drawn on it

#### Scenario: A dataset without an axis id

- **WHEN** `options.scales` lists `ramazan` before `y`, one dataset has `yAxisID: 'ramazan'` and another has no `yAxisID`
- **THEN** both are drawn on `ramazan`, the first vertical axis listed

#### Scenario: axis or position given

- **WHEN** a scale has `axis` or `position`
- **THEN** that decides, as before this change

#### Scenario: Unbound id

- **WHEN** a scale `y2` or `xTop` is named by no dataset
- **THEN** the first letter decides, as before this change

#### Scenario: Nothing decides

- **WHEN** a scale `foo` has no `axis`, no `position`, no `type`, and no dataset names it
- **THEN** creating the chart fails with "Cannot determine type of 'foo' axis. Please provide 'axis' or 'position' option."

### Requirement: When the axis of a scale is decided

An axis taken from the first letter of the id SHALL be decided again at every update until a dataset names the id. Every other axis SHALL stay as it was first decided.

#### Scenario: The dataset arrives after the chart

- **WHEN** a chart is created with a scale `ramazan` and no datasets, a dataset with `yAxisID: 'ramazan'` is added, and the chart is updated
- **THEN** `ramazan` is a vertical cartesian axis and the dataset is drawn on it

#### Scenario: Rebinding

- **WHEN** a dataset that binds a scale as `yAxisID` is changed to bind it as `xAxisID` and the chart is updated
- **THEN** the scale stays a vertical axis, as before this change
