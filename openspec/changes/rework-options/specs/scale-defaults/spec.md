## Purpose

Where a scale option comes from when the chart does not set it, and when it is read.

## ADDED Requirements

### Requirement: Scale options follow the defaults at update

A scale option that the chart does not set SHALL take its value from the defaults as they are when the chart is updated.

#### Scenario: Colour defaults changed

- **WHEN** a chart exists, `Chart.defaults.scale.grid.color`, `Chart.defaults.color` or `Chart.defaults.borderColor` is changed, and the chart is updated
- **THEN** the grid lines, axis borders, tick labels and scale titles that set no colour use the new value

#### Scenario: The chart sets the option

- **WHEN** the chart sets `scales.x.grid.color`, the default changes, and the chart is updated
- **THEN** the x scale keeps its colour and the y scale follows the default

#### Scenario: A scale type's default changed

- **WHEN** a default of one scale type is changed and the chart is updated
- **THEN** scales of that type that do not set the option use the new value

#### Scenario: Nothing changed

- **WHEN** neither the defaults nor the chart's configuration changed
- **THEN** an update draws the same chart, and a new chart draws what it drew before this change

### Requirement: An update resolves scale defaults as a new chart would

The defaults a scale takes from the chart type and from the types of the datasets that use it SHALL be decided again at every update.

#### Scenario: The chart type changes

- **WHEN** a line chart's type is changed to bar and the chart is updated
- **THEN** its index axis is offset and its value axis begins at zero, and both revert when the type is changed back

#### Scenario: A dataset of another type is added

- **WHEN** a bar dataset is added to a line chart and the chart is updated
- **THEN** the scales it uses take the bar defaults that the chart does not set

### Requirement: The chart's scale options are its own

The scale options a chart stores SHALL hold what the chart was given, and the objects the user passed SHALL not be modified.

#### Scenario: One options object for two charts

- **WHEN** one options object is used for a bar chart and then for a line chart
- **THEN** the line chart's scales carry no bar defaults

#### Scenario: The user's objects

- **WHEN** a chart is created or updated
- **THEN** the scale objects the user passed in `options.scales` have the keys they had before

#### Scenario: Documented ways to change a scale

- **WHEN** `chart.options.scales.y.min = 0`, `chart.options.scales.y = {type: 'logarithmic'}` or `chart.options.scales = {…}` is followed by an update
- **THEN** the chart behaves as before this change

#### Scenario: Listing a scale's options

- **WHEN** the keys of `chart.options.scales.x` are listed
- **THEN** they are `axis`, `id`, `position` and the keys the chart set; every other option is still readable by name
