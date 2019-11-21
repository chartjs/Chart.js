# Updating Charts

It's pretty common to want to update charts after they've been created. When the chart data or options are changed, Chart.js will animate to the new data values and options.

## Adding or Removing Data

Adding and removing data is supported by changing the data array. To add data, just add data into the data array as seen in this example.

```javascript
function addData(chart, label, data) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
}

function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
```

## Updating Options

To update the options, mutating the options property in place or passing in a new options object are supported.

- If the options are mutated in place, other option properties would be preserved, including those calculated by Chart.js.
- If created as a new object, it would be like creating a new chart with the options - old options would be discarded.

```javascript
function updateConfigByMutating(chart) {
    chart.options.title.text = 'new title';
    chart.update();
}

function updateConfigAsNewObject(chart) {
    chart.options = {
        responsive: true,
        title: {
            display: true,
            text: 'Chart.js'
        },
        scales: {
            x: {
                display: true
            },
            y: {
                display: true
            }
        }
    };
    chart.update();
}
```

Scales can be updated separately without changing other options.
To update the scales, pass in an object containing all the customization including those unchanged ones.

Variables referencing any one from `chart.scales` would be lost after updating scales with a new `id` or the changed `type`.

```javascript
function updateScales(chart) {
    var xScale = chart.scales.x;
    var yScale = chart.scales.y;
    chart.options.scales = {
        newId: {
            display: true
        },
        y: {
            display: true,
            type: 'logarithmic'
        }
    };
    chart.update();
    // need to update the reference
    xScale = chart.scales.newId;
    yScale = chart.scales.y;
}
```

You can also update a specific scale either by its id.

```javascript
function updateScale(chart) {
    chart.options.scales.y = {
        type: 'logarithmic'
    };
    chart.update();
}
```

Code sample for updating options can be found in [toggle-scale-type.html](../../samples/scales/toggle-scale-type.html).

## Preventing Animations

Sometimes when a chart updates, you may not want an animation. To achieve this you can call `update` with a duration of `0`. This will render the chart synchronously and without an animation.
