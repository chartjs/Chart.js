# Mixed Chart Types

With Chart.js, it is possible to create mixed charts that are a combination of two or more different chart types. A common example is a bar chart that also includes a line dataset.

When creating a mixed chart, we specify the chart type on each dataset.

```javascript
const mixedChart = new Chart(ctx, {
    data: {
        datasets: [{
            type: 'bar',
            label: 'Bar Dataset',
            data: [10, 20, 30, 40]
        }, {
            type: 'line',
            label: 'Line Dataset',
            data: [50, 50, 50, 50],
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: options
});
```

At this point, we have a chart rendering how we'd like. It's important to note that the default options for the charts are only considered at the dataset level and are not merged at the chart level in this case.

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'January',
    'February',
    'March',
    'April'
  ],
  datasets: [{
    type: 'bar',
    label: 'Bar Dataset',
    data: [10, 20, 30, 40],
    borderColor: 'rgb(255, 99, 132)',
    backgroundColor: 'rgba(255, 99, 132, 0.2)'
  }, {
    type: 'line',
    label: 'Line Dataset',
    data: [50, 50, 50, 50],
    fill: false,
    borderColor: 'rgb(54, 162, 235)'
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Drawing order

 By default, datasets are drawn such that the first one is top-most. This can be altered by specifying `order` option to datasets. `order` defaults to `0`. Note that this also affects stacking, legend, and tooltip. So it's essentially the same as reordering the datasets.

The `order` property behaves like a weight instead of a specific order, so the higher the number, the sooner that dataset is drawn on the canvas and thus other datasets with a lower order number will get drawn over it.

 ```javascript
const mixedChart = new Chart(ctx, {
    type: 'bar',
    data: {
        datasets: [{
            label: 'Bar Dataset',
            data: [10, 20, 30, 40],
            // this dataset is drawn below
            order: 2
        }, {
            label: 'Line Dataset',
            data: [10, 10, 10, 10],
            type: 'line',
            // this dataset is drawn on top
            order: 1
        }],
        labels: ['January', 'February', 'March', 'April']
    },
    options: options
});
```
