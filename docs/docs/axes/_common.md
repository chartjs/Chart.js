### Common to all axes

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `type` | `string` | | Type of scale being employed. Custom scales can be created and registered with a string key. This allows changing the type of an axis for a chart.
| `display` | `boolean`\|`string` | `true` | Controls the axis global visibility (visible when `true`, hidden when `false`). When `display: 'auto'`, the axis is visible only if at least one associated dataset is visible.
| `gridLines` | `object` | | Grid line configuration. [more...](./styling.mdx#grid-line-configuration)
| `min` | `number` | | User defined minimum number for the scale, overrides minimum value from data. [more...](./index.mdx#axis-range-settings)
| `max` | `number` | | User defined maximum number for the scale, overrides maximum value from data. [more...](./index.mdx#axis-range-settings)
| `reverse` | `boolean` | `false` | Reverse the scale.
| `suggestedMax` | `number` | | Adjustment used when calculating the maximum data value. [more...](./index.mdx#axis-range-settings)
| `suggestedMin` | `number` | | Adjustment used when calculating the minimum data value. [more...](./index.mdx#axis-range-settings)
| `ticks` | `object` | | Tick configuration. [more...](#tick-configuration)
| `weight` | `number` | `0` | The weight used to sort the axis. Higher weights are further away from the chart area.
