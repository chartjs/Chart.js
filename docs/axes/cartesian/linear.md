# Linear Axis

The linear scale is used to chart numerical data. It can be placed on either the x or y-axis. The scatter chart type automatically configures a line chart to use one of these scales for the x-axis. As the name suggests, linear interpolation is used to determine where a value lies on the axis.

## Configuration Options

### Linear Axis specific options

Namespace: `options.scales[scaleId]`

| Name | Type | Description
| ---- | ---- | -----------
| `beginAtZero` | `boolean` | if true, scale will include 0 if it is not already included.
| `grace` | `number`\|`string` | Percentage (string ending with `%`) or amount (number) for added room in the scale range above and below data. [more...](#grace)

!!!include(axes/cartesian/_common.md)!!!

!!!include(axes/_common.md)!!!

## Tick Configuration

### Linear Axis specific tick options

Namespace: `options.scales[scaleId].ticks`

| Name | Type | Scriptable | Default | Description
| ---- | ---- | ------- | ------- | -----------
| `count` | `number` | Yes | `undefined` | The number of ticks to generate. If specified, this overrides the automatic generation.
| `format` | `object` | Yes | | The [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used by the default label formatter
| `precision` | `number` | Yes | | if defined and `stepSize` is not specified, the step size will be rounded to this many decimal places.
| `stepSize` | `number` | Yes | | User-defined fixed step size for the scale. [more...](#step-size)

!!!include(axes/cartesian/_common_ticks.md)!!!

!!!include(axes/_common_ticks.md)!!!

## Step Size

If set, the scale ticks will be enumerated by multiple of `stepSize`, having one tick per increment. If not set, the ticks are labeled automatically using the nice numbers algorithm.

This example sets up a chart with a y-axis that creates ticks at `0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5`.

```javascript
let options = {
    scales: {
        y: {
            max: 5,
            min: 0,
            ticks: {
                stepSize: 0.5
            }
        }
    }
};
```

## Grace

If the value is a string ending with `%`, it's treated as a percentage. If a number, it's treated as a value.
The value is added to the maximum data value and subtracted from the minimum data. This extends the scale range as if the data values were that much greater.

```js chart-editor
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: ['Positive', 'Negative'],
  datasets: [{
    data: [100, -50],
    backgroundColor: 'rgb(255, 99, 132)'
  }],
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bar',
  data,
  options: {
    scales: {
      y: {
        type: 'linear',
        grace: '5%'
      }
    },
    plugins: {
      legend: false
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Internal data format

Internally, the linear scale uses numeric data
