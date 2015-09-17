---
title: Scatter Chart
anchor: scatter-chart
---
###Introduction
A scatter chart is a way of plotting huge amount of data points (race checkpoints, left/right balance of cyclist, amount of people on the event (why not?)).

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

###Example usage
```javascript
var myScatterChart = new Chart(ctx).Scatter(data, options);
```
###Data structure

```javascript
var data = {
	labels: ["January", "February", "March", "April", "May", "June", "July"],
	datasets: [
		{
      label: "My First dataset",
      pointColor : "rgba(220,220,220,0.5)",
      pointRadius : "8",
      pointHighlightStroke : "rgba(220,220,220,1)",
			data: [65, 59, 80, 81, 56, 55, 40]
		},
		{
      label: "My First dataset",
      pointColor : "rgba(220,220,220,0.5)",
      pointRadius : "8",
      pointHighlightStroke : "rgba(220,220,220,1)",
			data: [28, 48, 40, 19, 86, 27, 90]
		}
	]
};
```

The scatter chart requires an array of labels for each of the data points. This is shown on the X axis.
The data for line charts is broken up into an array of datasets. Each dataset has a color for the fill, a color for the highlight mode, and radius of points. These colors are strings just like CSS, radius parameter is also a string. You can use RGBA, RGB, HEX or HSL notation.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart options

These are the customisation options specific to Scatter charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{

  ///Boolean - Whether grid lines are shown across the chart
  scaleShowGridLines : true,

  //String - Colour of the grid lines
  scaleGridLineColor : "rgba(0,0,0,.05)",

  //Number - Width of the grid lines
  scaleGridLineWidth : 1,

  //Boolean - Whether to show horizontal lines (except X axis)
  scaleShowHorizontalLines: true,

  //Boolean - Whether to show vertical lines (except Y axis)
  scaleShowVerticalLines: true,

  //Number - Radius of each point dot in pixels (1 by default)
  pointRadius : 1,

  //Number - amount extra to add to the radius to cater for hit detection outside the drawn point
  pointHitDetectionRadius : 1,

  //Boolean - Whether to show a stroke for datasets
  datasetStroke : true,

  //Number - Pixel width of dataset stroke
  datasetStrokeWidth : 2,

  //Boolean - Whether to fill the dataset with a colour
  datasetFill : true,

  //String - A legend template
  legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"><%if(datasets[i].label){%><%=datasets[i].label%><%}%></span></li><%}%></ul>",

  //Boolean - Whether to horizontally center the label and point dot inside the grid
  offsetGridLines : false

};
```

You can override these for your `Chart` instance by passing a second argument into the `Scatter` method as an object with the keys you want to override.

For example, we could make radius of point detection a bit bigger, if we are working with small datasets:

```javascript
new Chart(ctx).Scatter(data, {
	pointHitDetectionRadius: 20
});
// This will create a chart with all of the default options, merged from the global config,
// and the Line chart defaults, but this particular instance will have `bezierCurve` set to false.
```

We can also change these defaults values for each Scatter type that is created, this object is available at `Chart.defaults.Scatter`.


### Prototype methods

#### .getPointsAtEvent( event )

Calling `getPointsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the point elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activePoints = myScatterChart.getPointsAtEvent(evt);
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
