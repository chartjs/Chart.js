# Scatter Chart

Scatter charts are based on basic line charts with the x axis changed to a linear axis. To use a scatter chart, data must be passed as objects containing X and Y properties. The example below creates a scatter chart with 3 points.

```javascript
var scatterChart = new Chart(ctx, {
    type: 'scatter',
    data: {
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
            }]
        }]
    },
    options: {
        scales: {
            xAxes: [{
                type: 'linear',
                position: 'bottom'
            }]
        }
    }
});
```

## Dataset Properties
The scatter chart supports all of the same properties as the [line chart](./line.md#dataset-properties).

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
