# Polar Area Chart

Polar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.

This type of chart is often useful when we want to show a comparison data similar to a pie chart, but also show a scale of values for context.

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'Red',
    'Green',
    'Yellow',
    'Grey',
    'Blue'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [11, 16, 7, 3, 14],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(75, 192, 192)',
      'rgb(255, 205, 86)',
      'rgb(201, 203, 207)',
      'rgb(54, 162, 235)'
    ]
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'polarArea',
  data: data,
  options: {}
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
* `options.datasets.polarArea` - options for all polarArea datasets
* `options.elements.arc` - options for all [arc elements](../configuration/elements.md#arc-configuration)
* `options` - options for the whole chart

The following options can be included in a polar area chart dataset to configure options for that specific dataset.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderAlign`](#border-alignment) | `'center'`\|`'inner'` | Yes | Yes | `'center'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'#fff'`
| [`borderJoinStyle`](#styling) | `'round'`\|`'bevel'`\|`'miter'` | Yes | Yes | `undefined`
| [`borderWidth`](#styling) | `number` | Yes | Yes | `2`
| [`clip`](#general) | `number`\|`object`\|`false` | - | - | `undefined`
| [`data`](#data-structure) | `number[]` | - | - | **required**
| [`hoverBackgroundColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderJoinStyle`](#interactions) | `'round'`\|`'bevel'`\|`'miter'` | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | Yes | `undefined`
| [`circular`](#styling) | `boolean` | Yes | Yes | `true`

All these values, if `undefined`, fallback to the scopes described in [option resolution](../general/options)

### General

| Name | Description
| ---- | ----
| `clip` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. `0` = clip at chartArea. Clipping can also be configured per side: `clip: {left: 5, top: false, right: -2, bottom: 0}`

### Styling

The style of each arc can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | arc background color.
| `borderColor` | arc border color.
| `borderJoinStyle` | arc border join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `borderWidth` | arc border width (in pixels).
| `circular` | By default the Arc is curved. If `circular: false` the Arc will be flat.

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

### Border Alignment

The following values are supported for `borderAlign`.

* `'center'` (default)
* `'inner'`

When `'center'` is set, the borders of arcs next to each other will overlap. When `'inner'` is set, it is guaranteed that all the borders do not overlap.

### Interactions

The interaction with each arc can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | arc background color when hovered.
| `hoverBorderColor` | arc border color when hovered.
| `hoverBorderJoinStyle` | arc border join style when hovered. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin).
| `hoverBorderWidth` | arc border width when hovered (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

## Config Options

These are the customisation options specific to Polar Area charts. These options are looked up on access, and form together with the [global chart default options](#default-options) the options of the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `animation.animateRotate` | `boolean` | `true` | If true, the chart will animate in with a rotation animation. This property is in the `options.animation` object.
| `animation.animateScale` | `boolean` | `true` | If true, will animate scaling the chart from the center outwards.

The polar area chart uses the [radialLinear](../axes/radial/linear.md) scale. Additional configuration is provided via the scale.

## Default Options

We can also change these default values for each PolarArea type that is created, this object is available at `Chart.overrides.polarArea`. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all new polar area charts with `animateScale = false` you would do:

```javascript
Chart.overrides.polarArea.animation.animateScale = false;
```

## Data Structure

For a polar area chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly for each slice.

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
