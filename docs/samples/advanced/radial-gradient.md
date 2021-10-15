# Radial Gradient

```js chart-editor
// <block:setup:3>
const DATA_COUNT = 5;
Utils.srand(110);

const chartColors = Utils.CHART_COLORS;
const colors = [chartColors.red, chartColors.orange, chartColors.yellow, chartColors.green, chartColors.blue];

const cache = new Map();
let width = null;
let height = null;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
];
// </block:setup>

// <block:createRadialGradient3:0>
function createRadialGradient3(context, c1, c2, c3) {
  const chartArea = context.chart.chartArea;
  if (!chartArea) {
    // This case happens on initial chart load
    return;
  }

  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (width !== chartWidth || height !== chartHeight) {
    cache.clear();
  }
  let gradient = cache.get(c1 + c2 + c3);
  if (!gradient) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    const centerX = (chartArea.left + chartArea.right) / 2;
    const centerY = (chartArea.top + chartArea.bottom) / 2;
    const r = Math.min(
      (chartArea.right - chartArea.left) / 2,
      (chartArea.bottom - chartArea.top) / 2
    );
    const ctx = context.chart.ctx;
    gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, r);
    gradient.addColorStop(0, c1);
    gradient.addColorStop(0.5, c2);
    gradient.addColorStop(1, c3);
    cache.set(c1 + c2 + c3, gradient);
  }

  return gradient;
}
// </block:createRadialGradient3>

// <block:data:2>
function generateData() {
  return Utils.numbers({
    count: DATA_COUNT,
    min: 0,
    max: 100
  });
}

const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [{
    data: generateData()
  }]
};
// </block:data>

// <block:config:1>
const config = {
  type: 'polarArea',
  data: data,
  options: {
    plugins: {
      legend: false,
      tooltip: false,
    },
    elements: {
      arc: {
        backgroundColor: function(context) {
          let c = colors[context.dataIndex];
          if (!c) {
            return;
          }
          if (context.active) {
            c = helpers.getHoverColor(c);
          }
          const mid = helpers.color(c).desaturate(0.2).darken(0.2).rgbString();
          const start = helpers.color(c).lighten(0.2).rotate(270).rgbString();
          const end = helpers.color(c).lighten(0.1).rgbString();
          return createRadialGradient3(context, start, mid, end);
        },
      }
    }
  }
};
// </block:config>

module.exports = {
  actions,
  config,
};
```
