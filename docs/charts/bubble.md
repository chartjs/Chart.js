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

All properties, except `label` can be specified as an array. If these are set to an array value, the first value applies to the first bubble in the dataset, the second value to the second bubble, and so on.

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `String` | The label for the dataset which appears in the legend and tooltips.
| `backgroundColor` | `Color/Color[]` | The fill color for bubbles.
| `borderColor` | `Color/Color[]` | The border color for bubbles.
| `borderWidth` | `Number/Number[]` | The width of the point bubbles in pixels.
| `hoverBackgroundColor` | `Color/Color[]` | Bubble background color when hovered.
| `hoverBorderColor` | `Color/Color[]` | Bubble border color when hovered.
| `hoverBorderWidth` | `Number/Number[]` | Border width of point when hovered.
| `hoverRadius` | `Number/Number[]` | Additional radius to add to data radius on hover.

## Config Options

The bubble chart has no unique configuration options. To configure options common to all of the bubbles, the [point element options](../configuration/elements/point.md#point-configuration) are used.

## Default Options

We can also change the default values for the Bubble chart type. Doing so will give all bubble charts created after this point the new defaults. The default configuration for the bubble chart can be accessed at `Chart.defaults.bubble`.

## Data Structure

For a bubble chart, datasets need to contain an array of data points. Each point must implement the [bubble data object](#bubble-data-object) interface.

### Bubble Data Object

Data for the bubble chart is passed in the form of an object. The object must implement the following interface. It is important to note that the radius property, `r` is **not** scaled by the chart. It is the raw radius in pixels of the bubble that is drawn on the canvas.

```javascript
{
    // X Value
    x: <Number>,

    // Y Value
    y: <Number>,

    // Radius of bubble. This is not scaled.
    r: <Number>
}
```