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
    },
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

| Name | Type | Description
| ---- | ---- | -----------
| `backgroundColor` | `Color[]` | The fill color of the arcs in the dataset. See [Colors](../general/colors.md#colors)
| `borderColor` | `Color[]` | The border color of the arcs in the dataset. See [Colors](../general/colors.md#colors)
| `borderWidth` | `Number[]` | The border width of the arcs in the dataset.
| `hoverBackgroundColor` | `Color[]` | The fill colour of the arcs when hovered.
| `hoverBorderColor` | `Color[]` | The stroke colour of the arcs when hovered.
| `hoverBorderWidth` | `Number[]` | The stroke width of the arcs when hovered.

## Config Options

These are the customisation options specific to Polar Area charts. These options are merged with the [global chart default options](#default-options), and form the options of the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `startAngle` | `Number` | `-0.5 * Math.PI` | Starting angle to draw arcs for the first item in a dataset.
| `animation.animateRotate` | `Boolean` | `true` | If true, the chart will animate in with a rotation animation. This property is in the `options.animation` object.
| `animation.animateScale` | `Boolean` | `true` | If true, will animate scaling the chart from the center outwards.

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
