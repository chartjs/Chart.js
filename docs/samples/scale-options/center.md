# Center Positioning

This sample show how to place the axis in the center of the chart area, instead of at the edges.

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Default Positions',
    handler(chart) {
      chart.options.scales.x.position = 'bottom';
      chart.options.scales.y.position = 'left';
      chart.update();
    }
  },
  {
    name: 'Position: center',
    handler(chart) {
      chart.options.scales.x.position = 'center';
      chart.options.scales.y.position = 'center';
      chart.update();
    }
  },
  {
    name: 'Position: Vertical: x=-60, Horizontal: y=30',
    handler(chart) {
      chart.options.scales.x.position = {y: 30};
      chart.options.scales.y.position = {x: -60};
      chart.update();
    }
  },
];
// </block:actions>


// <block:setup:1>
const DATA_COUNT = 6;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
const data = {
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.points(NUMBER_CFG),
      fill: false,
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Dataset 2',
      data: Utils.points(NUMBER_CFG),
      fill: false,
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'scatter',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Axis Center Positioning'
      }
    },
    scales: {
      x: {
        min: -100,
        max: 100,
      },
      y: {
        min: -100,
        max: 100,
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
* [Scatter](../../charts/scatter.html)
* [Cartesian Axes](../../axes/cartesian/)
  * [Axis Position](../../axes/cartesian/#axis-position)