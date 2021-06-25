# Scatter Chart

Scatter charts are based on basic line charts with the x axis changed to a linear axis. To use a scatter chart, data must be passed as objects containing X and Y properties. The example below creates a scatter chart with 4 points.

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [{
    label: 'Scatter Dataset',
    data: [{
      x: -10,
      y: 0
    }, {
      x: 0,
      y: 10
    }, {
      x: 10,
      y: 5
    }, {
      x: 0.5,
      y: 5.5
    }],
    backgroundColor: 'rgb(255, 99, 132)'
  }],
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'scatter',
  data: data,
  options: {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom'
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

## Dataset Properties

Namespaces:

* `data.datasets[index]` - options for this dataset only
* `options.datasets.scatter` - options for all scatter datasets
* `options.elements.line` - options for all [line elements](../configuration/elements.md#line-configuration)
* `options.elements.point` - options for all [point elements](../configuration/elements.md#point-configuration)
* `options` - options for the whole chart

The scatter chart supports all of the same properties as the [line chart](./line.md#dataset-properties).
By default, the scatter chart will override the showLine property of the line chart to `false`.

The index scale is of the type `linear`. This means if you are using the labels array the values have to be numbers or parsable to numbers, the same applies to the object format for the keys.

## Data Structure

Unlike the line chart where data can be supplied in two different formats, the scatter chart only accepts data in a point format.

```javascript
data: [{
        x: 10,
        y: 20
    }, {
        x: 15,
        y: 10
    }]
```

## Internal data format

`{x, y}`
