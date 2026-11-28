## Purpose

What a plugin gets when it layers an object or a named block of options over the options it was handed, and what a scriptable option's second argument reads.

## ADDED Requirements

### Requirement: A scriptable option reads the options without the hover layer

The second argument of a scriptable option SHALL resolve options without the prefixes that the last `setContext` call set and without the block being applied, in the same context as the call and with the same plain-object overrides. Inside an item of an array of option objects it SHALL be that item's options. For the elements of a dataset it SHALL resolve without the hover prefixes, as before this change.

#### Scenario: A hover key reads its normal value

- **WHEN** options have `color: 'red'` and `hoverColor: (ctx, opts) => opts.color + '+dark'`, and are given a context with the prefixes `['hover', '']`
- **THEN** `color` is `'red+dark'` and nothing throws; the same holds one level down, in `label.color`

#### Scenario: Prefixes set in two calls

- **WHEN** options are given a context with the prefixes `['point', '']`, then with `['pointHover', 'point', '']`, and `pointHoverColor` is `(ctx, opts) => opts.color`
- **THEN** it returns the value of `pointColor`

#### Scenario: A prefix of any name

- **WHEN** `activeColor` is `(ctx, opts) => opts.color + '+dark'`, `color` is `'red'`, and the options are given a context with the prefixes `['active', '']`
- **THEN** `color` is `'red+dark'`

#### Scenario: The context follows

- **WHEN** options have `a: (ctx, opts) => opts.b` and `b: ctx => ctx.n`, and are given a new context `{n: 2}`
- **THEN** `a` is 2

#### Scenario: An item of an array

- **WHEN** an option is an array of objects and a scriptable option in one item reads its second argument
- **THEN** it reads that item's options, not the array

#### Scenario: A plain override follows

- **WHEN** a plugin overrides a nested option object with the plain object `{type: 'label'}`, and a scriptable option in it returns `opts.type`
- **THEN** it returns `'label'`, hovered or not

### Requirement: A block of options applies with one override

A plugin SHALL be able to pass the key of a nested object of its options, a block, to `override` on the options that hold it. Every option the block defines SHALL win at every depth, every other option SHALL keep its value, and the options the plugin holds SHALL stay as they were. Only what the layers of those options hold under the key SHALL be part of the block; an option of the same name at the root of the chart's options MUST NOT enter it.

#### Scenario: Static block

- **WHEN** options `{backgroundColor: 'red', label: {color: 'black'}, hover: {backgroundColor: 'blue', label: {color: 'white'}}}` are overridden with the key `'hover'`
- **THEN** `backgroundColor` is `'blue'`, `label.color` is `'white'`, `label.font.size` is the default, and the original options still give `'red'` and `'black'`

#### Scenario: A function in the block reads the option it defines

- **WHEN** `hover.label.color` is `(ctx, opts) => opts.color + '+dark'` and `label.color` is `'black'`
- **THEN** `label.color` of the overridden options is `'black+dark'`

#### Scenario: Functions at any level

- **WHEN** `hover`, `hover.label` or `hover.label.font` is a function that returns an object, which may itself contain functions
- **THEN** every leaf resolves with the current context

#### Scenario: The context changes after the override

- **WHEN** the overridden options are given a new context
- **THEN** the functions in the block are called with the new context

#### Scenario: Array form

- **WHEN** the options are an item of an array of option objects and that item has a `hover` block
- **THEN** the override works as for a keyed object

#### Scenario: A block in the chart's options and in the plugin's defaults

- **WHEN** the plugin's defaults have `hover: {color: 'b', label: {padding: 9}}`, the chart's options have `hover: {color: 'u'}`, and the key `'hover'` is applied
- **THEN** `color` is `'u'` and `label.padding` is 9

#### Scenario: The chart's interaction options stay out

- **WHEN** a plugin whose options also read the root of the chart's options has `box: {mode: 'own', hover: {color: 'b'}}`, and the key `'hover'` is applied to `box`
- **THEN** `mode` is `'own'`, not the `mode` of the chart's `options.hover`

#### Scenario: No block

- **WHEN** no layer holds an object under the key, or `null` or `undefined` is passed
- **THEN** the options are returned unchanged and their keys can be listed

#### Scenario: An object

- **WHEN** an object is passed to `override`
- **THEN** the result is as before this change
