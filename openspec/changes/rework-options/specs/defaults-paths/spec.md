## Purpose

Which paths and keys the `Chart.defaults` methods accept.

## ADDED Requirements

### Requirement: Defaults paths cannot reach prototypes

`Chart.defaults.set`, `get`, `describe`, `override` and `route` MUST throw when a path has a segment `__proto__`, `prototype` or `constructor`, at any depth, or a segment that names a property the object it is read from inherits, such as `toString`, `valueOf` or one of the methods of `Chart.defaults`. They MUST leave every object outside the defaults unchanged. `route` MUST also reject such a name for the option it defines and for the option it targets.

#### Scenario: First segment

- **WHEN** `Chart.defaults.set('__proto__', {polluted: 1})` is called
- **THEN** it throws, and no object gains `polluted`

#### Scenario: Nested segment

- **WHEN** `Chart.defaults.set('plugins.__proto__', {p: 1})` is called
- **THEN** it throws, and `({}).p` is undefined

#### Scenario: Inherited property

- **WHEN** `Chart.defaults.set('toString.x', {p: 1})`, `Chart.defaults.set('plugins.valueOf.x', {p: 1})` or `Chart.defaults.set('set.x', {p: 1})` is called
- **THEN** it throws, and `Object.prototype.toString`, `Object.prototype.valueOf` and `Chart.defaults.set` have no property `x`

#### Scenario: Route name

- **WHEN** `Chart.defaults.route('', '__proto__', '', 'color')` or `Chart.defaults.route('', 'constructor', '', 'color')` is called
- **THEN** it throws, and the defaults gain no property

#### Scenario: Route target

- **WHEN** `Chart.defaults.route('rt', 'x', '', '__proto__')` is called
- **THEN** it throws, and the defaults gain no property

#### Scenario: Other paths

- **WHEN** the path is any other string, such as `myconstructor.a` or the id of a registered controller, element, scale or plugin
- **THEN** the method works as before this change

### Requirement: Values cannot replace the defaults' own methods

A key of the values given to `Chart.defaults.set`, `describe` or `override` that names a property the object being written to inherits MUST be ignored. The other keys SHALL be applied.

#### Scenario: A method name as a key

- **WHEN** `Chart.defaults.set({describe: {a: 1}, color: 'red'})` is called
- **THEN** `Chart.defaults.describe` is still a function and `Chart.defaults.color` is `'red'`
