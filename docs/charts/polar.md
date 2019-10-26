# Polar Area

Polar area charts are similar to pie charts, but each segment has the same angle - the radius of the segment differs depending on the value.

This type of chart is often useful when we want to show a comparison data similar to a pie chart, but also show a scale of values for context.

{% chartjs %}
{
    "type": "polarArea",
    "data": {
        "labels": [
            "Red",
            "Green",
            "Yellow",
            "Grey",
            "Blue"
        ],
        "datasets": [{
            "label": "My First Dataset",
            "data": [11, 16, 7, 3, 14],
            "backgroundColor": [
                "rgb(255, 99, 132)",
                "rgb(75, 192, 192)",
                "rgb(255, 205, 86)",
                "rgb(201, 203, 207)",
                "rgb(54, 162, 235)"
            ]
        }]
    }
}
{% endchartjs %}

## Example Usage

```javascript
new Chart(ctx, {
    data: data,
    type: 'polarArea',
    options: options
});
```

## Dataset Properties

The following options can be included in a polar area chart dataset to configure options for that specific dataset.

| Name | Type | [Scriptable](../general/options.md#scriptable-options) | [Indexable](../general/options.md#indexable-options) | Default
| ---- | ---- | :----: | :----: | ----
| [`backgroundColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'rgba(0, 0, 0, 0.1)'`
| [`borderAlign`](#border-alignment) | `string` | Yes | Yes | `'center'`
| [`borderColor`](#styling) | [`Color`](../general/colors.md) | Yes | Yes | `'#fff'`
| [`borderWidth`](#styling) | `number` | Yes | Yes | `2`
| [`data`](#data-structure) | `number[]` | - | - | **required**
| [`hoverBackgroundColor`](#interations) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderColor`](#interactions) | [`Color`](../general/colors.md) | Yes | Yes | `undefined`
| [`hoverBorderWidth`](#interactions) | `number` | Yes | Yes | `undefined`

### Styling

The style of each arc can be controlled with the following properties:

| Name | Description
| ---- | ----
| `backgroundColor` | arc background color.
| `borderColor` | arc border color.
| `borderWidth` | arc border width (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

### Border Alignment

The following values are supported for `borderAlign`.

* `'center'` (default)
* `'inner'`

When `'center'` is set, the borders of arcs next to each other will overlap. When `'inner'` is set, it is guaranteed that all the borders are not overlap.

### Interactions

The interaction with each arc can be controlled with the following properties:

| Name | Description
| ---- | -----------
| `hoverBackgroundColor` | arc background color when hovered.
| `hoverBorderColor` | arc border color when hovered.
| `hoverBorderWidth` | arc border width when hovered (in pixels).

All these values, if `undefined`, fallback to the associated [`elements.arc.*`](../configuration/elements.md#arc-configuration) options.

## Config Options

These are the customisation options specific to Polar Area charts. These options are merged with the [global chart default options](#default-options), and form the options of the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `startAngle` | `number` | `-0.5 * Math.PI` | Starting angle to draw arcs for the first item in a dataset.
| `animation.animateRotate` | `boolean` | `true` | If true, the chart will animate in with a rotation animation. This property is in the `options.animation` object.
| `animation.animateScale` | `boolean` | `true` | If true, will animate scaling the chart from the center outwards.

## Default Options

We can also change these defaults values for each PolarArea type that is created, this object is available at `Chart.defaults.polarArea`. Changing the global options only affects charts created after the change. Existing charts are not changed.

For example, to configure all new polar area charts with `animateScale = false` you would do:
```javascript
Chart.defaults.polarArea.animation.animateScale = false;
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
