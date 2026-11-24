## Purpose

What the TypeScript types infer from the legend's options.

## ADDED Requirements

### Requirement: Legend callbacks do not decide the chart type

The type of a chart SHALL be inferred from its `type`, not from the types of the legend's `onClick`, `onHover` and `onLeave` parameters.

#### Scenario: onClick with a general legend parameter

- **WHEN** a line chart is created with a legend `onClick(e, item, legend: LegendElement<ChartType>)`
- **THEN** `chart.options.scales?.x?.title` compiles

#### Scenario: Calling the pie default handler

- **WHEN** a custom legend `onClick` of a pie chart calls the pie chart's default `onClick` with its event, item and legend
- **THEN** it compiles
