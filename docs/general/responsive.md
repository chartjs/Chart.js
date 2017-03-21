# Responsive Charts

Chart.js provides a few options for controlling resizing behaviour of charts.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `responsive` | `Boolean` | `true` | Resizes the chart canvas when its container does.
| `responsiveAnimationDuration` | `Number` | `0` | Duration in milliseconds it takes to animate to new size after a resize event.
| `maintainAspectRatio` | `Boolean` | `true` | Maintain the original canvas aspect ratio `(width / height)` when resizing.
| `onResize` | `Function` | `null` | Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.