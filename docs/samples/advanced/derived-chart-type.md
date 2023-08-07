# Derived Chart Type

```js chart-editor
// <block:setup:1>
const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100, rmin: 1, rmax: 20};
const data = {
  datasets: [
    {
      label: 'My First dataset',
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
      borderColor: Utils.CHART_COLORS.blue,
      borderWidth: 1,
      boxStrokeStyle: 'red',
      data: Utils.bubbles(NUMBER_CFG)
    }
  ],
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'derivedBubble',
  data: data,
  options: {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Derived Chart Type'
      },
    }
  }
};

// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## DerivedBubble Implementation

<<< @/scripts/derived-bubble.js

## Docs
* [Bubble Chart](../../charts/bubble.md)
* [New Charts](../../developers/charts.md)
