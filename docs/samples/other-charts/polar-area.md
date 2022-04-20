# Polar area

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
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels.push('data #' + (data.labels.length + 1));

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(0, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach(dataset => {
        dataset.data.pop();
      });

      chart.update();
    }
  }
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 5;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const labels = ['Red', 'Orange', 'Yellow', 'Green', 'Blue'];
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      backgroundColor: [
        Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
        Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
        Utils.transparentize(Utils.CHART_COLORS.yellow, 0.5),
        Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
        Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      ]
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'polarArea',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Polar Area Chart'
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

## Docs
* [Polar Area Chart](../../charts/polar.md)
