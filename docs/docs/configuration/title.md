---
title: Title
---

The chart title defines text to draw at the top of the chart.

## Title Configuration

The title configuration is passed into the `options.plugins.title` namespace. The global options for the chart title is defined in `Chart.defaults.plugins.title`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `align` | `string` | `'center'` | Alignment of the title. [more...](#align)
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of text.
| `display` | `boolean` | `false` | Is the title shown?
| `position` | `string` | `'top'` | Position of title. [more...](#position)
| `font` | `Font` | `{style: 'bold'}` | See [Fonts](../general/fonts.md)
| `padding` | `number`\|`{top: number, bottom: number}` | `10` | Adds padding above and below the title text if a single number is specified. It is also possible to change top and bottom padding separately.
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
