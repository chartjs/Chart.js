# Updating Charts

It's pretty common to want to update charts after they've been created. When the chart data is changed, Chart.js will animate to the new data values. 

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
```

```javascript
function removeData(chart) {
    chart.data.labels.pop();
    chart.data.datasets.forEach((dataset) => {
        dataset.data.pop();
    });
    chart.update();
}
```

## Preventing Animations

Sometimes when a chart updates, you may not want an animation. To achieve this you can call `update` with a duration of `0`. This will render the chart synchronously and without an animation.