---
title: Chart Configuration
anchor: chart-configuration
---

Chart.js provides a number of options for changing the behaviour of created charts. These configuration options can be changed on a per chart basis by passing in an options object when creating the chart. Alternatively, the global configuration can be changed which will be used by all charts created after that point.

### Chart Data

To display data, the chart must be passed a data object that contains all of the information needed by the chart. The data object can contain the following parameters

Name | Type | Description
--- | --- | ----
datasets | Array[object] | Contains data for each dataset. See the documentation for each chart type to determine the valid options that can be attached to the dataset
labels | Array[string] | Optional parameter that is used with the [category axis](#scales-category-scale).
xLabels | Array[string] | Optional parameter that is used with the category axis and is used if the axis is horizontal
yLabels | Array[string] | Optional parameter that is used with the category axis and is used if the axis is vertical

### Creating a Chart with Options

To create a chart with configuration options, simply pass an object containing your configuration to the constructor. In the example below, a line chart is created and configured to not be responsive.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        responsive: false
    }
});
```

### Global Configuration

This concept was introduced in Chart.js 1.0 to keep configuration [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself), and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges the options object passed to the chart with the global configuration using chart type defaults and scales defaults appropriately. This way you can be as specific as you would like in your individual chart configuration, while still changing the defaults for all chart types where applicable. The global general options are defined in `Chart.defaults.global`. The defaults for each chart type are discussed in the documentation for that chart type.

The following example would set the hover mode to 'single' for all charts where this was not overridden by the chart type defaults or the options passed to the constructor on creation.

```javascript
Chart.defaults.global.hover.mode = 'single';

// Hover mode is set to single because it was not overridden here
var chartInstanceHoverModeSingle = new Chart(ctx, {
    type: 'line',
    data: data,
});

