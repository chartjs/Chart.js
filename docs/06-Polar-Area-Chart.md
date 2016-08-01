---
title: Polar Area Chart
anchor: polar-area-chart
---
### Introduction
Polar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.

This type of chart is often useful when we want to show a comparison data similar to a pie chart, but also show a scale of values for context.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example Usage

```javascript
new Chart(ctx, {
	data: data,
	type: 'polarArea',
	options: options
});
```

### Dataset Structure

The following options can be included in a polar area chart dataset to configure options for that specific dataset.

Some properties are specified as arrays. The first value applies to the first bar, the second value to the second bar, and so on.

Property | Type | Usage
--- | --- | ---
data | `Array<Number>` | The data to plot as arcs
label | `String` | The label for the dataset which appears in the legend and tooltips
backgroundColor | `Array<Color>` | The fill color of the arcs. See [Colors](#chart-configuration-colors)
borderColor | `Array<Color>` | Arc border color
borderWidth | `Array<Number>` | Border width of arcs in pixels
hoverBackgroundColor | `Array<Color>` | Arc background color when hovered
hoverBorderColor | `Array<Color>` | Arc border color when hovered
hoverBorderWidth | `Array<Number>` | Border width of arc when hovered

An example data object using these attributes is shown below.

```javascript
var data = {
	datasets: [{
		data: [
			11,
			16,
			7,
			3,
			14
		],
		backgroundColor: [
			"#FF6384",
			"#4BC0C0",
			"#FFCE56",
			"#E7E9ED",
			"#36A2EB"
		],
		label: 'My dataset' // for legend
	}],
	labels: [
		"Red",
		"Green",
		"Yellow",
		"Grey",
		"Blue"
	]
};
```
As you can see, for the chart data you pass in an array of objects, with a value and a colour. The value attribute should be a number, while the color attribute should be a string. Similar to CSS, for this string you can use HEX notation, RGB, RGBA or HSL.

### Chart Options

These are the customisation options specific to Polar Area charts. These options are merged with the [global chart configuration options](#global-chart-configuration), and form the options of the chart.

Name | Type | Default | Description
--- | --- | --- | ---
startAngle | Number | -0.5 * Math.PI | Sets the starting angle for the first item in a dataset
scale | Object | [See Scales](#scales) and [Defaults for Radial Linear Scale](#scales-radial-linear-scale) | Options for the one scale used on the chart. Use this to style the ticks, labels, and grid.
*scale*.type | String |"radialLinear" | As defined in ["Radial Linear"](#scales-radial-linear-scale).
*scale*.lineArc | Boolean | true | When true, lines are circular.
*animation*.animateRotate | Boolean |true | If true, will animate the rotation of the chart.
*animation*.animateScale | Boolean | true | If true, will animate scaling the chart.
*legend*.*labels*.generateLabels | Function | `function(data) {} ` | Returns labels for each the legend
*legend*.onClick | Function | function(event, legendItem) {} ` | Handles clicking an individual legend item
legendCallback | Function | `function(chart) ` | Generates the HTML legend via calls to `generateLegend`

You can override these for your `Chart` instance by passing a second argument into the `PolarArea` method as an object with the keys you want to override.

For example, we could have a polar area chart with a black stroke on each segment like so:

```javascript
new Chart(ctx, {
	data: data,
	type: "polarArea",
	options: {
		elements: {
			arc: {
				borderColor: "#000000"
			}
		}
	}
});
// This will create a chart with all of the default options, merged from the global config,
// and the PolarArea chart defaults but this particular instance will have `elements.arc.borderColor` set to `"#000000"`.
```

We can also change these defaults values for each PolarArea type that is created, this object is available at `Chart.defaults.polarArea`.
