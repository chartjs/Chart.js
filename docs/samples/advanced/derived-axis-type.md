# Derived Axis Type

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 12;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 1000};
const labels = Utils.months({count: DATA_COUNT});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'My First dataset',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
      fill: false,
    }
  ],
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data,
  options: {
    responsive: true,
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        type: 'log2',
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

## Log2 axis implementation

<<< @/scripts/log2.js

## Docs
* [Data structures (`labels`)](../../general/data-structures.html)
* [Line](../../charts/line.html)
* [New Axes](../../developers/axes.html)
