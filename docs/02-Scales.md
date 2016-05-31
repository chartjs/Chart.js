---
title: Scales
anchor: scales
---

Scales in v2.0 of Chart.js are significantly more powerful, but also different than those of v1.0.
* Multiple X & Y axes are supported.
* A built-in label auto-skip feature detects would-be overlapping ticks and labels and removes every nth label to keep things displaying normally.
* Scale titles are supported
* New scale types can be extended without writing an entirely new chart type


### Common Configuration

Every scale extends a core scale class with the following options:

Name | Type | Default | Description
--- | --- | --- | ---
type | String | Chart specific. | Type of scale being employed. Custom scales can be created and registered with a string key. Options: ["category"](#scales-category-scale), ["linear"](#scales-linear-scale), ["logarithmic"](#scales-logarithmic-scale), ["time"](#scales-time-scale), ["radialLinear"](#scales-radial-linear-scale)
display | Boolean | true | If true, show the scale including gridlines, ticks, and labels. Overrides *gridLines.display*, *scaleLabel.display*, and *ticks.display*.
position | String | "left" | Position of the scale. Possible values are 'top', 'left', 'bottom' and 'right'.
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
**gridLines** | Object | - | See [grid line configuration](#scales-grid-line-configuration) section.
**scaleLabel** | Object | | See [scale title configuration](#scales-scale-title-configuration) section.
**ticks** | Object | | See [ticks configuration](#scales-ticks-configuration) section.

#### Grid Line Configuration

The grid line configuration is nested under the scale configuration in the `gridLines` key. It defines options for the grid lines that run perpendicular to the axis.

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | true |
color | Color | "rgba(0, 0, 0, 0.1)" | Color of the grid lines.
lineWidth | Number | 1 | Stroke width of grid lines
drawBorder | Boolean | true | If true draw border on the edge of the chart
drawOnChartArea | Boolean | true | If true, draw lines on the chart area inside the axis lines. This is useful when there are multiple axes and you need to control which grid lines are drawn
drawTicks | Boolean | true |  If true, draw lines beside the ticks in the axis area beside the chart.
tickMarkLength | Number | 10 | Length in pixels that the grid lines will draw into the axis area.
zeroLineWidth | Number | 1 | Stroke width of the grid line for the first index (index 0).
zeroLineColor | Color | "rgba(0, 0, 0, 0.25)" | Stroke color of the grid line for the first index (index 0).
offsetGridLines | Boolean | false | If true, offset labels from grid lines.

#### Scale Title Configuration

The grid line configuration is nested under the scale configuration in the `scaleLabel` key. It defines options for the scale title.

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | false |
labelString | String | "" | The text for the title. (i.e. "# of People", "Response Choices")
fontColor | Color | "#666" | Font color for the scale title.
fontFamily| String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family for the scale title, follows CSS font-family options.
fontSize | Number | 12 | Font size for the scale title.
fontStyle | String | "normal" | Font style for the scale title, follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).

#### Tick Configuration

The grid line configuration is nested under the scale configuration in the `ticks` key. It defines options for the tick marks that are generated by the axis.

Name | Type | Default | Description
--- | --- | --- | ---
autoSkip | Boolean | true | If true, automatically calculates how many labels that can be shown and hides labels accordingly. Turn it off to show all labels no matter what
callback | Function | `function(value) { return '' + value; } ` | Returns the string representation of the tick value as it should be displayed on the chart. See [callback](#scales-creating-custom-tick-formats) section below.
display | Boolean | true | If true, show the ticks.
fontColor | Color | "#666" | Font color for the tick labels.
fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family for the tick labels, follows CSS font-family options.
fontSize | Number | 12 | Font size for the tick labels.
fontStyle | String | "normal" | Font style for the tick labels, follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
labelOffset | Number | 0 | Distance in pixels to offset the label from the centre point of the tick (in the y direction for the x axis, and the x direction for the y axis). *Note: this can cause labels at the edges to be cropped by the edge of the canvas*
maxRotation | Number | 90 | Maximum rotation for tick labels when rotating to condense labels. Note: Rotation doesn't occur until necessary. *Note: Only applicable to horizontal scales.*
minRotation | Number | 0 | Minimum rotation for tick labels. *Note: Only applicable to horizontal scales.*
mirror | Boolean | false | Flips tick labels around axis, displaying the labels inside the chart instead of outside. *Note: Only applicable to vertical scales.*
padding | Number | 10 | Padding between the tick label and the axis. *Note: Only applicable to horizontal scales.*
reverse | Boolean | false | Reverses order of tick labels.

#### Creating Custom Tick Formats

The `callback` method may be used for advanced tick customization. In the following example, every label of the Y axis would be displayed in scientific notation.

If the callback returns `null` or `undefined` the associated grid line will be hidden.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    // Create scientific notation labels
                    callback: function(value, index, values) {
                        return value.toExponential();
                    }
                }
            }]
        }
    }
});
```

### Category Scale

The category scale will be familiar to those who have used v1.0. Labels are drawn in from the labels array included in the chart data.

#### Configuration Options

The category scale has the following additional options that can be set.

Name | Type | Default | Description
--- | --- | --- | ---
ticks.min | String | - | The minimum item to display. Must be a value in the `labels` array
ticks.max | String | - | The maximum item to display. Must be a value in the `labels` array
gridLines.offsetGridLines | Boolean | - | If true, labels are shifted to be between grid lines. This is used in the bar chart.


### Linear Scale

The linear scale is use to chart numerical data. It can be placed on either the x or y axis. The scatter chart type automatically configures a line chart to use one of these scales for the x axis. As the name suggests, linear interpolation is used to determine where a value lies on the axis.

#### Configuration Options

The following options are provided by the linear scale. They are all located in the `ticks` sub options.

Name | Type | Default | Description
--- | --- | --- | ---
beginAtZero | Boolean | - | if true, scale will inclulde 0 if it is not already included.
min | Number | - | User defined minimum number for the scale, overrides minimum value from data.
max | Number | - | User defined maximum number for the scale, overrides maximum value from data.
maxTicksLimit | Number | 11 | Maximum number of ticks and gridlines to show. If not defined, it will limit to 11 ticks but will show all gridlines.
stepSize | Number | - | User defined fixed step size for the scale. If set, the scale ticks will be enumerated by multiple of stepSize, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.
stepSize | Number | - | if defined, it can be used along with the min and the max to give a custom number of steps. See the example below.
suggestedMax | Number | - | User defined maximum number for the scale, overrides maximum value *except for if* it is lower than the maximum value.
suggestedMin | Number | - | User defined minimum number for the scale, overrides minimum value *except for if* it is higher than the minimum value.

#### Example Configuration

The following example creates a line chart with a vertical axis that goes from 0 to 5 in 0.5 sized steps.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    max: 5,
                    min: 0,
                    stepSize: 0.5
                }
            }]
        }
    }
});
```

