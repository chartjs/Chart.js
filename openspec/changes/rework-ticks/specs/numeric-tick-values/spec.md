## Purpose

This spec covers which tick values a linear axis (`linear`, and `radialLinear` for radar and polar area charts) and a logarithmic axis generate before any tick is skipped: how `stepSize`, `min`, `max`, `bounds`, `grace` and `ticks.includeBounds` decide them, and what holds for every set of ticks.

## ADDED Requirements

### Requirement: Step size gives one tick per step

When `ticks.stepSize` is set, a linear axis SHALL place its ticks on multiples of the step. Only when `max - min` is a whole number of steps within floating-point precision SHALL the ticks run from `min` to `max` in equal steps; otherwise a user `min` or `max` that is not a multiple SHALL get its own tick beside the multiples.

#### Scenario: Range that is not a whole number of steps

- **WHEN** a y axis has `min: 0`, `max: 3333` and `ticks.stepSize: 500`
- **THEN** the ticks are 0, 500, 1000, 1500, 2000, 2500, 3000 and 3333

#### Scenario: Range that is a whole number of steps in decimals

- **WHEN** a y axis has `min: 0`, `max: 0.3` and `ticks.stepSize: 0.1`
- **THEN** the ticks are 0, 0.1, 0.2 and 0.3

### Requirement: The axis ends at its last tick under grace and step size

When `bounds` is `'ticks'` and `ticks.stepSize` is set, the number of ticks SHALL be limited over the same range the ticks are generated for, `grace` included, in every layout pass. The axis SHALL NOT end beyond its outermost ticks.

#### Scenario: Grace with a step size

- **WHEN** the data is [10, 20, 80], the y axis has `grace: '10%'` and `ticks.stepSize: 10`
- **THEN** the ticks are 0, 10, …, 90 and the axis maximum is 90

### Requirement: Tick values are strictly increasing and finite

Every set of generated ticks SHALL be strictly increasing (before `reverse` is applied), contain no value twice and contain only finite values. Generating them SHALL finish for any finite data.

#### Scenario: Data bounds with a fractional maximum

- **WHEN** the y axis has `bounds: 'data'` and the data is [0, 10.3]
- **THEN** no tick value appears twice

#### Scenario: The largest number

- **WHEN** the data is [0, Number.MAX_VALUE]
- **THEN** the chart renders and every tick value is finite

#### Scenario: The full number range

- **WHEN** the data is [-Number.MAX_VALUE, Number.MAX_VALUE]
- **THEN** there are two ticks, at -Number.MAX_VALUE and Number.MAX_VALUE

#### Scenario: A range just under a whole number of steps

- **WHEN** the y axis has `bounds: 'data'` and the data is [0, 3200]
- **THEN** the ticks include 3000 and the last tick is 3200

### Requirement: Data bounds follow the tick grid

When `bounds` is `'data'`, a linear axis SHALL place its ticks on multiples of the spacing and SHALL treat the data minimum and maximum as it treats a user `min` and `max`: with `ticks.includeBounds` true each gets its own tick, and a grid tick closer to it than one label is dropped; with `ticks.includeBounds` false neither gets a tick.

#### Scenario: Off-grid data bounds

- **WHEN** the y axis has `bounds: 'data'` and the data is [0.31, 0.97]
- **THEN** the ticks are 0.31, 0.4, 0.5, …, 0.9 and 0.97

#### Scenario: Bounds left out

- **WHEN** the y axis has `bounds: 'data'`, `ticks.includeBounds: false` and the data is [0, 97]
- **THEN** the ticks are 0, 10, …, 90 and there is no tick at 97
- **AND** the axis still runs from 0 to 97

### Requirement: Logarithmic ticks start at the minimum

A logarithmic axis SHALL NOT place a tick below its minimum, and SHALL NOT repeat a tick, for any minimum.

#### Scenario: Data minimum between nice values

- **WHEN** a logarithmic y axis has the data [7, 10]
- **THEN** the axis minimum is 7 and the ticks start 7, 7.5

#### Scenario: Explicit decimal minimum

- **WHEN** a logarithmic y axis has `min: 0.3` and the data [0.3, 10]
- **THEN** the ticks start 0.3, 0.4 and 0.3 appears once
