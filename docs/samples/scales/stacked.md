# Stacked Linear / Category

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
      data: ['ON', 'ON', 'OFF', 'ON', 'OFF', 'OFF', 'ON'],
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.CHART_COLORS.blue,
      stepped: true,
      yAxisID: 'y2',
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
        text: 'Stacked scales',
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        stack: 'demo',
        stackWeight: 2,
        border: {
          color: Utils.CHART_COLORS.red
        }
      },
      y2: {
        type: 'category',
        labels: ['ON', 'OFF'],
        offset: true,
        position: 'left',
        stack: 'demo',
        stackWeight: 1,
        border: {
          color: Utils.CHART_COLORS.blue
        }
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
* [Line](../../charts/line.md)
* [Axes scales](../../axes/)
  * [Stacking](../../axes/#stacking)
* [Data structures (`labels`)](../../general/data-structures.md)
