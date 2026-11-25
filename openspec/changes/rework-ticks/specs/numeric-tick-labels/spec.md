## Purpose

This spec covers the text the default numeric formatter (used by linear, radial linear and logarithmic axes, and callable from a user's tick callback) gives each tick: how many digits it shows, when it uses scientific notation, and how `ticks.precision` and `ticks.format` limit it.

## ADDED Requirements

### Requirement: A label tells its tick apart from its neighbours

The default numeric formatter SHALL show enough fraction digits that ticks on the grid of the tick step get distinct labels, counting the step's last significant digit, not only its magnitude. When the step is below 1, every label SHALL show the same number of fraction digits.

#### Scenario: Quarter steps

- **WHEN** a y axis has `min: 0`, `max: 1` and `ticks.stepSize: 0.25`
- **THEN** the labels are "0", "0.25", "0.50", "0.75" and "1.00"

#### Scenario: Whole and half steps stay short

- **WHEN** a y axis has `min: 0`, `max: 10` and `ticks.stepSize: 2.5`
- **THEN** the labels are "0", "2.5", "5", "7.5" and "10"

### Requirement: A label states an off-grid tick exactly

A tick that is not on the step's grid (a user or data bound) SHALL be labelled with one fraction digit more than the grid's, or fewer when its value, read without floating-point noise, needs fewer. A tick within a millionth of a step of the grid, or within the floating-point spacing of its own value, SHALL be labelled as on the grid.

#### Scenario: Bounds with more digits than the step

- **WHEN** a y axis has `min: 0.1234567` and `max: 0.8765432`
- **THEN** the first label is "0.12" and the last is "0.88"

#### Scenario: A bound with floating-point noise

- **WHEN** a y axis has `max: 12.000000001`
- **THEN** the last label is "12"

#### Scenario: Large values with a small step

- **WHEN** a y axis has `min: 1700000000` and `max: 1700000001`
- **THEN** every label has at most one fraction digit

#### Scenario: Data bounds off the grid

- **WHEN** a y axis has `bounds: 'data'` and the data is [0.31, 0.97]
- **THEN** the first label is "0.31" and the last is "0.97"
- **AND** no two labels are equal

### Requirement: Scientific labels count digits on the significand

When the formatter uses scientific notation, the fraction digits SHALL be counted on the significand, from the difference between the tick's exponent and the step's resolution.

#### Scenario: Small values

- **WHEN** the data is [1e-5, 1.3e-5]
- **THEN** the labels are "1.00E-5", "1.05E-5", … and none has more than two fraction digits

#### Scenario: Large values

- **WHEN** the data is [1e15, 5e15]
- **THEN** the labels are "1.0E15", "1.5E15", …, "5.0E15"

### Requirement: Precision caps the label digits

When `ticks.precision` is set, no label from the default formatter SHALL have more fraction digits than it. Fraction digits set in `ticks.format` SHALL still take precedence.

#### Scenario: Bounds with precision

- **WHEN** a y axis has `min: 0.1234567`, `max: 0.8765432` and `ticks.precision: 1`
- **THEN** the first label is "0.1" and the last is "0.9"
