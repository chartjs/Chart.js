# Linear Scale - Min-Max

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: [10, 30, 50, 20, 25, 44, -10],
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
    },
    {
      label: 'Dataset 2',
      data: [100, 33, 22, 19, 11, 49, 30],
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.CHART_COLORS.blue,
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Min and Max Settings'
      }
    },
    scales: {
      y: {
        min: 10,
        max: 50,
      }
    }
  },
};
// </block:config>

module.exports = {
  config: config,
};
```

## Docs
* [Line](../../charts/line.html)
* [Data structures (`labels`)](../../general/data-structures.html)
* [Axes scales](../../axes/)
  * [Common options to all axes (`min`,`max`)](../../axes/#common-options-to-all-axes)
 