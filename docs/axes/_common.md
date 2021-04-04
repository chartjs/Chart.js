### Common options to all axes

Namespace: `options.scales[scaleId]`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `type` | `string` | | Type of scale being employed. Custom scales can be created and registered with a string key. This allows changing the type of an axis for a chart.
| `alignToPixels` | `boolean` | `false` | Align pixel values to device pixels.
| `backgroundColor` | [`Color`](/general/colors.md) | | Background color of the scale area.
| `display` | `boolean`\|`string` | `true` | Controls the axis global visibility (visible when `true`, hidden when `false`). When `display: 'auto'`, the axis is visible only if at least one associated dataset is visible.
| `grid` | `object` | | Grid line configuration. [more...](/axes/styling.md#grid-line-configuration)
| `min` | `number` | | User defined minimum number for the scale, overrides minimum value from data. [more...](/axes/index.md#axis-range-settings)
| `max` | `number` | | User defined maximum number for the scale, overrides maximum value from data. [more...](/axes/index.md#axis-range-settings)
| `reverse` | `boolean` | `false` | Reverse the scale.
| `stacked` | `boolean`\|`string` | `false` | Should the data be stacked. [more...](/axes/index.md#stacking)
| `suggestedMax` | `number` | | Adjustment used when calculating the maximum data value. [more...](/axes/index.md#axis-range-settings)
| `suggestedMin` | `number` | | Adjustment used when calculating the minimum data value. [more...](/axes/index.md#axis-range-settings)
| `ticks` | `object` | | Tick configuration. [more...](/axes/index.md#tick-configuration)
| `weight` | `number` | `0` | The weight used to sort the axis. Higher weights are further away from the chart area.