// This chart would have the hover mode that was passed in
var chartInstanceDifferentHoverMode = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        hover: {
            // Overrides the global setting
            mode: 'label'
        }
    }
})
```

#### Global Font Settings

There are 4 special global settings that can change all of the fonts on the chart. These options are in `Chart.defaults.global`.

Name | Type | Default | Description
--- | --- | --- | ---
defaultFontColor | Color | '#666' | Default font color for all text
defaultFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Default font family for all text
defaultFontSize | Number | 12 | Default font size (in px) for text. Does not apply to radialLinear scale point labels
defaultFontStyle | String | 'normal' | Default font style. Does not apply to tooltip title or footer. Does not apply to chart title

### Common Chart Configuration

The following options are applicable to all charts. The can be set on the [global configuration](#chart-configuration-global-configuration), or they can be passed to the chart constructor.

Name | Type | Default | Description
--- | --- | --- | ---
responsive | Boolean | true | Resizes the chart canvas when its container does.
responsiveAnimationDuration | Number | 0 | Duration in milliseconds it takes to animate to new size after a resize event.
maintainAspectRatio | Boolean | true | Maintain the original canvas aspect ratio `(width / height)` when resizing
events | Array[String] | `["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]` | Events that the chart should listen to for tooltips and hovering
onClick | Function | null | Called if the event is of type 'mouseup' or 'click'. Called in the context of the chart and passed an array of active elements
legendCallback | Function | ` function (chart) { }` | Function to generate a legend. Receives the chart object to generate a legend from. Default implementation returns an HTML string.
onResize | Function | null | Called when a resize occurs. Gets passed two arguemnts: the chart instance and the new size.

### Title Configuration

The title configuration is passed into the `options.title` namespace. The global options for the chart title is defined in `Chart.defaults.global.title`.

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | false | Display the title block
position | String | 'top' | Position of the title. Possible values are 'top', 'left', 'bottom' and 'right'.
fullWidth | Boolean | true | Marks that this box should take the full width of the canvas (pushing down other boxes)
fontSize | Number | 12 | Font size inherited from global configuration
fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family inherited from global configuration
fontColor | Color | "#666" | Font color inherited from global configuration
fontStyle | String | 'bold' | Font styling of the title.
padding | Number | 10 | Number of pixels to add above and below the title text
text | String | '' | Title text

#### Example Usage

The example below would enable a title of 'Custom Chart Title' on the chart that is created.

```javascript
var chartInstance = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        title: {
            display: true,
            text: 'Custom Chart Title'
        }
    }
})
```

### Legend Configuration

The legend configuration is passed into the `options.legend` namespace. The global options for the chart legend is defined in `Chart.defaults.global.legend`.

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | true | Is the legend displayed
position | String | 'top' | Position of the legend. Possible values are 'top', 'left', 'bottom' and 'right'.
fullWidth | Boolean | true | Marks that this box should take the full width of the canvas (pushing down other boxes)
onClick | Function | `function(event, legendItem) {}` | A callback that is called when a click is registered on top of a label item
labels |Object|-| See the [Legend Label Configuration](#chart-configuration-legend-label-configuration) section below.

#### Legend Label Configuration

The legend label configuration is nested below the legend configuration using the `labels` key.

Name | Type | Default | Description
--- | --- | --- | ---
boxWidth | Number | 40 | Width of coloured box
fontSize | Number | 12 | Font size inherited from global configuration
fontStyle | String | "normal" | Font style inherited from global configuration
fontColor | Color | "#666" | Font color inherited from global configuration
fontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family inherited from global configuration
padding | Number | 10 | Padding between rows of colored boxes
generateLabels: | Function | `function(chart) {  }` | Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. See [Legend Item](#chart-configuration-legend-item-interface) for details.
usePointStyle | Boolean | false | Label style will match corresponding point style (size is based on fontSize, boxWidth is not used in this case).
reverse | Boolean | false | Legend will show datasets in reverse order

#### Legend Item Interface

Items passed to the legend `onClick` function are the ones returned from `labels.generateLabels`. These items must implement the following interface.

```javascript
{
    // Label that will be displayed
    text: String,

    // Fill style of the legend box
    fillStyle: Color,

    // If true, this item represents a hidden dataset. Label will be rendered with a strike-through effect
    hidden: Boolean,

    // For box border. See https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap
    lineCap: String,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
    lineDash: Array[Number],

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
    lineDashOffset: Number,

    // For box border. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
    lineJoin: String,

    // Width of box border
    lineWidth: Number,

    // Stroke style of the legend box
    strokeStyle: Color

    // Point style of the legend box (only used if usePointStyle is true)
    pointStyle: String
}
```

#### Example

The following example will create a chart with the legend enabled and turn all of the text red in color.

```javascript
var chartInstance = new Chart(ctx, {
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

### Tooltip Configuration

The tooltip configuration is passed into the `options.tooltips` namespace. The global options for the chart tooltips is defined in `Chart.defaults.global.tooltips`.

Name | Type | Default | Description
--- | --- | --- | ---
enabled | Boolean | true | Are tooltips enabled
custom | Function | null | See [section](#chart-configuration-custom-tooltips) below
mode | String | 'single' | Sets which elements appear in the tooltip. Acceptable options are `'single'`, `'label'` or `'x-axis'`. <br>&nbsp;<br>`single` highlights the closest element. <br>&nbsp;<br>`label` highlights elements in all datasets at the same `X` value. <br>&nbsp;<br>`'x-axis'` also highlights elements in all datasets at the same `X` value, but activates when hovering anywhere within the vertical slice of the x-axis representing that `X` value.
itemSort | Function | undefined | Allows sorting of [tooltip items](#chart-configuration-tooltip-item-interface). Must implement at minimum a function that can be passed to [Array.prototype.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort).  This function can also accept a third parameter that is the data object passed to the chart.
backgroundColor | Color | 'rgba(0,0,0,0.8)' | Background color of the tooltip
titleFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family for tooltip title inherited from global font family
titleFontSize | Number | 12 | Font size for tooltip title inherited from global font size
titleFontStyle | String | "bold" |
titleFontColor | Color | "#fff" | Font color for tooltip title
titleSpacing | Number | 2 | Spacing to add to top and bottom of each title line.
titleMarginBottom | Number | 6 | Margin to add on bottom of title section
bodyFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family for tooltip items inherited from global font family
bodyFontSize | Number | 12 | Font size for tooltip items inherited from global font size
bodyFontStyle | String | "normal" |
bodyFontColor | Color | "#fff" | Font color for tooltip items.
bodySpacing | Number | 2 | Spacing to add to top and bottom of each tooltip item
footerFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Font family for tooltip footer inherited from global font family.
footerFontSize | Number | 12 | Font size for tooltip footer inherited from global font size.
footerFontStyle | String | "bold" | Font style for tooltip footer.
footerFontColor | Color | "#fff" | Font color for tooltip footer.
footerSpacing | Number | 2 | Spacing to add to top and bottom of each footer line.
footerMarginTop | Number | 6 | Margin to add before drawing the footer
xPadding | Number | 6 | Padding to add on left and right of tooltip
yPadding | Number | 6 | Padding to add on top and bottom of tooltip
caretSize | Number | 5 | Size, in px, of the tooltip arrow
cornerRadius | Number | 6 | Radius of tooltip corner curves
multiKeyBackground | Color | "#fff" | Color to draw behind the colored boxes when multiple items are in the tooltip
callbacks | Object | | See the [callbacks section](#chart-configuration-tooltip-callbacks) below

#### Tooltip Callbacks

The tooltip label configuration is nested below the tooltip configuration using the `callbacks` key. The tooltip has the following callbacks for providing text. For all functions, 'this' will be the tooltip object created from the Chart.Tooltip constructor.

All functions are called with the same arguments: a [tooltip item](#chart-configuration-tooltip-item-interface) and the data object passed to the chart. All functions must return either a string or an array of strings. Arrays of strings are treated as multiple lines of text.

Callback | Arguments | Description
--- | --- | ---
beforeTitle | `Array[tooltipItem], data` | Text to render before the title
title | `Array[tooltipItem], data` | Text to render as the title
afterTitle | `Array[tooltipItem], data` | Text to render after the title
beforeBody | `Array[tooltipItem], data` | Text to render before the body section
beforeLabel | `tooltipItem, data` | Text to render before an individual label
label | `tooltipItem, data` | Text to render for an individual item in the tooltip
labelColor | `tooltipItem, chartInstace` | Returns the colors to render for the tooltip item. Return as an object containing two parameters: `borderColor` and `backgroundColor`.
afterLabel | `tooltipItem, data` | Text to render after an individual label
afterBody | `Array[tooltipItem], data` | Text to render after the body section
beforeFooter | `Array[tooltipItem], data` | Text to render before the footer section
footer | `Array[tooltipItem], data` | Text to render as the footer
afterFooter | `Array[tooltipItem], data` | Text to render after the footer section

#### Tooltip Item Interface

The tooltip items passed to the tooltip callbacks implement the following interface.

```javascript
{
    // X Value of the tooltip as a string
    xLabel: String,

    // Y value of the tooltip as a string
    yLabel: String,

    // Index of the dataset the item comes from
    datasetIndex: Number,

    // Index of this data item in the dataset
    index: Number
}
```

### Hover Configuration

The hover configuration is passed into the `options.hover` namespace. The global hover configuration is at `Chart.defaults.global.hover`.

Name | Type | Default | Description
--- | --- | --- | ---
mode | String | 'single' | Sets which elements hover. Acceptable options are `'single'`, `'label'`, `'x-axis'`, or `'dataset'`. <br>&nbsp;<br>`single` highlights the closest element. <br>&nbsp;<br>`label` highlights elements in all datasets at the same `X` value. <br>&nbsp;<br>`'x-axis'` also highlights elements in all datasets at the same `X` value, but activates when hovering anywhere within the vertical slice of the x-axis representing that `X` value.  <br>&nbsp;<br>`dataset` highlights the closest dataset.
animationDuration | Number | 400 | Duration in milliseconds it takes to animate hover style changes
onHover | Function | null | Called when any of the events fire. Called in the context of the chart and passed an array of active elements (bars, points, etc)

### Animation Configuration

The following animation options are available. The global options for are defined in `Chart.defaults.global.animation`.

Name | Type | Default | Description
--- |:---:| --- | ---
duration | Number | 1000 | The number of milliseconds an animation takes.
easing | String | "easeOutQuart" | Easing function to use. Available options are: `'linear'`, `'easeInQuad'`, `'easeOutQuad'`, `'easeInOutQuad'`, `'easeInCubic'`, `'easeOutCubic'`, `'easeInOutCubic'`, `'easeInQuart'`, `'easeOutQuart'`, `'easeInOutQuart'`, `'easeInQuint'`, `'easeOutQuint'`, `'easeInOutQuint'`, `'easeInSine'`, `'easeOutSine'`, `'easeInOutSine'`, `'easeInExpo'`, `'easeOutExpo'`, `'easeInOutExpo'`, `'easeInCirc'`, `'easeOutCirc'`, `'easeInOutCirc'`, `'easeInElastic'`, `'easeOutElastic'`, `'easeInOutElastic'`, `'easeInBack'`, `'easeOutBack'`, `'easeInOutBack'`, `'easeInBounce'`, `'easeOutBounce'`, `'easeInOutBounce'`. See [Robert Penner's easing equations](http://robertpenner.com/easing/).
onProgress | Function | none | Callback called on each step of an animation. Passed a single argument, an object, containing the chart instance and an object with details of the animation.
onComplete | Function | none | Callback called at the end of an animation. Passed the same arguments as `onProgress`

#### Animation Callbacks

The `onProgress` and `onComplete` callbacks are useful for synchronizing an external draw to the chart animation. The callback is passed an object that implements the following interface. An example usage of these callbacks can be found on [Github](https://github.com/chartjs/Chart.js/blob/master/samples/AnimationCallbacks/progress-bar.html). This sample displays a progress bar showing how far along the animation is.

```javscript
{
    // Chart object
    chartInstance,

    // Contains details of the on-going animation
    animationObject,
}
```

#### Animation Object

The animation object passed to the callbacks is of type `Chart.Animation`. The object has the following parameters.

```javascript
{
    // Current Animation frame number
    currentStep: Number,

    // Number of animation frames
    numSteps: Number,

    // Animation easing to use
    easing: String,

    // Function that renders the chart
    render: Function,

    // User callback
    onAnimationProgress: Function,

    // User callback
    onAnimationComplete: Function
}
```

### Element Configuration

The global options for elements are defined in `Chart.defaults.global.elements`.

Options can be configured for four different types of elements; arc, lines, points, and rectangles. When set, these options apply to all objects of that type unless specifically overridden by the configuration attached to a dataset.

#### Arc Configuration

Arcs are used in the polar area, doughnut and pie charts. They can be configured with the following options. The global arc options are stored in `Chart.defaults.global.elements.arc`.

Name | Type | Default | Description
--- | --- | --- | ---
backgroundColor | Color | 'rgba(0,0,0,0.1)' | Default fill color for arcs. Inherited from the global default
borderColor | Color | '#fff' | Default stroke color for arcs
borderWidth | Number | 2 | Default stroke width for arcs

#### Line Configuration

Line elements are used to represent the line in a line chart. The global line options are stored in `Chart.defaults.global.elements.line`.

Name | Type | Default | Description
--- | --- | --- | ---
tension | Number | 0.4 | Default bezier curve tension. Set to `0` for no bezier curves.
backgroundColor | Color | 'rgba(0,0,0,0.1)' | Default line fill color
borderWidth | Number | 3 | Default line stroke width
borderColor | Color | 'rgba(0,0,0,0.1)' | Default line stroke color
borderCapStyle | String | 'butt' | Default line cap style. See [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap)
borderDash | Array | `[]` | Default line dash. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
borderDashOffset | Number | 0.0 | Default line dash offset. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
borderJoinStyle | String | 'miter' | Default line join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
capBezierPoints | Boolean | true | If true, bezier control points are kept inside the chart. If false, no restriction is enforced.
fill | Boolean | true | If true, the line is filled.
stepped | Boolean | false | If true, the line is shown as a stepped line and 'tension' will be ignored

#### Point Configuration

Point elements are used to represent the points in a line chart or a bubble chart. The global point options are stored in `Chart.defaults.global.elements.point`.

Name | Type | Default | Description
--- | --- | --- | ---
radius | Number | 3 | Default point radius
pointStyle | String | 'circle' | Default point style
backgroundColor | Color | 'rgba(0,0,0,0.1)' | Default point fill color
borderWidth | Number | 1 | Default point stroke width
borderColor | Color | 'rgba(0,0,0,0.1)' | Default point stroke color
hitRadius | Number | 1 | Extra radius added to point radius for hit detection
hoverRadius | Number | 4 | Default point radius when hovered
hoverBorderWidth | Number | 1 | Default stroke width when hovered

#### Rectangle Configuration

Rectangle elements are used to represent the bars in a bar chart. The global rectangle options are stored in `Chart.defaults.global.elements.rectangle`.

Name | Type | Default | Description
--- | --- | --- | ---
backgroundColor | Color | 'rgba(0,0,0,0.1)' | Default bar fill color
borderWidth | Number | 0 | Default bar stroke width
borderColor | Color | 'rgba(0,0,0,0.1)' | Default bar stroke color
borderSkipped | String | 'bottom' | Default skipped (excluded) border for rectangle. Can be one of `bottom`, `left`, `top`, `right`

### Colors

When supplying colors to Chart options, you can use a number of formats. You can specify the color as a string in hexadecimal, RGB, or HSL notations. If a color is needed, but not specified, Chart.js will use the global default color. This color is stored at `Chart.defaults.global.defaultColor`. It is initially set to 'rgba(0, 0, 0, 0.1)';

You can also pass a [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object. You will need to create this before passing to the chart, but using it you can achieve some interesting effects.

### Patterns

An alternative option is to pass a [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object. For example, if you wanted to fill a dataset with a pattern from an image you could do the following.

```javascript
var img = new Image();
img.src = 'https://example.com/my_image.png';
img.onload = function() {
    var ctx = document.getElementById('canvas').getContext('2d');
    var fillPattern = ctx.createPattern(img, 'repeat');

    var chart = new Chart(ctx, {
        data: {
            labels: ['Item 1', 'Item 2', 'Item 3'],
            datasets: [{
                data: [10, 20, 30],
                backgroundColor: fillPattern
            }]
        }
    })
}
```

Using pattern fills for data graphics can help viewers with vision deficiencies (e.g. color-blindness or partial sight) to [more easily understand your data](http://betweentwobrackets.com/data-graphics-and-colour-vision/).

Using the [Patternomaly](https://github.com/ashiguruma/patternomaly) library you can generate patterns to fill datasets.

```javascript
var chartData = {
	datasets: [{
		data: [45, 25, 20, 10],
		backgroundColor: [
			pattern.draw('square', '#ff6384'),
			pattern.draw('circle', '#36a2eb'),
			pattern.draw('diamond', '#cc65fe'),
			pattern.draw('triangle', '#ffce56'),
		]
	}],
	labels: ['Red', 'Blue', 'Purple', 'Yellow']
};
```

### Mixed Chart Types

When creating a chart, you have the option to overlay different chart types on top of eachother as separate datasets.

To do this, you must set a `type` for each dataset individually. You can create mixed chart types with bar and line chart types.

When creating the chart you must set the overall `type` as `bar`.

```javascript
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Item 1', 'Item 2', 'Item 3'],
        datasets: [
            {
                type: 'bar',
                label: 'Bar Component',
                data: [10, 20, 30],
            },
            {
                type: 'line',
                label: 'Line Component',
                data: [30, 20, 10],
            }
        ]
    }
});
```
