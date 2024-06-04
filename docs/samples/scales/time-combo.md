# Time Scale - Combo Chart

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: 0, max: 100});
      });
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = [];

for (let i = 0; i < DATA_COUNT; ++i) {
  labels.push(Utils.newDate(i));
}

const data = {
  labels: labels,
  datasets: [{
    type: 'bar',
    label: 'Dataset 1',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    borderColor: Utils.CHART_COLORS.red,
    data: Utils.numbers(NUMBER_CFG),
  }, {
    type: 'bar',
    label: 'Dataset 2',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    borderColor: Utils.CHART_COLORS.blue,
    data: Utils.numbers(NUMBER_CFG),
  }, {
    type: 'line',
    label: 'Dataset 3',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
    borderColor: Utils.CHART_COLORS.green,
    fill: false,
    data: Utils.numbers(NUMBER_CFG),
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      title: {
        text: 'Chart.js Combo Time Scale',
        display: true
      }
    },
    scales: {
      x: {
        type: 'time',
        display: true,
        offset: true,
        ticks: {
          source: 'data'
        },
        time: {
          unit: 'day'
        },
      },
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```

## Docs
* [Bar](../../charts/bar.md)
* [Line](../../charts/line.md)
* [Data structures (`labels`)](../../general/data-structures.md)
* [Time Scale](../../axes/cartesian/time.md)
