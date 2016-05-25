---
title: Line Chart
anchor: line-chart
---
### Introduction
A line chart is a way of plotting data points on a line. Often, it is used to show trend data, and the comparison of two data sets.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example Usage
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

### Data Structure

The following options can be included in a line chart dataset to configure options for that specific dataset.

All point* properties can be specified as an array. If these are set to an array value, the first value applies to the first point, the second value to the second point, and so on.

Property | Type | Usage
--- | --- | ---
data | See [data point](#line-chart-data-points) section | The data to plot in a line
label | `String` | The label for the dataset which appears in the legend and tooltips
xAxisID | `String` | The ID of the x axis to plot this dataset on
yAxisID | `String` | The ID of the y axis to plot this dataset on
fill | `Boolean` | If true, fill the area under the line
lineTension | `Number` | Bezier curve tension of the line. Set to 0 to draw straightlines. *Note* This was renamed from 'tension' but the old name still works.
backgroundColor | `Color` | The fill color under the line. See [Colors](#getting-started-colors)
borderWidth | `Number` | The width of the line in pixels
borderColor | `Color` | The color of the line.
borderCapStyle | `String` | Cap style of the line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap)
borderDash | `Array<Number>` | Length and spacing of dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
borderDashOffset | `Number` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
borderJoinStyle | `String` | Line joint style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
pointBorderColor | `Color or Array<Color>` | The border color for points.
pointBackgroundColor | `Color or Array<Color>` | The fill color for points
pointBorderWidth | `Number or Array<Number>` | The width of the point border in pixels
pointRadius | `Number or Array<Number>` | The radius of the point shape. If set to 0, nothing is rendered. 
pointHoverRadius | `Number or Array<Number>` | The radius of the point when hovered
pointHitRadius | `Number or Array<Number>` | The pixel size of the non-displayed point that reacts to mouse events
pointHoverBackgroundColor | `Color or Array<Color>` | Point background color when hovered
pointHoverBorderColor | `Color or Array<Color>` | Point border color when hovered
pointHoverBorderWidth | `Number or Array<Number>` | Border width of point when hovered
pointStyle | `String, Array<String>, Image, Array<Image>` | The style of point. Options are 'circle', 'triangle', 'rect', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'. If the option is an image, that image is drawn on the canvas using `drawImage`. 

An example data object using these attributes is shown below.
```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			fill: false,
			lineTension: 0.1,
			backgroundColor: "rgba(75,192,192,0.4)",
			borderColor: "rgba(75,192,192,1)",
			borderCapStyle: 'butt',
			borderDash: [],
			borderDashOffset: 0.0,
			borderJoinStyle: 'miter',
			pointBorderColor: "rgba(75,192,192,1)",
			pointBackgroundColor: "#fff",
			pointBorderWidth: 1,
			pointHoverRadius: 5,
			pointHoverBackgroundColor: "rgba(75,192,192,1)",
			pointHoverBorderColor: "rgba(220,220,220,1)",
			pointHoverBorderWidth: 2,
			pointRadius: 1,
			pointHitRadius: 10,
			data: [65, 59, 80, 81, 56, 55, 40],
		}
	]
};
```

The line chart usually requires an array of labels. This labels are shown on the X axis. There must be one label for each data point. More labels than datapoints are allowed, in which case the line ends at the last data point.
The data for line charts is broken up into an array of datasets. Each dataset has a colour for the fill, a colour for the line and colours for the points and strokes of the points. These colours are strings just like CSS. You can use RGBA, RGB, HEX or HSL notation.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Data Points

The data passed to the chart can be passed in two formats. The most common method is to pass the data array as an array of numbers. In this case, the `data.labels` array must be specified and must contain a label for each point.

The alternate is used for sparse datasets. Data is specified using an object containing `x` and `y` properties. This is used for scatter charts as documented below.

### Scatter Line Charts

Scatter line charts can be created by changing the X axis to a linear axis. To use a scatter chart, data must be passed as objects containing X and Y properties. The example below creates a scatter chart with 3 points.

```javascript
var scatterChart = new Chart(ctx, {
	type: 'line',
	data: {
		datasets: [{
			label: 'Scatter Dataset',
			data: [{
				x: -10,
				y: 0
			}, {
				x: 0,
				y: 10
			}, {
				x: 10,
				y: 5
			}]
		}]
	},
	options: {
		scales: {
			xAxes: [{
				type: 'linear',
				position: 'bottom'
			}]
		}
	}
});
```

### Chart Options

These are the customisation options specific to Line charts. These options are merged with the [global chart configuration options](#chart-configuration-global-configuration), and form the options of the chart.

Name | Type | Default | Description
--- | --- | --- | ---
showLines | Boolean | true | If false, the lines between points are not drawn

You can override these for your `Chart` instance by passing a member `options` into the `Line` method.

For example, we could have a line chart display without an X axis by doing the following. The config merge is smart enough to handle arrays so that you do not need to specify all axis settings to change one thing.

```javascript
new Chart(ctx, {
	type: 'line',
	data: data,
	options: {
		scales: {
			xAxes: [{
				display: false
			}]
		}
	}
});
```

We can also change these defaults values for each Line type that is created, this object is available at `Chart.defaults.line`.

### Stacked Charts

Stacked area charts can be created by setting the Y axis to a stacked configuration. The following example would have stacked lines.

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
