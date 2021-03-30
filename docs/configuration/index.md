# Configuration

The configuration is used to change how the chart behaves. There are properties to control styling, fonts, the legend, etc.

## Global Configuration

This concept was introduced in Chart.js 1.0 to keep configuration [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges the options object passed to the chart with the global configuration using chart type defaults and scales defaults appropriately. This way you can be as specific as you would like in your individual chart configuration, while still changing the defaults for all chart types where applicable. The global general options are defined in `Chart.defaults`. The defaults for each chart type are discussed in the documentation for that chart type.

The following example would set the interaction mode to 'nearest' for all charts where this was not overridden by the chart type defaults or the options passed to the constructor on creation.

```javascript
Chart.defaults.interaction.mode = 'nearest';

// Interaction mode is set to nearest because it was not overridden here
var chartInteractionModeNearest = new Chart(ctx, {
    type: 'line',
    data: data
});

// This chart would have the interaction mode that was passed in
var chartDifferentInteractionMode = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            // Overrides the global setting
            mode: 'index'
        }
    }
});
```

## Dataset Configuration

Options may be configured directly on the dataset. The dataset options can be changed at multiple different levels. See [options](../general/options.md#dataset-level-options) for details on how the options are resolved.

The following example would set the `showLine` option to 'false' for all line datasets except for those overridden by options passed to the dataset on creation.

```javascript
// Do not show lines for all datasets by default
Chart.defaults.datasets.line.showLine = false;

// This chart would show a line only for the third dataset
var chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [0, 0],
        }, {
            data: [0, 1]
        }, {
            data: [1, 0],
            showLine: true // overrides the `line` dataset default
        }, {
            type: 'scatter', // 'line' dataset default does not affect this dataset since it's a 'scatter'
            data: [1, 1]
        }]
    }
});
```
