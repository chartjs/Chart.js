---
title: Bar Chart
anchor: bar-chart
---

### Introduction
A bar chart is a way of showing data as bars.

It is sometimes used to show trend data, and the comparison of multiple data sets side by side.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example Usage
```javascript
var myBarChart = new Chart(ctx, {
	type: 'bar',
	data: data,
	options: options
});
```

Or if you want horizontal bars.

```javascript
var myBarChart = new Chart(ctx, {
	type: 'horizontalBar',
	data: data,
	options: options
});
```

### Data Structure
The following options can be included in a bar chart dataset to configure options for that specific dataset.

Some properties can be specified as an array. If these are set to an array value, the first value applies to the first bar, the second value to the second bar, and so on.

Property | Type | Usage
--- | --- | ---
data | `Array<Number>` | The data to plot as bars
label | `String` | The label for the dataset which appears in the legend and tooltips
xAxisID | `String` | The ID of the x axis to plot this dataset on
yAxisID | `String` | The ID of the y axis to plot this dataset on
backgroundColor | `Color or Array<Color>` | The fill color of the bars. See [Colors](#getting-started-colors)
borderColor | `Color or Array<Color>` | Bar border color
borderWidth | `Number or Array<Number>` | Border width of bar in pixels
borderSkipped | `String or Array<String>` | Which edge to skip drawing the border for. Options are 'bottom', 'left', 'top', and 'right'
hoverBackgroundColor | `Color or Array<Color>` | Bar background color when hovered
hoverBorderColor | `Color or Array<Color>` | Bar border color when hovered
hoverBorderWidth | `Number or Array<Number>` | Border width of bar when hovered

An example data object using these attributes is shown below.

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			backgroundColor: [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)'
            ],
            borderColor: [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
			data: [65, 59, 80, 81, 56, 55, 40],
		}
	]
};
```
The bar chart has the a very similar data structure to the line chart, and has an array of datasets, each with colours and an array of data.
We have an array of labels too for display. In the example, we are showing the same data as the previous line chart example.

### Chart Options

These are the customisation options specific to Bar charts. These options are merged with the [global chart configuration options](#global-chart-configuration), and form the options of the chart.

The default options for bar chart are defined in `Chart.defaults.bar`.

Name | Type | Default | Description
--- |:---:| --- | ---
*hover*.mode | String | "label" | Label's hover mode. "label" is used since the x axis displays data by the index in the dataset.
scales | Object | - | -
*scales*.xAxes | Array |  | The bar chart officially supports only 1 x-axis but uses an array to keep the API consistent. Use a scatter chart if you need multiple x axes.
*Options for xAxes* | | |
type | String | "Category" | As defined in [Scales](#scales-category-scale).
display | Boolean | true | If true, show the scale.
id | String | "x-axis-0" | Id of the axis so that data can bind to it
stacked | Boolean | false | If true, bars are stacked on the x-axis
categoryPercentage | Number | 0.8 | Percent (0-1) of the available width (the space between the gridlines for small datasets) for each data-point to use for the bars. [Read More](#bar-chart-barpercentage-vs-categorypercentage)
barPercentage | Number | 0.9 | Percent (0-1) of the available width each bar should be within the category percentage. 1.0 will take the whole category width and put the bars right next to each other. [Read More](#bar-chart-barpercentage-vs-categorypercentage)
gridLines | Object |  [See Scales](#scales) |
*gridLines*.offsetGridLines | Boolean | true | If true, the bars for a particular data point fall between the grid lines. If false, the grid line will go right down the middle of the bars.
| | |
*scales*.yAxes | Array | `[{ type: "linear" }]` |
*Options for xAxes* | | |
type | String | "linear" | As defined in [Scales](#scales-linear-scale).
display | Boolean | true | If true, show the scale.
id | String | "y-axis-0" | Id of the axis so that data can bind to it.
stacked | Boolean | false | If true, bars are stacked on the y-axis

You can override these for your `Chart` instance by passing a second argument into the `Bar` method as an object with the keys you want to override.

For example, we could have a bar chart without a stroke on each bar by doing the following:

```javascript
new Chart(ctx, {
	type: "bar",
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
	}
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Bar chart defaults but this particular instance will have `stacked` set to true
// for both x and y axes.
```

We can also change these defaults values for each Bar type that is created, this object is available at `Chart.defaults.bar`. For horizontal bars, this object is available at `Chart.defaults.horizontalBar`.

The default options for horizontal bar charts are defined in `Chart.defaults.horizontalBar` and are same as those of the bar chart, but with `xAxes` and `yAxes` swapped and the following additional options.

Name | Type | Default | Description
--- |:---:| --- | ---
*Options for xAxes* | | |
position | String | "bottom" |
*Options for yAxes* | | |
position | String | "left" |

### barPercentage vs categoryPercentage

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
