# category-scale-bounds Specification

## Purpose

How `min`, `max`, `suggestedMin` and `suggestedMax` limit a category axis. Each of them may be given as a label or as an index.

## Requirements

### Requirement: Bounds are resolved against the complete labels

A category axis SHALL resolve `min` and `max` after all labels from the data are known. This holds whether they are given as labels or as indices. Resolving a bound SHALL NOT change the order of the labels.

#### Scenario: String bounds with labels from the data

- **WHEN** the labels come from data `L0` to `L5` and the axis has `min: 'L1'` and `max: 'L3'`
- **THEN** the labels stay in the order `L0` to `L5`
- **AND** the axis shows `L1`, `L2`, `L3`
- **AND** this holds on a horizontal and on a vertical index axis

#### Scenario: Index bounds with labels from the data

- **WHEN** the labels come from data `L0` to `L5` and the axis has `min: 2` and `max: 4`
- **THEN** the axis shows `L2`, `L3`, `L4`

#### Scenario: Bounds changed

- **WHEN** the bounds are changed and `update()` is called
- **THEN** the new bounds apply

### Requirement: Suggested bounds are resolved against the complete labels

A category axis SHALL resolve `suggestedMin` and `suggestedMax` after all labels from the data are known, given as labels or as indices. Resolving them SHALL NOT change the order of the labels.

#### Scenario: A suggested maximum only a hidden dataset reaches

- **WHEN** an axis has `bounds: 'data'` and `suggestedMax: 'L4'`, and `L4` occurs only in a hidden dataset
- **THEN** the axis extends to `L4`

#### Scenario: A suggested minimum only a hidden dataset reaches

- **WHEN** an axis has `bounds: 'data'` and `suggestedMin` names a label that occurs only in a hidden dataset before the visible ones
- **THEN** the axis starts at that label

#### Scenario: Labels keep their order

- **WHEN** `suggestedMin` and `suggestedMax` are labels from the data
- **THEN** the labels are not reordered

### Requirement: A bound that is not among the labels is added after them

When `min`, `max`, `suggestedMin` or `suggestedMax` names a label that is not among the axis' labels, the axis SHALL add it after the labels from the data. It SHALL NOT add it to any user array.

#### Scenario: Unknown minimum

- **WHEN** the labels from the data are `L0`, `L1`, `L2` and the axis has `min: 'ZZ'`
- **THEN** the axis' labels are `L0`, `L1`, `L2`, `ZZ`
- **AND** `data.labels` does not contain `ZZ`
