# Linear Cartesian Axis

The linear scale is use to chart numerical data. It can be placed on either the x or y axis. The scatter chart type automatically configures a line chart to use one of these scales for the x axis. As the name suggests, linear interpolation is used to determine where a value lies on the axis.

## Configuration Options

| Name | Type | Description
| ---- | ---- | -----------
| `beginAtZero` | `boolean` | if true, scale will include 0 if it is not already included.
| `suggestedMax` | `number` | Adjustment used when calculating the maximum data value. [more...](#axis-range-settings)
| `suggestedMin` | `number` | Adjustment used when calculating the minimum data value. [more...](#axis-range-settings)

## Tick Configuration Options

The following options are provided by the linear scale. They are all located in the `ticks` sub options. These options extend the [common tick configuration](README.md#tick-configuration).

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `maxTicksLimit` | `number` | `11` | Maximum number of ticks and gridlines to show.
| `precision` | `number` | | if defined and `stepSize` is not specified, the step size will be rounded to this many decimal places.
| `stepSize` | `number` | | User defined fixed step size for the scale. [more...](#step-size)

## Axis Range Settings

Given the number of axis range settings, it is important to understand how they all interact with each other.

The `suggestedMax` and `suggestedMin` settings only change the data values that are used to scale the axis. These are useful for extending the range of the axis while maintaining the auto fit behaviour.

```javascript
let minDataValue = Math.min(mostNegativeValue, options.suggestedMin);
let maxDataValue = Math.max(mostPositiveValue, options.suggestedMax);
```

In this example, the largest positive value is 50, but the data maximum is expanded out to 100. However, because the lowest data value is below the `suggestedMin` setting, it is ignored.

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: 'First dataset',
            data: [0, 20, 40, 50]
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: {
        scales: {
            y: {
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
        y: {
            max: 5,
            min: 0,
            ticks: {
                stepSize: 0.5
            }
        }
    }
};
```

## Internal data format

Internally, linear scale uses numeric data
