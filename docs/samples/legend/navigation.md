# Navigation

This sample shows how to use legend navigation to handle overflow.

```js chart-editor

// <block:setup:1>
const DATA_COUNT = 100;
const NUMBER_CFG = {count: DATA_COUNT, decimals: 0};
const LABEL_CFG = {count: DATA_COUNT, prefix: 'Group ', min: 1, max: DATA_COUNT + 1};

const data = {
  labels: Utils.labels(LABEL_CFG),
  datasets: [{
    label: '# of Votes',
    data: Utils.numbers(NUMBER_CFG),
    backgroundColor: Object.values(Utils.CHART_COLORS),
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'pie',
  data: data,
  options: {
    plugins: {
      legend: {
        position: 'right',
        align: 'start',
        title: {
          display: true,
          text: 'Chart.js Legend Navigation Example',
          position: 'start',
        },
        navigation: {
          display: 'auto',
          maxCols: 1,
          maxRows: 3,
          arrowSize: 12,
          align: 'start',
          grid: true
        }
      },
    }
  }
};
// </block:config>

// <block:actions:2>
const actions = [
  {
    name: 'Toggle',
    handler(chart) {
      const {navigation} = chart.options.plugins.legend;
      navigation.display = navigation.display ? false : 'auto';
      chart.update();
    }
  },
  {
    name: '+ Label',
    handler(chart) {
      console.log(chart);
      const lastLabel = chart.data.labels[chart.data.labels.length - 1] || '';
      const lastIndex = +lastLabel.substring(6);
      chart.data.labels.push(LABEL_CFG.prefix + (lastIndex + 1));
      chart.update();
    }
  },
  {
    name: '- Label',
    handler(chart) {
      chart.data.labels.pop();
      chart.update();
    }
  },
  {
    name: 'Position: left',
    handler(chart) {
      chart.options.plugins.legend.position = 'left';
      chart.update();
    }
  },
  {
    name: 'Position: top',
    handler(chart) {
      chart.options.plugins.legend.position = 'top';
      chart.update();
    }
  },
  {
    name: 'Position: right',
    handler(chart) {
      chart.options.plugins.legend.position = 'right';
      chart.update();
    }
  },
  {
    name: 'Position: bottom',
    handler(chart) {
      chart.options.plugins.legend.position = 'bottom';
      chart.update();
    }
  },
  {
    name: 'Toggle grid',
    handler(chart) {
      chart.options.plugins.legend.navigation.grid = !chart.options.plugins.legend.navigation.grid;
      chart.update();
    }
  },
];
// </block:actions>

module.exports = {
  config,
  actions
};
```

## Docs
* [Doughnut and Pie Charts](../../charts/doughnut.md)
* [Legend](../../configuration/legend.md)
  * [Navigation](../../configuration/legend.md#legend-navigation-configuration)