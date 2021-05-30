### Common tick options to all axes

Namespace: `options.scales[scaleId].ticks`

| Name | Type | Scriptable | Default | Description
| ---- | ---- | :-------------------------------: | ------- | -----------
| `backdropColor` | [`Color`](../../general/colors.md) | Yes | `'rgba(255, 255, 255, 0.75)'` | Color of label backdrops.
| `backdropPadding` | [`Padding`](../../general/padding.md) | | `2` | Padding of label backdrop.
| `callback` | `function` | | | Returns the string representation of the tick value as it should be displayed on the chart. See [callback](/axes/labelling.md#creating-custom-tick-formats).
| `display` | `boolean` | | `true` | If true, show tick labels.
| `color` | [`Color`](/general/colors.md) | Yes | `Chart.defaults.color` | Color of ticks.
| `font` | `Font` | Yes | `Chart.defaults.font` | See [Fonts](/general/fonts.md)
| `major` | `object` | | `{}` | [Major ticks configuration](/axes/styling.md#major-tick-configuration).
| `padding` | `number` | | `3` | Sets the offset of the tick labels from the axis
| `showLabelBackdrop` | `boolean` | Yes | `true` for radial scale, `false` otherwise | If true, draw a background behind the tick labels.
| `textStrokeColor` | [`Color`](/general/colors.md) | Yes | `` | The color of the stroke around the text.
| `textStrokeWidth` | `number` | Yes | `0` | Stroke width around the text.
| `z` | `number` | | `0` | z-index of tick layer. Useful when ticks are drawn on chart area. Values &lt;= 0 are drawn under datasets, &gt; 0 on top.
