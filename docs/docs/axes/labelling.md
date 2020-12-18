---
title: Labeling Axes
---

When creating a chart, you want to tell the viewer what data they are viewing. To do this, you need to label the axis.

## Scale Title Configuration

The scale label configuration is nested under the scale configuration in the `scaleLabel` key. It defines options for the scale title. Note that this only applies to cartesian axes.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `false` | If true, display the axis title.
| `align` | `string` | `'center'` | Alignment of the axis title. Possible options are `'start'`, `'center'` and `'end'`
| `labelString` | `string` | `''` | The text for the title. (i.e. "# of People" or "Response Choices").
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of label.
| `font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `padding` | `number`\|`object` | `4` | Padding to apply around scale labels. Only `top` and `bottom` are implemented.

## Creating Custom Tick Formats

It is also common to want to change the tick marks to include information about the data type. For example, adding a dollar sign ('$'). To do this, you need to override the `ticks.callback` method in the axis configuration.
In the following example, every label of the Y-axis would be displayed with a dollar sign at the front.

If the callback returns `null` or `undefined` the associated grid line will be hidden.

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

The third parameter passed to the callback function is an array of labels, but in the time scale, it is an array of `{label: string, major: boolean}` objects.
