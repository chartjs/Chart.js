## Purpose

A multi-line label is given as an array of lines. This spec covers multi-line labels as values on a category axis.

## ADDED Requirements

### Requirement: A multi-line label in object data is a category

A category axis SHALL treat an array value on its axis as a multi-line label. An array SHALL match a label that is an array with the same lines in the same order. It does not have to be the same array object.

#### Scenario: Multi-line labels from the data

- **WHEN** object data has x values `['Line', 'one']` and `['Line', 'two']` and no labels are given
- **THEN** the axis has the two multi-line labels
- **AND** the points are drawn at the first and second tick

#### Scenario: Multi-line labels given in data.labels

- **WHEN** `data.labels` contains `['Line', 'one']` and `['Line', 'two']`, and object data uses equal but separate arrays
- **THEN** the points are drawn at the first and second tick
- **AND** no label is added

#### Scenario: Equal arrays share a label

- **WHEN** two points use equal arrays as their x value
- **THEN** they are drawn at the same tick

#### Scenario: Pixel of a multi-line label

- **WHEN** the pixel for the value `['Line', 'two']` is asked
- **THEN** it is the pixel of the second tick
