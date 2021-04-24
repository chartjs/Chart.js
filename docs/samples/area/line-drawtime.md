# Line Chart drawTime

```js chart-editor
// <block:setup:2>
const inputs = {
  min: -100,
  max: 100,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

Utils.srand(3);
const generateData = () => (Utils.numbers(inputs));
// </block:setup>

// <block:data:0>
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'Dataset 1',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.CHART_COLORS.red,
      fill: true
    },
    {
      label: 'Dataset 2',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue),
      fill: true
    }
  ]
};
// </block:data>

// <block:actions:3>
let smooth = false;

const actions = [
  {
    name: 'drawTime: beforeDatasetDraw (default)',
    handler: (chart) => {
      chart.options.plugins.filler.drawTime = 'beforeDatasetDraw';
      chart.update();
    }
  },
  {
    name: 'drawTime: beforeDatasetsDraw',
    handler: (chart) => {
      chart.options.plugins.filler.drawTime = 'beforeDatasetsDraw';
      chart.update();
    }
  },
  {
    name: 'drawTime: beforeDraw',
    handler: (chart) => {
      chart.options.plugins.filler.drawTime = 'beforeDraw';
      chart.update();
    }
  },
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
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

// <block:config:1>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false,
      },
      title: {
        display: true,
        text: (ctx) => 'drawTime: ' + ctx.chart.options.plugins.filler.drawTime
      }
    },
    pointBackgroundColor: '#fff',
    radius: 10,
    interaction: {
      intersect: false,
    }
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```
