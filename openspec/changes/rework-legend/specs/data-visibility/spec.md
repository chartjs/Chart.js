## Purpose

How hidden data items behave when the data is replaced or measured by an axis.

## ADDED Requirements

### Requirement: Hidden state follows the labels when they are replaced

When `data.labels` is replaced by a different array, a hidden data item SHALL stay hidden only if its label is in the new labels, and SHALL then be hidden at that label's index, also when the data was changed with array methods before the same update. Equal labels SHALL match in order of occurrence. When the chart has no labels, or the labels array is changed in place, the hidden state SHALL stay by index, moved by array mutations as before.

#### Scenario: Labels replaced without the hidden label

- **WHEN** item `a` of `[a, b, c]` is hidden and the labels and data are replaced with `[b, c]`
- **THEN** `b` and `c` are visible

#### Scenario: Labels replaced with an equal array

- **WHEN** an item is hidden and the labels are replaced with a new array of the same labels
- **THEN** the same item stays hidden

#### Scenario: Data spliced and labels replaced before one update

- **WHEN** item `c` of `[a, b, c, d]` is hidden, the data is spliced to drop `a`, and the labels are replaced with `[b, c, d]`, all before one update
- **THEN** `c` is hidden and `b` and `d` are visible

#### Scenario: No labels

- **WHEN** the chart has no labels and the data is replaced
- **THEN** the hidden state stays by index

### Requirement: Hidden bars do not count towards the value axis

A bar data item hidden with `toggleDataVisibility` or with `hide(datasetIndex, dataIndex)` SHALL NOT count towards the value axis' minimum and maximum. The index axis SHALL keep all its categories. Other chart types SHALL keep their axes as before.

#### Scenario: Hide the largest bar

- **WHEN** a bar chart has data `[10, 100]` and item 1 is hidden, with `toggleDataVisibility(1)` or with `hide(0, 1)`
- **THEN** the value axis ends below 100
- **AND** the category axis still shows both categories

#### Scenario: Show it again

- **WHEN** the item is shown again
- **THEN** the value axis reaches 100 again
