# Line Chart Datasets

```js chart-editor
// <block:actions:2>
let smooth = false;
let propagate = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData()
      });
      chart.update();
    }
  },
  {
    name: 'Propagate',
    handler(chart) {
      propagate = !propagate
      chart.options.plugins.filler.propagate = propagate;
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0.000001;
      chart.update();
    }
  }
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const inputs = {
  min: 20,
  max: 80,
  count: 8,
  decimals: 2,
  continuity: 1
}

const generateLabels = () => {
  return Utils.months({count: inputs.count});
}

const generateData = () => (Utils.numbers(inputs))

Utils.srand(42)

const labels = Utils.months({count: 7});
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'D0',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      hidden: true
    },
    {
      label: 'D1',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.orange,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.orange),
      fill: '-1'
    },
    {
      label: 'D2',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.yellow,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow),
      hidden: true,
      fill: 1
    },
    {
      label: 'D3',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.green,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green),
      fill: '-1'
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
      borderColor: Utils.CHART_COLORS.grey,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.grey),
      fill: '+2'
    },
    {
      label: 'D6',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.purple,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.purple),
      fill: false
    },
    {
      label: 'D7',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      fill: 8
    },
    {
      label: 'D8',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.orange,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.orange),
      fill: 'end',
      hidden: true
    },
    {
      label: 'D9',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.yellow,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.yellow),
      fill: {above: 'blue', below: 'red', target: {value: 350}}
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    maintainAspectRatio: false,
    spanGaps: false,
    elements: {
      line: {
        tension: 0.000001
      }
    },
    scales: {
      y: {
        stacked: true
      }
    },
    plugins: {
      filler: {
        propagate: false
      },
      'samples-filler-analyser': {
        target: 'chart-analyser'
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
