# Stepped Line Charts

```js chart-editor
// <block:setup:1>
const data = {
  labels: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'],
  datasets: [
    {
      label: 'Dataset',
      data: Utils.numbers({count: 6, min: -100, max: 100}),
      borderColor: Utils.CHART_COLORS.red,
      fill: false,

      // Change the stepped mode to explore different stepped chart options
      // false: no stepping
      // true: stepped before interpolation
      // 'before': step before interpolation
      // 'after': step after interpolation
      // 'middle': step middle interpolation
      stepped: true,
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: (ctx) => 'Step ' + ctx.chart.data.datasets[0].stepped + ' Interpolation',
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```
