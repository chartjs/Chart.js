## Purpose

Which forms a bar dataset's `base` takes.

## ADDED Requirements

### Requirement: Bar base per bar

A bar dataset's `base` SHALL be a number, an array of numbers, or a function. It SHALL also be read from `options.datasets.bar`.

#### Scenario: Array

- **WHEN** a bar dataset has `base: [2, 5, -3]`
- **THEN** each bar starts at its own base, and the array repeats when it is shorter than the data

#### Scenario: Function

- **WHEN** `base` is `(ctx, opts) => ctx.dataIndex * 10 + opts.borderWidth`
- **THEN** it is called with each bar's context, and each bar starts at the value returned for it

#### Scenario: Number or unset

- **WHEN** `base` is a number or is not set
- **THEN** the bars are drawn as before this change
