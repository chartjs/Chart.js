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
var myBarChart = new Chart(ctx).Bar(data, options);
```

### Data structure

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			fillColor: "rgba(220,220,220,0.5)",
			strokeColor: "rgba(220,220,220,0.8)",
			highlightFill: "rgba(220,220,220,0.75)",
			highlightStroke: "rgba(220,220,220,1)",
			data: [65, 59, 80, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			fillColor: "rgba(151,187,205,0.5)",
			strokeColor: "rgba(151,187,205,0.8)",
			highlightFill: "rgba(151,187,205,0.75)",
			highlightStroke: "rgba(151,187,205,1)",
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
	//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
	scaleBeginAtZero : true,

	//Boolean - Whether grid lines are shown across the chart
	scaleShowGridLines : true,

	//String - Colour of the grid lines
	scaleGridLineColor : "rgba(0,0,0,.05)",

	//Number - Width of the grid lines
	scaleGridLineWidth : 1,

	//Boolean - Whether to show horizontal lines (except X axis)
	scaleShowHorizontalLines: true,

	//Boolean - Whether to show vertical lines (except Y axis)
	scaleShowVerticalLines: true,

	//Boolean - If there is a stroke on each bar
	barShowStroke : true,

	//Number - Pixel width of the bar stroke
	barStrokeWidth : 2,

	//Number - Spacing between each of the X value sets
	barValueSpacing : 5,

	//Number - Spacing between data sets within X values
	barDatasetSpacing : 1,
	{% raw %}
	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	{% endraw %}
}
```

You can override these for your `Chart` instance by passing a second argument into the `Bar` method as an object with the keys you want to override.

For example, we could have a bar chart without a stroke on each bar by doing the following:

```javascript
new Chart(ctx).Bar(data, {
	barShowStroke: false
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
