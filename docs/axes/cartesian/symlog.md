# Symlog Axis

The symlog (symmetric logarithmic) scale is used to chart numerical data that spans many orders of magnitude and also contains zero or negative values, which a [logarithmic axis](./logarithmic.md) cannot show. It can be placed on either the x or y-axis.

Values close to zero are spaced almost linearly and values far from zero almost logarithmically, on both sides of zero, with a gradual transition in between. A value `x` is placed at `sign(x) * ln(1 + |x| / linearThreshold)`, so zero sits at the origin, `x` and `-x` are mirrored around it, and each order of magnitude gets the same amount of space once values are well past `linearThreshold`.

```js chart-editor
// <block:setup:1>
const data = {
  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'],
  datasets: [{
    label: 'Change from baseline',
    data: [-4200, -150, 0, 0, 35, 87000, 61000000],
    backgroundColor: 'rgb(54, 162, 235)'
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bar',
  data,
  options: {
    scales: {
      y: {
        type: 'symlog'
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Configuration Options

### Symlog Axis specific options

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `beginAtZero` | `boolean` | `false` | if true, scale will include 0 if it is not already included.
| `grace` | `number`\|`string` | `0` | Percentage (string ending with `%`) or amount (number) for added room in the scale range above and below data. [more...](#grace)
| `linearThreshold` | `number` | `1` | How far from zero the scale stays close to linear; the change to logarithmic spacing is gradual. [more...](#linear-threshold)

!!!include(axes/cartesian/_common.md)!!!

!!!include(axes/_common.md)!!!

## Tick Configuration

### Symlog Axis specific tick options

Namespace: `options.scales[scaleId].ticks`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `format` | `object` | | The [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used by the default label formatter. [more...](#tick-labels)

!!!include(axes/cartesian/_common_ticks.md)!!!

!!!include(axes/_common_ticks.md)!!!

## Linear Threshold

`linearThreshold` sets how far from zero the scale stays close to linear. It defaults to `1`, which suits counts. There is no cutoff at `linearThreshold`: the spacing changes gradually, from almost linear for values much smaller than `linearThreshold` to almost logarithmic for values much larger than it. With the default of `1`, `0.1` and `0.2` are spaced almost linearly and `1,000` and `10,000` almost a full order of magnitude apart, while values around `1` are spaced somewhere in between. It must be a positive number; any other value logs a warning and `1` is used instead.

With `linearThreshold: 100`, for example, `-10`, `-5`, `0`, `5` and `10` come out almost evenly spaced, and the ticks picked between `-100` and `100` are evenly spaced values. A smaller threshold gives small values more room on the axis: with `linearThreshold: 10`, the values between 0 and 100 take up more of the axis than they do with `100`.

```javascript
let options = {
    scales: {
        y: {
            type: 'symlog',
            linearThreshold: 100
        }
    }
};
```

## Differences from the linear axis

The symlog axis supports the same range options as the [linear axis](./linear.md): `min`, `max`, `suggestedMin`, `suggestedMax`, `beginAtZero`, `reverse` and `bounds` behave the same way. The differences are listed below.

### Grace

* A percentage (string ending with `%`) is applied in the scale's logarithmic space, as a share of the axis length. On a linear axis it is a share of the value range instead; applied that way here, `grace: '10%'` on data from 0 to 100,000,000 would add about seven orders of magnitude of empty axis below zero.
* A number is an amount in data units, the same as on a linear axis.
* Ends set with `min` or `max` are not padded, and with `beginAtZero: true` an end at 0 stays at 0.
* Grace also widens the axis with `bounds: 'data'`. The linear axis does not apply grace to its range in that case.

### Axis range with `bounds: 'ticks'`

With the default `bounds: 'ticks'`, ends that are not set with `min` or `max` are rounded outward to a round number: one significant digit on wide ranges (data up to 120,000,000 ends at 200,000,000), or a multiple of the tick step on ranges that are narrow next to their values (data from 4000 to 4010 ends at 4000 and 4010).

### Ignored tick options

`ticks.stepSize`, `ticks.count` and `ticks.precision` have no effect on a symlog axis. Ticks are never flagged as major, so the [major tick options](../styling.md#major-tick-configuration) have no effect either.

### How ticks are picked

Tick values are chosen from:

* `0`, when it is in range,
* the axis ends, with `bounds: 'ticks'`, or `min` and `max` when `includeBounds` is true,
* powers of ten outside of `-linearThreshold` to `linearThreshold`, or every second, third, etc. power of ten when they would be too close together,
* evenly spaced values inside `-linearThreshold` to `linearThreshold`, and over ranges that are narrow next to their values,
* 2 and 5 times the powers of ten, when every order of magnitude on the axis has room for them.

Ticks are kept in that order of importance, as long as their labels leave enough room to the ticks already kept. `ticks.maxTicksLimit` (default `11`) sets how dense the ticks may be; `0` and the axis ends may sit a little closer to a neighbouring tick as long as their labels do not overlap. When an axis end is not a tick itself, for example with `bounds: 'data'`, one more round value may be added between the outermost tick and that end.

Label sizes are measured while picking ticks, so `ticks.callback` is also called for values that do not end up as ticks. It always receives the actual tick values.

### Tick labels

The default label formatter is `Chart.Ticks.formatters.symlog`. All labels on an axis use the same style:

* Compact notation in the chart's locale, for example `-10K`, `0`, `100`, `1M`, `100M`.
* Plain grouped numbers when the compact form, at up to 3 significant digits, cannot tell neighbouring ticks apart, for example `4,000`, `4,002` ... `4,010` or `98,000`, `98,500` ... `102,500`. Decimals are chosen like on the linear axis.
* Scientific notation when the axis reaches 1e15 or more, or when every tick is smaller than 1e-4.

Each label keeps the digits its value needs, so a `min` of `3999.5` is shown as `3.9995K` or `3,999.5` rather than `4K`. The `ticks.format` options are merged into the [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used for every label, for example `format: {notation: 'standard'}` to always show plain numbers. Tooltips show the full value.

## Internal data format

Internally, the symlog scale uses numeric data. Negative values and zero are supported.
