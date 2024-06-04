# Interaction Modes

This sample shows how to use the tooltip position mode setting.

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Mode: index',
    handler(chart) {
      chart.options.interaction.axis = 'xy';
      chart.options.interaction.mode = 'index';
      chart.update();
    }
  },
  {
    name: 'Mode: dataset',
    handler(chart) {
      chart.options.interaction.axis = 'xy';
      chart.options.interaction.mode = 'dataset';
      chart.update();
    }
  },
  {
    name: 'Mode: point',
    handler(chart) {
      chart.options.interaction.axis = 'xy';
      chart.options.interaction.mode = 'point';
      chart.update();
    }
  },
  {
    name: 'Mode: nearest, axis: xy',
    handler(chart) {
      chart.options.interaction.axis = 'xy';
      chart.options.interaction.mode = 'nearest';
      chart.update();
    }
  },
  {
    name: 'Mode: nearest, axis: x',
    handler(chart) {
      chart.options.interaction.axis = 'x';
      chart.options.interaction.mode = 'nearest';
      chart.update();
    }
  },
  {
    name: 'Mode: nearest, axis: y',
    handler(chart) {
      chart.options.interaction.axis = 'y';
      chart.options.interaction.mode = 'nearest';
      chart.update();
    }
  },
  {
    name: 'Mode: x',
    handler(chart) {
      chart.options.interaction.mode = 'x';
      chart.update();
    }
  },
  {
    name: 'Mode: y',
    handler(chart) {
      chart.options.interaction.mode = 'y';
      chart.update();
    }
  },
  {
    name: 'Toggle Intersect',
    handler(chart) {
      chart.options.interaction.intersect = !chart.options.interaction.intersect;
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      fill: false,
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      fill: false,
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    },
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      title: {
        display: true,
        text: (ctx) => {
          const {axis = 'xy', intersect, mode} = ctx.chart.options.interaction;
          return 'Mode: ' + mode + ', axis: ' + axis + ', intersect: ' + intersect;
        }
      },
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
* [Data structures (`labels`)](../../general/data-structures.md)
* [Line](../../charts/line.md)
* [Tooltip](../../configuration/tooltip.md)
* [Interactions](../../configuration/interactions.md)
