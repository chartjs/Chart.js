# Waterfall Chart

A waterfall chart can be created using floating bars. Each bar starts from the previous cumulative value and ends at the next cumulative value.

```js chart-editor
// <block:setup:1>
const labels = ['Start', 'Revenue', 'Expenses', 'Tax', 'Total'];

const data = {
  labels: labels,
  datasets: [{
    label: 'Waterfall',
    data: [
      [0, 100],
      [100, 170],
      [170, 120],
      [120, 90],
      [0, 90],
    ],
    backgroundColor: [
      Utils.CHART_COLORS.blue,
      Utils.CHART_COLORS.green,
      Utils.CHART_COLORS.red,
      Utils.CHART_COLORS.red,
      Utils.CHART_COLORS.blue,
    ],
    borderColor: [
      Utils.CHART_COLORS.blue,
      Utils.CHART_COLORS.green,
      Utils.CHART_COLORS.red,
      Utils.CHART_COLORS.red,
      Utils.CHART_COLORS.blue,
    ],
    borderWidth: 1,
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bar',
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Chart.js Waterfall Chart'
      }
    }
  }
};
// </block:config>

module.exports = {
  config: config,
};
```

## Docs
* [Bar](../../charts/bar.md)
* [Floating Bars](./floating.md)
