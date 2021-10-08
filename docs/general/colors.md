# Colors

When supplying colors to Chart options, you can use a number of formats. You can specify the color as a string in hexadecimal, RGB, or HSL notations. If a color is needed, but not specified, Chart.js will use the global default color. There are 3 color options, stored at `Chart.defaults`, to set:

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `backgroundColor` | `Color` | `rgba(0, 0, 0, 0.1)` | Background color.
| `borderColor` | `Color` | `rgba(0, 0, 0, 0.1)` | Border color.
| `color` | `Color` | `#666` | Font color.

You can also pass a [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object. You will need to create this before passing to the chart, but using it you can achieve some interesting effects.

## Patterns and Gradients

An alternative option is to pass a [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) or [CanvasGradient](https://developer.mozilla.org/en/docs/Web/API/CanvasGradient) object instead of a string colour.

For example, if you wanted to fill a dataset with a pattern from an image you could do the following.

```javascript
const img = new Image();
img.src = 'https://example.com/my_image.png';
img.onload = function() {
    const ctx = document.getElementById('canvas').getContext('2d');
    const fillPattern = ctx.createPattern(img, 'repeat');

    const chart = new Chart(ctx, {
        data: {
            labels: ['Item 1', 'Item 2', 'Item 3'],
            datasets: [{
                data: [10, 20, 30],
                backgroundColor: fillPattern
            }]
        }
    });
};
```

Using pattern fills for data graphics can help viewers with vision deficiencies (e.g. color-blindness or partial sight) to [more easily understand your data](http://betweentwobrackets.com/data-graphics-and-colour-vision/).

Using the [Patternomaly](https://github.com/ashiguruma/patternomaly) library you can generate patterns to fill datasets.

```javascript
const chartData = {
    datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: [
            pattern.draw('square', '#ff6384'),
            pattern.draw('circle', '#36a2eb'),
            pattern.draw('diamond', '#cc65fe'),
            pattern.draw('triangle', '#ffce56')
        ]
    }],
    labels: ['Red', 'Blue', 'Purple', 'Yellow']
};
```
