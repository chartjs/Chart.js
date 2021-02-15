---
title: Legend
---

The chart legend displays data about the datasets that are appearing on the chart.

## Configuration options

The legend configuration is passed into the `options.plugins.legend` namespace. The global options for the chart legend is defined in `Chart.defaults.plugins.legend`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `legend.display` | `boolean` | `true` | Is the legend shown?
| `legend.position` | `string` | `'top'` | Position of the legend. [more...](#position)
| `legend.align` | `string` | `'center'` | Alignment of the legend. [more...](#align)
| `legend.maxHeight` | `number` | | Maximum height of the legend, in pixels
| `legend.maxWidth` | `number` | | Maximum width of the legend, in pixels
| `legend.fullSize` | `boolean` | `true` | Marks that this box should take the full width/height of the canvas (moving other boxes). This is unlikely to need to be changed in day-to-day use.
| `legend.onClick` | `function` | | A callback that is called when a click event is registered on a label item. Arguments: `[event, legendItem, legend]`.
| `legend.onHover` | `function` | | A callback that is called when a 'mousemove' event is registered on top of a label item. Arguments: `[event, legendItem, legend]`.
| `legend.onLeave` | `function` | | A callback that is called when a 'mousemove' event is registered outside of a previously hovered label item. Arguments: `[event, legendItem, legend]`.
| `legend.reverse` | `boolean` | `false` | Legend will show datasets in reverse order.
| `legend.labels` | `object` | | See the [Legend Label Configuration](#legend-label-configuration) section below.
| `legend.rtl` | `boolean` | | `true` for rendering the legends from right to left.
| `legend.textDirection` | `string` | canvas' default | This will force the text direction `'rtl'` or `'ltr'` on the canvas for rendering the legend, regardless of the css specified on the canvas
| `legend.title` | `object` | | See the [Legend Title Configuration](#legend-title-configuration) section below.

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

The legend label configuration is nested below the legend configuration using the `options.plugins.legend.labels` namespace.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `legend.labels.boxWidth` | `number` | `40` | Width of coloured box.
| `legend.labels.boxHeight` | `number` | `font.size` | Height of the coloured box.
| `legend.labels.color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of label and the strikethrough.
| `legend.labels.font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `legend.labels.padding` | `number` | `10` | Padding between rows of colored boxes.
| `legend.labels.generateLabels` | `function` | | Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See [Legend Item](#legend-item-interface) for details.
| `legend.labels.filter` | `function` | `null` | Filters legend items out of the legend. Receives 2 parameters, a [Legend Item](#legend-item-interface) and the chart data.
| `legend.labels.sort` | `function` | `null` | Sorts legend items. Receives 3 parameters, two [Legend Items](#legend-item-interface) and the chart data.
| `legend.labels.pointStyle` | | | If specified, this style of point is used for the legend. Only used if `usePointStyle` is true.
| `legend.labels.usePointStyle` | `boolean` | `false` | Label style will match corresponding point style (size is based on the minimum value between boxWidth and font.size).

## Legend Title Configuration

The legend title configuration is nested below the legend configuration using the `options.plugins.legend.title` namespace.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `legend.title.color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of text.
| `legend.title.display` | `boolean` | `false` | Is the legend title displayed.
| `legend.title.font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `legend.title.padding` | `number`\|`object` | `0` | Padding around the title. If specified as a number, it applies evenly to all sides.
| `legend.title.text` | `string` | | The string title.

## Legend Item Interface

Items passed to the legend `onClick` function are the ones returned from `labels.generateLabels`. These items must implement the following interface.

```javascript
{
    // Label that will be displayed
    text: string,

    // Index of the associated dataset
    datasetIndex: number,

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
        plugins: {
            legend: {
                display: true,
                labels: {
                    color: 'rgb(255, 99, 132)'
                }
            }
        }
    }
});
```

## Custom On Click Actions

It can be common to want to trigger different behaviour when clicking an item in the legend. This can be easily achieved using a callback in the config object.

The default legend click handler is:

```javascript
function(e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const ci = legend.chart;
    if (ci.isDatasetVisible(index)) {
        ci.hide(index);
        legendItem.hidden = true;
    } else {
        ci.show(index);
        legendItem.hidden = false;
    }
}
```

Lets say we wanted instead to link the display of the first two datasets. We could change the click handler accordingly.

```javascript
var defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
var newLegendClickHandler = function (e, legendItem, legend) {
    var index = legendItem.datasetIndex;

    if (index > 1) {
        // Do the original logic
        defaultLegendClickHandler(e, legendItem);
    } else {
        let ci = legend.chart;
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
        plugins: {
            legend: {
                onClick: newLegendClickHandler
            }
        }
    }
});
```

Now when you click the legend in this chart, the visibility of the first two datasets will be linked together.
