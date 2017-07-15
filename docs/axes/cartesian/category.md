# Category Cartesian Axis

The category scale will be familiar to those who have used v1.0. Labels are drawn from one of the label arrays included in the chart data. If only `data.labels` is defined, this will be used. If `data.xLabels` is defined and the axis is horizontal, this will be used. Similarly, if `data.yLabels` is defined and the axis is vertical, this property will be used. Using both `xLabels` and `yLabels` together can create a chart that uses strings for both the X and Y axes.

Specifying any of the settings above implicitly defines the x axis as `type: category`if not defined otherwise. For more fine-grained control of category labels, it is (as of 2.7) also possible to add `labels` as part of the explicit category axis definition.

## Category Axis Definition

Implicit:

```javascript
let chart = new Chart(ctx, {
    type: ...
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: ...
    },
});
```
Explicit:

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
