# Doughnut and Pie
Pie and doughnut charts are probably the most commonly used charts. They are divided into segments, the arc of each segment shows the proportional value of each piece of data.

They are excellent at showing the relational proportions between data.

Pie and doughnut charts are effectively the same class in Chart.js, but have one different default value - their `cutoutPercentage`. This equates what percentage of the inner should be cut out. This defaults to `0` for pie charts, and `50` for doughnuts.

They are also registered under two aliases in the `Chart` core. Other than their different default value, and different alias, they are exactly the same.

{% chartjs %}
{
    "type": "doughnut",
    "data": {
        "labels": [
            "Red",
            "Blue",
            "Yellow",
        ],
        "datasets": [{
            "label": "My First Dataset",
            "data": [300, 50, 100],
            "backgroundColor": [
                "rgb(255, 99, 132)",
                "rgb(54, 162, 235)",
                "rgb(255, 205, 86)",
            ]
        }]
    },
}
{% endchartjs %}

## Example Usage

```javascript
// For a pie chart
var myPieChart = new Chart(ctx,{
    type: 'pie',
    data: data,
    options: options
});
```

```javascript
// And for a doughnut chart
var myDoughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: data,
    options: options
});
```

## Dataset Properties

The doughnut/pie chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a the dataset's arc are generally set this way.

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `String` | The label for the dataset which appears in the legend and tooltips.
| `backgroundColor` | `Color[]` | The fill color of the arcs in the dataset. See [Colors](../general/colors.md#colors)
| `borderColor` | `Color[]` | The border color of the arcs in the dataset. See [Colors](../general/colors.md#colors)
| `borderWidth` | `Number[]` | The border width of the arcs in the dataset.
| `hoverBackgroundColor` | `Color[]` | The fill colour of the arcs when hovered.
| `hoverBorderColor` | `Color[]` | The stroke colour of the arcs when hovered.
| `hoverBorderWidth` | `Number[]` | The stroke width of the arcs when hovered.

## Config Options

These are the customisation options specific to Pie & Doughnut charts. These options are merged with the global chart configuration options, and form the options of the chart.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `cutoutPercentage` | `Number` | `50` - for doughnut, `0` - for pie | The percentage of the chart that is cut out of the middle.
| `rotation` | `Number` | `-0.5 * Math.PI` | Starting angle to draw arcs from.
| `circumference` | `Number` | `2 * Math.PI` | Sweep to allow arcs to cover
| `animation.animateRotate` | `Boolean` | `true` | If true, the chart will animate in with a rotation animation. This property is in the `options.animation` object.
| `animation.animateScale` | `Boolean` | `false` | If true, will animate scaling the chart from the center outwards.

## Default Options

We can also change these default values for each Doughnut type that is created, this object is available at `Chart.defaults.doughnut`. Pie charts also have a clone of these defaults available to change at `Chart.defaults.pie`, with the only difference being `cutoutPercentage` being set to 0.

## Data Structure

For a pie chart, datasets need to contain an array of data points. The data points should be a number, Chart.js will total all of the numbers and calculate the relative proportion of each.

You also need to specify an array of labels so that tooltips appear correctly

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