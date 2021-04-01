# Log Scale

```js chart-editor
// <block:actions:2>
const logNumbers = (num) => {
  const data = [];

  for (let i = 0; i < num; ++i) {
    data.push(Math.ceil(Math.random() * 10.0) * Math.pow(10, Math.ceil(Math.random() * 5)));
  }

  return data;
};

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = logNumbers(chart.data.labels.length);
      });
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: logNumbers(DATA_COUNT),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
      fill: false,
    },
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
        text: 'Chart.js Line Chart - Logarithmic'
      }
    },
    scales: {
      x: {
        display: true,
      },
      y: {
        display: true,
        type: 'logarithmic',
      }
    }
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```
