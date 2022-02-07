# Doughnut Empty State

```js chart-editor
// <block:data:2>
const data = {
  labels: [],
  datasets: [
    {
      label: 'Dataset 1',
      data: []
    }
  ]
};
// </block:data>

// <block:plugin:1>
const plugin = {
  id: 'emptyDoughnut',
  afterDraw(chart, args, options) {
    const {datasets} = chart.data;
    const {color, width, radiusDecrease} = options;
    let hasData = false;

    for (let i = 0; i < datasets.length; i += 1) {
      const dataset = datasets[i];
      hasData |= dataset.data.length > 0;
    }

    if (!hasData) {
      const {chartArea: {left, top, right, bottom}, ctx} = chart;
      const centerX = (left + right) / 2;
      const centerY = (top + bottom) / 2;
      const r = Math.min(right - left, bottom - top) / 2;

      ctx.beginPath();
      ctx.lineWidth = width || 2;
      ctx.strokeStyle = color || 'rgba(255, 128, 0, 0.5)';
      ctx.arc(centerX, centerY, (r - radiusDecrease || 0), 0, 2 * Math.PI);
      ctx.stroke();
    }
  }
};
// </block:plugin>

// <block:config:0>
const config = {
  type: 'doughnut',
  data: data,
  options: {
    plugins: {
      emptyDoughnut: {
        color: 'rgba(255, 128, 0, 0.5)',
        width: 2,
        radiusDecrease: 20
      }
    }
  },
  plugins: [plugin]
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
