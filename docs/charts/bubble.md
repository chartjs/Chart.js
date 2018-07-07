# Bubble Chart

A bubble chart is used to display three dimensions of data at the same time. The location of the bubble is determined by the first two dimensions and the corresponding horizontal and vertical axes. The third dimension is represented by the size of the individual bubbles.

{% chartjs %}
{
    "type": "bubble",
    "data": {
        "datasets": [{
            "label": "First Dataset",
            "data": [{
                "x": 20,
                "y": 30,
                "r": 15
            }, {
                "x": 40,
                "y": 10,
                "r": 10
            }],
            "backgroundColor": "rgb(255, 99, 132)"
        }]
    },
}
{% endchartjs %}

## Example Usage

```javascript
// For a bubble chart
var myBubbleChart = new Chart(ctx,{
    type: 'bubble',
    data: data,
    options: options
});
```

## Dataset Properties

The bubble chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of the bubbles is generally set this way.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) |  Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0,0,0,0.1)'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0,0,0,0.1)'`
| [`borderWidth`](#styling) | `Number` | Yes | Yes | `3`
| [`data`](#data-structure) | `Object[]` | - | - | **required**
| [`hoverBackgroundColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `Number` | Yes | Yes | `1`
| [`hoverRadius`](#interactions) | `Number` | Yes | Yes | `4`
| [`hitRadius`](#interactions) | `Number` | Yes | Yes | `1`
| [`label`](#labeling) | `String` | - | - | `undefined`
| [`pointStyle`](#styling) | `String` | Yes | Yes | `circle`
| [`rotation`](#styling) | `Number` | Yes | Yes | `0`
| [`radius`](#styling) | `Number` | Yes | Yes | `3`

### Labeling

`label` defines the text associated to the dataset and which appears in the legend and tooltips.

### Styling

The style of each bubble can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | bubble background color
| `borderColor` | bubble border color
| `borderWidth` | bubble border width (in pixels)
| `pointStyle` | bubble [shape style](../configuration/elements#point-styles)
| `rotation` | bubble rotation (in degrees)
| `radius` | bubble radius (in pixels)

All these values, if `undefined`, fallback to the associated [`elements.point.*`](../configuration/elements.md#point-configuration) options.

### Interactions

The interaction with each bubble can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | bubble background color when hovered
| `hoverBorderColor` | bubble border color hovered
| `hoverBorderWidth` | bubble border width when hovered (in pixels)
| `hoverRadius` | bubble **additional** radius when hovered (in pixels)
| `hitRadius` | bubble **additional** radius for hit detection (in pixels)

All these values, if `undefined`, fallback to the associated [`elements.point.*`](../configuration/elements.md#point-configuration) options.

## Default Options

We can also change the default values for the Bubble chart type. Doing so will give all bubble charts created after this point the new defaults. The default configuration for the bubble chart can be accessed at `Chart.defaults.bubble`.

## Data Structure

Bubble chart datasets need to contain a `data` array of points, each points represented by an object containing the following properties:

```javascript
{
    // X Value
    x: <Number>,

    // Y Value
    y: <Number>,

    // Bubble radius in pixels (not scaled).
    r: <Number>
}
```

**Important:** the radius property, `r` is **not** scaled by the chart, it is the raw radius in pixels of the bubble that is drawn on the canvas.
