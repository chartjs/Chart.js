---
title: Getting started
anchor: getting-started
---

###Include Chart.js

First we need to include the Chart.js library on the page. The library occupies a global variable of `Chart`.

```html
<script src="Chart.js"></script>
```

Alternatively, if you're using an AMD loader for JavaScript modules, that is also supported in the Chart.js core. Please note: the library will still occupy a global variable of `Chart`, even if it detects `define` and `define.amd`. If this is a problem, you can call `noConflict` to restore the global Chart variable to its previous owner.

```javascript
// Using requirejs
require(['path/to/Chartjs'], function(Chart){
	// Use Chart.js as normal here.

	// Chart.noConflict restores the Chart global variable to its previous owner
	// The function returns what was previously Chart, allowing you to reassign.
	var Chartjs = Chart.noConflict();

});
```

You can also grab Chart.js using bower:

```bash
bower install Chart.js --save
```

or NPM:

```bash
npm install chart.js --save
```

Also, Chart.js is available from CDN:

https://cdnjs.cloudflare.com/ajax/libs/Chart.js/1.0.2/Chart.min.js

###Creating a chart

To create a chart, we need to instantiate the `Chart` class. To do this, we need to pass in the 2d context of where we want to draw the chart. Here's an example.

```html
<canvas id="myChart" width="400" height="400"></canvas>
```

```javascript
// Get the context of the canvas element we want to select
var ctx = document.getElementById("myChart").getContext("2d");
var myNewChart = new Chart(ctx).PolarArea(data);
```

We can also get the context of our canvas with jQuery. To do this, we need to get the DOM node out of the jQuery collection, and call the `getContext("2d")` method on that.

```javascript
// Get context with jQuery - using jQuery's .get() method.
var ctx = $("#myChart").get(0).getContext("2d");
// This will get the first returned node in the jQuery collection.
var myNewChart = new Chart(ctx);
```

After we've instantiated the Chart class on the canvas we want to draw on, Chart.js will handle the scaling for retina displays.

With the Chart class set up, we can go on to create one of the charts Chart.js has available. In the example below, we would be drawing a Polar area chart.

```javascript
new Chart(ctx).PolarArea(data, options);
```

We call a method of the name of the chart we want to create. We pass in the data for that chart type, and the options for that chart as parameters. Chart.js will merge the global defaults with chart type specific defaults, then merge any options passed in as a second argument after data.

###Global chart configuration

This concept was introduced in Chart.js 1.0 to keep configuration DRY, and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Templates are based on micro templating by John Resig:

http://ejohn.org/blog/javascript-micro-templating/

```javascript
Chart.defaults.global = {
	// Boolean - Whether to animate the chart
	animation: true,

	// Number - Number of animation steps
	animationSteps: 60,

	// String - Animation easing effect
	// Possible effects are:
	// [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
	//  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
	//  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
	//  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
	//  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
	//  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
	//  easeOutElastic, easeInCubic]
	animationEasing: "easeOutQuart",

	// Boolean - If we should show the scale at all
	showScale: true,

	// Boolean - If we want to override with a hard coded scale
	scaleOverride: false,

	// ** Required if scaleOverride is true **
	// Number - The number of steps in a hard coded scale
	scaleSteps: null,
	// Number - The value jump in the hard coded scale
	scaleStepWidth: null,
	// Number - The scale starting value
	scaleStartValue: null,

	// String - Colour of the scale line
	scaleLineColor: "rgba(0,0,0,.1)",

	// Number - Pixel width of the scale line
	scaleLineWidth: 1,

	// Boolean - Whether to show labels on the scale
	scaleShowLabels: true,

	// Interpolated JS string - can access value
	scaleLabel: "<%=value%>",

	// Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
	scaleIntegersOnly: true,

	// Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
	scaleBeginAtZero: false,

	// String - Scale label font declaration for the scale label
	scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

	// Number - Scale label font size in pixels
	scaleFontSize: 12,

	// String - Scale label font weight style
	scaleFontStyle: "normal",

	// String - Scale label font colour
	scaleFontColor: "#666",

	// Boolean - whether or not the chart should be responsive and resize when the browser does.
	responsive: false,

	// Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
	maintainAspectRatio: true,

	// Boolean - Determines whether to draw tooltips on the canvas or not
	showTooltips: true,

	// Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-external-tooltips))
	customTooltips: false,

	// Array - Array of string names to attach tooltip events
	tooltipEvents: ["mousemove", "touchstart", "touchmove"],

	// String - Tooltip background colour
	tooltipFillColor: "rgba(0,0,0,0.8)",

	// String - Tooltip label font declaration for the scale label
	tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

	// Number - Tooltip label font size in pixels
	tooltipFontSize: 14,

	// String - Tooltip font weight style
	tooltipFontStyle: "normal",

	// String - Tooltip label font colour
	tooltipFontColor: "#fff",

	// String - Tooltip title font declaration for the scale label
	tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

	// Number - Tooltip title font size in pixels
	tooltipTitleFontSize: 14,

	// String - Tooltip title font weight style
	tooltipTitleFontStyle: "bold",

	// String - Tooltip title font colour
	tooltipTitleFontColor: "#fff",

	// String - Tooltip title template
	tooltipTitleTemplate: "<%= label%>",

	// Number - pixel width of padding around tooltip text
	tooltipYPadding: 6,

	// Number - pixel width of padding around tooltip text
	tooltipXPadding: 6,

	// Number - Size of the caret on the tooltip
	tooltipCaretSize: 8,

	// Number - Pixel radius of the tooltip border
	tooltipCornerRadius: 6,

	// Number - Pixel offset from point x to tooltip edge
	tooltipXOffset: 10,
	{% raw %}
	// String - Template string for single tooltips
	tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",
	{% endraw %}
	// String - Template string for multiple tooltips
	multiTooltipTemplate: "<%= value %>",

	// Function - Will fire on animation progression.
	onAnimationProgress: function(){},

	// Function - Will fire on animation completion.
	onAnimationComplete: function(){}
}
```

If for example, you wanted all charts created to be responsive, and resize when the browser window does, the following setting can be changed:

```javascript
Chart.defaults.global.responsive = true;
```

Now, every time we create a chart, `options.responsive` will be `true`.
