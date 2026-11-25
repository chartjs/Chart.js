## Purpose

Which font each text of a chart uses.

## ADDED Requirements

### Requirement: options.font is the chart's base font

Each property of a text's font (family, size, style, weight, line height) SHALL come from the first of: that text's own font option; that text's built-in default; the chart's `options.font`; the chart type's default font; `Chart.defaults.font`.

#### Scenario: Size set on the chart

- **WHEN** `options.font.size` is 30 and no other font option is set
- **THEN** tick labels, scale titles, legend labels, the legend title, the chart title, the subtitle and the tooltip's title, body and footer are measured and drawn at 30 px, and radial point labels stay 10 px in the chart's font family

#### Scenario: A text's own font wins

- **WHEN** `options.font.size` is 30 and `plugins.legend.labels.font.size` is 14
- **THEN** legend labels are 14 px and every other text is 30 px

#### Scenario: Tooltip

- **WHEN** `options.font.family` is set and the tooltip is shown
- **THEN** its title is bold in that family, `tooltip.options.bodyFont` read by a callback has that family, and the colour boxes are as wide as the body font size

#### Scenario: Two charts

- **WHEN** two charts on a page set different `options.font`
- **THEN** each uses its own

#### Scenario: No chart font

- **WHEN** a chart sets no `options.font`
- **THEN** it is drawn as before this change

#### Scenario: Global font changed

- **WHEN** `Chart.defaults.font` is changed
- **THEN** every text of a chart follows at that chart's next update, and until then is drawn with the font it was laid out with
