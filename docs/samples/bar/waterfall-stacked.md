# Waterfall Chart Using Stacked Bars

A waterfall chart can be created using stacked bars with a transparent base dataset. The base dataset positions each step, while the change dataset renders the visible positive or negative bars.

```js chart-editor
// <block:setup:1>
const labels = ['Start', 'Revenue', 'Cost', 'Tax', 'End'];

const data = {
  labels: labels,
  datasets: [
    {
      label: 'Base',
      data: [0, 500, 550, 500, 0],
      backgroundColor: 'rgba(0, 0, 0, 0)',
      borderWidth: 0,
      stack: 'waterfall',
    },
    {
      label: 'Change',
      data: [500, 200, 150, 50, 500],
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
      stack: 'waterfall',
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bar',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Waterfall Chart Using Stacked Bars'
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true
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
* [Stacked Bar Chart](../../charts/bar.md#stacked-bar-chart)
