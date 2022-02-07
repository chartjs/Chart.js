# Doughnut and Pie Charts

Pie and doughnut charts are probably the most commonly used charts. They are divided into segments, the arc of each segment shows the proportional value of each piece of data.

They are excellent at showing the relational proportions between data.

Pie and doughnut charts are effectively the same class in Chart.js, but have one different default value - their `cutout`. This equates to what portion of the inner should be cut out. This defaults to `0` for pie charts, and `'50%'` for doughnuts.

They are also registered under two aliases in the `Chart` core. Other than their different default value, and different alias, they are exactly the same.

:::: tabs

::: tab Doughnut

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'doughnut',
  data: data,
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

:::

:::tab Pie

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'pie',
  data: data,
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

:::

::::

## Dataset Properties

Namespaces:

* `data.datasets[index]` - options for this dataset only
* `options.datasets.doughnut` - options for all doughnut datasets
* `options.datasets.pie` - options for all pie datasets
* `options.elements.arc` - options for all [arc elements](../configuration/elements.md#arc-configuration)
* `options` - options for the whole chart

The doughnut/pie chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colours of the dataset's arcs are generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderAlign`](#border-alignment) | `'center'`\|`'inner'` | Yes | Yes | `'center'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'#fff'`
| [`borderJoinStyle`](#styling) | `'round'`\|`'bevel'`\|`'miter'` | Yes | Yes | `undefined`
| [`borderRadius`](#border-radius) | `number`\|`object` | Yes | Yes | `0`
| [`borderWidth`](#styling) | `number` | Yes | Yes | `2`
| [`circumference`](#general) | `number` | - | - | `undefined`
| [`clip`](#general) | `number`\|`object` | - | - | `undefined`
| [`data`](#data-structure) | `number[]` | - | - | **required**
| [`hoverBackgroundColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderJoinStyle`](#interactions) | `'round'`\|`'bevel'`\|`'miter'` | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | Yes | `undefined`
| [`hoverOffset`](#interactions) | `number` | Yes | Yes | `0`
| [`offset`](#styling) | `number` | Yes | Yes | `0`
| [`rotation`](#general) | `number` | - | - | `undefined`
| [`spacing`](#styling) | `number` | - | - | `0`
| [`weight`](#styling) | `number` | - | - | `1`

All these values, if `undefined`, fallback to the scopes described in [option resolution](../general/options)

### General

| Name | Description
| ---- | ----
| `circumference` | Per-dataset override for the sweep that the arcs cover
| `clip` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. `0` = clip at chartArea. Clipping can also be configured per side: `clip: {left: 5, top: false, right: -2, bottom: 0}`
| `rotation` | Per-dataset override for the starting angle to draw arcs from

### Styling

The style of each arc can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | arc background color.
| `borderColor` | arc border color.
| `borderJoinStyle` | arc border join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `borderWidth` | arc border width (in pixels).
| `offset` | arc offset (in pixels).
| `spacing` | Fixed arc offset (in pixels). Similar to `offset` but applies to all arcs.
| `weight` | The relative thickness of the dataset. Providing a value for weight will cause the pie or doughnut dataset to be drawn with a thickness relative to the sum of all the dataset weight values.

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

### Border Alignment

The following values are supported for `borderAlign`.

* `'center'` (default)
* `'inner'`

When `'center'` is set, the borders of arcs next to each other will overlap. When `'inner'` is set, it is guaranteed that all borders will not overlap.

### Border Radius

If this value is a number, it is applied to all corners of the arc (outerStart, outerEnd, innerStart, innerRight). If this value is an object, the `outerStart` property defines the outer-start corner's border radius. Similarly, the `outerEnd`, `innerStart`, and `innerEnd` properties can also be specified.

### Interactions

The interaction with each arc can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | arc background color when hovered.
| `hoverBorderColor` | arc border color when hovered.
| `hoverBorderJoinStyle` | arc border join style when hovered. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `hoverBorderWidth` | arc border width when hovered (in pixels).
| `hoverOffset` | arc offset when hovered (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

## Config Options

These are the customisation options specific to Pie & Doughnut charts. These options are looked up on access, and form together with the global chart configuration the options of the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `cutout` | `number`\|`string` | `50%` - for doughnut, `0` - for pie | The portion of the chart that is cut out of the middle. If `string` and ending with '%', percentage of the chart radius. `number` is considered to be pixels.
| `radius` | `number`\|`string` | `100%` | The outer radius of the chart. If `string` and ending with '%', percentage of the maximum radius. `number` is considered to be pixels.
| `rotation` | `number` | 0 | Starting angle to draw arcs from.
| `circumference` | `number` | 360 | Sweep to allow arcs to cover.
| `animation.animateRotate` | `boolean` | `true` | If true, the chart will animate in with a rotation animation. This property is in the `options.animation` object.
| `animation.animateScale` | `boolean` | `false` | If true, will animate scaling the chart from the center outwards.

## Default Options

We can also change these default values for each Doughnut type that is created, this object is available at `Chart.overrides.doughnut`. Pie charts also have a clone of these defaults available to change at `Chart.overrides.pie`, with the only difference being `cutout` being set to 0.

## Data Structure

For a pie chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly.

```javascript
data = {
    datasets: [{
        data: [10, 20, 30]
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Red',
        'Yellow',
        'Blue'
    ]
};
```
