# Quadrants

```js chart-editor
// <block:data:2>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};
const data = {
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.points(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Dataset 2',
      data: Utils.points(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    }
  ]
};
// </block:data>

// <block:plugin:1>
const quadrants = {
  id: 'quadrants',
  beforeDraw(chart, args, options) {
    const {ctx, chartArea: {left, top, right, bottom}, scales: {x, y}} = chart;
    const midX = x.getPixelForValue(0);
    const midY = y.getPixelForValue(0);
    ctx.save();
    ctx.fillStyle = options.topLeft;
    ctx.fillRect(left, top, midX - left, midY - top);
    ctx.fillStyle = options.topRight;
    ctx.fillRect(midX, top, right - midX, midY - top);
    ctx.fillStyle = options.bottomRight;
    ctx.fillRect(midX, midY, right - midX, bottom - midY);
    ctx.fillStyle = options.bottomLeft;
    ctx.fillRect(left, midY, midX - left, bottom - midY);
    ctx.restore();
  }
};
// </block:plugin>

// <block:config:0>
const config = {
  type: 'scatter',
  data: data,
  options: {
    plugins: {
      quadrants: {
        topLeft: Utils.CHART_COLORS.red,
        topRight: Utils.CHART_COLORS.blue,
        bottomRight: Utils.CHART_COLORS.green,
        bottomLeft: Utils.CHART_COLORS.yellow,
      }
    }
  },
  plugins: [quadrants]
};
// </block:config>

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.points(NUMBER_CFG);
      });
      chart.update();
    }
  },
];

module.exports = {
  actions,
  config,
};
```

## Docs
* [Data structures (`labels`)](../../general/data-structures.html)
* [Plugins](../../developers/plugins.html)
* [Scatter](../../charts/scatter.html)
