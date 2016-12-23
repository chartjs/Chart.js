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

## defaultFontColor
**Type:** Color
**Default:** `'#666'`
Default font color for all text.

## defaultFontFamily
**Type:** String
**Default:** `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"`
Default font family for all text.

## defaultFontSize
**Type:** Number
**Default:** `12`
Default font size (in px) for text. Does not apply to radialLinear scale point labels.

## defaultFontStyle
**Type:** String
**Default:** `'normal'`
Default font style. Does not apply to tooltip title or footer. Does not apply to chart title.