## Purpose

How the axis of a scale (`x`, `y` or `r`) is decided.

## ADDED Requirements

### Requirement: The axis of a scale

The axis of a scale given in `options.scales` SHALL be the first of: the id when it is exactly `x`, `y` or `r`; the scale's `axis` option; the axis of its `position`; the axis by which the first dataset that names the id binds it (`xAxisID` or `yAxisID`); the first letter of the id when it is `x`, `y` or `r`; the default axis of the scale's type. When none applies, creating the chart SHALL fail with a message that asks for `axis` or `position`.

#### Scenario: Bound id that starts with r

- **WHEN** a scale `ramazan` has no `axis` and no `position`, and a dataset has `yAxisID: 'ramazan'`
- **THEN** it is a vertical cartesian axis and the dataset is drawn on it

#### Scenario: Bound id that starts with the other axis letter

- **WHEN** a scale `yFoo` has no `axis` and no `position`, and a dataset has `xAxisID: 'yFoo'`
- **THEN** it is a horizontal axis and the dataset is drawn on it

#### Scenario: axis or position given

- **WHEN** a scale has `axis` or `position`
- **THEN** that decides, as before this change

#### Scenario: Unbound id

- **WHEN** a scale `y2` or `xTop` is named by no dataset
- **THEN** the first letter decides, as before this change

#### Scenario: Nothing decides

- **WHEN** a scale `foo` has no `axis`, no `position`, no `type`, and no dataset names it
- **THEN** creating the chart fails with "Cannot determine type of 'foo' axis. Please provide 'axis' or 'position' option."
