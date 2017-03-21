# Interactions

The hover configuration is passed into the `options.hover` namespace. The global hover configuration is at `Chart.defaults.global.hover`. To configure which events trigger chart interactions, see [events](./events.md#events). 

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `mode` | `String` | `'nearest'` | Sets which elements appear in the tooltip. See [Interaction Modes](./modes.md#interaction-modes) for details.
| `intersect` | `Boolean` | `true` | if true, the hover mode only applies when the mouse position intersects an item on the chart.
| `animationDuration` | `Number` | `400` | Duration in milliseconds it takes to animate hover style changes.