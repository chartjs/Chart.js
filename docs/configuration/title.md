# Title

The chart title defines text to draw at the top of the chart.

## Title Configuration

Namespace: `options.plugins.title`, the global options for the chart title is defined in `Chart.defaults.plugins.title`.

| Name | Type | Default | [Scriptable](../general/options.md#scriptable-options) | Description
| ---- | ---- | ------- | :----: | -----------
| `align` | `string` | `'center'` | Yes | Alignment of the title. [more...](#align)
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Yes | Color of text.
| `display` | `boolean` | `false` | Yes | Is the title shown?
| `fullSize` | `boolean` | `true` | Yes | Marks that this box should take the full width/height of the canvas. If `false`, the box is sized and placed above/beside the chart area.
| `position` | `string` | `'top'` | Yes | Position of title. [more...](#position)
| `font` | `Font` | `{weight: 'bold'}` | Yes | See [Fonts](../general/fonts.md)
| `padding` | [`Padding`](../general/padding.md) | `10` | Yes | Padding to apply around the title. Only `top` and `bottom` are implemented.
| `text` | `string`\|`string[]` | `''` | Yes | Title text to display. If specified as an array, text is rendered on multiple lines.

:::tip Note
If you need more visual customizations, you can implement the title with HTML and CSS.
:::

### Position

Possible title position values are:

* `'top'`
* `'left'`
* `'bottom'`
* `'right'`

## Align

Alignment of the title. Options are:

* `'start'`
* `'center'`
* `'end'`

## Example Usage

The example below would enable a title of 'Custom Chart Title' on the chart that is created.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Custom Chart Title'
            }
        }
    }
});
```

This example shows how to specify separate top and bottom title text padding:

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            title: {
                display: true,
                text: 'Custom Chart Title',
                padding: {
                    top: 10,
                    bottom: 30
                }
            }
        }
    }
});
```
