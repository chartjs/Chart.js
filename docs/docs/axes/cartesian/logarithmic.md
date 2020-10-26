---
title: Logarithmic Axis
---

The logarithmic scale is used to chart numerical data. It can be placed on either the x or y-axis. As the name suggests, logarithmic interpolation is used to determine where a value lies on the axis.

## Configuration Options

These options extend the [common configuration for all cartesian axes](index.md#configuration-options).

| Name | Type | Description
| ---- | ---- | -----------
| `suggestedMax` | `number` | Adjustment used when calculating the maximum data value. [more...](#axis-range-settings)
| `suggestedMin` | `number` | Adjustment used when calculating the minimum data value. [more...](#axis-range-settings)

## Tick Configuration Options

The following options are provided by the logarithmic scale. They are all located in the `ticks` sub-options. These options extend the [common tick configuration](index.md#tick-configuration).

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `format` | `object` | | The [`Intl.NumberFormat`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat) options used by the default label formatter

## Internal data format

Internally, the logarithmic scale uses numeric data.
