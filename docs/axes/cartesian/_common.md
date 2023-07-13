### Common options to all cartesian axes

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `bounds` | `string` | `'ticks'` | Determines the scale bounds. [more...](./index.md#scale-bounds)
| `clip` | `boolean` | `true` | If true, clip the dataset drawing against the size of the scale instead of chart area
| `position` | `string` \| `object` | | Position of the axis. [more...](./index.md#axis-position)
| `stack` | `string` | | Stack group. Axes at the same `position` with same `stack` are stacked.
| `stackWeight` | `number` | 1 | Weight of the scale in stack group. Used to determine the amount of allocated space for the scale within the group.
| `axis` | `string` | | Which type of axis this is. Possible values are: `'x'`, `'y'`. If not set, this is inferred from the first character of the ID which should be `'x'` or `'y'`.
| `offset` | `boolean` | `false` | If true, extra space is added to the both edges and the axis is scaled to fit into the chart area. This is set to `true` for a bar chart by default.
| `title` | `object` | | Scale title configuration. [more...](../labelling.md#scale-title-configuration)
