---
title: Overlay Chart
anchor: overlay-chart
---

### Introduction
An overlay chart is a way of showing both bar charts and line charts on the same chart.


<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

### Example usage
```javascript
var myOverlayChart = new Chart(ctx).Overlay(data, options);
```

### Data structure

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
			label: "My First dataset",
			type: "line",
			fillColor: "rgba(220,220,220,0.2)",
			strokeColor: "rgba(220,220,220,1)",
			pointColor: "rgba(220,220,220,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(220,220,220,1)",
			showTooltip: true, //optional default is true
			data: [65, 59, 80, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			type:"bar",
			fillColor: "rgba(151,187,205,0.5)",
			strokeColor: "rgba(151,187,205,0.8)",
			highlightFill: "rgba(151,187,205,0.75)",
			highlightStroke: "rgba(151,187,205,1)",
			showTooltip: true, //optional default is true
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```
The overlay chart has the a very similar data structure to the line chart and bar chart, and has an array of datasets, each with colours and an array of data. Again, colours are in CSS format. The only extra option that needs to be provided is `type` which cn be either `line` or `bar`. Of no type is provided the chart will default to bars
We have an array of labels too for display. In the example, we are showing the same data as the previous line chart example.
For fine control of the displaying of tooltips ```showTooltip``` can be passed as either true or flase (default is true). If flase is passed that datasets tooltip will not be dispayed.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart Options

These are the customisation options specific to Bar charts and Line Charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{	
	//Function - Whether the current x-axis label should be filtered out, takes in current label and 
		//index, return true to filter out the label return false to keep the label
		labelsFilter : function(label,index){return false;},

		//Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
		scaleBeginAtZero : true,

		//Boolean - Whether grid lines are shown across the chart
		scaleShowGridLines : true,

		//String - Colour of the grid lines
		scaleGridLineColor : "rgba(0,0,0,.05)",

		//Number - Width of the grid lines
		scaleGridLineWidth : 1,

		//Boolean - If there is a stroke on each bar
		barShowStroke : true,

		//Number - Pixel width of the bar stroke
		barStrokeWidth : 2,

		//Number - Spacing between each of the X value sets
		barValueSpacing : 5,

		//Number - Spacing between data sets within X values
		barDatasetSpacing : 1,

		//Boolean - Whether the line is curved between points
		bezierCurve : true,

		//Number - Tension of the bezier curve between points
		bezierCurveTension : 0.4,

		//Boolean - Whether to show a dot for each point
		pointDot : true,

		//Number - Radius of each point dot in pixels
		pointDotRadius : 4,

		//Number - Pixel width of point dot stroke
		pointDotStrokeWidth : 1,

		//Number - amount extra to add to the radius to cater for hit detection outside the drawn point
		pointHitDetectionRadius : 20,

		//Boolean - Whether to show a stroke for datasets
		datasetStroke : true,

		//Number - Pixel width of dataset stroke
		datasetStrokeWidth : 2,

		//Boolean - Whether to fill the dataset with a colour
		datasetFill : true,

		{% raw %}
		//String - A legend template
		legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].lineColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
		{% endraw %}
}
```

You can override these for your `Chart` instance by passing a second argument into the `Overlay` method as an object with the keys you want to override.

For example, we could have an overlay chart without a stroke on each bar and without bezier curves between points by doing the following by doing the following:

```javascript
new Chart(ctx).Overlay(data, {
	barShowStroke: false,
	bezierCurve: false
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Overlay chart defaults but this particular instance will have `barShowStroke` set to false and `bezierCurve` set to false.
// It will also only display every 5th x-axis label
```

We can also change these defaults values for each Bar type that is created, this object is available at `Chart.defaults.Bar`.

### Prototype methods

#### .getBarsAtEvent( event )

Calling `getDataAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the bar and line elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activeDataSet = myOverlayChart.getDataAtEvent(evt);
	// => activeDataSet is an array of bars and points on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myOverlayChart.barDatasets[0].bars[2].value = 50;
// Would update the first bar dataset's value of 'March' to be 50
myOverlayChart.lineDatasets[0].points[2].value = 50;
// Would update the first line dataset's value of 'March' to be 50
myOverlayChart.update();
// Calling update now animates the position of March from 90 to 50.
```

#### .addData( valuesArray, label )

Calling `addData(valuesArray, label)` on your Chart instance passing an array of values for each dataset, along with a label.

```javascript
// The values array passed into addData should be one for each dataset in the chart
myOverlayChart.addData([40, 60], "August");
// The new data will now animate at the end of the chart.
```

#### .removeData( )

Calling `removeData()` on your Chart instance will remove the first value for all datasets on the chart.

```javascript
myOverlayChart.removeData();
// The chart will now animate and remove the first bar
```