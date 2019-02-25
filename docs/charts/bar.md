# Bar
A bar chart provides a way of showing data values represented as vertical bars. It is sometimes used to show trend data, and the comparison of multiple data sets side by side.

{% chartjs %}
{
    "type": "bar",
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
            "backgroundColor": [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)"
            ],
            "borderColor": [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
            ],
            "borderWidth": 1
        }]
    },
    "options": {
        "scales": {
            "yAxes": [{
                "ticks": {
                    "beginAtZero": true
                }
            }]
        }
    }
}
{% endchartjs %}

## Example Usage
```javascript
var myBarChart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: options
});
```

## Dataset Properties

The bar chart allows a number of properties to be specified for each dataset.
These are used to set display properties for a specific dataset. For example,
the color of the bars is generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderSkipped`](#borderskipped) | `string` | Yes | Yes | `'bottom'`
| [`borderWidth`](#borderwidth) | <code>number&#124;object</code> | Yes | Yes | `0`
| [`data`](#data-structure) | `object[]` | - | - | **required**
| [`hoverBackgroundColor`](#interactions) | [`Color`](../general/colors.md) | - | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | - | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | - | Yes | `1`
| [`label`](#general) | `string` | - | - | `''`
| [`xAxisID`](#general) | `string` | - | - | first x axis
| [`yAxisID`](#general) | `string` | - | - | first y axis

### General

| Name | Description
| ---- | ----
| `label` | The label for the dataset which appears in the legend and tooltips.
| `xAxisID` | The ID of the x axis to plot this dataset on.
| `yAxisID` | The ID of the y axis to plot this dataset on.

### Styling

The style of each bar can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | The bar background color.
| `borderColor` | The bar border color.
| [`borderSkipped`](#borderskipped) | The edge to skip when drawing bar.
| [`borderWidth`](#borderwidth) | The bar border width (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.rectangle.*`](../configuration/elements.md#rectangle-configuration) options.

#### borderSkipped

This setting is used to avoid drawing the bar stroke at the base of the fill.
In general, this does not need to be changed except when creating chart types
that derive from a bar chart.

**Note:** for negative bars in vertical chart, `top` and `bottom` are flipped. Same goes for `left` and `right` in horizontal chart.

Options are:
* `'bottom'`
* `'left'`
* `'top'`
* `'right'`
* `false`

#### borderWidth

If this value is a number, it is applied to all sides of the rectangle (left, top, right, bottom), except [`borderSkipped`](#borderskipped). If this value is an object, the `left` property defines the left border width. Similarly the `right`, `top` and `bottom` properties can also be specified. Omitted borders and [`borderSkipped`](#borderskipped) are skipped.

### Interactions

The interaction with each bar can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | The bar background color when hovered.
| `hoverBorderColor` | The bar border color when hovered.
| `hoverBorderWidth` | The bar border width when hovered (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.rectangle.*`](../configuration/elements.md#rectangle-configuration) options.

## Scale Configuration
The bar chart accepts the following configuration from the associated `scale` options:

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `barPercentage` | `number` | `0.9` | Percent (0-1) of the available width each bar should be within the category width. 1.0 will take the whole category width and put the bars right next to each other. [more...](#barpercentage-vs-categorypercentage)
| `categoryPercentage` | `number` | `0.8` | Percent (0-1) of the available width each category should be within the sample width. [more...](#barpercentage-vs-categorypercentage)
| `barThickness` | <code>number&#124;string</code> | | Manually set width of each bar in pixels. If set to `'flex'`, it computes "optimal" sample widths that globally arrange bars side by side. If not set (default), bars are equally sized based on the smallest interval. [more...](#barthickness)
| `maxBarThickness` | `number` | | Set this to ensure that bars are not sized thicker than this.
| `minBarLength` | `number` | | Set this to ensure that bars have a minimum length in pixels.
| `gridLines.offsetGridLines` | `boolean` | `true` | If true, the bars for a particular data point fall between the grid lines. The grid line will move to the left by one half of the tick interval. If false, the grid line will go right down the middle of the bars. [more...](#offsetgridlines)

### Example Usage

```javascript
options = {
    scales: {
        xAxes: [{
            barPercentage: 0.5,
            barThickness: 6,
            maxBarThickness: 8,
            minBarLength: 2,
            gridLines: {
                offsetGridLines: true
            }
        }]
    }
};
```
### barThickness
If this value is a number, it is applied to the width of each bar, in pixels. When this is enforced, `barPercentage` and `categoryPercentage` are ignored.

If set to `'flex'`, the base sample widths are calculated automatically based on the previous and following samples so that they take the full available widths without overlap. Then, bars are sized using `barPercentage` and `categoryPercentage`. There is no gap when the percentage options are 1. This mode generates bars with different widths when data are not evenly spaced.

If not set (default), the base sample widths are calculated using the smallest interval that prevents bar overlapping, and bars are sized using `barPercentage` and `categoryPercentage`. This mode always generates bars equally sized.

### offsetGridLines
If true, the bars for a particular data point fall between the grid lines. The grid line will move to the left by one half of the tick interval, which is the space between the grid lines. If false, the grid line will go right down the middle of the bars. This is set to true for a category scale in a bar chart while false for other scales or chart types by default.

## Default Options

It is common to want to apply a configuration setting to all created bar charts. The global bar chart settings are stored in `Chart.defaults.bar`. Changing the global options only affects charts created after the change. Existing charts are not changed.

## barPercentage vs categoryPercentage

The following shows the relationship between the bar percentage option and the category percentage option.

```text
// categoryPercentage: 1.0
// barPercentage: 1.0
Bar:        | 1.0 | 1.0 |
Category:   |    1.0    |
Sample:     |===========|

// categoryPercentage: 1.0
// barPercentage: 0.5
Bar:          |.5|  |.5|
Category:  |      1.0     |
Sample:    |==============|

// categoryPercentage: 0.5
// barPercentage: 1.0
Bar:            |1.||1.|
Category:       |  .5  |
Sample:     |==============|
```

## Data Structure

The `data` property of a dataset for a bar chart is specified as an array of numbers. Each point in the data array corresponds to the label at the same index on the x axis.

```javascript
data: [20, 10]
```

You can also specify the dataset as x/y coordinates when using the [time scale](../axes/cartesian/time.md#time-cartesian-axis).

```javascript
data: [{x:'2016-12-25', y:20}, {x:'2016-12-26', y:10}]
```

## Stacked Bar Chart

Bar charts can be configured into stacked bar charts by changing the settings on the X and Y axes to enable stacking. Stacked bar charts can be used to show how one data series is made up of a number of smaller pieces.

```javascript
var stackedBar = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        scales: {
            xAxes: [{
                stacked: true
            }],
            yAxes: [{
                stacked: true
            }]
        }
    }
});
```

The following dataset properties are specific to stacked bar charts.

| Name | Type | Description
| ---- | ---- | -----------
| `stack` | `string` | The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack).

## Horizontal Bar Chart
A horizontal bar chart is a variation on a vertical bar chart. It is sometimes used to show trend data, and the comparison of multiple data sets side by side.
{% chartjs %}
{
    "type": "horizontalBar",
    "data": {
        "labels": ["January", "February", "March", "April", "May", "June", "July"],
        "datasets": [{
            "label": "My First Dataset",
            "data": [65, 59, 80, 81, 56, 55, 40],
            "fill": false,
            "backgroundColor": [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)"
            ],
            "borderColor": [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
            ],
            "borderWidth": 1
        }]
    },
    "options": {
        "scales": {
            "xAxes": [{
                "ticks": {
                    "beginAtZero": true
                }
            }]
        }
    }
}
{% endchartjs %}

## Example
```javascript
var myBarChart = new Chart(ctx, {
    type: 'horizontalBar',
    data: data,
    options: options
});
```

### Config Options
The configuration options for the horizontal bar chart are the same as for the [bar chart](#scale-configuration). However, any options specified on the x axis in a bar chart, are applied to the y axis in a horizontal bar chart.

The default horizontal bar configuration is specified in `Chart.defaults.horizontalBar`.
