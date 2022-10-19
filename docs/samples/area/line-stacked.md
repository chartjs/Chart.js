# Line Chart Stacked

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Stacked: true',
    handler: (chart) => {
      chart.options.scales.y.stacked = true;
      chart.update();
    }
  },
  {
    name: 'Stacked: false (default)',
    handler: (chart) => {
      chart.options.scales.y.stacked = false;
      chart.update();
    }
  },
  {
    name: 'Stacked Single',
    handler: (chart) => {
      chart.options.scales.y.stacked = 'single';
      chart.update();
    }
  },
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const data = chart.data;
      const dsColor = Utils.namedColor(chart.data.datasets.length);
      const newDataset = {
        label: 'Dataset ' + (data.datasets.length + 1),
        backgroundColor: dsColor,
        borderColor: dsColor,
        fill: true,
        data: Utils.numbers({count: data.labels.length, min: -100, max: 100}),
      };
      chart.data.datasets.push(newDataset);
      chart.update();
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels = Utils.months({count: data.labels.length + 1});

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(-100, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
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
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'My First dataset',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
      fill: true
    },
    {
      label: 'My Second dataset',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.CHART_COLORS.blue,
      fill: true
    },
    {
      label: 'My Third dataset',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.green,
      backgroundColor: Utils.CHART_COLORS.green,
      fill: true
    },
    {
      label: 'My Fourth dataset',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.yellow,
      backgroundColor: Utils.CHART_COLORS.yellow,
      fill: true
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
        text: (ctx) => 'Chart.js Line Chart - stacked=' + ctx.chart.options.scales.y.stacked
      },
      tooltip: {
        mode: 'index'
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      },
      y: {
        stacked: true,
        title: {
          display: true,
          text: 'Value'
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: actions,
  config: config
};
```

## Docs
* [Area](../../charts/area.html)
  * [Filling modes](../../charts/area.html#filling-modes)
* [Line](../../charts/line.html)
* [Data structures (`labels`)](../../general/data-structures.html)
* [Axes scales](../../axes/)
  * [Common options to all axes (`stacked`)](../../axes/#common-options-to-all-axes)
