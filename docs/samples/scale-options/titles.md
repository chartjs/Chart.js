# Title Configuration

This sample shows how to configure the title of an axis including alignment, font, and color.

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: 0, max: 100};
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
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Month',
          color: '#911',
          font: {
            family: 'Comic Sans MS',
            size: 20,
            weight: 'bold',
            lineHeight: 1.2,
          },
          padding: {top: 20, left: 0, right: 0, bottom: 0}
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Value',
          color: '#191',
          font: {
            family: 'Times',
            size: 20,
            style: 'normal',
            lineHeight: 1.2
          },
          padding: {top: 30, left: 0, right: 0, bottom: 0}
        }
      }
    }
  },
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Docs
* [Line](../../charts/line.html)
* [Data structures (`labels`)](../../general/data-structures.html)
* [Axes Styling](../../axes/styling.html)
* [Cartesian Axes](../../axes/cartesian/)
  * [Common options to all cartesian axes](../../axes/cartesian/#common-options-to-all-cartesian-axes)
* [Labeling Axes](../../axes/labelling.html)
  * [Scale Title Configuration](../../axes/labelling.html#scale-title-configuration)