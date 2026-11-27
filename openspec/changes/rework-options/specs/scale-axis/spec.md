## Purpose

How the axis of a scale (`x`, `y` or `r`) is decided.

## ADDED Requirements

### Requirement: The axis of a scale

The axis of a scale given in `options.scales` SHALL be the first of: the id when it is exactly `x`, `y` or `r`; its `axis` option; the axis of the `position` the chart gave it; the axis by which the first dataset that names the id binds it; the first letter of the id when the scale's type allows it; the axis of `axis` or `position` in the defaults of the scale's type; `r` when the scale's type is radial. When none applies, creating the chart SHALL fail with a message that asks for `axis` or `position`.

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

### Requirement: The type of a scale limits the first letter

A first letter `r` SHALL decide the axis only when the chart gives the scale no `type` or a radial one, and a first letter `x` or `y` only when it gives none or one that is not radial. A scale type SHALL count as radial when its scales have a `getPointPositionForValue` method, whatever class it extends. A type that is not registered when the axis is decided SHALL limit nothing.

#### Scenario: Cartesian type on an id that starts with r

- **WHEN** a scale `ramazan` has `type: 'linear'` (a type whose defaults declare no axis), no `axis`, no `position`, and no dataset names it
- **THEN** creating the chart fails with the message that asks for `axis` or `position`

#### Scenario: A type that declares its axis

- **WHEN** a registered scale type that is not radial has `axis: 'x'` in its defaults, and an unbound scale `rFoo` with no `axis` and no `position` has that type
- **THEN** `rFoo` is a horizontal axis

#### Scenario: The same scale, bound

- **WHEN** a scale `ramazan` has `type: 'linear'` and a dataset has `yAxisID: 'ramazan'`
- **THEN** it is a vertical cartesian axis

#### Scenario: Radial type on an id that starts with x

- **WHEN** a scale `xFoo` has `type: 'radialLinear'`, no `axis` and no `position`, and no dataset names it
- **THEN** it is the radial axis

#### Scenario: A radial scale that extends nothing radial

- **WHEN** a registered scale type has `getPointPositionForValue` and does not extend the built-in radial scale, and a scale `r2` has that type
- **THEN** `r2` is a radial axis

#### Scenario: No type

- **WHEN** a scale `r2`, `y2` or `xTop` has no `type` and is named by no dataset
- **THEN** the first letter decides, as before this change

#### Scenario: Type registered later

- **WHEN** a chart is created on a canvas outside the document with a scale whose type is not yet registered, and the type is registered before the canvas is attached
- **THEN** the first letter of the id decided the axis, as before this change

#### Scenario: axis or position with a type of the other kind

- **WHEN** a scale has `axis` or `position` and a type of the other kind
- **THEN** `axis` or `position` decides, as before this change

### Requirement: When the axis of a scale is decided

An axis taken from the first letter of the id SHALL be decided again at every update until a dataset names the id. Every other axis SHALL stay as it was first decided. A position that the chart did not give SHALL NOT decide the axis, and SHALL NOT stay when the axis is decided again.

#### Scenario: The dataset arrives after the chart

- **WHEN** a chart is created with a scale `ramazan` and no datasets, a dataset with `yAxisID: 'ramazan'` is added, and the chart is updated
- **THEN** `ramazan` is a vertical cartesian axis on the left, the chart area is where it is for the same chart created with its data, and the dataset is drawn on it

#### Scenario: The dataset arrives later and binds the other axis

- **WHEN** a chart is created with a scale `xFoo` and no datasets, a dataset with `yAxisID: 'xFoo'` is added, and the chart is updated
- **THEN** `xFoo` is a vertical linear axis on the left and the dataset is drawn on it

#### Scenario: A position the chart gave

- **WHEN** a scale `ramazan` has `position: 'right'`
- **THEN** it is a vertical axis on the right at every update

#### Scenario: The dataset is removed

- **WHEN** the dataset that bound `ramazan` as `yAxisID` is removed and the chart is updated
- **THEN** `ramazan` stays a vertical axis

#### Scenario: Rebinding

- **WHEN** a dataset that binds a scale as `yAxisID` is changed to bind it as `xAxisID` and the chart is updated
- **THEN** the scale stays a vertical axis, as before this change
