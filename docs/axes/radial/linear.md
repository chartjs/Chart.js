# Linear Radial Axis

The linear radial scale is used to chart numerical data. As the name suggests, linear interpolation is used to determine where a value lies in relation to the center of the axis.

The following additional configuration options are provided by the radial linear scale.

## Configuration Options

### Linear Radial Axis specific options

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `animate` | `boolean` | `true` | Whether to animate scaling the chart from the centre
| `angleLines` | `object` | | Angle line configuration. [more...](#angle-line-options)
| `beginAtZero` | `boolean` | `false` | If true, scale will include 0 if it is not already included.
| `pointLabels` | `object` | | Point label configuration. [more...](#point-label-options)
| `startAngle` | `number` | `0` | Starting angle of the scale. In degrees, 0 is at top.

### Common options to all axes

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `type` | `string` | | Type of scale being employed. Custom scales can be created and registered with a string key. This allows changing the type of an axis for a chart.
| `alignToPixels` | `boolean` | `false` | Align pixel values to device pixels.
| `backgroundColor` | [`Color`](/general/colors.md) | | Background color of the scale area.
| `display` | `boolean`\|`string` | `true` | Controls the axis global visibility (visible when `true`, hidden when `false`). When `display: 'auto'`, the axis is visible only if at least one associated dataset is visible.
| `grid` | `object` | | Grid line configuration. [more...](#grid-line-configuration)
| `min` | `number` | | User defined minimum number for the scale, overrides minimum value from data. [more...](/axes/index.md#axis-range-settings)
| `max` | `number` | | User defined maximum number for the scale, overrides maximum value from data. [more...](/axes/index.md#axis-range-settings)
| `reverse` | `boolean` | `false` | Reverse the scale.
| `stacked` | `boolean`\|`string` | `false` | Should the data be stacked. [more...](/axes/index.md#stacking)
| `suggestedMax` | `number` | | Adjustment used when calculating the maximum data value. [more...](/axes/index.md#axis-range-settings)
| `suggestedMin` | `number` | | Adjustment used when calculating the minimum data value. [more...](/axes/index.md#axis-range-settings)
| `ticks` | `object` | | Tick configuration. [more...](/axes/index.md#tick-configuration)
| `weight` | `number` | `0` | The weight used to sort the axis. Higher weights are further away from the chart area.

## Tick Configuration

### Linear Radial Axis specific tick options

Namespace: `options.scales[scaleId].ticks`

| Name | Type | Scriptable | Default | Description
| ---- | ---- | ------- | ------- | -----------
| `count` | `number` | Yes | `undefined` | The number of ticks to generate. If specified, this overrides the automatic generation.
| `format` | `object` | Yes | | The [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used by the default label formatter
| `maxTicksLimit` | `number` | Yes | `11` | Maximum number of ticks and gridlines to show.
| `precision` | `number` | Yes | | If defined and `stepSize` is not specified, the step size will be rounded to this many decimal places.
| `stepSize` | `number` | Yes | | User defined fixed step size for the scale. [more...](#step-size)

!!!include(axes/_common_ticks.md)!!!

The scriptable context is described in [Options](../../general/options.md#tick) section.

## Grid Line Configuration

Namespace: `options.scales[scaleId].grid`, it defines options for the grid lines of the axis.

| Name | Type | Scriptable | Indexable | Default | Description
| ---- | ---- | :-------------------------------: | :-----------------------------: | ------- | -----------
| `borderDash` | `number[]` | | | `[]` | Length and spacing of dashes on grid lines. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | `number` | Yes | | `0.0` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).
| `circular` | `boolean` | | | `false` | If true, gridlines are circular (on radar and polar area charts only).
| `color` | [`Color`](../general/colors.md)  | Yes | Yes | `Chart.defaults.borderColor` | The color of the grid lines. If specified as an array, the first color applies to the first grid line, the second to the second grid line, and so on.
| `display` | `boolean` | | | `true` | If false, do not display grid lines for this axis.
| `lineWidth` | `number` | Yes | Yes | `1` | Stroke width of grid lines.

The scriptable context is described in [Options](../general/options.md#tick) section.

## Axis Range Settings

Given the number of axis range settings, it is important to understand how they all interact with each other.

The `suggestedMax` and `suggestedMin` settings only change the data values that are used to scale the axis. These are useful for extending the range of the axis while maintaining the auto fit behaviour.

```javascript
let minDataValue = Math.min(mostNegativeValue, options.ticks.suggestedMin);
let maxDataValue = Math.max(mostPositiveValue, options.ticks.suggestedMax);
```

In this example, the largest positive value is 50, but the data maximum is expanded out to 100. However, because the lowest data value is below the `suggestedMin` setting, it is ignored.

```javascript
let chart = new Chart(ctx, {
    type: 'radar',
    data: {
        datasets: [{
            label: 'First dataset',
            data: [0, 20, 40, 50]
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: {
        scales: {
            r: {
                suggestedMin: 50,
                suggestedMax: 100
            }
        }
    }
});
```

In contrast to the `suggested*` settings, the `min` and `max` settings set explicit ends to the axes. When these are set, some data points may not be visible.

## Step Size

If set, the scale ticks will be enumerated by multiple of `stepSize`, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.

This example sets up a chart with a y axis that creates ticks at `0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5`.

```javascript
let options = {
    scales: {
        r: {
            max: 5,
            min: 0,
            ticks: {
                stepSize: 0.5
            }
        }
    }
};
```

## Angle Line Options

The following options are used to configure angled lines that radiate from the center of the chart to the point labels.
Namespace: `options.scales[scaleId].angleLines`

| Name | Type | Scriptable | Default | Description
| ---- | ---- | ------- | ------- | -----------
| `display` | `boolean` | | `true` | If true, angle lines are shown.
| `color` | [`Color`](../../general/colors.md) | Yes | `Chart.defaults.borderColor` | Color of angled lines.
| `lineWidth` | `number` | Yes | `1` | Width of angled lines.
| `borderDash` | `number[]` | Yes<sup>1</sup> | `[]` | Length and spacing of dashes on angled lines. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | `number` | Yes | `0.0` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).

  1. the `borderDash` setting only accepts a static value or a function. Passing an array of arrays is not supported.

The scriptable context is described in [Options](../../general/options.md#pointLabel) section.

## Point Label Options

The following options are used to configure the point labels that are shown on the perimeter of the scale.
Namespace: `options.scales[scaleId].pointLabels`

| Name | Type | Scriptable | Default | Description
| ---- | ---- | ------- | ------- | -----------
| `backdropColor` | [`Color`](../../general/colors.md) | `true` | `undefined` | Background color of the point label.
| `backdropPadding` | [`Padding`](../../general/padding.md) | | `2` | Padding of label backdrop.
| `borderRadius` | `number`\|`object` | `true` | `0` | Border radius of the point label
| `display` | `boolean`\|`string` | | `true` | If true, point labels are shown.  When `display: 'auto'`, the label is hidden if it overlaps with another label.
| `callback` | `function` | | | Callback function to transform data labels to point labels. The default implementation simply returns the current string.
| `color` | [`Color`](../../general/colors.md) | Yes | `Chart.defaults.color` | Color of label.
| `font` | `Font` | Yes | `Chart.defaults.font` | See [Fonts](../../general/fonts.md)
| `padding` | `number` | Yes | 5 | Padding between chart and point labels.
| [`centerPointLabels`](../../samples/other-charts/polar-area-center-labels.md) | `boolean` | | `false` | If true, point labels are centered.

The scriptable context is described in [Options](../../general/options.md#pointLabel) section.

## Internal data format

Internally, the linear radial scale uses numeric data
