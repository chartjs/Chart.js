# Position

This sample show how to change the position of the chart legend.

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Position: top',
    handler(chart) {
      chart.options.plugins.legend.position = 'top';
      chart.update();
    }
  },
  {
    name: 'Position: right',
    handler(chart) {
      chart.options.plugins.legend.position = 'right';
      chart.update();
    }
  },
  {
    name: 'Position: bottom',
    handler(chart) {
      chart.options.plugins.legend.position = 'bottom';
      chart.update();
    }
  },
  {
    name: 'Position: left',
    handler(chart) {
      chart.options.plugins.legend.position = 'left';
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
    },
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```