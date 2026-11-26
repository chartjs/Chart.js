## Purpose

What the package publishes as TypeScript declarations, which compilers can read them, and how plugins and consumers reach and extend them.

## ADDED Requirements

### Requirement: Exported names keep their kind within a major version

Every name that `chart.js`, `chart.js/auto` or `chart.js/helpers` exports in a release SHALL still be exported, with the same kind (value, type or both), by every later release of the same major version.

#### Scenario: A 4.6 import still resolves

- **WHEN** a consumer imports any name that 4.6.2 exports from `chart.js`, `chart.js/auto` or `chart.js/helpers`, and compiles against a later 4.x release
- **THEN** the import resolves to a name of the same kind

#### Scenario: Converting a module removes no export

- **WHEN** a release on 4.x contains a module converted from JavaScript to TypeScript
- **THEN** the `controllers`, `elements`, `plugins` and `scales` namespaces, `animator`, `_detectPlatform`, `Colors` and every `chart.js/helpers` function still export every member they exported before

### Requirement: Declared types do not narrow or widen within a major version

A member or parameter that a release declares with a type other than `any` SHALL keep that type in every later release of the same major version. A later release MAY add members.

#### Scenario: No member turns into any

- **WHEN** a consumer reads a member of `Chart`, a scale, a controller, an element, a plugin or a helper on a later 4.x release
- **THEN** its declared type is the type 4.6.2 declares, or that member is new

#### Scenario: A helper keeps its signature

- **WHEN** a consumer calls a `chart.js/helpers` function with the arguments the 4.6.2 declarations accept
- **THEN** it compiles, and its result has the same declared type

### Requirement: Plugins can extend the registries

The package SHALL let another package extend the chart type, scale type, plugin option and element option registries by interface merging through `declare module 'chart.js'`.

#### Scenario: Plugin options are typed

- **WHEN** a plugin declares `interface PluginOptionsByType<TType> { myPlugin: {size: number} }` in `declare module 'chart.js'`
- **THEN** `options.plugins.myPlugin.size` is typed `number` in a chart of every type, and `myPlugin: {size: 'x'}` is a type error

#### Scenario: A new chart type is accepted

- **WHEN** a package adds a chart type to `ChartTypeRegistry`
- **THEN** `new Chart(ctx, {type: '<that type>', data})` type-checks

### Requirement: The declarations compile on the oldest supported TypeScript

The published declarations SHALL compile with no errors on TypeScript 4.7.4 and on the newest TypeScript release, with `skipLibCheck` off, under both `moduleResolution: node` and `moduleResolution: nodenext`.

#### Scenario: A project on TypeScript 4.7.4

- **WHEN** a project on TypeScript 4.7.4 with `skipLibCheck: false` imports `chart.js`, `chart.js/auto` and `chart.js/helpers`
- **THEN** it compiles, with no error reported from the package's declarations

### Requirement: Deep type paths keep resolving within a major version

Under `moduleResolution: node`, the type paths `chart.js/dist/types`, `chart.js/dist/types/index`, `chart.js/dist/types/utils`, `chart.js/dist/types/basic` and `chart.js/dist/types/geometric` SHALL resolve, with the names they had, in every release of the major version that published them.

#### Scenario: DeepPartial from its file

- **WHEN** a consumer on 4.x imports `DeepPartial` from `chart.js/dist/types/utils`
- **THEN** it resolves, as it does on 4.6.2

### Requirement: On v5, components are declared as their classes

From 5.0.0, the published declaration of each built-in controller, scale, element, plugin and platform, and of `Chart`, SHALL be the class itself, with its own members, its static `id` and `defaults`, and its constructor. Members that are marked internal SHALL NOT be published. Exported helpers whose names start with `_` SHALL stay published.

#### Scenario: A controller has its own members

- **WHEN** a consumer on v5 annotates a value as `BarController`
- **THEN** the type has the members of the bar controller, not only those of `DatasetController`

#### Scenario: An internal member is not published

- **WHEN** a consumer on v5 reads a member that 4.x never declared and that the source marks internal
- **THEN** it is a type error

#### Scenario: An underscore helper stays

- **WHEN** a plugin on v5 imports `_angleBetween` from `chart.js/helpers`
- **THEN** it resolves

### Requirement: On v5, declarations match the runtime

From 5.0.0, a published declaration that contradicted the runtime value in 4.x SHALL declare what the runtime holds, and the v5 migration guide SHALL list each such correction.

#### Scenario: The chart id is a number

- **WHEN** a consumer on v5 reads `chart.id`
- **THEN** it is typed `number`, which is what the runtime holds, and the migration guide names the change

### Requirement: The API reference documents the classes

From 5.0.0, the generated API reference SHALL document the classes as the source declares them, with their public members, and SHALL list no member that is marked internal.

#### Scenario: Chart.update is documented

- **WHEN** a reader opens the v5 API reference page of `Chart`
- **THEN** it lists `update`, with its parameters, and lists no internal member
