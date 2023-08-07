# Colors

Charts support three color options:
* for geometric elements, you can change *background* and *border* colors;
* for textual elements, you can change the *font* color.

Also, you can change the whole [canvas background](../configuration/canvas-background.md).

## Default colors

If a color is not specified, a global default color from `Chart.defaults` is used:

| Name | Type | Description | Default value
| ---- | ---- | ----------- | -------------
| `backgroundColor` | [`Color`](../api/#color) | Background color | `rgba(0, 0, 0, 0.1)`
| `borderColor` | [`Color`](../api/#color) | Border color | `rgba(0, 0, 0, 0.1)`
| `color` | [`Color`](../api/#color) | Font color | `#666`

You can reset default colors by updating these properties of `Chart.defaults`:

```javascript
Chart.defaults.backgroundColor = '#9BD0F5';
Chart.defaults.borderColor = '#36A2EB';
Chart.defaults.color = '#000';
```

### Per-dataset color settings

If your chart has multiple datasets, using default colors would make individual datasets indistinguishable. In that case, you can set `backgroundColor` and `borderColor` for each dataset:

```javascript
const data = {
  labels: ['A', 'B', 'C'],
  datasets: [
    {
      label: 'Dataset 1',
      data: [1, 2, 3],
      borderColor: '#36A2EB',
      backgroundColor: '#9BD0F5',
    },
    {
      label: 'Dataset 2',
      data: [2, 3, 4],
      borderColor: '#FF6384',
      backgroundColor: '#FFB1C1',
    }
  ]
};
```

However, setting colors for each dataset might require additional work that you'd rather not do. In that case, consider using the following plugins with pre-defined or generated palettes.

### Default color palette

If you don't have any preference for colors, you can use the built-in `Colors` plugin. It will cycle through a palette of seven Chart.js brand colors:

<div style="max-width: 500px;">

![Colors plugin palette](./colors-plugin-palette.png)

</div>

All you need is to import and register the plugin:

```javascript
import { Colors } from 'chart.js';

Chart.register(Colors);
```

:::tip Note

If you are using the UMD version of Chart.js, this plugin will be enabled by default. You can disable it by setting the `enabled` option to `false`:

```js
const options = {
  plugins: {
    colors: {
      enabled: false
    }
  }
};
```

:::

### Dynamic datasets at runtime

By default, the colors plugin only works when you initialize the chart without any colors for the border or background specified.
If you want to force the colors plugin to always color your datasets, for example, when using dynamic datasets at runtime you will need to set the `forceOverride` option to true:

```js
const options = {
  plugins: {
    colors: {
      forceOverride: true
    }
  }
};
```


### Advanced color palettes

See the [awesome list](https://github.com/chartjs/awesome#plugins) for plugins that would give you more flexibility defining color palettes.

## Color formats

You can specify the color as a string in either of the following notations:

| Notation | Example | Example with transparency
| -------- | ------- | -------------------------
| [Hexadecimal](https://developer.mozilla.org/en-US/docs/Web/CSS/hex-color) | `#36A2EB` | `#36A2EB80`
| [RGB](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgb) or [RGBA](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/rgba) | `rgb(54, 162, 235)` | `rgba(54, 162, 235, 0.5)`
| [HSL](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl) or [HSLA](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsla) | `hsl(204, 82%, 57%)` | `hsla(204, 82%, 57%, 0.5)`

Alternatively, you can pass a [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) or [CanvasGradient](https://developer.mozilla.org/en/docs/Web/API/CanvasGradient) object instead of a string color to achieve some interesting effects.

## Patterns and Gradients

For example, you can fill a dataset with a pattern from an image.

```javascript
const img = new Image();
img.src = 'https://example.com/my_image.png';
img.onload = () => {
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
Pattern fills can help viewers with vision deficiencies (e.g., color-blindness or partial sight) [more easily understand your data](http://betweentwobrackets.com/data-graphics-and-colour-vision/).

You can use the [Patternomaly](https://github.com/ashiguruma/patternomaly) library to generate patterns to fill datasets:

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
