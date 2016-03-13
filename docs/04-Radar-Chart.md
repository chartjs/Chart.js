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
```javascript
var data = {
	labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
	datasets: [
		{
			label: "My First dataset",
			backgroundColor: "rgba(220,220,220,0.2)",
			borderColor: "rgba(220,220,220,1)",
			pointBackgroundColor: "rgba(220,220,220,1)",
			pointBorderColor: "#fff",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(220,220,220,1)",
			data: [65, 59, 90, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			backgroundColor: "rgba(151,187,205,0.2)",
			borderColor: "rgba(151,187,205,1)",
			pointBackgroundColor: "rgba(151,187,205,1)",
			pointBorderColor: "#fff",
			pointHoverBackgroundColor: "#fff",
			pointHoverBorderColor: "rgba(151,187,205,1)",
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
scale | Array | [See Scales](#scales) and [Defaults for Radial Linear Scale](#scales-radial-linear-scale) | Options for the one scale used on the chart. Use this to style the ticks, labels, and grid lines.
*scale*.type | String |"radialLinear" | As defined in ["Radial Linear"](#scales-radial-linear-scale).
*elements*.line | Array | | Options for all line elements used on the chart, as defined in the global elements, duplicated here to show Radar chart specific defaults.
*elements.line*.tension | Number | 0 | Tension exhibited by lines when calculating splineCurve. Setting to 0 creates straight lines.

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
