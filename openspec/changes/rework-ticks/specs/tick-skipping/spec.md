## Purpose

This spec covers which of an axis's generated ticks are drawn when `ticks.autoSkip` is on and not every label fits, how the label callback sees the ticks, and where grid lines go after ticks are skipped.

## ADDED Requirements

### Requirement: A null label removes only its tick

A tick whose label callback returns `null` or `undefined` SHALL be removed; any other label, including `0`, `''`, `[]` and multi-line arrays, SHALL keep its tick. Removing ticks SHALL take time proportional to the number of ticks.

#### Scenario: Many removed ticks

- **WHEN** a category axis has 100,000 ticks and a callback that labels one in a thousand
- **THEN** the update takes milliseconds, not seconds

#### Scenario: Empty labels

- **WHEN** a callback returns `0`, `''` or `[]` for a tick
- **THEN** that tick is kept

### Requirement: The label callback sees the full tick set

The label callback SHALL be called once for each generated tick, with the tick's index in the generated set and with that set, whatever `ticks.sampleSize` is. Sampling SHALL only limit which labels are measured.

#### Scenario: Sampled measuring

- **WHEN** a category axis with 50 labels at 300 px has `ticks.sampleSize: 5` and a callback that labels every index divisible by 7
- **THEN** the labels shown are L0, L7, …, L49, each on its own category

### Requirement: Ticks between major ticks are evenly spaced

When major ticks are enabled and fewer majors than the limit exist, the kept ticks SHALL repeat from each major in the same whole step, and a tick closer than one step to the next major SHALL be dropped. Evenly spaced majors SHALL be recognised whatever the index of the first major, and the step SHALL then divide the major spacing.

#### Scenario: Even majors starting at the first tick

- **WHEN** 120 ticks have majors at 0, 30, 60 and 90 and 30 labels fit
- **THEN** every gap between kept ticks is 5

#### Scenario: Uneven majors

- **WHEN** 181 ticks have majors at 0, 31, 59, 90, 120 and 151 and 30 labels fit
- **THEN** the kept ticks are 0, 7, 14, 21, 31, 38, 45, 52, 59, …: 7 apart after each major, with the only longer gaps just before a major

### Requirement: Labels fit the part of the axis the ticks cover

The number of labels that fit SHALL be counted over the span of the axis that the ticks' values cover, and SHALL never be more than the axis length allows.

#### Scenario: Ticks over half the axis

- **WHEN** a linear x axis runs from 0 to 1000 at 600 px and its ticks cover 0 to 500
- **THEN** no two drawn labels are closer than the widest label plus `ticks.autoSkipPadding`

#### Scenario: Radial axis

- **WHEN** a radar chart has a visible radial axis
- **THEN** its ticks and rings are drawn as before

### Requirement: Offset grid lines stay between categories

With `grid.offset`, each drawn tick SHALL have its grid line on the boundary before it among the generated ticks (whether they were skipped or removed by a `null` label), and one line SHALL close the last generated tick. When nothing is skipped or removed the lines SHALL be where they are today.

#### Scenario: Every other label skipped

- **WHEN** a bar chart with 12 categories at 300 px has `offset` and `grid.offset` and every other label is skipped
- **THEN** the grid cells are of equal width and no grid line crosses a bar

#### Scenario: Odd labels removed by the callback

- **WHEN** the same chart has a callback that returns `null` for odd indexes
- **THEN** no grid line crosses a bar

### Requirement: The ends can be kept when skipping

With `ticks.autoSkipKeepEnds` on, skipping SHALL keep the last tick. The first kept tick SHALL be the same as with the option off, and SHALL never be dropped for the last one. The tick before the last SHALL be dropped when it is closer than one label's room or when keeping it would exceed `ticks.maxTicksLimit`. Keeping the last tick SHALL NOT make bars narrower.

#### Scenario: Category limit

- **WHEN** a category axis has 20 labels, `ticks.maxTicksLimit: 7` and `ticks.autoSkipKeepEnds: true`
- **THEN** the labels are L0, L3, L6, L9, L12, L15 and L19

#### Scenario: Option off

- **WHEN** `ticks.autoSkipKeepEnds` is false
- **THEN** the drawn ticks are the same as without this requirement

#### Scenario: Bar width

- **WHEN** a bar chart on a time axis skips labels and `ticks.autoSkipKeepEnds` is on
- **THEN** the bars are as wide as with it off

### Requirement: Skipping keeps round multiples of the step on linear axes

On a linear axis, skipping SHALL keep the ticks whose values are multiples of a nice multiple (1, 2 or 5 times a power of ten) of the tick step, so that 0 is kept whenever it is in range. The first tick, and a bound tick off the grid, SHALL be kept. The step SHALL be read from the ticks being skipped, so ticks replaced in `afterBuildTicks` are seen; when none is on such a grid, ticks SHALL be skipped by index and at least one SHALL be kept. With `ticks.autoSkip: false` every step SHALL be drawn.

#### Scenario: Unit step on a short axis

- **WHEN** a y axis runs from 0 to 100 with `ticks.stepSize: 1` at 400 px
- **THEN** the drawn ticks are 0, 10, 20, …, 100

#### Scenario: Zero inside the range

- **WHEN** a bar chart's y axis runs from -40 to 120 with `ticks.stepSize: 10` at 150 px
- **THEN** the drawn ticks include 0 and every drawn value is a multiple of 50 except the first

#### Scenario: Ticks replaced in a hook

- **WHEN** `afterBuildTicks` replaces a linear axis's ticks with 0.5, 7 and 40
- **THEN** at least one tick is drawn
