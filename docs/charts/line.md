# Line

A line chart is a way of plotting data points on a line. Often, it is used to show trend data, or the comparison of two data sets.

{% chartjs %}
{
    "type": "line",
    "data": {
        "labels": [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July"
        ],
        "datasets": [{
            "label": "My First Dataset",
            "data": [65, 59, 80, 81, 56, 55, 40],
            "fill": false,
            "borderColor": "rgb(75, 192, 192)",
            "lineTension": 0.1
        }]
    },
    "options": {

    }
}
{% endchartjs %}

## Example Usage

```javascript
var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});
```

## Dataset Properties

The line chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a line is generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `'rgba(0, 0, 0, 0.1)'`
| [`borderCapStyle`](#line-styling) | `string` | Yes | - | `'butt'`
| [`borderColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `'rgba(0, 0, 0, 0.1)'`
| [`borderDash`](#line-styling) | `number[]` | Yes | - | `[]`
| [`borderDashOffset`](#line-styling) | `number` | Yes | - | `0.0`
| [`borderJoinStyle`](#line-styling) | `string` | Yes | - | `'miter'`
| [`borderWidth`](#line-styling) | `number` | Yes | - | `3`
| [`clip`](#general) | <code>number&#124;object</code> | - | - | `undefined`
| [`cubicInterpolationMode`](#cubicinterpolationmode) | `string` | Yes | - | `'default'`
| [`fill`](#line-styling) | <code>boolean&#124;string</code> | Yes | - | `true`
| [`hoverBackgroundColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `undefined`
| [`hoverBorderCapStyle`](#line-styling) | `string` | Yes | - | `undefined`
| [`hoverBorderColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `undefined`
| [`hoverBorderDash`](#line-styling) | `number[]` | Yes | - | `undefined`
| [`hoverBorderDashOffset`](#line-styling) | `number` | Yes | - | `undefined`
| [`hoverBorderJoinStyle`](#line-styling) | `string` | Yes | - | `undefined`
| [`hoverBorderWidth`](#line-styling) | `number` | Yes | - | `undefined`
| [`label`](#general) | `string` | - | - | `''`
| [`lineTension`](#line-styling) | `number` | - | - | `0.4`
| [`order`](#general) | `number` | - | - | `0`
| [`pointBackgroundColor`](#point-styling) | `Color` | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`pointBorderColor`](#point-styling) | `Color` | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`pointBorderWidth`](#point-styling) | `number` | Yes | Yes | `1`
| [`pointHitRadius`](#point-styling) | `number` | Yes | Yes | `1`
| [`pointHoverBackgroundColor`](#interactions) | `Color` | Yes | Yes | `undefined`
| [`pointHoverBorderColor`](#interactions) | `Color` | Yes | Yes | `undefined`
| [`pointHoverBorderWidth`](#interactions) | `number` | Yes | Yes | `1`
| [`pointHoverRadius`](#interactions) | `number` | Yes | Yes | `4`
| [`pointRadius`](#point-styling) | `number` | Yes | Yes | `3`
| [`pointRotation`](#point-styling) | `number` | Yes | Yes | `0`
| [`pointStyle`](#point-styling) | <code>string&#124;Image</code> | Yes | Yes | `'circle'`
| [`showLine`](#line-styling) | `boolean` | - | - | `undefined`
| [`spanGaps`](#line-styling) | `boolean` | - | - | `undefined`
| [`steppedLine`](#stepped-line) | <code>boolean&#124;string</code> | - | - | `false`
| [`xAxisID`](#general) | `string` | - | - | first x axis
| [`yAxisID`](#general) | `string` | - | - | first y axis

### General

| Name | Description
| ---- | ----
| `clip` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. `0` = clip at chartArea. Clipping can also be configured per side: `clip: {left: 5, top: false, right: -2, bottom: 0}`
| `label` | The label for the dataset which appears in the legend and tooltips.
| `order` | The drawing order of dataset. Also affects order for stacking, tooltip, and legend.
| `xAxisID` | The ID of the x axis to plot this dataset on.
| `yAxisID` | The ID of the y axis to plot this dataset on.

### Point Styling

The style of each point can be controlled with the following properties:

| Name | Description
| ---- | ----
| `pointBackgroundColor` | The fill color for points.
| `pointBorderColor` | The border color for points.
| `pointBorderWidth` | The width of the point border in pixels.
| `pointHitRadius` | The pixel size of the non-displayed point that reacts to mouse events.
| `pointRadius` | The radius of the point shape. If set to 0, the point is not rendered.
| `pointRotation` | The rotation of the point in degrees.
| `pointStyle` | Style of the point. [more...](../configuration/elements.md#point-styles)

All these values, if `undefined`, fallback first to the dataset options then to the associated [`elements.point.*`](../configuration/elements.md#point-configuration) options.

### Line Styling

The style of the line can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | The line fill color.
| `borderCapStyle` | Cap style of the line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap).
| `borderColor` | The line color.
| `borderDash` | Length and spacing of dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `borderJoinStyle` | Line joint style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `borderWidth` | The line width (in pixels).
| `fill` | How to fill the area under the line. See [area charts](area.md).
| `lineTension` | Bezier curve tension of the line. Set to 0 to draw straightlines. This option is ignored if monotone cubic interpolation is used.
| `showLine` | If false, the line is not drawn for this dataset.
| `spanGaps` | If true, lines will be drawn between points with no or null data. If false, points with `NaN` data will create a break in the line.

If the value is `undefined`, `showLine` and `spanGaps` fallback to the associated [chart configuration options](#configuration-options). The rest of the values fallback to the associated [`elements.line.*`](../configuration/elements.md#line-configuration) options.

### Interactions

The interaction with each point can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `pointHoverBackgroundColor` | Point background color when hovered.
| `pointHoverBorderColor` | Point border color when hovered.
| `pointHoverBorderWidth` | Border width of point when hovered.
| `pointHoverRadius` | The radius of the point when hovered.

### cubicInterpolationMode

The following interpolation modes are supported.

* `'default'`
* `'monotone'`

The `'default'` algorithm uses a custom weighted cubic interpolation, which produces pleasant curves for all types of datasets.

The `'monotone'` algorithm is more suited to `y = f(x)` datasets : it preserves monotonicity (or piecewise monotonicity) of the dataset being interpolated, and ensures local extremums (if any) stay at input data points.

If left untouched (`undefined`), the global `options.elements.line.cubicInterpolationMode` property is used.

### Stepped Line

The following values are supported for `steppedLine`.

* `false`: No Step Interpolation (default)
* `true`: Step-before Interpolation (eq. `'before'`)
* `'before'`: Step-before Interpolation
* `'after'`: Step-after Interpolation
* `'middle'`: Step-middle Interpolation

If the `steppedLine` value is set to anything other than false, `lineTension` will be ignored.

## Configuration Options

The line chart defines the following configuration options. These options are merged with the global chart configuration options, `Chart.defaults.global`, to form the options passed to the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `showLines` | `boolean` | `true` | If false, the lines between points are not drawn.
| `spanGaps` | `boolean` | `false` | If false, NaN data causes a break in the line.

## Default Options

It is common to want to apply a configuration setting to all created line charts. The global line chart settings are stored in `Chart.defaults.line`. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all line charts with `spanGaps = true` you would do:

```javascript
Chart.defaults.line.spanGaps = true;
```

## Data Structure

See [`Data structures`](../general/data-structures.md)

## Stacked Area Chart

Line charts can be configured into stacked area charts by changing the settings on the y axis to enable stacking. Stacked area charts can be used to show how one data trend is made up of a number of smaller pieces.

```javascript
var stackedLine = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                stacked: true
            }
        }
    }
});
```

## Internal data format

`{x, y}`
