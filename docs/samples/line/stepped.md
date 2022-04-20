# Stepped Line Charts

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Step: false (default)',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.stepped = false;
      });
      chart.update();
    }
  },
  {
    name: 'Step: true',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.stepped = true;
      });
      chart.update();
    }
  },
  {
    name: 'Step: before',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.stepped = 'before';
      });
      chart.update();
    }
  },
  {
    name: 'Step: after',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.stepped = 'after';
      });
      chart.update();
    }
  },
  {
    name: 'Step: middle',
    handler: (chart) => {
      chart.data.datasets.forEach(dataset => {
        dataset.stepped = 'middle';
      });
      chart.update();
    }
  }
];
// </block:actions>

// <block:setup:1>
const data = {
  labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
  datasets: [
    {
      label: 'Dataset',
      data: Utils.numbers({count: 6, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.red,
      fill: false,
      stepped: true,
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
    interaction: {
      intersect: false,
      axis: 'x'
    },
    plugins: {
      title: {
        display: true,
        text: (ctx) => 'Step ' + ctx.chart.data.datasets[0].stepped + ' Interpolation',
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
* [Data structures (`labels`)](../../general/data-structures.html)
* [Line](../../charts/line.html)
  * [Stepped](../../charts/line.html#stepped)
