## Purpose

Where the bars of one or more bar datasets sit on the index axis, and how wide they are.

## ADDED Requirements

### Requirement: Only bars that share a range share the slots

The bars at an index value SHALL be divided among the visible, grouped bar datasets of the same chart type whose index scales cover the same pixel range. Datasets of other types, hidden datasets and datasets on index scales with another pixel range SHALL NOT take a slot. Within one range, the slots SHALL be ordered by index scale (in the order of each scale's first dataset), then by stack group.

#### Scenario: A line on a second index axis

- **WHEN** a bar dataset is on `x` and a line dataset is on a second category axis `x2` with the same labels
- **THEN** each bar is `categoryPercentage × barPercentage` of its category wide, as without the line

#### Scenario: Stacked index axes

- **WHEN** two index axes are stacked next to each other (the same scale `stack`) and each has one bar dataset
- **THEN** each bar is centred on its own category and as wide as on a chart with one index axis

#### Scenario: Overlaid index axes with different stack counts

- **WHEN** two index axes cover the same range, the first holds stack groups `a` and `b` and the second holds `c`
- **THEN** each category has three slots of equal width in the order `a`, `b`, `c`, and no bar overlaps another

#### Scenario: Overlaid index axes with different labels

- **WHEN** two category axes cover the same range, `x` with labels a, b, c and `x2` with labels c, b, a, and each has one bar dataset
- **THEN** each bar sits at its own label on its own axis, in a slot of half the category

#### Scenario: Overlaid index axes with one stack each

- **WHEN** three index axes cover the same range and each holds one stack group
- **THEN** each category has three slots, as in 4.5

### Requirement: Flex bars take their neighbours from all bars

With `barThickness: 'flex'`, the region of a bar SHALL reach halfway to the previous and the next index value at which any bar dataset of the same type on that scale has data. The first and last values SHALL mirror their only neighbour; a single value overall SHALL use the whole scale.

#### Scenario: A dataset with one value

- **WHEN** `barThickness` is `'flex'`, the labels are A, B and C, one dataset has a value only at B and another has values at A, B and C
- **THEN** no two bars overlap

#### Scenario: Two items at the same index value

- **WHEN** `barThickness` is `'flex'` and a dataset has two items at the same category
- **THEN** both bars have the category's width share, not zero

### Requirement: A null frees its slot when skipNull is on

When any bar dataset of the same type on the index scales that share a range has `skipNull` set, a dataset SHALL take no slot at an index value where its value is null, undefined or NaN. All datasets at that index value SHALL see the same slots.

#### Scenario: Only some datasets skip nulls

- **WHEN** dataset A has `skipNull: true` and data `[1, 1]`, dataset B has data `[1, 1]` and dataset C has data `[null, 1]`
- **THEN** at the first category A and B have two equal slots and no bars overlap

#### Scenario: skipNull on the dataset that should widen

- **WHEN** dataset A has `skipNull: true` and data `[1, 2]`, and dataset B has data `[null, 3]`
- **THEN** A's first bar takes the whole category

#### Scenario: skipNull for the whole chart

- **WHEN** `skipNull` is set in the chart options and one of two datasets is null at a category
- **THEN** the other dataset's bar takes the whole category, as before

#### Scenario: Several entries at one category

- **WHEN** dataset A has `skipNull: true` and data `[{x: 'a', y: 1}]`, and dataset B has data `[{x: 'a', y: null}, {x: 'a', y: 2}]`
- **THEN** A and B each take one slot at 'a' and their bars do not overlap

### Requirement: Layout cost

Placing a bar SHALL NOT take time proportional to the number of bars in other datasets.

#### Scenario: Many points with skipNull

- **WHEN** three datasets of 1000 points each have `skipNull` set
- **THEN** the chart updates without searching the other datasets' data for each bar

#### Scenario: Many datasets

- **WHEN** a chart has 1000 bar datasets of one point each
- **THEN** placing a bar does not go through the list of datasets again for each bar

### Requirement: Minimum bar thickness

A bar SHALL be at least `minBarThickness` pixels wide on the index axis. When `minBarThickness` and `maxBarThickness` conflict, `maxBarThickness` SHALL win.

#### Scenario: Thin bars on a long time scale

- **WHEN** `minBarThickness` is 4 and the computed width is 1 pixel
- **THEN** the bar is 4 pixels wide

#### Scenario: Conflict with the maximum

- **WHEN** `minBarThickness` is 10 and `maxBarThickness` is 6
- **THEN** the bar is 6 pixels wide

### Requirement: Bar alignment on the index axis

`barAlign` SHALL place a bar's region on the index axis: `'center'` (the default) around its value, `'start'` from its value towards the next greater value, `'end'` from its value towards the previous smaller value.

#### Scenario: Bars starting at their timestamp

- **WHEN** a time axis has data every 5 minutes, `offset` is false and `barAlign` is `'start'`
- **THEN** each bar's edge on the side of smaller values is at its timestamp

#### Scenario: Default

- **WHEN** `barAlign` is not set
- **THEN** bars are centred on their value, as before
