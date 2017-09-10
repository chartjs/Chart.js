# Fonts

There are 4 special global settings that can change all of the fonts on the chart. These options are in `Chart.defaults.global`. The global font settings only apply when more specific options are not included in the config.

For example, in this chart the text will all be red except for the labels in the legend.

```javascript
Chart.defaults.global.defaultFontColor = 'red';
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        legend: {
            labels: {
                // This more specific font property overrides the global property
                fontColor: 'black'
            }
        }
    }
});
```

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `defaultFontColor` | `Color` | `'#666'` | Default font color for all text.
| `defaultFontFamily` | `String` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Default font family for all text.
| `defaultFontSize` | `Number` | `12` | Default font size (in px) for text. Does not apply to radialLinear scale point labels.
| `defaultFontStyle` | `String` | `'normal'` | Default font style. Does not apply to tooltip title or footer. Does not apply to chart title.

## Non-Existant Fonts

If a font is specified for a chart that does exist on the system, the browser will not apply the font when it is set. If you notice odd fonts appearing in your charts, check that the font you are applying exists on your system. See [issue 3318](https://github.com/chartjs/Chart.js/issues/3318) for more details.
