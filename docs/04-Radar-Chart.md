---
title: Radar Chart
anchor: radar-chart
---

### Introduction
A radar chart is a way of showing multiple data points and the variation between them.

They are often useful for comparing the points of two or more different data sets.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example usage

```javascript
var myRadarChart = new Chart(ctx, {
	type: 'radar',
	data: data,
	options: options
});
```

### Data structure

The following options can be included in a radar chart dataset to configure options for that specific dataset.

All point* properties can be specified as an array. If these are set to an array value, the first value applies to the first point, the second value to the second point, and so on.

Property | Type | Usage
--- | --- | ---
data | `Array<Number>` | The data to plot in a line
label | `String` | The label for the dataset which appears in the legend and tooltips
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
hitRadius | `Number or Array<Number>` | The pixel size of the non-displayed point that reacts to mouse events
pointHoverBackgroundColor | `Color or Array<Color>` | Point background color when hovered
pointHoverBorderColor | `Color or Array<Color>` | Point border color when hovered
pointHoverBorderWidth | `Number or Array<Number>` | Border width of point when hovered
pointStyle | `String or Array<String>` | The style of point. Options include 'circle', 'triangle', 'rect', 'rectRot', 'cross', 'crossRot', 'star', 'line', and 'dash'

An example data object using these attributes is shown below.

```javascript
var data = {
	labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
	datasets: [
		{
			label: "My First dataset",
			backgroundColor: "rgba(179,181,198,0.2)",
			borderColor: "rgba(179,181,198,1)",
			pointBackgroundColor: "rgba(179,181,198,1)",
			pointBorderColor: "#fff",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(179,181,198,1)",
			data: [65, 59, 90, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			backgroundColor: "rgba(255,99,132,0.2)",
			borderColor: "rgba(255,99,132,1)",
			pointBackgroundColor: "rgba(255,99,132,1)",
			pointBorderColor: "#fff",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(255,99,132,1)",
			data: [28, 48, 40, 19, 96, 27, 100]
		}
	]
};
```
For a radar chart, to provide context of what each point means, we include an array of strings that show around each point in the chart.
For the radar chart data, we have an array of datasets. Each of these is an object, with a fill colour, a stroke colour, a colour for the fill of each point, and a colour for the stroke of each point. We also have an array of data values.
The label key on each dataset is optional, and can be used when generating a scale for the chart.


### Chart Options

These are the customisation options specific to Radar charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

The default options for radar chart are defined in `Chart.defaults.radar`.

Name | Type | Default | Description
--- | --- | --- | ---
scale | Object | [See Scales](#scales) and [Defaults for Radial Linear Scale](#scales-radial-linear-scale) | Options for the one scale used on the chart. Use this to style the ticks, labels, and grid lines.
*scale*.type | String |"radialLinear" | As defined in ["Radial Linear"](#scales-radial-linear-scale).
*elements*.line | Object | | Options for all line elements used on the chart, as defined in the global elements, duplicated here to show Radar chart specific defaults.
*elements.line*.lineTension | Number | 0 | Tension exhibited by lines when calculating splineCurve. Setting to 0 creates straight lines.

You can override these for your `Chart` instance by passing a second argument into the `Radar` method as an object with the keys you want to override.

For example, we could have a radar chart without a point for each on piece of data by doing the following:

```javascript
new Chart(ctx, {
	type: "radar",
	data: data,
	options: {
			scale: {
				reverse: true,
				ticks: {
					beginAtZero: true
				}
			}
	}
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Radar chart defaults but this particular instance's scale will be reversed as
// well as the ticks beginning at zero.
```

We can also change these defaults values for each Radar type that is created, this object is available at `Chart.defaults.radar`.
