# Elements

While chart types provide settings to configure the styling of each dataset, you sometimes want to style **all datasets the same way**. A common example would be to stroke all of the bars in a bar chart with the same colour but change the fill per dataset. Options can be configured for four different types of elements: **[arc](#arc-configuration)**, **[lines](#line-configuration)**, **[points](#point-configuration)**, and **[rectangles](#rectangle-configuration)**. When set, these options apply to all objects of that type unless specifically overridden by the configuration attached to a dataset.

## Global Configuration

The element options can be specified per chart or globally. The global options for elements are defined in `Chart.defaults.global.elements`. For example, to set the border width of all bar charts globally you would do:

```javascript
Chart.defaults.global.elements.rectangle.borderWidth = 2;
```

## Point Configuration
Point elements are used to represent the points in a line, radar or bubble chart.

Global point options: `Chart.defaults.global.elements.point`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `radius` | `number` | `3` | Point radius.
| [`pointStyle`](#point-styles) | <code>string&#124;Image</code> | `'circle'` | Point style.
| `rotation` | `number` | `0` | Point rotation (in degrees).
| `backgroundColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Point fill color.
| `borderWidth` | `number` | `1` | Point stroke width.
| `borderColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Point stroke color.
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

Global line options: `Chart.defaults.global.elements.line`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `tension` | `number` | `0.4` | Bézier curve tension (`0` for no Bézier curves).
| `backgroundColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Line fill color.
| `borderWidth` | `number` | `3` | Line stroke width.
| `borderColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Line stroke color.
| `borderCapStyle` | `string` | `'butt'` | Line cap style. See [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `borderDash` | `number[]` | `[]` | Line dash. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | `number` | `0.0` | Line dash offset. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `borderJoinStyle` | `string` | `'miter'` | Line join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `capBezierPoints` | `boolean` | `true` | `true` to keep Bézier control inside the chart, `false` for no restriction.
| `fill` | <code>boolean&#124;string</code> | `true` | Fill location: `'zero'`, `'top'`, `'bottom'`, `true` (eq. `'zero'`) or `false` (no fill).
| `stepped` | `boolean` | `false` | `true` to show the line as a stepped line (`tension` will be ignored).

## Rectangle Configuration
Rectangle elements are used to represent the bars in a bar chart.

Global rectangle options: `Chart.defaults.global.elements.rectangle`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `backgroundColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Bar fill color.
| `borderWidth` | `number` | `0` | Bar stroke width.
| `borderColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Bar stroke color.
| `borderSkipped` | `string` | `'bottom'` | Skipped (excluded) border: `'bottom'`, `'left'`, `'top'` or `'right'`.

## Arc Configuration
Arcs are used in the polar area, doughnut and pie charts.

Global arc options: `Chart.defaults.global.elements.arc`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `backgroundColor` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Arc fill color.
| `borderAlign` | `string` | `'center'` | Arc stroke alignment.
| `borderColor` | `Color` | `'#fff'` | Arc stroke color.
| `borderWidth`| `number` | `2` | Arc stroke width.
