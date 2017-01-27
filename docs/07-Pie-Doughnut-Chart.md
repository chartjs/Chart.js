---
title: Pie & Doughnut Charts
anchor: doughnut-pie-chart
---
### Introduction
Pie and doughnut charts are probably the most commonly used charts there are. They are divided into segments, the arc of each segment shows the proportional value of each piece of data.

They are excellent at showing the relational proportions between data.

Pie and doughnut charts are effectively the same class in Chart.js, but have one different default value - their `cutoutPercentage`. This equates what percentage of the inner should be cut out. This defaults to `0` for pie charts, and `50` for doughnuts.

They are also registered under two aliases in the `Chart` core. Other than their different default value, and different alias, they are exactly the same.

<div class="canvas-holder half">
	<canvas width="250" height="125"></canvas>
</div>

<div class="canvas-holder half">
	<canvas width="250" height="125"></canvas>
</div>
<br>

### Example Usage

```javascript
// For a pie chart
var myPieChart = new Chart(ctx,{
	type: 'pie',
	data: data,
	options: options
});
```

```javascript
// And for a doughnut chart
var myDoughnutChart = new Chart(ctx, {
	type: 'doughnut',
	data: data,
	options: options
});
```

### Dataset Structure

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
    labels: [
        "Red",
        "Blue",
        "Yellow"
    ],
    datasets: [
        {
            data: [300, 50, 100],
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
        }]
};
```

For a pie chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each. You can also add an array of background colors. The color attributes should be a string. Similar to CSS, for this string you can use HEX notation, RGB, RGBA or HSL.

### Chart Options

These are the customisation options specific to Pie & Doughnut charts. These options are merged with the [global chart configuration options](#global-chart-configuration), and form the options of the chart.

Name | Type | Default | Description
--- | --- | --- | ---
cutoutPercentage | Number | 50 - for doughnut, 0 - for pie | The percentage of the chart that is cut out of the middle.
rotation | Number | -0.5 * Math.PI | Starting angle to draw arcs from
circumference | Number | 2 * Math.PI | Sweep to allow arcs to cover
*animation*.animateRotate | Boolean |true | If true, will animate the rotation of the chart.
*animation*.animateScale | Boolean | false | If true, will animate scaling the Doughnut from the centre.
*legend*.*labels*.generateLabels | Function | `function(chart) {} ` | Returns a label for each item to be displayed on the legend.
*legend*.onClick | Function | function(event, legendItem) {} ` | Handles clicking an individual legend item

You can override these for your `Chart` instance by passing a second argument into the `Doughnut` method as an object with the keys you want to override.

For example, we could have a doughnut chart that animates by scaling out from the centre like so:

```javascript
new Chart(ctx,{
	type:"doughnut",
	options: {
		animation:{
			animateScale:true
		}
	}
});
// This will create a chart with all of the default options, merged from the global config,
// and the Doughnut chart defaults but this particular instance will have `animateScale` set to `true`.
```

We can also change these default values for each Doughnut type that is created, this object is available at `Chart.defaults.doughnut`. Pie charts also have a clone of these defaults available to change at `Chart.defaults.pie`, with the only difference being `cutoutPercentage` being set to 0.
