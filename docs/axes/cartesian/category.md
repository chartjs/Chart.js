# Category Cartesian Axis

If global configuration is used, labels are drawn from one of the label arrays included in the chart data. If only `data.labels` is defined, this will be used. If `data.xLabels` is defined and the axis is horizontal, this will be used. Similarly, if `data.yLabels` is defined and the axis is vertical, this property will be used. Using both `xLabels` and `yLabels` together can create a chart that uses strings for both the X and Y axes.

Specifying any of the settings above defines the x axis as `type: category` if not defined otherwise. For more fine-grained control of category labels it is also possible to add `labels` as part of the category axis definition. Doing so does not apply the global defaults.

## Category Axis Definition

Globally:

```javascript
let chart = new Chart(ctx, {
    type: ...
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: ...
    },
});
```
As part of axis definition:

```javascript
let chart = new Chart(ctx, {
    type: ...
    data: ...
    options: {
        scales: {
            xAxes: [{
                type: 'category',
                labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            }]
        }
    }
});
```

## Tick Configuration Options

The category scale provides the following options for configuring tick marks. They are nested in the `ticks` sub object. These options extend the [common tick configuration](README.md#tick-configuration).

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `labels` | `Array[String]` | - | An array of labels to display.
| `min` | `String` | | The minimum item to display. [more...](#min-max-configuration)
| `max` | `String` | | The maximum item to display. [more...](#min-max-configuration)

## Min Max Configuration
For both the `min` and `max` properties, the value must be in the `labels` array. In the example below, the x axis would only display "March" through "June".

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [10, 20, 30, 40, 50, 60]
        }],
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    min: 'March'
                }
            }]
        }
    }
});
```
