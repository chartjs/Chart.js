---
title: Scales
anchor: scales
---

Scales in v2.0 of Chart.js are significantly more powerful, but also different than those of v1.0.
* Multiple x & y axes are now supported.
* A built-in label auto-skip feature now detects would-be overlapping ticks and labels and removes every nth label to keep things displaying normally.
* Scale titles are now supported
* New scale types can be extended without writing an entirely new chart type

Every scale extends a core scale class with the following options:

Name | Type | Default | Description
--- |:---:| --- | ---
type | String | Chart specific. | Type of scale being employed. Custom scales can be created and registered with a string key. Options: ["category"](#scales-category-scale), ["linear"](#scales-linear-scale), ["logarithmic"](#scales-logarithmic-scale), ["time"](#scales-time-scale), ["radialLinear"](#scales-radial-linear-scale)
display | Boolean | true | If true, show the scale including gridlines, ticks, and labels. Overrides *gridLines.display*, *scaleLabel.display*, and *ticks.display*.
position | String | "left" | Position of the scale. Possible values are top, left, bottom and right.
beforeUpdate | Function | undefined | Callback called before the update process starts. Passed a single argument, the scale instance.
beforeSetDimensions | Function | undefined | Callback that runs before dimensions are set. Passed a single argument, the scale instance.
afterSetDimensions | Function | undefined | Callback that runs after dimensions are set. Passed a single argument, the scale instance.
beforeDataLimits | Function | undefined | Callback that runs before data limits are determined. Passed a single argument, the scale instance.
afterDataLimits | Function | undefined | Callback that runs after data limits are determined. Passed a single argument, the scale instance.
beforeBuildTicks | Function | undefined | Callback that runs before ticks are created. Passed a single argument, the scale instance.
afterBuildTicks | Function | undefined | Callback that runs after ticks are created. Useful for filtering ticks. Passed a single argument, the scale instance.
beforeTickToLabelConversion | Function | undefined | Callback that runs before ticks are converted into strings. Passed a single argument, the scale instance.
afterTickToLabelConversion | Function | undefined | Callback that runs after ticks are converted into strings. Passed a single argument, the scale instance.
beforeCalculateTickRotation | Function | undefined | Callback that runs before tick rotation is determined. Passed a single argument, the scale instance.
afterCalculateTickRotation | Function | undefined | Callback that runs after tick rotation is determined. Passed a single argument, the scale instance.
beforeFit | Function | undefined | Callback that runs before the scale fits to the canvas. Passed a single argument, the scale instance.
afterFit | Function | undefined | Callback that runs after the scale fits to the canvas. Passed a single argument, the scale instance.
afterUpdate | Function | undefined | Callback that runs at the end of the update process. Passed a single argument, the scale instance.
**gridLines** | Object | - | Options for the grid lines that run perpendicular to the axis.
*gridLines*.display | Boolean | true |
*gridLines*.color | Color | "rgba(0, 0, 0, 0.1)" | Color of the grid lines.
*gridLines*.lineWidth | Number | 1 | Stroke width of grid lines
*gridLines*.drawOnChartArea | Boolean | true | If true, draw lines on the chart area inside the axis lines. This is useful when there are multiple axes and you need to control which grid lines are drawn
*gridLines*.drawTicks | Boolean | true |  If true, draw lines beside the ticks in the axis area beside the chart.
*gridLines*.tickMarkLength | Number | 10 | Length in pixels that the grid lines will draw into the axis area.
*gridLines*.zeroLineWidth | Number | 1 | Stroke width of the grid line for the first index (index 0).
*gridLines*.zeroLineColor | Color | "rgba(0, 0, 0, 0.25)" | Stroke color of the grid line for the first index (index 0).
*gridLines*.offsetGridLines | Boolean | false | If true, offset labels from grid lines.
**scaleLabel** | Object | | Title for the entire axis.
*scaleLabel*.display | Boolean | false |
*scaleLabel*.labelString | String | "" | The text for the title. (i.e. "# of People", "Response Choices")
*scaleLabel*.fontColor | Color | "#666" | Font color for the scale title.
*scaleLabel*.fontFamily| String | "Helvetica Neue" | Font family for the scale title, follows CSS font-family options.
*scaleLabel*.fontSize | Number | 12 | Font size for the scale title.
*scaleLabel*.fontStyle | String | "normal" | Font style for the scale title, follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
**ticks** | Object | | Settings for the labels that run along the axis.
*ticks*.beginAtZero | Boolean | false | If true the scale will be begin at 0, if false the ticks will begin at your smallest data value.
*ticks*.fontColor | Color | "#666" | Font color for the tick labels.
*ticks*.fontFamily | String | "Helvetica Neue" | Font family for the tick labels, follows CSS font-family options.
*ticks*.fontSize | Number | 12 | Font size for the tick labels.
*ticks*.fontStyle | String | "normal" | Font style for the tick labels, follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
*ticks*.maxRotation | Number | 90 | Maximum rotation for tick labels when rotating to condense labels. Note: Rotation doesn't occur until necessary. *Note: Only applicable to horizontal scales.*
*ticks*.minRotation | Number |  20 | *currently not-implemented* Minimum rotation for tick labels when condensing is necessary.  *Note: Only applicable to horizontal scales.*
*ticks*.maxTicksLimit | Number | 11 | Maximum number of ticks and gridlines to show. If not defined, it will limit to 11 ticks but will show all gridlines.
*ticks*.padding | Number | 10 | Padding between the tick label and the axis. *Note: Only applicable to horizontal scales.*
*ticks*.labelOffset | Number | 0 | Distance in pixels to offset the label from the centre point of the tick (in the y direction for the x axis, and the x direction for the y axis). *Note: this can cause labels at the edges to be cropped by the edge of the canvas*
*ticks*.mirror | Boolean | false | Flips tick labels around axis, displaying the labels inside the chart instead of outside. *Note: Only applicable to vertical scales.*
*ticks*.reverse | Boolean | false | Reverses order of tick labels.
*ticks*.display | Boolean | true | If true, show the ticks.
*ticks*.suggestedMin | Number | - | User defined minimum number for the scale, overrides minimum value *except for if* it is higher than the minimum value.
*ticks*.suggestedMax | Number | - | User defined maximum number for the scale, overrides maximum value *except for if* it is lower than the maximum value.
*ticks*.min | Number | - | User defined minimum number for the scale, overrides minimum value.
*ticks*.max | Number | - | User defined minimum number for the scale, overrides maximum value
*ticks*.autoSkip | Boolean | true | If true, automatically calculates how many labels that can be shown and hides labels accordingly. Turn it off to show all labels no matter what
*ticks*.callback | Function | `function(value) { return '' + value; } ` | Returns the string representation of the tick value as it should be displayed on the chart.

The `callback` method may be used for advanced tick customization. The following callback would display every label in scientific notation
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

### Category Scale
The category scale will be familiar to those who have used v1.0. Labels are drawn in from the labels array included in the chart data.

The category scale extends the core scale class with the following tick template:

```javascript
{
	position: "bottom",
}
```

The `ticks.min` and `ticks.max` attributes may be used with the category scale. Unlike other scales, the value of these attributes must simply be something that can be found in the `labels` array of the data object.

### Linear Scale
The linear scale can be used to display numerical data. It can be placed on either the x or y axis. The scatter chart type automatically configures a line chart to use one of these scales for the x axis.

The linear scale extends the core scale class with the following tick template:

```javascript
{
	position: "left",
    ticks: {
        callback: function(tickValue, index, ticks) {
            var delta = ticks[1] - ticks[0];

            // If we have a number like 2.5 as the delta, figure out how many decimal places we need
            if (Math.abs(delta) > 1) {
                if (tickValue !== Math.floor(tickValue)) {
                    // not an integer
                    delta = tickValue - Math.floor(tickValue);
                }
            }

            var logDelta = helpers.log10(Math.abs(delta));
            var tickString = '';

            if (tickValue !== 0) {
                var numDecimal = -1 * Math.floor(logDelta);
                numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
                tickString = tickValue.toFixed(numDecimal);
            } else {
            	tickString = '0'; // never show decimal places for 0
            }

      		return tickString;
      	}
    }
}
```

It also provides additional configuration options:

Name | Type | Default | Description
--- |:---:| --- | ---
*ticks*.stepSize | Number | - | User defined fixed step size for the scale. If set, the scale ticks will be enumerated by multiple of stepSize, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.

### Logarithmic Scale
The logarithmic scale is used to display logarithmic data of course. It can be placed on either the x or y axis.

The log scale extends the core scale class with the following tick template:

```javascript
{
	position: "left",
	ticks: {
		callback: function(value) {
			var remain = value / (Math.pow(10, Math.floor(Chart.helpers.log10(value))));

        	if (remain === 1 || remain === 2 || remain === 5) {
        		return value.toExponential();
        	} else {
        		return '';
        	}
        }
	}
}
```

### Time Scale
The time scale is used to display times and dates. It can be placed on the x axis. When building its ticks, it will automatically calculate the most comfortable unit base on the size of the scale.

The time scale extends the core scale class with the following tick template:

```javascript
{
	position: "bottom",
	time: {
		// string/callback - By default, date objects are expected. You may use a pattern string from http://momentjs.com/docs/#/parsing/string-format/ to parse a time string format, or use a callback function that is passed the label, and must return a moment() instance.
		parser: false,
		// string - By default, unit will automatically be detected.  Override with 'week', 'month', 'year', etc. (see supported time measurements)
		unit: false,

		// Number - The number of steps of the above unit between ticks
		unitStepSize: 1

		// string - By default, no rounding is applied.  To round, set to a supported time unit eg. 'week', 'month', 'year', etc.
		round: false,

		// Moment js for each of the units. Replaces `displayFormat`
		// To override, use a pattern string from http://momentjs.com/docs/#/displaying/format/
		displayFormats: {
			'millisecond': 'SSS [ms]',
			'second': 'h:mm:ss a', // 11:20:01 AM
			'minute': 'h:mm:ss a', // 11:20:01 AM
			'hour': 'MMM D, hA', // Sept 4, 5PM
			'day': 'll', // Sep 4 2015
			'week': 'll', // Week 46, or maybe "[W]WW - YYYY" ?
			'month': 'MMM YYYY', // Sept 2015
			'quarter': '[Q]Q - YYYY', // Q3
			'year': 'YYYY', // 2015
		},
		// Sets the display format used in tooltip generation
		tooltipFormat: ''
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

### Radial Linear Scale
The radial linear scale is used specifically for the radar chart type.

The radial linear scale extends the core scale class with the following tick template:

```javascript
{
	animate: true,
	lineArc: false,
	position: "chartArea",

	angleLines: {
		display: true,
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

		//Number - Limit the maximum number of ticks and gridlines
		maxTicksLimit: 11,
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

		//Function - Used to determine point labels to show in scale
		callback: function(pointLabel) {
			return pointLabel;
		}
	},
}
```

### Update Default Scale config
The default configuration for a scale can be easily changed using the scale service. Pass in a partial configuration that will be merged with the current scale default configuration.

For example, to set the minimum value of 0 for all linear scales, you would do the following. Any linear scales created after this time would now have a minimum of 0.
```
Chart.scaleService.updateScaleDefaults('linear', {
	ticks: {
		min: 0
	}
})
```
