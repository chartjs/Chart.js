# Time Cartesian Axis

The time scale is used to display times and dates. Data are spread according to the amount of time between data points. When building its ticks, it will automatically calculate the most comfortable unit base on the size of the scale.

## Date Adapters

The time scale **requires** both a date library and a corresponding adapter to be present. Please choose from the [available adapters](https://github.com/chartjs/awesome#adapters).

## Data Sets

### Input Data

See [data structures](../../general/data-structures.md).

### Date Formats

When providing data for the time scale, Chart.js uses timestamps defined as milliseconds since the epoch (midnight January 1, 1970, UTC) internally. However, Chart.js also supports all of the formats that your chosen date adapter accepts. You should use timestamps if you'd like to set `parsing: false` for better performance.

## Configuration Options

### Time Axis specific options

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `min` | `number`\|`string` | | The minimum item to display. [more...](#min-max-configuration)
| `max` | `number`\|`string` | | The maximum item to display. [more...](#min-max-configuration)
| `suggestedMin` | `number`\|`string` | | The minimum item to display if there is no datapoint before it. [more...](../index.md#axis-range-settings)
| `suggestedMax` | `number`\|`string` | | The maximum item to display if there is no datapoint behind it. [more...](../index.md#axis-range-settings)
| `adapters.date` | `object` | `{}` | Options for adapter for external date library if that adapter needs or supports options
| `bounds` | `string` | `'data'` | Determines the scale bounds. [more...](./index.md#scale-bounds)
| `offsetAfterAutoskip` | `boolean` | `false` | If true, bar chart offsets are computed with auto skipped ticks.
| `ticks.source` | `string` | `'auto'` | How ticks are generated. [more...](#ticks-source)
| `time.displayFormats` | `object` | | Sets how different time units are displayed. [more...](#display-formats)
| `time.isoWeekday` | `boolean`\|`number` | `false` | If `boolean` and true and the unit is set to 'week', then the first day of the week will be Monday. Otherwise, it will be Sunday. If `number`, the index of the first day of the week (0 - Sunday, 6 - Saturday)
| `time.parser` | `string`\|`function` | | Custom parser for dates. [more...](#parser)
| `time.round` | `string` | `false` | If defined, dates will be rounded to the start of this unit. See [Time Units](#time-units) below for the allowed units.
| `time.tooltipFormat` | `string` | | The format string to use for the tooltip.
| `time.unit` | `string` | `false` | If defined, will force the unit to be a certain type. See [Time Units](#time-units) section below for details.
| `time.minUnit` | `string` | `'millisecond'` | The minimum display format to be used for a time unit.

!!!include(axes/cartesian/_common.md)!!!

!!!include(axes/_common.md)!!!

#### Time Units

The following time measurements are supported. The names can be passed as strings to the `time.unit` config option to force a certain unit.

* `'millisecond'`
* `'second'`
* `'minute'`
* `'hour'`
* `'day'`
* `'week'`
* `'month'`
* `'quarter'`
* `'year'`

For example, to create a chart with a time scale that always displayed units per month, the following config could be used.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month'
                }
            }
        }
    }
});
```

#### Display Formats

You may specify a map of display formats with a key for each unit:

* `millisecond`
* `second`
* `minute`
* `hour`
* `day`
* `week`
* `month`
* `quarter`
* `year`

The format string used as a value depends on the date adapter you chose to use.

For example, to set the display format for the `quarter` unit to show the month and year, the following config might be passed to the chart constructor.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    displayFormats: {
                        quarter: 'MMM YYYY'
                    }
                }
            }
        }
    }
});
```

#### Ticks Source

The `ticks.source` property controls the ticks generation.

* `'auto'`: generates "optimal" ticks based on scale size and time options
* `'data'`: generates ticks from data (including labels from data `{x|y}` objects)
* `'labels'`: generates ticks from user given `labels` ONLY

#### Parser

If this property is defined as a string, it is interpreted as a custom format to be used by the date adapter to parse the date.

If this is a function, it must return a type that can be handled by your date adapter's `parse` method.

## Min Max Configuration

For both the `min` and `max` properties, the value must be `string` that is parsable by your date adapter or a number with the amount of milliseconds that have elapsed since UNIX epoch.
In the example below the x axis will start at 7 November 2021.

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [{
                x: '2021-11-06 23:39:30',
                y: 50
            }, {
                x: '2021-11-07 01:00:28',
                y: 60
            }, {
                x: '2021-11-07 09:00:28',
                y: 20
            }]
        }],
    },
    options: {
        scales: {
            x: {
                min: '2021-11-07 00:00:00',
            }
        }
    }
});
```

## Changing the scale type from Time scale to Logarithmic/Linear scale.

When changing the scale type from Time scale to Logarithmic/Linear scale, you need to add `bounds: 'ticks'` to the scale options. Changing the `bounds` parameter is necessary because its default value is the `'data'` for the Time scale.

Initial config:

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'time',
            }
        }
    }
});
```

Scale update:

```javascript
chart.options.scales.x = {
    type: 'logarithmic',
    bounds: 'ticks'
};
```

## Internal data format

Internally time scale uses milliseconds since epoch