### Logarithmic Scale

The logarithmic scale is use to chart numerical data. It can be placed on either the x or y axis. As the name suggests, logarithmic interpolation is used to determine where a value lies on the axis.

#### Configuration Options

The following options are provided by the logarithmic scale. They are all located in the `ticks` sub options.

Name | Type | Default | Description
--- | --- | --- | ---
min | Number | - | User defined minimum number for the scale, overrides minimum value from data.
max | Number | - | User defined maximum number for the scale, overrides maximum value from data.

#### Example Configuration

The following example creates a chart with a logarithmic X axis that ranges from 1 to 1000.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                type: 'logarithmic',
                position: 'bottom',
                ticks: {
                    min: 1,
                    max: 1000
                }
            }]
        }
    }
})
```

### Time Scale

The time scale is used to display times and dates. It can only be placed on the X axis. When building its ticks, it will automatically calculate the most comfortable unit base on the size of the scale.

#### Configuration Options

The following options are provided by the logarithmic scale. They are all located in the `time` sub options.

Name | Type | Default | Description
--- | --- | --- | ---
displayFormats | Object | - | See [Display Formats](#scales-display-formats) section below.
isoWeekday | Boolean | false | If true and the unit is set to 'week', iso weekdays will be used.
max | [Time](#scales-date-formats) | - | If defined, this will override the data maximum
min | [Time](#scales-date-formats) | - | If defined, this will override the data minimum
parser | String or Function | - | If defined as a string, it is interpreted as a custom format to be used by moment to parse the date. If this is a function, it must return a moment.js object given the appropriate data value.
round | String | - | If defined, dates will be rounded to the start of this unit. See [Time Units](#scales-time-units) below for the allowed units.
tooltipFormat | String | '' | The moment js format string to use for the tooltip.
unit | String | - | If defined, will force the unit to be a certain type. See [Time Units](#scales-time-units) section below for details.
unitStepSize | Number | 1 | The number of units between grid lines. 

#### Date Formats

When providing data for the time scale, Chart.js supports all of the formats that Moment.js accepts. See [Moment.js docs](http://momentjs.com/docs/#/parsing/) for details.

#### Display Formats

The following display formats are used to configure how different time units are formed into strings for the axis tick marks. See [moment.js](http://momentjs.com/docs/#/displaying/format/) for the allowable format strings.

Name | Default 
--- | --- 
millisecond | 'SSS [ms]'
second | 'h:mm:ss a'
minute | 'h:mm:ss a'
hour | 'MMM D, hA'
day | 'll'
week | 'll'
month | 'MMM YYYY'
quarter | '[Q]Q - YYYY'
year | 'YYYY'

For example, to set the display format for the 'quarter' unit to show the month and year, the following config would be passed to the chart constructor.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    displayFormats: {
                        quarter: 'MMM YYYY'
                    }
                }
            }]
        }
    }
})
```

