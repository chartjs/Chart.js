# Bubble Chart

A bubble chart is used to display three dimensions of data at the same time. The location of the bubble is determined by the first two dimensions and the corresponding horizontal and vertical axes. The third dimension is represented by the size of the individual bubbles.

```js chart-editor
// <block:setup:1>
const data = {
  datasets: [{
    label: 'First Dataset',
    data: [{
      x: 20,
      y: 30,
      r: 15
    }, {
      x: 40,
      y: 10,
      r: 10
    }],
    backgroundColor: 'rgb(255, 99, 132)'
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'bubble',
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
* `options.datasets.bubble` - options for all bubble datasets
* `options.elements.point` - options for all [point elements](../configuration/elements.md#point-configuration)
* `options` - options for the whole chart

The bubble chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of the bubbles is generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderWidth`](#styling) | `number` | Yes | Yes | `3`
| [`clip`](#general) | `number`\|`object` | - | - | `undefined`
| [`data`](#data-structure) | `object[]` | - | - | **required**
| [`drawActiveElementsOnTop`](#general) | `boolean` | Yes | Yes | `true`
| [`hoverBackgroundColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | Yes | `1`
| [`hoverRadius`](#interactions) | `number` | Yes | Yes | `4`
| [`hitRadius`](#interactions) | `number` | Yes | Yes | `1`
| [`label`](#general) | `string` | - | - | `undefined`
| [`order`](#general) | `number` | - | - | `0`
| [`pointStyle`](#styling) | [`pointStyle`](../configuration/elements.md#types) | Yes | Yes | `'circle'`
| [`rotation`](#styling) | `number` | Yes | Yes | `0`
| [`radius`](#styling) | `number` | Yes | Yes | `3`

All these values, if `undefined`, fallback to the scopes described in [option resolution](../general/options)

### General

| Name | Description
| ---- | ----
| `clip` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. `0` = clip at chartArea. Clipping can also be configured per side: `clip: {left: 5, top: false, right: -2, bottom: 0}`
| `drawActiveElementsOnTop` | Draw the active bubbles of a dataset over the other bubbles of the dataset
| `label` | The label for the dataset which appears in the legend and tooltips.
| `order` | The drawing order of dataset. Also affects order for tooltip and legend. [more](mixed.md#drawing-order)

### Styling

The style of each bubble can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | bubble background color.
| `borderColor` | bubble border color.
| `borderWidth` | bubble border width (in pixels).
| `pointStyle` | bubble [shape style](../configuration/elements.md#point-styles).
| `rotation` | bubble rotation (in degrees).
| `radius` | bubble radius (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.point.*`](../configuration/elements.md#point-configuration) options.

### Interactions

The interaction with each bubble can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hitRadius` | bubble **additional** radius for hit detection (in pixels).
| `hoverBackgroundColor` | bubble background color when hovered.
| `hoverBorderColor` | bubble border color when hovered.
| `hoverBorderWidth` | bubble border width when hovered (in pixels).
| `hoverRadius` | bubble **additional** radius when hovered (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.point.*`](../configuration/elements.md#point-configuration) options.

## Default Options

We can also change the default values for the Bubble chart type. Doing so will give all bubble charts created after this point the new defaults. The default configuration for the bubble chart can be accessed at `Chart.overrides.bubble`.

## Data Structure

Bubble chart datasets need to contain a `data` array of points, each point represented by an object containing the following properties:

```javascript
{
    // X Value
    x: number,

    // Y Value
    y: number,

    // Bubble radius in pixels (not scaled).
    r: number
}
```

**Important:** the radius property, `r` is **not** scaled by the chart, it is the raw radius in pixels of the bubble that is drawn on the canvas.

## Internal data format

`{x, y, _custom}` where `_custom` is the radius.
