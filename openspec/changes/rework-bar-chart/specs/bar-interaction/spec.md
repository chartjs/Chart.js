## Purpose

Which bars the interaction modes find, and which one wins.

## ADDED Requirements

### Requirement: Bars are found through their visible part

A bar whose base or head lies outside the chart area SHALL be found by the interaction modes when the pointer is over its visible part, and distances SHALL be measured to the centre of that part. A bar with no part inside the chart area SHALL NOT be found unless `includeInvisible` is set. Points keep their rule: a point whose centre is outside the chart area is not found.

#### Scenario: Base below the axis minimum

- **WHEN** the value axis has `min: 1`, the data is `[1.5, 10]`, and the interaction is `{mode: 'nearest', intersect: false, axis: 'x'}` with the pointer over the first category near the top of the chart area
- **THEN** the first bar is found

#### Scenario: Head above the axis maximum

- **WHEN** the value axis has `max: 50`, the data is `[100, 20]`, the interaction mode is `'index'` with `intersect: true`, and the pointer is inside the first bar
- **THEN** the first bar is found

### Requirement: Index mode follows the index axis

In `index` mode without `axis`, the index SHALL be chosen along the chart's `indexAxis`.

#### Scenario: Horizontal bars

- **WHEN** `indexAxis` is `'y'`, the data is `[10, 2]`, the interaction is `{mode: 'index', intersect: false}`, and the pointer is in the first row at the second bar's length
- **THEN** the items of the first row are found

### Requirement: The item drawn on top wins

When several items contain the pointer and the interaction is `{mode: 'nearest', intersect: true}`, the item drawn on top SHALL be found.

#### Scenario: Overlapping bars

- **WHEN** `indexAxis` is `'y'`, the index axis is not stacked, datasets `[5]`, `[9]` and `[10]` share one stack name, and the pointer is at the value 6
- **THEN** the second dataset's bar is found (it is drawn over the third), not the third, whose centre is nearer
