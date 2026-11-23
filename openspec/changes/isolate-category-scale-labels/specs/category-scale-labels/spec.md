## Purpose

This spec covers where a category axis gets its labels:

- the labels the user gives;
- the labels the axis adds from the data it plots;
- the user-owned arrays it must never change.

## ADDED Requirements

### Requirement: User label arrays are never modified

A category axis SHALL NOT add, remove or reorder entries in `data.labels`, `data.xLabels`, `data.yLabels` or in its own `labels` option. Labels it finds in the data SHALL be kept by the axis only.

#### Scenario: Labels given in the data

- **WHEN** a chart has `data.labels: ['a']` and object data with x values `'a'` and `'b'`, and it renders
- **THEN** `data.labels` is still `['a']`
- **AND** the axis shows `a` and `b`

#### Scenario: Labels given on the axis

- **WHEN** a category axis has `labels: ['a']` and the data is `{a: 1, b: 3}`
- **THEN** the array passed as `labels` is still `['a']`
- **AND** the axis shows `a` and `b`

#### Scenario: No labels given

- **WHEN** a chart has no labels and the data is `{a: 1, b: 3}`
- **THEN** `chart.data.labels` is `[]` after rendering
- **AND** the axis shows `a` and `b`

#### Scenario: Repeated updates

- **WHEN** a chart with labels inferred from the data is updated several times without changes
- **THEN** the user's arrays are unchanged
- **AND** no label is shown twice

### Requirement: Labels found in the data belong to the axis that plots that data

A label a category axis finds in the data SHALL be shown only on that axis. It SHALL NOT be shown on another axis.

#### Scenario: Two category x axes

- **WHEN** two category x axes have no labels, one dataset plots `'Medications'` on the first and another plots `'Encounters'` on the second
- **THEN** each axis shows only its own label
- **AND** each value is drawn at its axis' first tick

#### Scenario: Category x and category y

- **WHEN** a category x axis and a category y axis both take their labels from the data
- **THEN** neither axis shows the other's labels

#### Scenario: Stacked category axes

- **WHEN** two category axes share a `stack` and each plots its own category
- **THEN** each axis shows only its own category

### Requirement: data.labels applies to every category axis

When `data.labels` is given, every category axis without its own `labels`, `xLabels` or `yLabels` SHALL start from `data.labels`.

#### Scenario: A second category axis with labels from the data

- **WHEN** `data.labels` is `['Jan', 'Feb']` and a category y axis plots the values `'Low'` and `'High'`
- **THEN** the x axis shows `Jan`, `Feb`
- **AND** the y axis shows `Jan`, `Feb`, `Low`, `High`

#### Scenario: Separate labels for the second axis

- **WHEN** the same chart gives the y axis `labels: ['Low', 'High']`
- **THEN** the y axis shows only `Low`, `High`

### Requirement: Labels found in the data follow the data

An axis SHALL show the labels given by the user first, then the labels found in the data, in data order. On every update the axis SHALL rebuild its labels from the current label source and the current data.

#### Scenario: Data adds a label

- **WHEN** the given labels are `['a']` and the data has the value `'z'`
- **THEN** the axis shows `a`, `z`

#### Scenario: Labels added by a plugin before the update

- **WHEN** a plugin pushes `'late'` to `data.labels` in its `beforeUpdate` hook, and the axis has a `min`
- **THEN** the axis shows `late`

#### Scenario: Labels pushed before an update

- **WHEN** the user pushes `'b'` to `data.labels`, adds a point at `'b'` and calls `update()`
- **THEN** the axis shows `a`, `b`, `z`

#### Scenario: Dataset removed

- **WHEN** the dataset that contained `'z'` is removed and `update()` is called
- **THEN** the axis no longer shows `z`

### Requirement: Point chart tooltips keep the category label

In scatter and bubble charts, the label of a point SHALL be the `data.labels` entry at its index when there is one. Otherwise, when the index axis is a category axis, it SHALL be that axis' label for the point. Otherwise, when the value axis is a category axis, it SHALL be that axis' label for the point.

#### Scenario: Labels from the data

- **WHEN** a bubble or scatter chart has a category x axis whose labels come from the data, and the user hovers the point at `'b'`
- **THEN** the tooltip title is `b`

#### Scenario: Category value axis

- **WHEN** a bubble or scatter chart has a linear x axis and a category y axis whose labels come from the data, and the user hovers the point at `'b'`
- **THEN** the tooltip title is `b`

#### Scenario: Labels given

- **WHEN** `data.labels` has an entry at the point's index
- **THEN** the tooltip title is that entry
