---
title: Fonts
---

There are special global settings that can change all of the fonts on the chart. These options are in `Chart.defaults.font`. The global font settings only apply when more specific options are not included in the config.

For example, in this chart the text will all be red except for the labels in the legend.

```javascript
Chart.defaults.font.size = 16;
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            legend: {
                labels: {
                    // This more specific font property overrides the global property
                    font: {
                        size: 14
                    }
                }
            }
        }
    }
});
```

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `family` | `string` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Default font family for all text, follows CSS font-family options.
| `size` | `number` | `12` | Default font size (in px) for text. Does not apply to radialLinear scale point labels.
| `style` | `string` | `'normal'` | Default font style. Does not apply to tooltip title or footer. Does not apply to chart title. Follows CSS font-style options (i.e. normal, italic, oblique, initial, inherit).
| `weight` | `string` | `undefined` | Default font weight (boldness). (see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight)).
| `lineHeight` | `number`\|`string` | `1.2` | Height of an individual line of text (see [MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/line-height)).

## Missing Fonts

If a font is specified for a chart that does exist on the system, the browser will not apply the font when it is set. If you notice odd fonts appearing in your charts, check that the font you are applying exists on your system. See [issue 3318](https://github.com/chartjs/Chart.js/issues/3318) for more details.

## Loading Fonts

If a font is not cached and needs to be loaded, charts that use the font will need to be updated once the font is loaded. This can be accomplished using the [Font Loading APIs](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API). See [issue 8020](https://github.com/chartjs/Chart.js/issues/8020) for more details.
