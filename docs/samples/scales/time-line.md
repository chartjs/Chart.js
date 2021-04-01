# Time Scale

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data.forEach(function(dataObj, j) {
          const newVal = Utils.rand(0, 100);

          if (typeof dataObj === 'object') {
            dataObj.y = newVal;
          } else {
            dataset.data[j] = newVal;
          }
        });
      });
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};

const data = {
  labels: [ // Date Objects
    Utils.newDate(0),
    Utils.newDate(1),
    Utils.newDate(2),
    Utils.newDate(3),
    Utils.newDate(4),
    Utils.newDate(5),
    Utils.newDate(6)
  ],
  datasets: [{
    label: 'My First dataset',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    borderColor: Utils.CHART_COLORS.red,
    fill: false,
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'My Second dataset',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    borderColor: Utils.CHART_COLORS.blue,
    fill: false,
    data: Utils.numbers(NUMBER_CFG),
  }, {
    label: 'Dataset with point data',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.green, 0.5),
    borderColor: Utils.CHART_COLORS.green,
    fill: false,
    data: [{
      x: Utils.newDateString(0),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(5),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(7),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(15),
      y: Utils.rand(0, 100)
    }],
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
        text: 'Chart.js Time Scale',
        display: true
      }
    },
    scales: {
      x: {
        type: 'time',
        time: {
          // Luxon format string
          tooltipFormat: 'DD T'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'value'
        }
      }
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```
