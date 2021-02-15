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

The point element configuration is passed into the `options.elements.point` namespace. Global point options: `Chart.defaults.elements.point`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `elements.point.radius` | `number` | `3` | Point radius.
| [`elements.point.pointStyle`](#point-styles) | `string`\|`Image` | `'circle'` | Point style.
| `elements.point.rotation` | `number` | `0` | Point rotation (in degrees).
| `elements.point.backgroundColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Point fill color.
| `elements.point.borderWidth` | `number` | `1` | Point stroke width.
| `elements.point.borderColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Point stroke color.
| `elements.point.hitRadius` | `number` | `1` | Extra radius added to point radius for hit detection.
| `elements.point.hoverRadius` | `number` | `4` | Point radius when hovered.
| `elements.point.hoverBorderWidth` | `number` | `1` | Stroke width when hovered.

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

The line element configuration is passed into the `options.elements.line` namespace. Global line options: `Chart.defaults.elements.line`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `elements.line.tension` | `number` | `0` | Bézier curve tension (`0` for no Bézier curves).
| `elements.line.backgroundColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Line fill color.
| `elements.line.borderWidth` | `number` | `3` | Line stroke width.
| `elements.line.borderColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Line stroke color.
| `elements.line.borderCapStyle` | `string` | `'butt'` | Line cap style. See [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `elements.line.borderDash` | `number[]` | `[]` | Line dash. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `elements.line.borderDashOffset` | `number` | `0.0` | Line dash offset. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `elements.line.borderJoinStyle` | `string` | `'miter'` | Line join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `elements.line.capBezierPoints` | `boolean` | `true` | `true` to keep Bézier control inside the chart, `false` for no restriction.
| `elements.line.cubicInterpolationMode` | `string` | `'default'` |  Interpolation mode to apply. [See more...](./charts/line.mdx/#cubicinterpolationmode)
| `elements.line.fill` | `boolean`\|`string` | `false` | How to fill the area under the line. See [area charts](../charts/area.md#filling-modes).
| `elements.line.stepped` | `boolean` | `false` | `true` to show the line as a stepped line (`tension` will be ignored).

## Bar Configuration

Bar elements are used to represent the bars in a bar chart.

The bar element configuration is passed into the `options.elements.bar` namespace. Global bar options: `Chart.defaults.elements.bar`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `options.elements.bar.backgroundColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Bar fill color.
| `options.elements.bar.borderWidth` | `number` | `0` | Bar stroke width.
| `options.elements.bar.borderColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Bar stroke color.
| `options.elements.bar.borderSkipped` | `string` | `'start'` | Skipped (excluded) border: `'start'`, `'end'`, `'bottom'`, `'left'`, `'top'` or `'right'`.
| `options.elements.bar.borderRadius` | `number`\|`object` | `0` | The bar border radius (in pixels).
| [`options.elements.bar.pointStyle`](#point-styles) | `string`\|`Image` | `'circle'` | Style of the point for legend.

## Arc Configuration

Arcs are used in the polar area, doughnut and pie charts.

The arc element configuration is passed into the `options.elements.arc` namespace. Global arc options: `Chart.defaults.elements.arc`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `elements.arc.angle` - for polar only | `number` | `circumference / (arc count)` | Arc angle to cover.
| `elements.arc.backgroundColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.1)'` | Arc fill color.
| `elements.arc.borderAlign` | `string` | `'center'` | Arc stroke alignment.
| `elements.arc.borderColor` | [`Color`](../general/colors.md) | `'#fff'` | Arc stroke color.
| `elements.arc.borderWidth`| `number` | `2` | Arc stroke width.
