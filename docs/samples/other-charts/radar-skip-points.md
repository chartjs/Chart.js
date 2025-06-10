# Radar skip points

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach((dataset, i) => {
        const data = Utils.numbers({count: chart.data.labels.length, min: 0, max: 100});

        if (i === 0) {
          data[0] = null;
        } else if (i === 1) {
          data[Number.parseInt(data.length / 2, 10)] = null;
        } else {
          data[data.length - 1] = null;
        }

        dataset.data = data;
      });
      chart.update();
    }
  }
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = Utils.months({count: 7});
const dataFirstSkip = Utils.numbers(NUMBER_CFG);
const dataMiddleSkip = Utils.numbers(NUMBER_CFG);
const dataLastSkip = Utils.numbers(NUMBER_CFG);

dataFirstSkip[0] = null;
dataMiddleSkip[Number.parseInt(dataMiddleSkip.length / 2, 10)] = null;
dataLastSkip[dataLastSkip.length - 1] = null;

const data = {
  labels: labels,
  datasets: [
    {
      label: 'Skip first dataset',
      data: dataFirstSkip,
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Skip mid dataset',
      data: dataMiddleSkip,
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    },
    {
      label: 'Skip last dataset',
      data: dataLastSkip,
      borderColor: Utils.CHART_COLORS.green,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'radar',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Radar Skip Points Chart'
      }
    }
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config
};
```

## Docs
* [Radar](../../charts/radar.md)
* [Data structures (`labels`)](../../general/data-structures.md)
* [Radial linear scale](../../axes/radial/linear.md)
