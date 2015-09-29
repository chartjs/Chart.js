---
title: Radar Chart
anchor: radar-chart
---

###Introduction
A radar chart is a way of showing multiple data points and the variation between them.

They are often useful for comparing the points of two or more different data sets.

<div class="canvas-holder">
	<canvas width="250" height="125"></canvas>
</div>

###Example usage

```javascript
var myRadarChart = new Chart(ctx).Radar(data, options);
```

###Data structure
```javascript
var data = {
	labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
	datasets: [
		{
			label: "My First dataset",
			fillColor: "rgba(220,220,220,0.2)",
			strokeColor: "rgba(220,220,220,1)",
			pointColor: "rgba(220,220,220,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(220,220,220,1)",
			data: [65, 59, 90, 81, 56, 55, 40]
		},
		{
			label: "My Second dataset",
			fillColor: "rgba(151,187,205,0.2)",
			strokeColor: "rgba(151,187,205,1)",
			pointColor: "rgba(151,187,205,1)",
			pointStrokeColor: "#fff",
			pointHighlightFill: "#fff",
			pointHighlightStroke: "rgba(151,187,205,1)",
			data: [28, 48, 40, 19, 96, 27, 100]
		}
	]
};
```
For a radar chart, to provide context of what each point means, we include an array of strings that show around each point in the chart.
For the radar chart data, we have an array of datasets. Each of these is an object, with a fill colour, a stroke colour, a colour for the fill of each point, and a colour for the stroke of each point. We also have an array of data values.

The label key on each dataset is optional, and can be used when generating a scale for the chart.

### Chart options

These are the customisation options specific to Radar charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.


```javascript
{
	//Boolean - Whether to show lines for each scale point
	scaleShowLine : true,

	//Boolean - Whether we show the angle lines out of the radar
	angleShowLineOut : true,

	//Boolean - Whether to show labels on the scale
	scaleShowLabels : false,

	// Boolean - Whether the scale should begin at zero
	scaleBeginAtZero : true,

	//String - Colour of the angle line
	angleLineColor : "rgba(0,0,0,.1)",

	//Number - Pixel width of the angle line
	angleLineWidth : 1,

	//String - Point label font declaration
	pointLabelFontFamily : "'Arial'",

	//String - Point label font weight
	pointLabelFontStyle : "normal",

	//Number - Point label font size in pixels
	pointLabelFontSize : 10,

	//String - Point label font colour
	pointLabelFontColor : "#666",

	//Boolean - Whether to show a dot for each point
	pointDot : true,

	//Number - Radius of each point dot in pixels
	pointDotRadius : 3,

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
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
	{% endraw %}
}
```


You can override these for your `Chart` instance by passing a second argument into the `Radar` method as an object with the keys you want to override.

For example, we could have a radar chart without a point for each on piece of data by doing the following:

```javascript
new Chart(ctx).Radar(data, {
	pointDot: false
});
// This will create a chart with all of the default options, merged from the global config,
//  and the Bar chart defaults but this particular instance will have `pointDot` set to false.
```

We can also change these defaults values for each Radar type that is created, this object is available at `Chart.defaults.Radar`.


### Prototype methods

#### .getPointsAtEvent( event )

Calling `getPointsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the point elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activePoints = myRadarChart.getPointsAtEvent(evt);
	// => activePoints is an array of points on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myRadarChart.datasets[0].points[2].value = 50;
// Would update the first dataset's value of 'Sleeping' to be 50
myRadarChart.update();
// Calling update now animates the position of Sleeping from 90 to 50.
```

#### .addData( valuesArray, label )

Calling `addData(valuesArray, label)` on your Chart instance passing an array of values for each dataset, along with a label for those points.

```javascript
// The values array passed into addData should be one for each dataset in the chart
myRadarChart.addData([40, 60], "Dancing");
// The new data will now animate at the end of the chart.
```

#### .removeData( )

Calling `removeData()` on your Chart instance will remove the first value for all datasets on the chart.

```javascript
myRadarChart.removeData();
// Other points will now animate to their correct positions.
```