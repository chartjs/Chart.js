# Stacked Bar Chart with Groups

Using the `stack` property to divide datasets into multiple stacks.

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
      });
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      backgroundColor: Utils.CHART_COLORS.red,
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      backgroundColor: Utils.CHART_COLORS.blue,
      stack: 'Stack 0',
    },
    {
      label: 'Dataset 3',
      data: Utils.numbers(NUMBER_CFG),
      backgroundColor: Utils.CHART_COLORS.green,
      stack: 'Stack 1',
    },
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bar',
  data: data,
  options: {
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart - Stacked'
      },
    },
    responsive: true,
    interaction: {
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
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

## Docs
* [Bar](../../charts/bar.html)
  * [Stacked Bar Chart](../../charts/bar.html#stacked-bar-chart)
* [Data structures (`labels`)](../../general/data-structures.html)
  * [Dataset Configuration (`stack`)](../../general/data-structures.html#dataset-configuration)

