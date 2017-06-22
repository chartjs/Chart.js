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

All point* properties can be specified as an array. If these are set to an array value, the first value applies to the first point, the second value to the second point, and so on.

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `String` | The label for the dataset which appears in the legend and tooltips.
| `xAxisID` | `String` | The ID of the x axis to plot this dataset on. If not specified, this defaults to the ID of the first found x axis
| `yAxisID` | `String` | The ID of the y axis to plot this dataset on. If not specified, this defaults to the ID of the first found y axis.
| `backgroundColor` | `Color/Color[]` | The fill color under the line. See [Colors](../general/colors.md#colors)
| `borderColor` | `Color/Color[]` | The color of the line. See [Colors](../general/colors.md#colors)
| `borderWidth` | `Number/Number[]` | The width of the line in pixels.
| `borderDash` | `Number[]` | Length and spacing of dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
| `borderDashOffset` | `Number` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
| `borderCapStyle` | `String` | Cap style of the line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap)
| `borderJoinStyle` | `String` | Line joint style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
| `cubicInterpolationMode` | `String` | Algorithm used to interpolate a smooth curve from the discrete data points. [more...](#cubicInterpolationMode)
| `fill` | `Boolean/String` | How to fill the area under the line. See [area charts](area.md)
| `lineTension` | `Number` | Bezier curve tension of the line. Set to 0 to draw straightlines. This option is ignored if monotone cubic interpolation is used.
| `pointBackgroundColor` | `Color/Color[]` | The fill color for points.
| `pointBorderColor` | `Color/Color[]` | The border color for points.
| `pointBorderWidth` | `Number/Number[]` | The width of the point border in pixels.
| `pointRadius` | `Number/Number[]` | The radius of the point shape. If set to 0, the point is not rendered.
| `pointStyle` | `String/String[]/Image/Image[]` | Style of the point. [more...](#pointStyle)
| `pointHitRadius` | `Number/Number[]` | The pixel size of the non-displayed point that reacts to mouse events.
| `pointHoverBackgroundColor` | `Color/Color[]` | Point background color when hovered.
| `pointHoverBorderColor` | `Color/Color[]` | Point border color when hovered.
| `pointHoverBorderWidth` | `Number/Number[]` | Border width of point when hovered.
| `pointHoverRadius` | `Number/Number[]` | The radius of the point when hovered.
| `showLine` | `Boolean` | If false, the line is not drawn for this dataset.
| `spanGaps` | `Boolean` | If true, lines will be drawn between points with no or null data. If false, points with `NaN` data will create a break in the line
| `steppedLine` | `Boolean/String` | If the line is shown as a stepped line. [more...](#stepped-line)

### cubicInterpolationMode
The following interpolation modes are supported:
* 'default'
* 'monotone'. 

The 'default' algorithm uses a custom weighted cubic interpolation, which produces pleasant curves for all types of datasets.

The 'monotone' algorithm is more suited to `y = f(x)` datasets : it preserves monotonicity (or piecewise monotonicity) of the dataset being interpolated, and ensures local extremums (if any) stay at input data points.

If left untouched (`undefined`), the global `options.elements.line.cubicInterpolationMode` property is used.

### pointStyle
The style of point. Options are:
* 'circle'
* 'cross'
* 'crossRot'
* 'dash'. 
* 'line'
* 'rect'
* 'rectRounded'
* 'rectRot'
* 'star'
* 'triangle'

If the option is an image, that image is drawn on the canvas using [drawImage](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/drawImage).

### Stepped Line
The following values are supported for `steppedLine`:
* `false`:  No Step Interpolation (default)
* `true`: Step-before Interpolation (eq. 'before')
* `'before'`: Step-before Interpolation
* `'after'`: Step-after Interpolation

If the `steppedLine` value is set to anything other than false, `lineTension` will be ignored.

## Configuration Options

The line chart defines the following configuration options. These options are merged with the global chart configuration options, `Chart.defaults.global`, to form the options passed to the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `showLines` | `Boolean` | `true` | If false, the lines between points are not drawn.
| `spanGaps` | `Boolean` | `false` | If false, NaN data causes a break in the line.

## Default Options

It is common to want to apply a configuration setting to all created line charts. The global line chart settings are stored in `Chart.defaults.line`. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all line charts with `spanGaps = true` you would do:
```javascript
Chart.defaults.line.spanGaps = true;
```

## Data Structure

The `data` property of a dataset for a line chart can be passed in two formats. 

### Number[]
```javascript
data: [20, 10]
```

When the `data` array is an array of numbers, the x axis is generally a [category](../axes/cartesian/category.md#Category Axis). The points are placed onto the axis using their position in the array. When a line chart is created with a category axis, the `labels` property of the data object must be specified.

### Point[]

```javascript
data: [{
        x: 10,
        y: 20
    }, {
        x: 15,
        y: 10
    }]
```

This alternate is used for sparse datasets, such as those in [scatter charts](./scatter.md#scatter-chart). Each data point is specified using an object containing `x` and `y` properties.

# Stacked Area Chart

Line charts can be configured into stacked area charts by changing the settings on the y axis to enable stacking. Stacked area charts can be used to show how one data trend is made up of a number of smaller pieces.

```javascript
var stackedLine = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                stacked: true
            }]
        }
    }
});
```

# High Performance Line Charts

When charting a lot of data, the chart render time may start to get quite large. In that case, the following strategies can be used to improve performance.

## Data Decimation

Decimating your data will achieve the best results. When there is a lot of data to display on the graph, it doesn't make sense to show tens of thousands of data points on a graph that is only a few hundred pixels wide.

There are many approaches to data decimation and selection of an algorithm will depend on your data and the results you want to achieve. For instance, [min/max](http://digital.ni.com/public.nsf/allkb/F694FFEEA0ACF282862576020075F784) decimation will preserve peaks in your data but could require up to 4 points for each pixel. This type of decimation would work well for a very noisy signal where you need to see data peaks.

## Disable Bezier Curves

If you are drawing lines on your chart, disabling bezier curves will improve render times since drawing a straight line is more performant than a bezier curve.

To disable bezier curves for an entire chart:

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        elements: {
            line: {
                tension: 0, // disables bezier curves
            }
        }
    }
});
```

## Disable Line Drawing

If you have a lot of data points, it can be more performant to disable rendering of the line for a dataset and only draw points. Doing this means that there is less to draw on the canvas which will improve render performance.

To disable lines:

```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            showLine: false, // disable for a single dataset
        }]
    },
    options: {
        showLines: false, // disable for all datasets
    }
});
```

## Disable Animations

If your charts have long render times, it is a good idea to disable animations. Doing so will mean that the chart needs to only be rendered once during an update instead of multiple times. This will have the effect of reducing CPU usage and improving general page performance.

To disable animations

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: {
            duration: 0, // general animation time
        },
        hover: {
            animationDuration: 0, // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0, // animation duration after a resize
    }
});
```
