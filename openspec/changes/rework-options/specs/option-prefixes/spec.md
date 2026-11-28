## Purpose

How prefixed option names (`hoverColor`, `pointRadius`) are found, also inside nested option objects, and how a plugin resolves its options under other prefixes.

## ADDED Requirements

### Requirement: Prefixes apply inside nested option objects

Options resolved with a list of prefixes SHALL apply the same list inside every nested option object, whether the object is given as an object, returned by a function, or is an item of an array.

#### Scenario: Static object

- **WHEN** a bar dataset has `borderWidth: {top: 1, hoverTop: 9}` and the bar is active
- **THEN** its top border width is 9, and 1 when the bar is not active

#### Scenario: Object returned by a function

- **WHEN** a bar dataset has `borderWidth: () => ({top: 1, hoverTop: 9})` and the bar is active
- **THEN** its top border width is 9

#### Scenario: Array of objects

- **WHEN** options that contain `nodes: [{test: 1, hoverTest: 2}]` are resolved with the prefixes `['hover', '']`
- **THEN** `nodes[0].test` is 2

#### Scenario: No prefixed key

- **WHEN** no nested option object of a chart has a key that starts with `hover` or with the element type
- **THEN** the chart is drawn as before this change

### Requirement: A plugin can resolve its options under other prefixes

A plugin SHALL be able to give a list of prefixes as the second argument of `setContext` on the options it was handed. The result SHALL resolve every option, at every depth, with those prefixes, and the options the plugin holds SHALL stay as they were. The argument SHALL be optional.

#### Scenario: Hover keys

- **WHEN** options `{color: 'red', hoverColor: 'blue', label: {color: 'black', hoverColor: 'white'}}` are given a context with the prefixes `['hover', '']`
- **THEN** `color` is `'blue'` and `label.color` is `'white'` in the result, and the original options still give `'red'` and `'black'`

#### Scenario: Prefixes left out

- **WHEN** `setContext` is called with a context only, or with an empty list
- **THEN** the prefixes in effect stay

#### Scenario: Reset

- **WHEN** hover-prefixed options are given a context with the prefixes `['']`
- **THEN** the un-prefixed values are returned

#### Scenario: Existing typed calls

- **WHEN** TypeScript code calls `setContext` or `override` on an options object with one argument
- **THEN** it compiles
