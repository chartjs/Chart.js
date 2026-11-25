## Purpose

How an object-valued option is merged across the layers that define it: the dataset, the chart's options, the chart type's overrides and the defaults.

## ADDED Requirements

### Requirement: Object options merge key by key across layers

An option whose value is an object SHALL take each key from the first layer that defines that key. A layer that gives the option as a function SHALL contribute the object the function returns. A function SHALL never be read for keys itself.

#### Scenario: Static object over a function

- **WHEN** a higher layer has `label: {color: 'white'}` and a lower layer has `label: ctx => ({color: 'black', padding: 5})`
- **THEN** `label.color` is `'white'` and `label.padding` is 5

#### Scenario: A function's own properties

- **WHEN** an option is `function foo(ctx) { return {color: 1}; }` and no layer defines `name` or `length` for it
- **THEN** `name` and `length` of the resolved object are undefined

#### Scenario: Static objects only

- **WHEN** every layer gives the option as an object
- **THEN** the result is as before this change

### Requirement: An options array is not a layer for its items

The items of an array of option objects SHALL resolve only keys that the item or the layers below the array define.

#### Scenario: Plugin options with an array of objects

- **WHEN** plugin options contain `ranges: [{prop: 1}, {prop: 2}]`
- **THEN** each item has the key `prop` and no keys `0` or `1`
