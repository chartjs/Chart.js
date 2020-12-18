---
title: Elements
---

While chart types provide settings to configure the styling of each dataset, you sometimes want to style **all datasets the same way**. A common example would be to stroke all of the bars in a bar chart with the same colour but change the fill per dataset. Options can be configured for four different types of elements: **[arc](#arc-configuration)**, **[lines](#line-configuration)**, **[points](#point-configuration)**, and **[bars](#bar-configuration)**. When set, these options apply to all objects of that type unless specifically overridden by the configuration attached to a dataset.

## Global Configuration

The element options can be specified per chart or globally. The global options for elements are defined in `Chart.defaults.elements`. For example, to set the border width of all bar charts globally you would do:

```javascript
Chart.defaults.elements.bar.borderWidth = 2;
```

## Point Configuration

Point elements are used to represent the points in a line, radar or bubble chart.

Global point options: `Chart.defaults.elements.point`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `radius` | `number` | `3` | Point radius.
| [`pointStyle`](#point-styles) | `string`\|`Image` | `'circle'` | Point style.
| `rotation` | `number` | `0` | Point rotation (in degrees).
| `backgroundColor` | [`Color`](../general/colors.md) | `Chart.defaults.backgroundColor` | Point fill color.
| `borderWidth` | `number` | `1` | Point stroke width.
| `borderColor` | [`Color`](../general/colors.md) | `Chart.defaults.borderColor` | Point stroke color.
| `hitRadius` | `number` | `1` | Extra radius added to point radius for hit detection.
| `hoverRadius` | `number` | `4` | Point radius when hovered.
| `hoverBorderWidth` | `number` | `1` | Stroke width when hovered.

### Point Styles

The following values are supported:

- `'circle'`
- `'cross'`
- `'crossRot'`
- `'dash'`
- `'line'`
- `'rect'`
- `'rectRounded'`
- `'rectRot'`
- `'star'`
- `'triangle'`

If the value is an image, that image is drawn on the canvas using [drawImage](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/drawImage).

## Line Configuration

Line elements are used to represent the line in a line chart.

Global line options: `Chart.defaults.elements.line`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `tension` | `number` | `0` | Bézier curve tension (`0` for no Bézier curves).
| `backgroundColor` | [`Color`](../general/colors.md) | `Chart.defaults.backgroundColor` | Line fill color.
| `borderWidth` | `number` | `3` | Line stroke width.
| `borderColor` | [`Color`](../general/colors.md) | `Chart.defaults.borderColor` | Line stroke color.
| `borderCapStyle` | `string` | `'butt'` | Line cap style. See [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `borderDash` | `number[]` | `[]` | Line dash. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | `number` | `0.0` | Line dash offset. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `borderJoinStyle` | `string` | `'miter'` | Line join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `capBezierPoints` | `boolean` | `true` | `true` to keep Bézier control inside the chart, `false` for no restriction.
| `cubicInterpolationMode` | `string` | `'default'` |  Interpolation mode to apply. [See more...](./charts/line.mdx/#cubicinterpolationmode)
| `fill` | `boolean`\|`string` | `false` | How to fill the area under the line. See [area charts](../charts/area.md#filling-modes).
| `stepped` | `boolean` | `false` | `true` to show the line as a stepped line (`tension` will be ignored).

## Bar Configuration

Bar elements are used to represent the bars in a bar chart.

Global bar options: `Chart.defaults.elements.bar`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `backgroundColor` | [`Color`](../general/colors.md) | `Chart.defaults.backgroundColor` | Bar fill color.
| `borderWidth` | `number` | `0` | Bar stroke width.
| `borderColor` | [`Color`](../general/colors.md) | `Chart.defaults.borderColor` | Bar stroke color.
| `borderSkipped` | `string` | `'start'` | Skipped (excluded) border: `'start'`, `'end'`, `'bottom'`, `'left'`, `'top'` or `'right'`.

## Arc Configuration

Arcs are used in the polar area, doughnut and pie charts.

Global arc options: `Chart.defaults.elements.arc`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `angle` - for polar only | `number` | `circumference / (arc count)` | Arc angle to cover.
| `backgroundColor` | [`Color`](../general/colors.md) | `Chart.defaults.backgroundColor` | Arc fill color.
| `borderAlign` | `string` | `'center'` | Arc stroke alignment.
| `borderColor` | [`Color`](../general/colors.md) | `'#fff'` | Arc stroke color.
| `borderWidth`| `number` | `2` | Arc stroke width.
