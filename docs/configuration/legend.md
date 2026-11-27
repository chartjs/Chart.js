# Legend

The chart legend displays data about the datasets that are appearing on the chart.

## Configuration options

Namespace: `options.plugins.legend`, the global options for the chart legend is defined in `Chart.defaults.plugins.legend`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `display` | `boolean` | `true` | Is the legend shown?
| `position` | `string` | `'top'` | Position of the legend. [more...](#position)
| `align` | `string` | `'center'` | Alignment of the legend. [more...](#align)
| `maxHeight` | `number` | | For a left or right legend, the height its columns of items wrap within; for a top or bottom legend, the maximum height of the legend. Either way the title counts in it. In pixels. [more...](#wrapping)
| `maxWidth` | `number` | | For a top or bottom legend, the width its rows of items wrap within; for a left or right legend, the maximum width of the legend. In pixels. [more...](#wrapping)
| `fullSize` | `boolean` | `true` | Marks that this box should take the full width/height of the canvas (moving other boxes). This is unlikely to need to be changed in day-to-day use.
| `onClick` | `function` | | A callback that is called when a `'click'` event is registered on a label item, or a `'mouseup'` (also from `'touchend'` and `'pointerup'`) when the [legend's events](./interactions.md#event-option) do not include `'click'`. A right-click (`'contextmenu'`) does not call it. Arguments: `[event, legendItem, legend]`.
| `onHover` | `function` | | A callback that is called when a `'mousemove'` event moves the pointer onto a label item. Arguments: `[event, legendItem, legend]`. [more...](#hover-and-scrolling)
| `onLeave` | `function` | | A callback that is called when a `'mousemove'` event is registered outside of a previously hovered label item, or when the pointer leaves the canvas (`'mouseout'`) while a label item is hovered. Arguments: `[event, legendItem, legend]`. [more...](#hover-and-scrolling)
| `reverse` | `boolean` | `false` | Legend will show datasets in reverse order.
| `labels` | `object` | | See the [Legend Label Configuration](#legend-label-configuration) section below.
| `rtl` | `boolean` | | `true` for rendering the legends from right to left.
| `textDirection` | `string` | canvas' default | This will force the text direction `'rtl'` or `'ltr'` on the canvas for rendering the legend, regardless of the css specified on the canvas
| `title` | `object` | | See the [Legend Title Configuration](#legend-title-configuration) section below.

:::warning
The doughnut, pie, and polar area charts override the legend defaults. To change the defaults for one of these chart types, use `Chart.overrides[type].plugins.legend`, where `type` is `'doughnut'`, `'pie'`, or `'polarArea'` (for example, `Chart.overrides.pie.plugins.legend`).
:::

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

## Wrapping

A top or bottom legend puts its items in rows, and starts a new row when the next item would make the row wider than the available width or `maxWidth`, whichever is smaller. A left or right legend puts its items in columns in the same way, within the available height or `maxHeight`. The legend's own padding around the items counts in the row width or column height, and the legend title counts in `maxHeight` on every side.

With the default `fullSize: true`, the legend's box still takes the full width (top, bottom) or height (left, right) of the chart, and `align` places each row or column within it.

* A limit smaller than an item puts one item in each row or column.
* On a left or right legend, a `maxHeight` at or below the height of the title puts every item in its own column.
* `0` means no limit.

On the other axis, `maxHeight` (top, bottom) or `maxWidth` (left, right) limits the size of the legend.

## Hover and scrolling

`onHover` and `onLeave` run only on pointer events, the chart's `'mousemove'` and `'mouseout'`. Scrolling the page does not move the pointer, and in Chromium and Firefox it sends no `'mousemove'` to the canvas. So when a hovered label scrolls away from a pointer that stays over the canvas, `onLeave` is called only when the pointer next moves. When the scroll takes the whole canvas out from under the pointer, Chromium and Firefox send `'mouseout'` and `onLeave` is called. If your page needs to react to the scroll itself, listen for the page's `'scroll'` event.

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

    // Index of the associated dataset (charts other than doughnut, pie and polarArea)
    datasetIndex?: number,

    // Index of the associated data item (doughnut, pie and polarArea charts)
    index?: number,

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

The following example will create a chart with the legend enabled and turn all the text red in color.

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

A legend item stands for a dataset in most charts, and for a data item in doughnut, pie and polar area charts. The click handler has to match: an item of a doughnut, pie or polar area chart has an `index` and no `datasetIndex`.

The default legend click handler, `Chart.defaults.plugins.legend.onClick`, hides and shows the dataset:

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

The doughnut, pie and polar area charts use their own handler, `Chart.overrides[type].plugins.legend.onClick`, which hides and shows the data item:

```javascript
function(e, legendItem, legend) {
    legend.chart.toggleDataVisibility(legendItem.index);
    legend.chart.update();
}
```

Let's say we wanted instead to link the display of the first two datasets of a line chart. We could change the click handler accordingly.

```javascript
const defaultLegendClickHandler = Chart.defaults.plugins.legend.onClick;
const newLegendClickHandler = function (e, legendItem, legend) {
    const index = legendItem.datasetIndex;

    if (index > 1) {
        // Do the original logic
        defaultLegendClickHandler(e, legendItem, legend);
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

In a doughnut, pie or polar area chart, a custom handler works on data items. This one keeps at least one slice of a pie chart visible, and otherwise does what the built-in handler does. `Chart.overrides.pie` holds the handler once the pie controller is registered.

```javascript
const pieLegendClickHandler = Chart.overrides.pie.plugins.legend.onClick;
const newLegendClickHandler = function (e, legendItem, legend) {
    const ci = legend.chart;
    const visibleCount = ci.data.labels.filter((label, i) => ci.getDataVisibility(i)).length;

    if (legendItem.hidden || visibleCount > 1) {
        pieLegendClickHandler(e, legendItem, legend);
    }
};

const chart = new Chart(ctx, {
    type: 'pie',
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
