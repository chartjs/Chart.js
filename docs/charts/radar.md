# Radar
A radar chart is a way of showing multiple data points and the variation between them.

They are often useful for comparing the points of two or more different data sets.

{% chartjs %}
{
    "type": "radar",
    "data": {
        "labels": [
            "Eating",
            "Drinking",
            "Sleeping",
            "Designing",
            "Coding",
            "Cycling",
            "Running"
        ],
        "datasets": [{
            "label": "My First Dataset",
            "data": [65, 59, 90, 81, 56, 55, 40],
            "fill": true,
            "backgroundColor": "rgba(255, 99, 132, 0.2)",
            "borderColor": "rgb(255, 99, 132)",
            "pointBackgroundColor": "rgb(255, 99, 132)",
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": "rgb(255, 99, 132)",
            "fill": true
        }, {
            "label": "My Second Dataset",
            "data": [28, 48, 40, 19, 96, 27, 100],
            "fill": true,
            "backgroundColor": "rgba(54, 162, 235, 0.2)",
            "borderColor": "rgb(54, 162, 235)",
            "pointBackgroundColor": "rgb(54, 162, 235)",
            "pointBorderColor": "#fff",
            "pointHoverBackgroundColor": "#fff",
            "pointHoverBorderColor": "rgb(54, 162, 235)",
            "fill": true
        }]
    },
    "options": {
        "elements": {
            "line": {
                "tension": 0,
                "borderWidth": 3
            }
        }
    }
}
{% endchartjs %}

## Example Usage
```javascript
var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
});
```

## Dataset Properties

The radar chart allows a number of properties to be specified for each dataset. These are used to set display properties for a specific dataset. For example, the colour of a line is generally set this way.

All point* properties can be specified as an array. If these are set to an array value, the first value applies to the first point, the second value to the second point, and so on.

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `String` | The label for the dataset which appears in the legend and tooltips.
| `backgroundColor` | `Color` | The fill color under the line. See [Colors](../general/colors.md#colors)
| `borderColor` | `Color` | The color of the line. See [Colors](../general/colors.md#colors)
| `borderWidth` | `Number` | The width of the line in pixels.
| `borderDash` | `Number[]` | Length and spacing of dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
| `borderDashOffset` | `Number` | Offset for line dashes. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
| `borderCapStyle` | `String` | Cap style of the line. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap)
| `borderJoinStyle` | `String` | Line joint style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
| `fill` | `Boolean/String` | How to fill the area under the line. See [area charts](area.md)
| `lineTension` | `Number` | Bezier curve tension of the line. Set to 0 to draw straightlines.
| `pointBackgroundColor` | `Color/Color[]` | The fill color for points.
| `pointBorderColor` | `Color/Color[]` | The border color for points.
| `pointBorderWidth` | `Number/Number[]` | The width of the point border in pixels.
| `pointRadius` | `Number/Number[]` | The radius of the point shape. If set to 0, the point is not rendered.
| `pointStyle` | `String/String[]/Image/Image[]` | Style of the point. [more...](#pointstyle)
| `pointHitRadius` | `Number/Number[]` | The pixel size of the non-displayed point that reacts to mouse events.
| `pointHoverBackgroundColor` | `Color/Color[]` | Point background color when hovered.
| `pointHoverBorderColor` | `Color/Color[]` | Point border color when hovered.
| `pointHoverBorderWidth` | `Number/Number[]` | Border width of point when hovered.
| `pointHoverRadius` | `Number/Number[]` | The radius of the point when hovered.

### pointStyle
The style of point. Options are:
* 'circle'
* 'cross'
* 'crossRot'
* 'dash'.
* 'line'
* 'rect'
* 'rectRounded'
* 'rectRot'
* 'star'
* 'triangle'

If the option is an image, that image is drawn on the canvas using [drawImage](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/drawImage).

## Configuration Options

Unlike other charts, the radar chart has no chart specific options.

## Scale Options

The radar chart supports only a single scale. The options for this scale are defined in the `scale` property.

```javascript
options = {
    scale: {
        // Hides the scale
        display: false
    }
};
```

## Default Options

It is common to want to apply a configuration setting to all created radar charts. The global radar chart settings are stored in `Chart.defaults.radar`. Changing the global options only affects charts created after the change. Existing charts are not changed.

## Data Structure

The `data` property of a dataset for a radar chart is specified as a an array of numbers. Each point in the data array corresponds to the label at the same index on the x axis.

```javascript
data: [20, 10]
```

For a radar chart, to provide context of what each point means, we include an array of strings that show around each point in the chart.

```javascript
data: {
    labels: ['Running', 'Swimming', 'Eating', 'Cycling'],
    datasets: [{
        data: [20, 10, 4, 2]
    }]
}
```
