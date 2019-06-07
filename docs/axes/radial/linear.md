# Linear Radial Axis

The linear scale is used to chart numerical data. As the name suggests, linear interpolation is used to determine where a value lies in relation the center of the axis.

The following additional configuration options are provided by the radial linear scale.

## Configuration Options

The axis has configuration properties for ticks, angle lines (line that appear in a radar chart outward from the center), pointLabels (labels around the edge in a radar chart). The following sections define each of the properties in those sections.

| Name | Type | Description
| ---- | ---- | -----------
| `angleLines` | `object` | Angle line configuration. [more...](#angle-line-options)
| `gridLines` | `object` | Grid line configuration. [more...](../styling.md#grid-line-configuration)
| `pointLabels` | `object` | Point label configuration. [more...](#point-label-options)
| `ticks` | `object` | Tick configuration. [more...](#tick-options)

## Tick Options
The following options are provided by the linear scale. They are all located in the `ticks` sub options. The [common tick configuration](../styling.md#tick-configuration) options are supported by this axis.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `backdropColor` | `Color` | `'rgba(255, 255, 255, 0.75)'` | Color of label backdrops.
| `backdropPaddingX` | `number` | `2` | Horizontal padding of label backdrop.
| `backdropPaddingY` | `number` | `2` | Vertical padding of label backdrop.
| `beginAtZero` | `boolean` | `false` | if true, scale will include 0 if it is not already included.
| `min` | `number` | | User defined minimum number for the scale, overrides minimum value from data. [more...](#axis-range-settings)
| `max` | `number` | | User defined maximum number for the scale, overrides maximum value from data. [more...](#axis-range-settings)
| `maxTicksLimit` | `number` | `11` | Maximum number of ticks and gridlines to show.
| `precision` | `number` | | if defined and `stepSize` is not specified, the step size will be rounded to this many decimal places.
| `stepSize` | `number` | | User defined fixed step size for the scale. [more...](#step-size)
| `suggestedMax` | `number` | | Adjustment used when calculating the maximum data value. [more...](#axis-range-settings)
| `suggestedMin` | `number` | | Adjustment used when calculating the minimum data value. [more...](#axis-range-settings)
| `showLabelBackdrop` | `boolean` | `true` | If true, draw a background behind the tick labels.

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
        scale: {
            ticks: {
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
    scale: {
        ticks: {
            max: 5,
            min: 0,
            stepSize: 0.5
        }
    }
};
```

## Angle Line Options

The following options are used to configure angled lines that radiate from the center of the chart to the point labels. They can be found in the `angleLines` sub options.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `true` | if true, angle lines are shown.
| `color` | `Color` | `'rgba(0, 0, 0, 0.1)'` | Color of angled lines.
| `lineWidth` | `number` | `1` | Width of angled lines.
| `borderDash` | `number[]` | `[]` | Length and spacing of dashes on angled lines. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash).
| `borderDashOffset` | `number` | `0.0` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset).

## Point Label Options

The following options are used to configure the point labels that are shown on the perimeter of the scale. They can be found in the `pointLabels` sub options.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `true` | if true, point labels are shown.
| `callback` | `function` | | Callback function to transform data labels to point labels. The default implementation simply returns the current string.
| `fontColor` | <code>Color&#124;Color[]</code> | `'#666'` | Font color for point labels.
| `fontFamily` | `string` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Font family to use when rendering labels.
| `fontSize` | `number` | `10` | font size in pixels.
| `fontStyle` | `string` | `'normal'` | Font style to use when rendering point labels.
| `lineHeight` | <code>number&#124;string</code> | `1.2` | Height of an individual line of text (see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)).
