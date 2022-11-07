# Legend

The chart legend displays data about the datasets that are appearing on the chart.

## Configuration options

Namespace: `options.plugins.legend`, the global options for the chart legend is defined in `Chart.defaults.plugins.legend`.

:::warning
The doughnut, pie, and polar area charts override the legend defaults. To change the overrides for those chart types, the options are defined in `Chart.overrides[type].plugins.legend`.
:::

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `true` | Is the legend shown?
| `position` | `string` | `'top'` | Position of the legend. [more...](#position)
| `align` | `string` | `'center'` | Alignment of the legend. [more...](#align)
| `maxHeight` | `number` | | Maximum height of the legend, in pixels
| `maxWidth` | `number` | | Maximum width of the legend, in pixels
| `fullSize` | `boolean` | `true` | Marks that this box should take the full width/height of the canvas (moving other boxes). This is unlikely to need to be changed in day-to-day use.
| `onClick` | `function` | | A callback that is called when a click event is registered on a label item. Arguments: `[event, legendItem, legend]`.
| `onHover` | `function` | | A callback that is called when a 'mousemove' event is registered on top of a label item. Arguments: `[event, legendItem, legend]`.
| `onLeave` | `function` | | A callback that is called when a 'mousemove' event is registered outside of a previously hovered label item. Arguments: `[event, legendItem, legend]`.
| `reverse` | `boolean` | `false` | Legend will show datasets in reverse order.
| `labels` | `object` | | See the [Legend Label Configuration](#legend-label-configuration) section below.
| `rtl` | `boolean` | | `true` for rendering the legends from right to left.
| `textDirection` | `string` | canvas' default | This will force the text direction `'rtl'` or `'ltr'` on the canvas for rendering the legend, regardless of the css specified on the canvas
| `title` | `object` | | See the [Legend Title Configuration](#legend-title-configuration) section below.

:::tip Note
If you need more visual customizations, please use an [HTML legend](../samples/legend/html.md).
:::

## Position

Position of the legend. Options are:

* `'top'`
* `'left'`
* `'bottom'`
* `'right'`
* `'chartArea'`

When using the `'chartArea'` option the legend position is at the moment not configurable, it will always be on the left side of the chart in the middle.

## Align

Alignment of the legend. Options are:

* `'start'`
* `'center'`
* `'end'`

Defaults to `'center'` for unrecognized values.

## Legend Label Configuration

Namespace: `options.plugins.legend.labels`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `boxWidth` | `number` | `40` | Width of coloured box.
| `boxHeight` | `number` | `font.size` | Height of the coloured box.
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of label and the strikethrough.
| `font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `padding` | `number` | `10` | Padding between rows of colored boxes.
| `generateLabels` | `function` | | Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See [Legend Item](#legend-item-interface) for details.
| `filter` | `function` | `null` | Filters legend items out of the legend. Receives 2 parameters, a [Legend Item](#legend-item-interface) and the chart data.
| `sort` | `function` | `null` | Sorts legend items. Type is : `sort(a: LegendItem, b: LegendItem, data: ChartData): number;`. Receives 3 parameters, two [Legend Items](#legend-item-interface) and the chart data. The return value of the function is a number that indicates the order of the two legend item parameters. The ordering matches the [return value](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#description) of `Array.prototype.sort()`
| [`pointStyle`](elements.md#point-styles) | [`pointStyle`](elements.md#types) | `'circle'` | If specified, this style of point is used for the legend. Only used if `usePointStyle` is true.
| `textAlign` | `string` | `'center'` | Horizontal alignment of the label text. Options are: `'left'`, `'right'` or `'center'`.
| `usePointStyle` | `boolean` | `false` | Label style will match corresponding point style (size is based on pointStyleWidth or the minimum value between boxWidth and font.size).
| `pointStyleWidth` | `number` | `null` | If `usePointStyle` is true, the width of the point style used for the legend.
| `useBorderRadius` | `boolean` | `false` | Label borderRadius will match corresponding borderRadius.
| `borderRadius` | `number` | `undefined` | Override the borderRadius to use.

## Legend Title Configuration

Namespace: `options.plugins.legend.title`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `color` | [`Color`](../general/colors.md) | `Chart.defaults.color` | Color of text.
| `display` | `boolean` | `false` | Is the legend title displayed.
| `font` | `Font` | `Chart.defaults.font` | See [Fonts](../general/fonts.md)
| `padding` | [`Padding`](../general/padding.md) | `0` | Padding around the title.
| `text` | `string` | | The string title.

## Legend Item Interface

Items passed to the legend `onClick` function are the ones returned from `labels.generateLabels`. These items must implement the following interface.

```javascript
{
    // Label that will be displayed
    text: string,

    // Border radius of the legend item.
    // Introduced in 3.1.0
    borderRadius?: number | BorderRadius,

    // Index of the associated dataset
    datasetIndex: number,

    // Fill style of the legend box
    fillStyle: Color,

    // Text color
    fontColor: Color,

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
    pointStyle: string | Image | HTMLCanvasElement,

    // Rotation of the point in degrees (only used if usePointStyle is true)
    rotation: number
}
```

## Example

The following example will create a chart with the legend enabled and turn all of the text red in color.

```javascript
const chart = new Chart(ctx, {
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
const defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
const pieDoughnutLegendClickHandler = Chart.controllers.doughnut.overrides.plugins.legend.onClick;
const newLegendClickHandler = function (e, legendItem, legend) {
    const index = legendItem.datasetIndex;
    const type = legend.chart.config.type;

    if (index > 1) {
        // Do the original logic
        if (type === 'pie' || type === 'doughnut') {
            pieDoughnutLegendClickHandler(e, legendItem, legend)
        } else {
            defaultLegendClickHandler(e, legendItem, legend);
        }

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

const chart = new Chart(ctx, {
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
