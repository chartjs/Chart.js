---
title: Line Chart
anchor: line-chart
---
### Introduction
A line chart is a way of plotting data points on a line.

Often, it is used to show trend data, and the comparison of two data sets.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example usage
```javascript
var myLineChart = new Chart(ctx, {
	type: 'line',
	data: data,
	options: options
});
```

Alternatively a line chart can be created using syntax similar to the v1.0 syntax
```javascript
var myLineChart = Chart.Line(ctx, {
	data: data,
	options: options
});
```
### Data structure

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",

			// Boolean - if true fill the area under the line
			fill: false,

			// String - the color to fill the area under the line with if fill is true
			backgroundColor: "rgba(220,220,220,0.2)",

			// The properties below allow an array to be specified to change the value of the item at the given index

			// String or array - Line color
			borderColor: "rgba(220,220,220,1)",

			// String - cap style of the line. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
            borderCapStyle: 'butt',

            // Array - Length and spacing of dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
            borderDash: [],

            // Number - Offset for line dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
            borderDashOffset: 0.0,

            // String - line join style. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
            borderJoinStyle: 'miter',

			// String or array - Point stroke color
			pointBorderColor: "rgba(220,220,220,1)",

			// String or array - Point fill color
			pointBackgroundColor: "#fff",

			// Number or array - Stroke width of point border
			pointBorderWidth: 1,

			// Number or array - Radius of point when hovered
			pointHoverRadius: 5,

			// String or array - point background color when hovered
			pointHoverBackgroundColor: "rgba(220,220,220,1)",

			// Point border color when hovered
			pointHoverBorderColor: "rgba(220,220,220,1)",

			// Number or array - border width of point when hovered
			pointHoverBorderWidth: 2,

			// Tension - bezier curve tension of the line. Set to 0 to draw straight Wlines connecting points
			tension: 0.1,

			// The actual data
			data: [65, 59, 80, 81, 56, 55, 40],

			// String - If specified, binds the dataset to a certain y-axis. If not specified, the first y-axis is used. First id is y-axis-0
			yAxisID: "y-axis-0",
		},
		{
			label: "My Second dataset",
			fill: false,
			backgroundColor: "rgba(220,220,220,0.2)",
			borderColor: "rgba(220,220,220,1)",
			pointBorderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: "#fff",
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: "rgba(220,220,220,1)",
			pointHoverBorderColor: "rgba(220,220,220,1)",
			pointHoverBorderWidth: 2,
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```

The line chart requires an array of labels. This labels are shown on the X axis. There must be one label for each data point. More labels than datapoints are allowed, in which case the line ends at the last data point.
The data for line charts is broken up into an array of datasets. Each dataset has a colour for the fill, a colour for the line and colours for the points and strokes of the points. These colours are strings just like CSS. You can use RGBA, RGB, HEX or HSL notation.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart options

These are the customisation options specific to Line charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

The default options for line chart are defined in `Chart.defaults.Line`.

Name | Type | Default | Description
--- | --- | --- | ---
showLines | Boolean | true | If false, the lines between points are not drawn
stacked | Boolean | false | If true, lines stack on top of each other along the y axis.
*hover*.mode | String | "label" | Label's hover mode. "label" is used since the x axis displays data by the index in the dataset.
scales | - | - | -
*scales*.xAxes | Array | `[{type:"category","id":"x-axis-1"}]` | Defines all of the x axes used in the chart. See the [scale documentation](#getting-started-scales) for details on the available options.
*Options for xAxes* | | |
type | String | "category" | As defined in ["Category"](#scales-category-scale).
id | String | "x-axis-1" | Id of the axis so that data can bind to it.
 | | |
 *scales*.yAxes | Array | `[{type:"linear","id":"y-axis-1"}]` | Defines all of the x axes used in the chart. See the [scale documentation](#getting-started-scales) for details on the available options.
 *Options for yAxes* | | |
 type | String | "linear" | As defined in ["Linear"](#scales-linear-scale).
 id | String | "y-axis-1" | Id of the axis so that data can bind to it.

You can override these for your `Chart` instance by passing a member `options` into the `Line` method.

For example, we could have a line chart display without an x axis by doing the following. The config merge is smart enough to handle arrays so that you do not need to specify all axis settings to change one thing.

```javascript
new Chart(ctx, {
	type: 'line',
	data: data,
	options: {
		xAxes: [{
			display: false
		}]
	}
});
// This will create a chart with all of the default options, merged from the global config,
// and the Line chart defaults, but this particular instance will have the x axis not displaying.
```

We can also change these defaults values for each Line type that is created, this object is available at `Chart.defaults.line`.
