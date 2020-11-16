### Common to all axes

| Name | Type | Scriptable | Default | Description
| ---- | ---- | :-------------------------------: | ------- | -----------
| `callback` | `function` | | | Returns the string representation of the tick value as it should be displayed on the chart. See [callback](../axes/labelling.md#creating-custom-tick-formats).
| `display` | `boolean` | | `true` | If true, show tick labels.
| `font` | `Font` | Yes | `defaults.font` | See [Fonts](../general/fonts.md)
| `major` | `object` | | `{}` | [Major ticks configuration](./styling.mdx#major-tick-configuration).
| `padding` | `number` | | `0` | Sets the offset of the tick labels from the axis
| `z` | `number` | | `0` | z-index of tick layer. Useful when ticks are drawn on chart area. Values &lt;= 0 are drawn under datasets, &gt; 0 on top.