#### Time Units

The following time measurements are supported. The names can be passed as strings to the `time.unit` config option to force a certain unit.

* millisecond
* second
* minute
* hour
* day
* week
* month
* quarter
* year

For example, to create a chart with a time scale that always displayed units per month, the following config could be used.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                time: {
                    unit: 'month'
                }
            }]
        }
    }
})
```

### Radial Linear Scale

The radial linear scale is used specifically for the radar and polar are chart types. It overlays the chart area, rather than being positioned on one of the edges.

#### Configuration Options

The following additional configuration options are provided by the radial linear scale.

Name | Type | Default | Description
--- | --- | --- | ---
lineArc | Boolean | false | If true, circular arcs are used else straight lines are used. The former is used by the polar area chart and the latter by the radar chart
angleLines | Object | - | See the [Angle Lines](#scales-angle-line-options) section below for details.
pointLabels | Object | - | See the [Point Label](#scales-point-label) section below for details.
ticks | Object | - | See the Ticks table below for options.

#### Angle Line Options

The following options are used to configure angled lines that radiate from the center of the chart to the point labels. They can be found in the `angleLines` sub options. Note that these options only apply if `lineArc` is false.

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | true | If true, angle lines are shown. 
color | Color | 'rgba(0, 0, 0, 0.1)' | Color of angled lines
lineWidth | Number | 1 | Width of angled lines

#### Point Label Options

The following options are used to configure the point labels that are shown on the perimeter of the scale. They can be found in the `pointLabel` sub options. Note that these options only apply if `lineArc` is false.

Name | Type | Default | Description
--- | --- | --- | ---
callback | Function | - | Callback function to transform data label to axis label
fontColor | Color | '#666' | Font color
fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family to render
fontSize | Number | 10 | Font size in pixels
fontStyle | String | 'normal' | Font Style to use


#### Tick Options

Name | Type | Default | Description
--- | --- | --- | ---
backdropColor | Color | 'rgba(255, 255, 255, 0.75)' | Color of label backdrops
backdropPaddingX | Number | 2 | Horizontal padding of label backdrop
backdropPaddingY | Number | 2 | Vertical padding of label backdrop
beginAtZero | Boolean | - | if true, scale will inclulde 0 if it is not already included.
min | Number | - | User defined minimum number for the scale, overrides minimum value from data.
max | Number | - | User defined maximum number for the scale, overrides maximum value from data.
maxTicksLimit | Number | 11 | Maximum number of ticks and gridlines to show. If not defined, it will limit to 11 ticks but will show all gridlines.
showLabelBackdrop | Boolean | true | If true, draw a background behind the tick labels
stepSize | Number | - | User defined fixed step size for the scale. If set, the scale ticks will be enumerated by multiple of stepSize, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.
stepSize | Number | - | if defined, it can be used along with the min and the max to give a custom number of steps. See the example below.
suggestedMax | Number | - | User defined maximum number for the scale, overrides maximum value *except for if* it is lower than the maximum value.
suggestedMin | Number | - | User defined minimum number for the scale, overrides minimum value *except for if* it is higher than the minimum value.

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
