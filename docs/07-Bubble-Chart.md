---
title: Bubble Chart
anchor: bubble-chart
---
### Introduction
A bubble chart is used to display three dimensions of data at the same time. The location of the bubble is determined by the first two dimensions and the corresponding horizontal and vertical axes. The third dimension is represented by the size of the individual bubbles. 

<div class="canvas-holder">
    <canvas width="250" height="125"></canvas>
</div>
<br>

### Example Usage

```javascript
// For a bubble chart
var myBubbleChart = new Chart(ctx,{
    type: 'bubble',
    data: data,
    options: options
});
```

### Data Structure

Property | Type | Usage
--- | --- | ---
data | `Array<BubbleDataObject>` | The data to plot as bubbles. See [Data format](#bubble-chart-data-format)
label | `String` | The label for the dataset which appears in the legend and tooltips
backgroundColor | `Color Array<Color>` | The fill color of the bubbles.
borderColor | `Color or Array<Color>` | The stroke color of the bubbles.
borderWidth | `Number or Array<Number>` | The stroke width of bubble in pixels.
hoverBackgroundColor | `Color or Array<Color>` | The fill color of the bubbles when hovered.
hoverBorderColor | `Color or Array<Color>` | The stroke color of the bubbles when hovered.
hoverBorderWidth | `Number or Array<Number>` | The stroke width of the bubbles when hovered.
hoverRadius | `Number or Array<Number>` | Additional radius to add to data radius on hover.

An example data object using these attributes is shown below. This example creates a single dataset with 2 different bubbles.

```javascript
var data = {
    datasets: [
        {
            label: 'First Dataset',
            data: [
                {
                    x: 20,
                    y: 30,
                    r: 15
                },
                {
                    x: 40,
                    y: 10,
                    r: 10
                }
            ],
            backgroundColor:"#FF6384",
            hoverBackgroundColor: "#FF6384",
        }]
};
```

### Data Object

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

### Chart Options

The bubble chart has no unique configuration options. To configure options common to all of the bubbles, the point element options are used. 

For example, to give all bubbles a 1px wide black border, the following options would be used.

```javascript
new Chart(ctx,{
    type:"bubble",
    options: {
        elements: {
            points: {
                borderWidth: 1,
                borderColor: 'rgb(0, 0, 0)'
            }
        }
    }
});
```

We can also change the default values for the Bubble chart type. Doing so will give all bubble charts created after this point the new defaults. The default configuration for the bubble chart can be accessed at `Chart.defaults.bubble`.
