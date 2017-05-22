# TimeSeries Cartesian Axis

The timeseries scale is used to display times and dates. When building its ticks, it automatically calculate dates display format. Unlike time scale it shows all points from all datasets with same distance by x axes.

## Configuration Options

The following options are provided by the timeseries scale. They are all located in the `time` sub options. These options extend the [common tick configuration](README.md#tick-configuration).

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `displayFormats` | `Object` | | Sets how different time units are displayed. [more...](#display-formats)
| `parser` | `String` or `Function` | | Custom parser for dates. [more...](#parser)
| `round` | `String` | `false` | If defined, dates will be rounded to the start of this unit. See [Time Units](#scales-time-units) below for the allowed units.
| `tooltipFormat` | `String` | | The moment js format string to use for the tooltip.
| `unit` | `String` | `false` | If defined, will force the unit to be a certain type. See [Time Units](#scales-time-units) section below for details.
| `minUnit` | `String` | `millisecond` | The minimum display format to be used for a time unit.

## Date Formats

When providing data for the time scale, Chart.js supports all of the formats that Moment.js accepts. See [Moment.js docs](http://momentjs.com/docs/#/parsing/) for details.

## Time Units

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
var chart = new Chart(ctx, {
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

## Display Formats
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
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            xAxes: [{
                type: 'timeseries',
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

## Parser
If this property is defined as a string, it is interpreted as a custom format to be used by moment to parse the date.

If this is a function, it must return a moment.js object given the appropriate data value.
