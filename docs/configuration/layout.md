# Layout Configuration

The layout configuration is passed into the `options.layout` namespace. The global options for the chart layout is defined in `Chart.defaults.global.layout`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `padding` | <code>number&#124;object</code> | `0` | The padding to add inside the chart. [more...](#padding)

## Padding
If this value is a number, it is applied to all sides of the chart (left, top, right, bottom). If this value is an object, the `left` property defines the left padding. Similarly the `right`, `top` and `bottom` properties can also be specified.

Lets say you wanted to add 50px of padding to the left side of the chart canvas, you would do:

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        layout: {
            padding: {
                left: 50,
                right: 0,
                top: 0,
                bottom: 0
            }
        }
    }
});
```
