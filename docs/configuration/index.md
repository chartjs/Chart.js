# Configuration

The configuration is used to change how the chart behaves. There are properties to control styling, fonts, the legend, etc.

## Configuration object structure

The top level structure of Chart.js configuration:

```javascript
const config = {
  type: 'line'
  data: {}
  options: {}
  plugins: []
}
```

### type

Chart type determines the main type of the chart.

**note** A dataset can override the `type`, this is how mixed charts are constructed.

### data

See [Data Structures](../general/data-structures.md) for details.

### options

Majority of the documentation talks about these options.

### plugins

Inline plugins can be included in this array. It is an alternative way of adding plugins for single chart (vs registering the plugin globally).
More about plugins in the [developers section](../developers/plugins.md).

## Global Configuration

This concept was introduced in Chart.js 1.0 to keep configuration [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges the options object passed to the chart with the global configuration using chart type defaults and scales defaults appropriately. This way you can be as specific as you would like in your individual chart configuration, while still changing the defaults for all chart types where applicable. The global general options are defined in `Chart.defaults`. The defaults for each chart type are discussed in the documentation for that chart type.

The following example would set the interaction mode to 'nearest' for all charts where this was not overridden by the chart type defaults or the options passed to the constructor on creation.

```javascript
Chart.defaults.interaction.mode = 'nearest';

// Interaction mode is set to nearest because it was not overridden here
const chartInteractionModeNearest = new Chart(ctx, {
    type: 'line',
    data: data
});

// This chart would have the interaction mode that was passed in
const chartDifferentInteractionMode = new Chart(ctx, {
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
const chart = new Chart(ctx, {
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
