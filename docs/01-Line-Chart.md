---
title: Line Chart
anchor: line-chart
---
###Introduction
A line chart is a way of plotting data points on a line.

Often, it is used to show trend data, and the comparison of two data sets.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

###Example usage
```javascript
var myLineChart = new Chart(ctx).Line({
	data: data, 
	options: options
});
```
###Data structure

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
			pointBorderWidth: 2,

			// The actual data
			data: [65, 59, 80, 81, 56, 55, 40],

			// String - If specified, binds the dataset to a certain y-axis. If not specified, the first y-axis is used.
			yAxisID: "y-axis-1",
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
			pointBorderWidth: 2,
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```

The line chart requires an array of labels for each of the data points. This is shown on the X axis.
The data for line charts is broken up into an array of datasets. Each dataset has a colour for the fill, a colour for the line and colours for the points and strokes of the points. These colours are strings just like CSS. You can use RGBA, RGB, HEX or HSL notation.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart options

These are the customisation options specific to Line charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{
	// Boolean - if true, line stack on top of each other along the y axis
	stacked: false,

	hover: {
		// String - We use a label hover mode since the x axis displays data by the index in the dataset
		mode: "label"
	},

	scales: {
		// The line chart officially supports only 1 x-axis but uses an array to keep the API consistent. Use a scatter chart if you need multiple x axes. 
		xAxes: [{
			// String - type of axis to use. Should not be changed from 'dataset'. To use a 'linear' axis on the x, use the scatter chart type
			scaleType: "dataset", // scatter should not use a dataset axis

			// Boolean - if true, show the scale
			display: true,

			// String - position of the scale. possible options are "top" and "bottom" for dataset scales
			position: "bottom",

			// String - id of the axis so that data can bind to it
			id: "x-axis-1", // need an ID so datasets can reference the scale

			// grid line settings
			gridLines: {
				// Boolean - if true, show the grid lines
				show: true,

				// String - color of the grid lines
				color: "rgba(0, 0, 0, 0.05)",

				// Number - width of the grid lines
				lineWidth: 1,

				// Boolean - if true draw lines on the chart area
				drawOnChartArea: true,

				// Boolean - if true draw ticks in the axis area
				drawTicks: true,

				// Number - width of the grid line for the first index (index 0)
				zeroLineWidth: 1,

				// String - color of the grid line for the first index
				zeroLineColor: "rgba(0,0,0,0.25)",

				// Boolean - if true, offset labels from grid lines
				offsetGridLines: false,
			},

			// label settings
			labels: {
				// Boolean - if true show labels
				show: true,

				// String - template string for labels
				template: "<%=value%>",

				// Number - label font size
				fontSize: 12,

				// String - label font style
				fontStyle: "normal",

				// String - label font color
				fontColor: "#666",

				// String - label font family
				fontFamily: "Helvetica Neue",
			},
		}],
		yAxes: [{
			// String - type of axis. 'linear' is the default but extensions may provide other types such as logarithmic
			scaleType: "linear",

			// Boolean - if true, show the scale
			display: true,

			// String - position of axis. Vertical axes can have either "left" or "right"
			position: "left",

			// ID of the axis for data binding
			id: "y-axis-1",

			// grid line settings
			gridLines: {
				// Boolean - if true, show the grid lines
				show: true,

				// String - color of the grid lines
				color: "rgba(0, 0, 0, 0.05)",

				// Number - width of the grid lines
				lineWidth: 1,

				// Boolean - if true draw lines on the chart area
				drawOnChartArea: true,

				// Boolean - if true draw ticks in the axis area
				drawTicks: true,

				// Number - width of the grid line representing a numerical value of 0
				zeroLineWidth: 1,

				// String - color of the grid line representing a numerical value of 0
				zeroLineColor: "rgba(0,0,0,0.25)",
			},

			// Boolean - if true ensures that the scale always has a 0 point
			beginAtZero: false,

			// Object - if specified, allows the user to override the step generation algorithm.
			//			Contains the following values
			//				start: // number to start at
			//				stepWidth: // size of step
			//				steps: // number of steps
			override: null,

			// label settings
			labels: {
				// Boolean - if true show labels
				show: true,

				// String - template string for labels
				template: "<%=value%>",

				// Function - if specified this is passed the tick value, index, and the array of all tick values. Returns a string that is used as the label for that value
				userCallback: null,

				// Number - label font size
				fontSize: 12,

				// String - label font style
				fontStyle: "normal",

				// String - label font color
				fontColor: "#666",

				// String - label font family
				fontFamily: "Helvetica Neue",
			},
		}],
	}
};
```

You can override these for your `Chart` instance by passing a member `options` into the `Line` method.

For example, we could have a line chart display without an x axis by doing the following. The config merge is smart enough to handle arrays so that you do not need to specify all axis settings to change one thing.

```javascript
new Chart(ctx).Line({
	data: data, 
	options: {
		xAxes: [{
			show: false
		}]
	}
});
// This will create a chart with all of the default options, merged from the global config,
// and the Line chart defaults, but this particular instance will have `bezierCurve` set to false.
```

We can also change these defaults values for each Line type that is created, this object is available at `Chart.defaults.Line`.


### Prototype methods

#### .getPointsAtEvent( event )

Calling `getPointsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the point elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activePoints = myLineChart.getPointsAtEvent(evt);
	// => activePoints is an array of points on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myLineChart.datasets[0].points[2].value = 50;
// Would update the first dataset's value of 'March' to be 50
myLineChart.update();
// Calling update now animates the position of March from 90 to 50.
```

#### .addData( valuesArray, label )

Calling `addData(valuesArray, label)` on your Chart instance passing an array of values for each dataset, along with a label for those points.

```javascript
// The values array passed into addData should be one for each dataset in the chart
myLineChart.addData([40, 60], "August");
// This new data will now animate at the end of the chart.
```

#### .removeData( )

Calling `removeData()` on your Chart instance will remove the first value for all datasets on the chart.

```javascript
myLineChart.removeData();
// The chart will remove the first point and animate other points into place
```
