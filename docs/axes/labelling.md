# Labeling Axes

When creating a chart, you want to tell the viewer what data they are viewing. To do this, you need to label the axis.

## Scale Title Configuration

The scale label configuration is nested under the scale configuration in the `scaleLabel` key. It defines options for the scale title. Note that this only applies to cartesian axes.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `false` | If true, display the axis title.
| `labelString` | `string` | `''` | The text for the title. (i.e. "# of People" or "Response Choices").
| `lineHeight` | <code>number&#124;string</code> | `1.2` | Height of an individual line of text (see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)).
| `fontColor` | `Color` | `'#666'` | Font color for scale title.
| `fontFamily` | `string` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Font family for the scale title, follows CSS font-family options.
| `fontSize` | `number` | `12` | Font size for scale title.
| `fontStyle` | `string` | `'normal'` | Font style for the scale title, follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
| `padding` | <code>number&#124;object</code> | `4` | Padding to apply around scale labels. Only `top` and `bottom` are implemented.

## Creating Custom Tick Formats

It is also common to want to change the tick marks to include information about the data type. For example, adding a dollar sign ('$'). To do this, you need to override the `ticks.callback` method in the axis configuration.
In the following example, every label of the Y axis would be displayed with a dollar sign at the front.

If the callback returns `null` or `undefined` the associated grid line will be hidden.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return '$' + value;
                    }
                }
            }]
        }
    }
});
```
