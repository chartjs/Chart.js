---
title: Pie & Doughnut Charts
anchor: doughnut-pie-chart
---
### Introduction
Pie and doughnut charts are probably the most commonly used chart there are. They are divided into segments, the arc of each segment shows the proportional value of each piece of data.

They are excellent at showing the relational proportions between data.

Pie and doughnut charts are effectively the same class in Chart.js, but have one different default value - their `percentageInnerCutout`. This equates what percentage of the inner should be cut out. This defaults to `0` for pie charts, and `50` for doughnuts.

They are also registered under two aliases in the `Chart` core. Other than their different default value, and different alias, they are exactly the same.

<div class="canvas-holder half">
	<canvas width="250" height="125"></canvas>
</div>

<div class="canvas-holder half">
	<canvas width="250" height="125"></canvas>
</div>


### Example usage

```javascript
// For a pie chart
var myPieChart = new Chart(ctx[0],{
	type:'pie',
	data: data,
	options: options
});

// And for a doughnut chart
var myDoughnutChart = new Chart(ctx[1], {
	type:'doughnut',
	data: data,
	options: options
});
```

### Data structure

```javascript
var data = {
    labels: [
        "Red",
        "Green",
        "Yellow"
    ],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: [
                "#F7464A",
                "#46BFBD",
                "#FDB45C"
            ],
            hoverBackgroundColor: [
                "#FF5A5E",
                "#5AD3D1",
                "#FFC870"
            ]
        }]
};
```

For a pie chart, you must pass in an array of objects with a value and an optional color property. The value attribute should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each. The color attribute should be a string. Similar to CSS, for this string you can use HEX notation, RGB, RGBA or HSL.

### Chart options

These are the customisation options specific to Pie & Doughnut charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

Name | Type | Default | Description
--- | --- | --- | ---
cutoutPercentage | Number | 50 - for doughnut, 0 - for pie | The percentage of the chart that is cut out of the middle.
scale | Array | [See Scales](#scales) and [Defaults for Radial Linear Scale](#getting-started-radial-linear-scale) | Options for the one scale used on the chart. Use this to style the ticks, labels, and grid.
*scale*.type | String |"radialLinear" | As defined in ["Radial Linear"](#scales-radial-linear-scale).
*scale*.lineArc | Boolean | true | When true, lines are arced compared to straight when false.
*animation*.animateRotate | Boolean |true | If true, will animate the rotation of the chart.
*animation*.animateScale | Boolean | false | If true, will animate scaling the Doughnut from the centre.
*legend*.*labels*.generateLabels | Function | `function(data) {} ` | Returns labels for each the legend
*legend*.onClick | Function | function(event, legendItem) {} ` | Handles clicking an individual legend item

You can override these for your `Chart` instance by passing a second argument into the `Doughnut` method as an object with the keys you want to override.

For example, we could have a doughnut chart that animates by scaling out from the centre like so:

```javascript
new Chart(ctx,{
	type:"doughnut",
	animation:{
		animateScale:true
	}
});
// This will create a chart with all of the default options, merged from the global config,
// and the Doughnut chart defaults but this particular instance will have `animateScale` set to `true`.
```

We can also change these default values for each Doughnut type that is created, this object is available at `Chart.defaults.doughnut`. Pie charts also have a clone of these defaults available to change at `Chart.defaults.pie`, with the only difference being `percentageInnerCutout` being set to 0.