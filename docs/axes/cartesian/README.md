# Cartesian Axes

Axes that follow a cartesian grid are known as 'Cartesian Axes'. Cartesian axes are used for line, bar, and bubble charts. Four cartesian axes are included in Chart.js by default.

* [linear](./linear.md#linear-cartesian-axis)
* [logarithmic](./logarithmic.md#logarithmic-cartesian-axis)
* [category](./category.md#category-cartesian-axis)
* [time](./time.md#time-cartesian-axis)

# Common Configuration

All of the included cartesian axes support a number of common options.

## type
**Type:** String
**Default:** Chart specific
Type of scale being employed. Custom scales can be created and registered with a string key. This allows changing the type of an axis for a chart.

## position
**Type:** String
Position of the axis in the chart. Possible values are:
* 'top'
* 'left'
* 'bottom'
* 'right'.

## id
**Type:** String
The ID is used to link datasets and scale axes together. The properties `dataset.xAxisID` or `dataset.yAxisID` have to match the scale properties `scales.xAxes.id` or `scales.yAxes.id`. This is especially needed if multi-axes charts are used.

```javascript
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            // This dataset appears on the first axis
            yAxisID: 'first-y-axis'
        }, {
            // This dataset appears on the second axis
            yAxisID: 'second-y-axis'
        }]
    },
    options: {
        scales: {
            yAxes: [{
                id: 'first-y-axis',
                type: 'linear'
            }, {
                id: 'second-y-axis',
                type: 'linear'
            }]
        }
    }
});
```

## Tick Configuration
The following options are common to all cartesian axes but do not apply to other axes.

### autoSkip
**Type:** Boolean
**Default:** `true`
If true, automatically calculates how many labels that can be shown and hides labels accordingly. Turn it off to show all labels no matter what

### autoSkipPadding
**Type:** Number
**Default:** `0`
Padding between the ticks on the horizontal axis when `autoSkip` is enabled. *Note: Only applicable to horizontal scales.*

### labelOffset
**Type:** Number
**Default:** `0`
Distance in pixels to offset the label from the centre point of the tick (in the y direction for the x axis, and the x direction for the y axis). *Note: this can cause labels at the edges to be cropped by the edge of the canvas*

### maxRotation
**Type:** Number
**Default:** `90`
Maximum rotation for tick labels when rotating to condense labels. Note: Rotation doesn't occur until necessary. *Note: Only applicable to horizontal scales.*

### minRotation
**Type:** Number
**Default:** `0`
Minimum rotation for tick labels. *Note: Only applicable to horizontal scales.*

### mirror
**Type:** Boolean
**Default:** `false`
Flips tick labels around axis, displaying the labels inside the chart instead of outside. *Note: Only applicable to vertical scales.*

### padding
**Type:** Number
**Default:** `10`
Padding between the tick label and the axis. *Note: Only applicable to horizontal scales.*

# Creating Multiple Axes

With cartesian axes, it is possible to create multiple X and Y axes. To do so, you can add multiple configuration objects to the `xAxes` and `yAxes` properties. When adding new axes, it is important to ensure that you specify the type of the new axes as default types are **not** used in this case.

In the example below, we are creating two Y axes. We then use the `yAxisID` property to map the datasets to their correct axes.

```javascript
var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [20, 50, 100, 75, 25, 0],
            label: 'Left dataset'

            // This binds the dataset to the left y axis
            yAxisID: 'left-y-axis'
        }, {
            data: [0.1, 0.5, 1.0, 2.0, 1.5, 0]
            label: 'Right dataset'

            // This binds the dataset to the right y axis
            yAxisID: 'right-y-axis',
        }],
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    },
    options: {
        scales: {
            yAxes: [{
                id: 'left-y-axis',
                type: 'linear',
                position: 'left'
            }, {
                id: 'right-y-axis',
                type: 'linear',
                position: 'right'
            }]
        }
    }
});
```