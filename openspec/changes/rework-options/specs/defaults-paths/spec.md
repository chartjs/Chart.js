## Purpose

Which paths the `Chart.defaults` methods accept.

## ADDED Requirements

### Requirement: Defaults paths cannot reach prototypes

`Chart.defaults.set`, `get`, `describe`, `override` and `route` MUST throw when a path has a segment `__proto__`, `prototype` or `constructor`, at any depth, and MUST leave every object outside the defaults unchanged. `route` MUST also reject such a name for the option it defines.

#### Scenario: First segment

- **WHEN** `Chart.defaults.set('__proto__', {polluted: 1})` is called
- **THEN** it throws, and no object gains `polluted`

#### Scenario: Nested segment

- **WHEN** `Chart.defaults.set('plugins.__proto__', {p: 1})` is called
- **THEN** it throws, and `({}).p` is undefined

#### Scenario: Route name

- **WHEN** `Chart.defaults.route('', '__proto__', '', 'color')` or `Chart.defaults.route('', 'constructor', '', 'color')` is called
- **THEN** it throws, and the defaults gain no property

#### Scenario: Other paths

- **WHEN** the path is any other string, such as `myconstructor.a`
- **THEN** the method works as before this change
