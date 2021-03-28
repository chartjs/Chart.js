---
title: Title
---

The chart title defines text to draw at the top of the chart.

## Title Configuration

Namespace: `options.plugins.title`, the global options for the chart title is defined in `Chart.defaults.plugins.title`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `align` | `string` | `'center'` | Alignment of the title. [more...](#align)
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of text.
| `display` | `boolean` | `false` | Is the title shown?
| `fullSize` | `boolean` | `true` | Marks that this box should take the full width/height of the canvas. If `false`, the box is sized and placed above/beside the chart area.
| `position` | `string` | `'top'` | Position of title. [more...](#position)
| `font` | `Font` | `{style: 'bold'}` | See [Fonts](../general/fonts.md)
| `padding` | [`Padding`](../general/padding.md) | `10` | Padding to apply around the title. Only `top` and `bottom` are implemented.
| `text` | `string`\|`string[]` | `''` | Title text to display. If specified as an array, text is rendered on multiple lines.

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
var chart = new Chart(ctx, {
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
var chart = new Chart(ctx, {
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
