# Radar
A radar chart is a way of showing multiple data points and the variation between them.

They are often useful for comparing the points of two or more different data sets.

{% chartjs %}
{
    "type": "radar",
    "data": {
        "labels": [
            "Eating",
            "Drinking",
            "Sleeping",
            "Designing",
            "Coding",
            "Cycling",
            "Running"
        ],
        "datasets": [{
            "label": "My First Dataset",
            "data": [65, 59, 90, 81, 56, 55, 40],
            "fill": true,
            "backgroundColor": "rgba(255, 99, 132, 0.2)",
            "borderColor": "rgb(255, 99, 132)",
            "pointBackgroundColor": "rgb(255, 99, 132)",
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": "rgb(255, 99, 132)",
            "fill": true
        }, {
            "label": "My Second Dataset",
            "data": [28, 48, 40, 19, 96, 27, 100],
            "fill": true,
            "backgroundColor": "rgba(54, 162, 235, 0.2)",
            "borderColor": "rgb(54, 162, 235)",
            "pointBackgroundColor": "rgb(54, 162, 235)",
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": "rgb(54, 162, 235)",
            "fill": true
        }]
    },
    "options": {
        "elements": {
            "line": {
                "tension": 0,
                "borderWidth": 3
            }
        }
    }
}
{% endchartjs %}

## Example Usage

```javascript
var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
});
```

## Dataset Properties

The radar chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a line is generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `'rgba(0, 0, 0, 0.1)'`
| [`borderCapStyle`](#line-styling) | `string` | Yes | - | `'butt'`
| [`borderColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `'rgba(0, 0, 0, 0.1)'`
| [`borderDash`](#line-styling) | `number[]` | Yes | - | `[]`
| [`borderDashOffset`](#line-styling) | `number` | Yes | - | `0.0`
| [`borderJoinStyle`](#line-styling) | `string` | Yes | - | `'miter'`
| [`borderWidth`](#line-styling) | `number` | Yes | - | `3`
| [`hoverBackgroundColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `undefined`
| [`hoverBorderCapStyle`](#line-styling) | `string` | Yes | - | `undefined`
| [`hoverBorderColor`](#line-styling) | [`Color`](../general/colors.md) | Yes | - | `undefined`
| [`hoverBorderDash`](#line-styling) | `number[]` | Yes | - | `undefined`
| [`hoverBorderDashOffset`](#line-styling) | `number` | Yes | - | `undefined`
| [`hoverBorderJoinStyle`](#line-styling) | `string` | Yes | - | `undefined`
| [`hoverBorderWidth`](#line-styling) | `number` | Yes | - | `undefined`
| [`clip`](#general) | <code>number&#124;object</code> | - | - | `undefined`
| [`fill`](#line-styling) | <code>boolean&#124;string</code> | Yes | - | `true`
| [`label`](#general) | `string` | - | - | `''`
| [`order`](#general) | `number` | - | - | `0`
| [`lineTension`](#line-styling) | `number` | - | - | `0`
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
| [`spanGaps`](#line-styling) | `boolean` | - | - | `undefined`

### General

| Name | Description
| ---- | ----
| `clip` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. `0` = clip at chartArea. Clipping can also be configured per side: `clip: {left: 5, top: false, right: -2, bottom: 0}`
| `label` | The label for the dataset which appears in the legend and tooltips.
| `order` | The drawing order of dataset.

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
| `pointStyle` | Style of the point. [more...](../configuration/elements#point-styles)

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
| `lineTension` | Bezier curve tension of the line. Set to 0 to draw straightlines.
| `spanGaps` | If true, lines will be drawn between points with no or null data. If false, points with `NaN` data will create a break in the line.

If the value is `undefined`, `spanGaps` fallback to the associated [chart configuration options](#configuration-options). The rest of the values fallback to the associated [`elements.line.*`](../configuration/elements.md#line-configuration) options.

### Interactions

The interaction with each point can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `pointHoverBackgroundColor` | Point background color when hovered.
| `pointHoverBorderColor` | Point border color when hovered.
| `pointHoverBorderWidth` | Border width of point when hovered.
| `pointHoverRadius` | The radius of the point when hovered.

## Configuration Options

The radar chart defines the following configuration options. These options are merged with the global chart configuration options, `Chart.defaults.global`, to form the options passed to the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `spanGaps` | `boolean` | `false` | If false, NaN data causes a break in the line.

## Scale Options

The radar chart supports only a single scale. The options for this scale are defined in the `scale` property.
The options for this scale are defined in the `scale` property, which can be referenced from the [Linear Radial Axis page](../axes/radial/linear).

```javascript
options = {
    scale: {
        angleLines: {
            display: false
        },
        suggestedMin: 50,
        suggestedMax: 100
    }
};
```

## Default Options

It is common to want to apply a configuration setting to all created radar charts. The global radar chart settings are stored in `Chart.defaults.radar`. Changing the global options only affects charts created after the change. Existing charts are not changed.

## Data Structure

The `data` property of a dataset for a radar chart is specified as an array of numbers. Each point in the data array corresponds to the label at the same index.

```javascript
data: [20, 10]
```

For a radar chart, to provide context of what each point means, we include an array of strings that show around each point in the chart.

```javascript
data: {
    labels: ['Running', 'Swimming', 'Eating', 'Cycling'],
    datasets: [{
        data: [20, 10, 4, 2]
    }]
}
```

## Internal data format

`{x, y}`
