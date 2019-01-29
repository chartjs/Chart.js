# Title

The chart title defines text to draw at the top of the chart.

## Title Configuration
The title configuration is passed into the `options.title` namespace. The global options for the chart title is defined in `Chart.defaults.global.title`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `false` | Is the title shown?
| `position` | `string` | `'top'` | Position of title. [more...](#position)
| `fontSize` | `number` | `12` | Font size.
| `fontFamily` | `string` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Font family for the title text.
| `fontColor` | `Color` | `'#666'` | Font color.
| `fontStyle` | `string` | `'bold'` | Font style.
| `padding` | `number` | `10` | Number of pixels to add above and below the title text.
| `lineHeight` | <code>number&#124;string</code> | `1.2` | Height of an individual line of text. See [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height).
| `text` | <code>string&#124;string[]</code> | `''` | Title text to display. If specified as an array, text is rendered on multiple lines.

### Position
Possible title position values are:
* `'top'`
* `'left'`
* `'bottom'`
* `'right'`

## Example Usage

The example below would enable a title of 'Custom Chart Title' on the chart that is created.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        title: {
            display: true,
            text: 'Custom Chart Title'
        }
    }
});
```
