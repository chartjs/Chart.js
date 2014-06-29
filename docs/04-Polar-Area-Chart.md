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

### Example usage

```javascript
new Chart(ctx).PolarArea(data, options);
```

### Data structure

```javascript
var data = [
	{
		value: 300,
		color:"#F7464A",
		highlight: "#FF5A5E",
		label: "Red"
	},
	{
		value: 50,
		color: "#46BFBD",
		highlight: "#5AD3D1",
		label: "Green"
	},
	{
		value: 100,
		color: "#FDB45C",
		highlight: "#FFC870",
		label: "Yellow"
	},
	{
		value: 40,
		color: "#949FB1",
		highlight: "#A8B3C5",
		label: "Grey"
	},
	{
		value: 120,
		color: "#4D5360",
		highlight: "#616774",
		label: "Dark Grey"
	}

];
```
As you can see, for the chart data you pass in an array of objects, with a value and a colour. The value attribute should be a number, while the color attribute should be a string. Similar to CSS, for this string you can use HEX notation, RGB, RGBA or HSL.

### Chart options

These are the customisation options specific to Polar Area charts. These options are merged with the [global chart configuration options](#getting-started-global-chart-configuration), and form the options of the chart.

```javascript
{
	//Boolean - Show a backdrop to the scale label
	scaleShowLabelBackdrop : true,

	//String - The colour of the label backdrop
	scaleBackdropColor : "rgba(255,255,255,0.75)",

	// Boolean - Whether the scale should begin at zero
	scaleBeginAtZero : true,

	//Number - The backdrop padding above & below the label in pixels
	scaleBackdropPaddingY : 2,

	//Number - The backdrop padding to the side of the label in pixels
	scaleBackdropPaddingX : 2,

	//Boolean - Show line for each value in the scale
	scaleShowLine : true,

	//Boolean - Stroke a line around each segment in the chart
	segmentShowStroke : true,

	//String - The colour of the stroke on each segement.
	segmentStrokeColor : "#fff",

	//Number - The width of the stroke value in pixels
	segmentStrokeWidth : 2,

	//Number - Amount of animation steps
	animationSteps : 100,

	//String - Animation easing effect.
	animationEasing : "easeOutBounce",

	//Boolean - Whether to animate the rotation of the chart
	animateRotate : true,

	//Boolean - Whether to animate scaling the chart from the centre
	animateScale : false,
	{% raw %}
	//String - A legend template
	legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<segments.length; i++){%><li><span style=\"background-color:<%=segments[i].fillColor%>\"></span><%if(segments[i].label){%><%=segments[i].label%><%}%></li><%}%></ul>"
	{% endraw %}
}
```

You can override these for your `Chart` instance by passing a second argument into the `PolarArea` method as an object with the keys you want to override.

For example, we could have a polar area chart with a black stroke on each segment like so:

```javascript
new Chart(ctx).PolarArea(data, {
	segmentStrokeColor: "#000000"
});
// This will create a chart with all of the default options, merged from the global config,
// and the PolarArea chart defaults but this particular instance will have `segmentStrokeColor` set to `"#000000"`.
```

We can also change these defaults values for each PolarArea type that is created, this object is available at `Chart.defaults.PolarArea`.

### Prototype methods

#### .getSegmentsAtEvent( event )

Calling `getSegmentsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the segment elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
	var activePoints = myPolarAreaChart.getSegmentsAtEvent(evt);
	// => activePoints is an array of segments on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

#### .update( )

Calling `update()` on your Chart instance will re-render the chart with any updated values, allowing you to edit the value of multiple existing points, then render those in one animated render loop.

```javascript
myPolarAreaChart.segments[1].value = 10;
// Would update the first dataset's value of 'Green' to be 10
myPolarAreaChart.update();
// Calling update now animates the position of Green from 50 to 10.
```

#### .addData( segmentData, index )

Calling `addData(segmentData, index)` on your Chart instance passing an object in the same format as in the constructor. There is an option second argument of 'index', this determines at what index the new segment should be inserted into the chart.

```javascript
// An object in the same format as the original data source
myPolarAreaChart.addData({
	value: 130,
	color: "#B48EAD",
	highlight: "#C69CBE",
	label: "Purple"
});
// The new segment will now animate in.
```

#### .removeData( index )

Calling `removeData(index)` on your Chart instance will remove segment at that particular index. If none is provided, it will default to the last segment.

```javascript
myPolarAreaChart.removeData();
// Other segments will update to fill the empty space left.
```