# Interactions

The hover configuration is passed into the `options.hover` namespace. The global hover configuration is at `Chart.defaults.global.hover`. To configure which events trigger chart interactions, see [events](./events.md#events).

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `mode` | `string` | `'nearest'` | Sets which elements appear in the tooltip. See [Interaction Modes](./modes.md#interaction-modes) for details.
| `intersect` | `boolean` | `true` | if true, the hover mode only applies when the mouse position intersects an item on the chart.
| `axis` | `string` | `'x'` | Can be set to `'x'`, `'y'`, or `'xy'` to define which directions are used in calculating distances. Defaults to `'x'` for `'index'` mode and `'xy'` in `dataset` and `'nearest'` modes.
| `animationDuration` | `number` | `400` | Duration in milliseconds it takes to animate hover style changes.
