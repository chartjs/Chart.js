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

### Example usage
```javascript
var myBarChart = new Chart(ctx).Bar({
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

			// The properties below allow an array to be specified to change the value of the item at the given index
			// String  or array - the bar color
			backgroundColor: "rgba(220,220,220,0.2)",

			// String or array - bar stroke color
			borderColor: "rgba(220,220,220,1)",

			// Number or array - bar border width
			borderWidth: 1,

			// String or array - fill color when hovered
			hoverBackgroundColor: "rgba(220,220,220,0.2)",

			// String or array - border color when hovered
			hoverBorderColor: "rgba(220,220,220,1)",

			// The actual data
			data: [65, 59, 80, 81, 56, 55, 40],

			// String - If specified, binds the dataset to a certain y-axis. If not specified, the first y-axis is used.
			yAxisID: "y-axis-1",
		},
		{
			label: "My Second dataset",
			backgroundColor: "rgba(220,220,220,0.2)",
			borderColor: "rgba(220,220,220,1)",
			borderWidth: 1,
			hoverBackgroundColor: "rgba(220,220,220,0.2)",
			hoverBorderColor: "rgba(220,220,220,1)",
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```
The bar chart has the a very similar data structure to the line chart, and has an array of datasets, each with colours and an array of data. Again, colours are in CSS format.
We have an array of labels too for display. In the example, we are showing the same data as the previous line chart example.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart Options

These are the customisation options specific to Bar charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{
	// Boolean - if true, bars stack on top of each other
	stacked: false,

	hover: {
		// String - We use a label hover mode since the x axis displays data by the index in the dataset
		mode: "label"
	},

	scales: {
		// The bar chart officially supports only 1 x-axis but uses an array to keep the API consistent. Use a scatter chart if you need multiple x axes. 
		xAxes: [{
			// String - type of axis to use. Should not be changed from 'dataset'.
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
	},
};
```

You can override these for your `Chart` instance by passing a second argument into the `Bar` method as an object with the keys you want to override.

For example, we could have a bar chart without a stroke on each bar by doing the following:

```javascript
new Chart(ctx).Bar({
	data: data, 
	options: {
		barShowStroke: false
	}
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Bar chart defaults but this particular instance will have `barShowStroke` set to false.
```

We can also change these defaults values for each Bar type that is created, this object is available at `Chart.defaults.Bar`.

### Prototype methods

#### .getBarsAtEvent( event )

Calling `getBarsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the bar elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activeBars = myBarChart.getBarsAtEvent(evt);
	// => activeBars is an array of bars on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myBarChart.datasets[0].bars[2].value = 50;
// Would update the first dataset's value of 'March' to be 50
myBarChart.update();
// Calling update now animates the position of March from 90 to 50.
```

#### .addData( valuesArray, label )

Calling `addData(valuesArray, label)` on your Chart instance passing an array of values for each dataset, along with a label for those bars.

```javascript
// The values array passed into addData should be one for each dataset in the chart
myBarChart.addData([40, 60], "August");
// The new data will now animate at the end of the chart.
```

#### .removeData( )

Calling `removeData()` on your Chart instance will remove the first value for all datasets on the chart.

```javascript
myBarChart.removeData();
// The chart will now animate and remove the first bar
```
