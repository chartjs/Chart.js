# Linear Scale - Suggested Min-Max

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
      data: [10, 30, 39, 20, 25, 34, -10],
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
    },
    {
      label: 'Dataset 2',
      data: [18, 33, 22, 19, 11, 39, 30],
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
        text: 'Suggested Min and Max Settings'
      }
    },
    scales: {
      y: {
        // the data minimum used for determining the ticks is Math.min(dataMin, suggestedMin)
        suggestedMin: 30,

        // the data maximum used for determining the ticks is Math.max(dataMax, suggestedMax)
        suggestedMax: 50,
      }
    }
  },
};
// </block:config>

module.exports = {
  config: config,
};
```
