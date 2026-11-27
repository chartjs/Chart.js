## Purpose

Which changes to a chart's data, labels, scales and parsing options are shown by the next update, and how code tells the chart about a change it cannot see.

## ADDED Requirements

### Requirement: Unchanged data is not read again

From 5.0.0, an update SHALL NOT read a dataset's data again when nothing it was parsed from has changed.

#### Scenario: Update without changes

- **WHEN** a chart whose time axis has a `parser` callback is updated without any change
- **THEN** the callback is not called

#### Scenario: Option-only change

- **WHEN** only an option such as a colour or a scale's `min` changes and the chart is updated
- **THEN** the `parser` callback is not called and every point keeps its data position

### Requirement: Array methods are seen

An update SHALL show every change made through the data array's `push`, `pop`, `shift`, `unshift`, `splice`, `sort`, `reverse`, `fill` and `copyWithin`, and from 5.0.0 SHALL read only the points those calls added or changed.

#### Scenario: Push

- **WHEN** one value is pushed and the chart is updated
- **THEN** the new point is drawn, and from 5.0.0 the `parser` callback is called once, for that value

#### Scenario: Splice in the middle

- **WHEN** values are spliced into the middle of the data and the chart is updated
- **THEN** every point is at its value and the nearest-mode tooltip finds the point under the pointer

#### Scenario: Rolling window under fixed labels

- **WHEN** a chart has fixed `labels` and plain number data, and the code runs `data.shift(); data.push(v)` before each update
- **THEN** every value is drawn at the label of its new position

#### Scenario: Sort in place

- **WHEN** the data array is sorted or reversed in place and the chart is updated
- **THEN** the points follow the new order

### Requirement: Replaced data is seen

An update SHALL show the new values when `dataset.data`, a dataset object or `chart.data` is replaced.

#### Scenario: Replaced array

- **WHEN** `dataset.data` is set to a new array and the chart is updated
- **THEN** every point shows the new values

### Requirement: Changes in place need the signal

From 5.0.0, a value changed by assignment SHALL be shown only after `markDataChanged` is called for it. In 4.7.0 such a change SHALL still be shown, and the first one on a chart SHALL be reported once on the console.

#### Scenario: Assignment without the signal (5.0.0)

- **WHEN** on a line chart with `labels` given and plain number data `data[1] = 39` is assigned and the chart is updated
- **THEN** point 1 keeps its old position and the tooltip shows the old value

#### Scenario: Not relied on

- **WHEN** code assigns in place without the signal on a chart where something else made the update read all data (a category axis that finds its labels in the data, a replaced array in another dataset's plugin)
- **THEN** the change may be shown, and the docs say not to rely on it

#### Scenario: Assignment with the signal

- **WHEN** `data[1] = 39` is assigned and `chart.markDataChanged(0, 1, 1)` is called before the update
- **THEN** point 1 moves to 39, animating from its old position

#### Scenario: Signal for everything

- **WHEN** values in several datasets are assigned and `chart.markDataChanged()` is called before the update
- **THEN** every changed value is shown

#### Scenario: Warning in 4.7.0

- **WHEN** on 4.7.0 a value is assigned in place and the chart is updated
- **THEN** the change is shown and the console warns once for that chart, naming the dataset and the migration guide

#### Scenario: No warning with the signal or an array method

- **WHEN** on 4.7.0 a value changes through an array method, or in place with the signal
- **THEN** there is no warning

#### Scenario: No warning for label and scale changes

- **WHEN** on 4.7.0 a label is assigned or a scale's type changes and the chart is updated
- **THEN** there is no warning

#### Scenario: Signal on 4.7.0

- **WHEN** on 4.7.0 `markDataChanged` is called before an update
- **THEN** the chart looks the same as without the call

### Requirement: Label changes are seen

An update SHALL show labels that were pushed, removed, replaced or assigned (`labels[2] = 'x'`) without a signal.

#### Scenario: Label pushed with values

- **WHEN** a label is pushed onto `chart.data.labels` and a value onto each dataset, and the chart is updated
- **THEN** the axis shows the label and the points sit at it

#### Scenario: Label assigned

- **WHEN** `chart.data.labels[2]` is assigned and the chart is updated
- **THEN** the axis shows the new label and the points of a dataset with `{x: label}` data follow it

#### Scenario: Labels replaced in a plugin hook

- **WHEN** a plugin's `beforeUpdate` replaces the labels of a category axis that has `min` set, and the chart is updated
- **THEN** the axis and the points follow the new labels

#### Scenario: Labels found in the data

- **WHEN** no labels are given and the only point with x `'c'` is removed by `splice`
- **THEN** the axis no longer shows `'c'`

### Requirement: Scale and parsing changes are seen

An update SHALL place the points by the scales, axes and `parsing` option in effect for that update.

#### Scenario: Scale type change

- **WHEN** the index axis changes from `category` to `time`, or a dataset's `xAxisID` or the chart's `indexAxis` changes, and the chart is updated
- **THEN** the points are placed by the new setting on that update

#### Scenario: Parsing key change

- **WHEN** a dataset's `parsing.yAxisKey` changes from `'a'` to `'b'` and the chart is updated once
- **THEN** the points show the values under `'b'`

### Requirement: Stacks follow the datasets

An update SHALL stack the values by the datasets' current order, stack names, `stacked` settings and visibility.

#### Scenario: Dataset removed or moved

- **WHEN** a stacked dataset is removed, the datasets are reordered, a dataset moves to another `stack`, or `stacked` is toggled, and the chart is updated
- **THEN** every stacked position is the sum of the values below it

#### Scenario: Dataset hidden

- **WHEN** a dataset of a stacked bar chart is hidden
- **THEN** the remaining bars keep correct positions and rounded ends

### Requirement: Bubble radius follows its option

A bubble chart's radius SHALL follow its `radius` option on every update, and a scriptable `radius` SHALL see the parsed point.

#### Scenario: Scriptable radius reading the parsed value

- **WHEN** a bubble chart has `radius: ctx => ctx.parsed.y` and data without `r`
- **THEN** the chart draws without an error and each bubble's radius is its y value

#### Scenario: Radius changed

- **WHEN** the `radius` option changes from 3 to 10 and the data does not, and the chart is updated
- **THEN** the bubbles of points without `r` are drawn with radius 10

#### Scenario: Parsed radius

- **WHEN** a tooltip callback reads `parsed._custom` of a bubble without `r`
- **THEN** it is the radius the bubble is drawn with

### Requirement: Third-party controllers keep working

From 5.0.0, a dataset controller that does not declare that its parse is local to each item SHALL read all its data on an update after any change to it, and none when nothing changed.

#### Scenario: Controller that parses across items

- **WHEN** a controller whose parse lays out all items together (as a sankey's links) has a link pushed and the chart is updated
- **THEN** every item is laid out again with the new link
