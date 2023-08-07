# Radar Chart Stacked

```js chart-editor
// <block:setup:1>
const inputs = {
  min: 8,
  max: 16,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

const generateData = () => {
  const values = Utils.numbers(inputs);
  inputs.from = values;
  return values;
};

const labels = Utils.months({count: 8});
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'D0',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
    },
    {
      label: 'D1',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.orange,
      hidden: true,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.orange),
      fill: '-1'
    },
    {
      label: 'D2',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.yellow,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow),
      fill: 1
    },
    {
      label: 'D3',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.green,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green),
      fill: false
    },
    {
      label: 'D4',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue),
      fill: '-1'
    },
    {
      label: 'D5',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.purple,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.purple),
      fill: '-1'
    },
    {
      label: 'D6',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.grey,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.grey),
      fill: {value: 85}
    }
  ]
};
// </block:setup>

// <block:actions:2>
let smooth = false;
let propagate = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      inputs.from = [];
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Propagate',
    handler(chart) {
      propagate = !propagate;
      chart.options.plugins.filler.propagate = propagate;
      chart.update();

    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:0>
const config = {
  type: 'radar',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false
      },
      'samples-filler-analyser': {
        target: 'chart-analyser'
      }
    },
    interaction: {
      intersect: false
    }
  }
};
// </block:config>

module.exports = {
  actions: actions,
  config: config
};
```

<div id="chart-analyser" class="analyser"></div>

## Docs
* [Area](../../charts/area.md)
  * [Filling modes](../../charts/area.md#filling-modes)
  * [`propagate`](../../charts/area.md#propagate)
* [Radar](../../charts/radar.md)
* [Data structures (`labels`)](../../general/data-structures.md)
