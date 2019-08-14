# Legend Configuration

The chart legend displays data about the datasets that are appearing on the chart.

## Configuration options
The legend configuration is passed into the `options.legend` namespace. The global options for the chart legend is defined in `Chart.defaults.global.legend`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `true` | Is the legend shown?
| `position` | `string` | `'top'` | Position of the legend. [more...](#position)
| `align` | `string` | `'center'` | Alignment of the legend. [more...](#align)
| `fullWidth` | `boolean` | `true` | Marks that this box should take the full width of the canvas (pushing down other boxes). This is unlikely to need to be changed in day-to-day use.
| `onClick` | `function` | | A callback that is called when a click event is registered on a label item.
| `onHover` | `function` | | A callback that is called when a 'mousemove' event is registered on top of a label item.
| `onLeave` | `function` | | A callback that is called when a 'mousemove' event is registered outside of a previously hovered label item.
| `reverse` | `boolean` | `false` | Legend will show datasets in reverse order.
| `labels` | `object` | | See the [Legend Label Configuration](#legend-label-configuration) section below.
| `rtl` | `boolean` | | `true` for rendering the legends from right to left.
| `textDirection` | `string` | canvas' default | This will force the text direction `'rtl'|'ltr` on the canvas for rendering the legend, regardless of the css specified on the canvas

## Position
Position of the legend. Options are:
* `'top'`
* `'left'`
* `'bottom'`
* `'right'`

## Align
Alignment of the legend. Options are:
* `'start'`
* `'center'`
* `'end'`

Defaults to `'center'` for unrecognized values.

## Legend Label Configuration

The legend label configuration is nested below the legend configuration using the `labels` key.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `boxWidth` | `number` | `40` | Width of coloured box.
| `fontSize` | `number` | `12` | Font size of text.
| `fontStyle` | `string` | `'normal'` | Font style of text.
| `fontColor` | `Color` | `'#666'` | Color of text.
| `fontFamily` | `string` | `"'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"` | Font family of legend text.
| `padding` | `number` | `10` | Padding between rows of colored boxes.
| `generateLabels` | `function` | | Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See [Legend Item](#legend-item-interface) for details.
| `filter` | `function` | `null` | Filters legend items out of the legend. Receives 2 parameters, a [Legend Item](#legend-item-interface) and the chart data.
| `usePointStyle` | `boolean` | `false` | Label style will match corresponding point style (size is based on the mimimum value between boxWidth and fontSize).

## Legend Item Interface

Items passed to the legend `onClick` function are the ones returned from `labels.generateLabels`. These items must implement the following interface.

```javascript
{
    // Label that will be displayed
    text: string,

    // Fill style of the legend box
    fillStyle: Color,

    // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
    hidden: boolean,

    // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
    lineCap: string,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    lineDash: number[],

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    lineDashOffset: number,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    lineJoin: string,

    // Width of box border
    lineWidth: number,

    // Stroke style of the legend box
    strokeStyle: Color,

    // Point style of the legend box (only used if usePointStyle is true)
    pointStyle: string | Image,

    // Rotation of the point in degrees (only used if usePointStyle is true)
    rotation: number
}
```

## Example

The following example will create a chart with the legend enabled and turn all of the text red in color.

```javascript
var chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        legend: {
            display: true,
            labels: {
                fontColor: 'rgb(255, 99, 132)'
            }
        }
    }
});
```

## Custom On Click Actions

It can be common to want to trigger different behaviour when clicking an item in the legend. This can be easily achieved using a callback in the config object.

The default legend click handler is:
```javascript
function(e, legendItem) {
    var index = legendItem.datasetIndex;
    var ci = this.chart;
    var meta = ci.getDatasetMeta(index);

    // See controller.isDatasetVisible comment
    meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

    // We hid a dataset ... rerender the chart
    ci.update();
}
```

Lets say we wanted instead to link the display of the first two datasets. We could change the click handler accordingly.

```javascript
var defaultLegendClickHandler = Chart.defaults.global.legend.onClick;
var newLegendClickHandler = function (e, legendItem) {
    var index = legendItem.datasetIndex;

    if (index > 1) {
        // Do the original logic
        defaultLegendClickHandler(e, legendItem);
    } else {
        let ci = this.chart;
        [
            ci.getDatasetMeta(0),
            ci.getDatasetMeta(1)
        ].forEach(function(meta) {
            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
        });
        ci.update();
    }
};

var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        legend: {
            onClick: newLegendClickHandler
        }
    }
});
```

Now when you click the legend in this chart, the visibility of the first two datasets will be linked together.

## HTML Legends

Sometimes you need a very complex legend. In these cases, it makes sense to generate an HTML legend. Charts provide a `generateLegend()` method on their prototype that returns an HTML string for the legend.

To configure how this legend is generated, you can change the `legendCallback` config property.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        legendCallback: function(chart) {
            // Return the HTML string here.
        }
    }
});
```

Note that legendCallback is not called automatically and you must call `generateLegend()` yourself in code when creating a legend using this method.
