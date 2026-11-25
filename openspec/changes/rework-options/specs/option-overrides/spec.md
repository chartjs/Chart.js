## Purpose

What a plugin gets when it layers an object or a block of options over the options it was handed, and what a scriptable option's second argument reads.

## ADDED Requirements

### Requirement: A scriptable option reads the options without the hover layer

The second argument of a scriptable option SHALL resolve options without the hover prefixes or the hover block being applied, in the same context as the call and with the same plain-object overrides.

#### Scenario: A hover key reads its normal value

- **WHEN** options have `color: 'red'` and `hoverColor: (ctx, opts) => opts.color + '+dark'`, and are given a context with the prefixes `['hover', '']`
- **THEN** `color` is `'red+dark'` and nothing throws; the same holds one level down, in `label.color`

#### Scenario: The context follows

- **WHEN** options have `a: (ctx, opts) => opts.b` and `b: ctx => ctx.n`, and are given a new context `{n: 2}`
- **THEN** `a` is 2

#### Scenario: A plain override follows

- **WHEN** a plugin overrides a nested option object with the plain object `{type: 'label'}`, and a scriptable option in it returns `opts.type`
- **THEN** it returns `'label'`, hovered or not

### Requirement: A block of options applies with one override

A plugin SHALL be able to pass a nested object of its own options, read from the options it was handed, to `override`. Every option the block defines SHALL win at every depth, every other option SHALL keep its value, and the options the plugin holds SHALL stay as they were.

#### Scenario: Static block

- **WHEN** options `{backgroundColor: 'red', label: {color: 'black'}, hover: {backgroundColor: 'blue', label: {color: 'white'}}}` are overridden with their `hover`
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

#### Scenario: Plain object

- **WHEN** the object passed to `override` is a plain object and not read from the options
- **THEN** the result is as before this change
