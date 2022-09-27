# Logarithmic Axis

The logarithmic scale is used to chart numerical data. It can be placed on either the x or y-axis. As the name suggests, logarithmic interpolation is used to determine where a value lies on the axis.

## Configuration Options

!!!include(axes/cartesian/_common.md)!!!

!!!include(axes/_common.md)!!!

## Tick Configuration

### Logarithmic Axis specific options

Namespace: `options.scales[scaleId].ticks`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `format` | `object` | | The [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used by the default label formatter

!!!include(axes/cartesian/_common_ticks.md)!!!

!!!include(axes/_common_ticks.md)!!!

## Internal data format

Internally, the logarithmic scale uses numeric data.
