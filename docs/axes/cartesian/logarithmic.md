# Logarithmic Cartesian Axis

The logarithmic scale is use to chart numerical data. It can be placed on either the x or y axis. As the name suggests, logarithmic interpolation is used to determine where a value lies on the axis.

## Tick Configuration Options

The following options are provided by the logarithmic scale. They are all located in the `ticks` sub options. These options extend the [common tick configuration](README.md#tick-configuration).

| Name | Type | Default | Description
| -----| ---- | --------| -----------
| `min` | `Number` | | User defined minimum number for the scale, overrides minimum value from data.
| `max` | `Number` | | User defined maximum number for the scale, overrides maximum value from data.