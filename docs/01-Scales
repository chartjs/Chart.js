---
title: Getting started
anchor: getting-started
---

###Scales

Scales in v2.0 of Chart.js are significantly more powerful, but also different than those of v1.0.
- Multiple x & y axes are now supported.
- A built-in label auto-skip feature now detects would-be overlapping ticks and labels and removes every nth label to keep things displaying normally. 
- Scale labels

Every scale extends a core scale class with the following options:

```javascript
Chart.defaults.scale = {
	display: true,

	// grid line settings
	gridLines: {
		show: true,
		color: "rgba(0, 0, 0, 0.1)",
		lineWidth: 1,
		drawOnChartArea: true,
		drawTicks: true,
		zeroLineWidth: 1,
		zeroLineColor: "rgba(0,0,0,0.25)",
		offsetGridLines: false,
	},

	// scale label
	scaleLabel: {
		fontColor: '#666',
		fontFamily: 'Helvetica Neue',
		fontSize: 12,
		fontStyle: 'normal',

		// actual label
		labelString: '',

		// display property
		show: false,
	},

	// label settings
	ticks: {
		beginAtZero: false,
		fontSize: 12,
		fontStyle: "normal",
		fontColor: "#666",
		fontFamily: "Helvetica Neue",
		maxRotation: 90,
		minRotation: 20,
		mirror: false,
		padding: 10,
		reverse: false,
		show: true,
		template: "<%=value%>",
		userCallback: false,
	},
};
```

The `userCallback` method may be used for advanced tick customization. The following callback would display every label in scientific notation
```javascript
{
    scales: {
        xAxes: [{
            ticks: {
                // Return an empty string to draw the tick line but hide the tick label
                // Return `null` or `undefined` to hide the tick line entirely
               	userCallback: function(value, index, values) {
    				return value.toExponential();
    			}
            }
        }]
    }
}
```

#### Category Scale
The category scale will be familiar to those who have used v1.0. Labels are drawn in from the labels array included in the chart data.

The category scale extends the core scale class with the following tick template:

```javascript
{
	position: "bottom",
}
```

#### Linear Scale
The linear scale can be used to display numerical data. It can be placed on either the x or y axis. The scatter chart type automatically configures a line chart to use one of these scales for the x axis.

The linear scale extends the core scale class with the following tick template:

```javascript
{
	position: "left",
}
```

#### Logarithmic Scale
The logarithmic scale is used to display logarithmic data of course. It can be placed on either the x or y axis.

The log scale extends the core scale class with the following tick template:

```javascript
{
	position: "left",
	ticks: {
		template: "<%var remain = value / (Math.pow(10, Math.floor(Chart.helpers.log10(value))));if (remain === 1 || remain === 2 || remain === 5) {%><%=value.toExponential()%><%} else {%><%= null %><%}%>",
	}
}
```

#### Time Scale
The time scale is used to display times and dates. It can be placed on the x axis. When building its ticks, it will automatically calculate the most comfortable unit base on the size of the scale.

The time scale extends the core scale class with the following tick template:

```javascript
{
	position: "bottom",
	time: {
		// string/callback - By default, date objects are expected. You may use a pattern string from http://momentjs.com/docs/#/parsing/string-format/ to parse a time string format, or use a callback function that is passed the label, and must return a moment() instance.
		format: false,
		// string - By default, unit will automatically be detected.  Override with 'week', 'month', 'year', etc. (see supported time measurements)
		unit: false, 
		// string - By default, no rounding is applied.  To round, set to a supported time unit eg. 'week', 'month', 'year', etc.
		round: false, 
		// string - By default, is set to the detected (or manually overridden) time unit's `display` property (see supported time measurements).  To override, use a pattern string from http://momentjs.com/docs/#/displaying/format/
		displayFormat: false
	},
}
```

The following time measurements are supported:

```javascript
{
	'millisecond': {
		display: 'SSS [ms]', // 002 ms
		maxStep: 1000,
	},
	'second': {
		display: 'h:mm:ss a', // 11:20:01 AM
		maxStep: 60,
	},
	'minute': {
		display: 'h:mm:ss a', // 11:20:01 AM
		maxStep: 60,
	},
	'hour': {
		display: 'MMM D, hA', // Sept 4, 5PM
		maxStep: 24,
	},
	'day': {
		display: 'll', // Sep 4 2015
		maxStep: 7,
	},
	'week': {
		display: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
		maxStep: 4.3333,
	},
	'month': {
		display: 'MMM YYYY', // Sept 2015
		maxStep: 12,
	},
	'quarter': {
		display: '[Q]Q - YYYY', // Q3
		maxStep: 4,
	},
	'year': {
		display: 'YYYY', // 2015
		maxStep: false,
	},
}
```

#### Radial Linear Scale
The radial linear scale is used specifically for the radar chart type.

The radial linear scale extends the core scale class with the following tick template:

```javascript
{
	animate: true,
	lineArc: false,
	position: "chartArea",

	angleLines: {
		show: true,
		color: "rgba(0, 0, 0, 0.1)",
		lineWidth: 1
	},

	// label settings
	ticks: {
		//Boolean - Show a backdrop to the scale label
		showLabelBackdrop: true,

		//String - The colour of the label backdrop
		backdropColor: "rgba(255,255,255,0.75)",

		//Number - The backdrop padding above & below the label in pixels
		backdropPaddingY: 2,

		//Number - The backdrop padding to the side of the label in pixels
		backdropPaddingX: 2,
	},

	pointLabels: {
		//String - Point label font declaration
		fontFamily: "'Arial'",

		//String - Point label font weight
		fontStyle: "normal",

		//Number - Point label font size in pixels
		fontSize: 10,

		//String - Point label font colour
		fontColor: "#666",
	},
}
```
