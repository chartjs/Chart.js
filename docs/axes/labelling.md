# Labeling Axes

When creating a chart, you want to tell the viewer what data they are viewing. To do this, you need to label the axis.

## Scale Title Configuration

Namespace: `options.scales[scaleId].title`, it defines options for the scale title. Note that this only applies to cartesian axes.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `false` | If true, display the axis title.
| `align` | `string` | `'center'` | Alignment of the axis title. Possible options are `'start'`, `'center'` and `'end'`
| `text` | `string`\|`string[]` | `''` | The text for the title. (i.e. "# of People" or "Response Choices").
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of label.
| `font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `padding` | [`Padding`](../general/padding.md) | `4` | Padding to apply around scale labels. Only `top` and `bottom` are implemented.

## Creating Custom Tick Formats

It is also common to want to change the tick marks to include information about the data type. For example, adding a dollar sign ('$').
To do this, you need to override the `ticks.callback` method in the axis configuration.

The method receiver 3 arguments:

* `value` - the tick value in the **internal data format** of the associated scale.
* `index` - the tick index in the ticks array.
* `ticks` - the array containing all of the [tick objects](../api/interfaces/tick).

The call to the method is scoped to the scale. `this` inside the method is the scale object.

If the callback returns `null` or `undefined` the associated grid line will be hidden.

:::tip
The [category axis](../axes/cartesian/category), which is the default x-axis for line and bar charts, uses the `index` as internal data format. For accessing the label, use `this.getLabelForValue(value)`. [API: getLabelForValue](../api/classes/scale.html#getlabelforvalue)
:::

In the following example, every label of the Y-axis would be displayed with a dollar sign at the front.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            y: {
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                    }
                }
            }
        }
    }
});
```

Related samples:

* [Tick configuration sample](../samples/scale-options/ticks)
