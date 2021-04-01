# Point Style

This sample show how to use the dataset point style in the legend instead of a rectangle to identify each dataset..

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Toggle Point Style',
    handler(chart) {
      chart.options.plugins.legend.labels.usePointStyle = !chart.options.plugins.legend.labels.usePointStyle;
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      fill: false,
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      borderWidth: 1,
      pointStyle: 'rectRot',
      pointRadius: 5,
      pointBorderColor: 'rgb(0, 0, 0)'
    },
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
        },
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```