# Linear Radial Axis

The linear scale is use to chart numerical data. As the name suggests, linear interpolation is used to determine where a value lies in relation the center of the axis.

The following additional configuration options are provided by the radial linear scale.

## Configuration Options

The axis has configuration properties for ticks, angle lines (line that appear in a radar chart outward from the center), pointLabels (labels around the edge in a radar chart). The following sections define each of the properties in those sections.

| Name | Type | Description
| ---- | ---- | -----------
| `angleLines` | `Object` | Angle line configuration. [more...](#angle-line-options)
| `gridLines` | `Object` | Grid line configuration. [more...](../styling.md#grid-line-configuration)
| `pointLabels` | `Object` | Point label configuration. [more...](#point-label-options)
| `ticks` | `Object` | Tick configuration. [more...](#tick-options)

## Tick Options
The following options are provided by the linear scale. They are all located in the `ticks` sub options. The [common tick configuration](../styling.md#tick-configuration) options are supported by this axis.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `backdropColor` | `Color` | `'rgba(255, 255, 255, 0.75)'` | Color of label backdrops
| `backdropPaddingX` | `Number` | `2` | Horizontal padding of label backdrop.
| `backdropPaddingY` | `Number` | `2` | Vertical padding of label backdrop.
| `beginAtZero` | `Boolean` | `false` | if true, scale will include 0 if it is not already included.
| `min` | `Number` | | User defined minimum number for the scale, overrides minimum value from data. [more...](#axis-range-settings)
| `max` | `Number` | | User defined maximum number for the scale, overrides maximum value from data. [more...](#axis-range-settings)
| `maxTicksLimit` | `Number` | `11` | Maximum number of ticks and gridlines to show.
| `stepSize` | `Number` | | User defined fixed step size for the scale. [more...](#step-size)
| `suggestedMax` | `Number` | | Adjustment used when calculating the maximum data value. [more...](#axis-range-settings)
| `suggestedMin` | `Number` | | Adjustment used when calculating the minimum data value. [more...](#axis-range-settings)
| `showLabelBackdrop` | `Boolean` | `true` | If true, draw a background behind the tick labels

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
 If set, the scale ticks will be enumerated by multiple of stepSize, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.

This example sets up a chart with a y axis that creates ticks at `0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5`.

```javascript
let options = {
    scales: {
        yAxes: [{
            ticks: {
                max: 5,
                min: 0,
                stepSize: 0.5
            }
        }]
    }
};
```

## Angle Line Options

The following options are used to configure angled lines that radiate from the center of the chart to the point labels. They can be found in the `angleLines` sub options. Note that these options only apply if `angleLines.display` is true.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `display` | `Boolean` | `true` | if true, angle lines are shown
| `color` | `Color` | `rgba(0, 0, 0, 0.1)` | Color of angled lines
| `lineWidth` | `Number` | `1` | Width of angled lines

## Point Label Options

The following options are used to configure the point labels that are shown on the perimeter of the scale. They can be found in the `pointLabels` sub options. Note that these options only apply if `pointLabels.display` is true.

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `callback` | `Function` | | Callback function to transform data labels to point labels. The default implementation simply returns the current string.
| `fontColor` | `Color/Color[]` | `'#666'` | Font color for point labels.
| `fontFamily` | `String` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Font family to use when rendering labels.
| `fontSize` | `Number` | 10 | font size in pixels
| `fontStyle` | `String` | `'normal'` | Font style to use when rendering point labels.
