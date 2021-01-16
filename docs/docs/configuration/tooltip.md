---
title: Tooltip
---

## Tooltip Configuration

The tooltip configuration is passed into the `options.plugins.tooltip` namespace. The global options for the chart tooltips is defined in `Chart.defaults.plugins.tooltip`.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `enabled` | `boolean` | `true` | Are on-canvas tooltips enabled?
| `custom` | `function` | `null` | See [custom tooltip](#external-custom-tooltips) section.
| `mode` | `string` | | Sets which elements appear in the tooltip. [more...](../general/interactions/modes.md#interaction-modes).
| `intersect` | `boolean` | | If true, the tooltip mode applies only when the mouse position intersects with an element. If false, the mode will be applied at all times.
| `position` | `string` | `'average'` | The mode for positioning the tooltip. [more...](#position-modes)
| `callbacks` | `object` | | See the [callbacks section](#tooltip-callbacks).
| `itemSort` | `function` | | Sort tooltip items. [more...](#sort-callback)
| `filter` | `function` | | Filter tooltip items. [more...](#filter-callback)
| `backgroundColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0.8)'` | Background color of the tooltip.
| `titleColor` | [`Color`](../general/colors.md) | `'#fff'` | Color of title text.
| `titleFont` | `Font` | `{style: 'bold'}` | See [Fonts](../general/fonts.md).
| `titleAlign` | `string` | `'left'` | Horizontal alignment of the title text lines. [more...](#alignment)
| `titleSpacing` | `number` | `2` | Spacing to add to top and bottom of each title line.
| `titleMarginBottom` | `number` | `6` | Margin to add on bottom of title section.
| `bodyColor` | [`Color`](../general/colors.md) | `'#fff'` | Color of body text.
| `bodyFont` | `Font` | `{}` | See [Fonts](../general/fonts.md).
| `bodyAlign` | `string` | `'left'` | Horizontal alignment of the body text lines. [more...](#alignment)
| `bodySpacing` | `number` | `2` | Spacing to add to top and bottom of each tooltip item.
| `footerColor` | [`Color`](../general/colors.md) | `'#fff'` | Color of footer text.
| `footerFont` | `Font` | `{style: 'bold'}` | See [Fonts](../general/fonts.md).
| `footerAlign` | `string` | `'left'` | Horizontal alignment of the footer text lines. [more...](#alignment)
| `footerSpacing` | `number` | `2` | Spacing to add to top and bottom of each footer line.
| `footerMarginTop` | `number` | `6` | Margin to add before drawing the footer.
| `xPadding` | `number` | `6` | Padding to add on left and right of tooltip.
| `yPadding` | `number` | `6` | Padding to add on top and bottom of tooltip.
| `caretPadding` | `number` | `2` | Extra distance to move the end of the tooltip arrow away from the tooltip point.
| `caretSize` | `number` | `5` | Size, in px, of the tooltip arrow.
| `cornerRadius` | `number` | `6` | Radius of tooltip corner curves.
| `multiKeyBackground` | [`Color`](../general/colors.md) | `'#fff'` | Color to draw behind the colored boxes when multiple items are in the tooltip.
| `displayColors` | `boolean` | `true` | If true, color boxes are shown in the tooltip.
| `boxWidth` | `number` | `bodyFont.size` | Width of the color box if displayColors is true.
| `boxHeight` | `number` | `bodyFont.size` | Height of the color box if displayColors is true.
| `usePointStyle` | `boolean` | `false` | Use the corresponding point style (from dataset options) instead of color boxes, ex: star, triangle etc. (size is based on the minimum value between boxWidth and boxHeight).
| `borderColor` | [`Color`](../general/colors.md) | `'rgba(0, 0, 0, 0)'` | Color of the border.
| `borderWidth` | `number` | `0` | Size of the border.
| `rtl` | `boolean` | | `true` for rendering the tooltip from right to left.
| `textDirection` | `string` | canvas' default | This will force the text direction `'rtl' or 'ltr` on the canvas for rendering the tooltips, regardless of the css specified on the canvas

### Position Modes

Possible modes are:

* `'average'`
* `'nearest'`

`'average'` mode will place the tooltip at the average position of the items displayed in the tooltip. `'nearest'` will place the tooltip at the position of the element closest to the event position.

New modes can be defined by adding functions to the `Chart.Tooltip.positioners` map.

Example:

```javascript
/**
 * Custom positioner
 * @function Tooltip.positioners.custom
 * @param elements {Chart.Element[]} the tooltip elements
 * @param eventPosition {Point} the position of the event in canvas coordinates
 * @returns {Point} the tooltip position
 */
const tooltipPlugin = Chart.registry.getPlugin('tooltip');
tooltipPlugin.positioners.custom = function(elements, eventPosition) {
    /** @type {Tooltip} */
    var tooltip = this;

    /* ... */

    return {
        x: 0,
        y: 0
    };
};
```

### Alignment

The `titleAlign`, `bodyAlign` and `footerAlign` options define the horizontal position of the text lines with respect to the tooltip box. The following values are supported.

* `'left'` (default)
* `'right'`
* `'center'`

These options are only applied to text lines. Color boxes are always aligned to the left edge.

### Sort Callback

Allows sorting of [tooltip items](#tooltip-item-context). Must implement at minimum a function that can be passed to [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort). This function can also accept a third parameter that is the data object passed to the chart.

### Filter Callback

Allows filtering of [tooltip items](#tooltip-item-context). Must implement at minimum a function that can be passed to [Array.prototype.filter](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/filter). This function can also accept a fourth parameter that is the data object passed to the chart.

## Tooltip Callbacks

The tooltip label configuration is nested below the tooltip configuration using the `callbacks` key. The tooltip has the following callbacks for providing text. For all functions, `this` will be the tooltip object created from the `Tooltip` constructor.

All functions are called with the same arguments: a [tooltip item context](#tooltip-item-context). All functions must return either a string or an array of strings. Arrays of strings are treated as multiple lines of text.

| Name | Arguments | Description
| ---- | --------- | -----------
| `beforeTitle` | `TooltipItem[], object` | Returns the text to render before the title.
| `title` | `TooltipItem[], object` | Returns text to render as the title of the tooltip.
| `afterTitle` | `TooltipItem[], object` | Returns text to render after the title.
| `beforeBody` | `TooltipItem[], object` | Returns text to render before the body section.
| `beforeLabel` | `TooltipItem, object` | Returns text to render before an individual label. This will be called for each item in the tooltip.
| `label` | `TooltipItem, object` | Returns text to render for an individual item in the tooltip. [more...](#label-callback)
| `labelColor` | `TooltipItem, Chart` | Returns the colors to render for the tooltip item. [more...](#label-color-callback)
| `labelTextColor` | `TooltipItem, Chart` | Returns the colors for the text of the label for the tooltip item.
| `labelPointStyle` | `TooltipItem, Chart` | Returns the point style to use instead of color boxes if usePointStyle is true (object with values `pointStyle` and `rotation`). Default implementation uses the point style from the dataset points. [more...](#label-point-style-callback)
| `afterLabel` | `TooltipItem, object` | Returns text to render after an individual label.
| `afterBody` | `TooltipItem[], object` | Returns text to render after the body section.
| `beforeFooter` | `TooltipItem[], object` | Returns text to render before the footer section.
| `footer` | `TooltipItem[], object` | Returns text to render as the footer of the tooltip.
| `afterFooter` | `TooltipItem[], object` | Text to render after the footer section.

### Label Callback

The `label` callback can change the text that displays for a given data point. A common example to show a unit. The example below puts a `'$'` before every row.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        var label = context.dataset.label || '';

                        if (label) {
                            label += ': ';
                        }
                        if (!isNaN(context.dataPoint.y)) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.dataPoint.y);
                        }
                        return label;
                    }
                }
            }
        }
    }
});
```

### Label Color Callback

For example, to return a red box for each item in the tooltip you could do:

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                callbacks: {
                    labelColor: function(context) {
                        return {
                            borderColor: 'rgb(255, 0, 0)',
                            backgroundColor: 'rgb(255, 0, 0)'
                        };
                    },
                    labelTextColor: function(context) {
                        return '#543453';
                    }
                }
            }
        }
    }
});
```

### Label Point Style Callback

For example, to draw triangles instead of the regular color box for each item in the tooltip you could do:

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        plugins: {
            tooltip: {
                usePointStyle: true,
                callbacks: {
                    labelPointStyle: function(context) {
                        return {
                            pointStyle: 'triangle',
                            rotation: 0
                        };
                    }
                }
            }
        }
    }
});
```


### Tooltip Item Context

The tooltip items passed to the tooltip callbacks implement the following interface.

```javascript
{
    // The chart the tooltip is being shown on
    chart: Chart

    // Label for the tooltip
    label: string,

    // Parsed data values for the given `dataIndex` and `datasetIndex`
    dataPoint: object,

    // Formatted value for the tooltip
    formattedValue: string,

    // The dataset the item comes from
    dataset: object

    // Index of the dataset the item comes from
    datasetIndex: number,

    // Index of this data item in the dataset
    dataIndex: number,

    // The chart element (point, arc, bar, etc.) for this tooltip item
    element: Element,
}
```

## External (Custom) Tooltips

Custom tooltips allow you to hook into the tooltip rendering process so that you can render the tooltip in your own custom way. Generally this is used to create an HTML tooltip instead of an on-canvas tooltip. The `custom` option takes a function which is passed a context parameter containing the `chart` and `tooltip`. You can enable custom tooltips in the global or chart configuration like so:

```javascript
var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: {
        plugins: {
            tooltip: {
                // Disable the on-canvas tooltip
                enabled: false,

                custom: function(context) {
                    // Tooltip Element
                    var tooltipEl = document.getElementById('chartjs-tooltip');

                    // Create element on first render
                    if (!tooltipEl) {
                        tooltipEl = document.createElement('div');
                        tooltipEl.id = 'chartjs-tooltip';
                        tooltipEl.innerHTML = '<table></table>';
                        document.body.appendChild(tooltipEl);
                    }

                    // Hide if no tooltip
                    var tooltipModel = context.tooltip;
                    if (tooltipModel.opacity === 0) {
                        tooltipEl.style.opacity = 0;
                        return;
                    }

                    // Set caret Position
                    tooltipEl.classList.remove('above', 'below', 'no-transform');
                    if (tooltipModel.yAlign) {
                        tooltipEl.classList.add(tooltipModel.yAlign);
                    } else {
                        tooltipEl.classList.add('no-transform');
                    }

                    function getBody(bodyItem) {
                        return bodyItem.lines;
                    }

                    // Set Text
                    if (tooltipModel.body) {
                        var titleLines = tooltipModel.title || [];
                        var bodyLines = tooltipModel.body.map(getBody);

                        var innerHtml = '<thead>';

                        titleLines.forEach(function(title) {
                            innerHtml += '<tr><th>' + title + '</th></tr>';
                        });
                        innerHtml += '</thead><tbody>';

                        bodyLines.forEach(function(body, i) {
                            var colors = tooltipModel.labelColors[i];
                            var style = 'background:' + colors.backgroundColor;
                            style += '; border-color:' + colors.borderColor;
                            style += '; border-width: 2px';
                            var span = '<span style="' + style + '"></span>';
                            innerHtml += '<tr><td>' + span + body + '</td></tr>';
                        });
                        innerHtml += '</tbody>';

                        var tableRoot = tooltipEl.querySelector('table');
                        tableRoot.innerHTML = innerHtml;
                    }

                    var position = context.chart.canvas.getBoundingClientRect();

                    // Display, position, and set styles for font
                    tooltipEl.style.opacity = 1;
                    tooltipEl.style.position = 'absolute';
                    tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
                    tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
                    tooltipEl.style.font = tooltipModel.bodyFont.string;
                    tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                    tooltipEl.style.pointerEvents = 'none';
                }
            }
        }
    }
});
```

See [samples](https://www.chartjs.org/samples/) for examples on how to get started with custom tooltips.

## Tooltip Model

The tooltip model contains parameters that can be used to render the tooltip.

```javascript
{
    // The items that we are rendering in the tooltip. See Tooltip Item Interface section
    dataPoints: TooltipItem[],

    // Positioning
    xAlign: string,
    yAlign: string,

    // X and Y properties are the top left of the tooltip
    x: number,
    y: number,
    width: number,
    height: number,
    // Where the tooltip points to
    caretX: number,
    caretY: number,

    // Body
    // The body lines that need to be rendered
    // Each object contains 3 parameters
    // before: string[] // lines of text before the line with the color square
    // lines: string[], // lines of text to render as the main item with color square
    // after: string[], // lines of text to render after the main lines
    body: object[],
    // lines of text that appear after the title but before the body
    beforeBody: string[],
    // line of text that appear after the body and before the footer
    afterBody: string[],

    // Title
    // lines of text that form the title
    title: string[],

    // Footer
    // lines of text that form the footer
    footer: string[],

    // colors to render for each item in body[]. This is the color of the squares in the tooltip
    labelColors: Color[],
    labelTextColors: Color[],

    // 0 opacity is a hidden tooltip
    opacity: number,

    // tooltip options
    options : Object
}
```
