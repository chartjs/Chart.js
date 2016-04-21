---
title: Getting started
anchor: getting-started
---

### Download Chart.js

To download a zip, go to [Chart.js on Github](https://github.com/nnnick/Chart.js) and choose the version that is right for your application.
* [Standard build](https://raw.githubusercontent.com/nnnick/Chart.js/v2.0-dev/dist/Chart.js) (~31kB gzipped)
* [Bundled with Moment.js](https://raw.githubusercontent.com/nnnick/Chart.js/v2.0-dev/dist/Chart.bundle.js) (~45kB gzipped)
* [CDN Versions](https://cdnjs.com/libraries/Chart.js)

To install via npm / bower:

```bash
npm install chart.js --save
```
```bash
bower install Chart.js --save
```

### Installation

To import Chart.js using an old-school script tag:

```html
<script src="Chart.js"></script>
<script>
    var myChart = new Chart({...})
</script>
```

To import Chart.js using an awesome module loader:

```javascript

// Using CommonJS
var Chart = require('src/chart.js')
var myChart = new Chart({...})

// ES6
import Chart from 'src/chart.js'
let myChart = new Chart({...})

// Using requirejs
require(['path/to/Chartjs'], function(Chart){
 var myChart = new Chart({...})
})

```

### Creating a Chart

To create a chart, we need to instantiate the `Chart` class. To do this, we need to pass in the node, jQuery instance, or 2d context of the canvas of where we want to draw the chart. Here's an example.

```html
<canvas id="myChart" width="400" height="400"></canvas>
```

```javascript
// Any of the following formats may be used
var ctx = document.getElementById("myChart");
var ctx = document.getElementById("myChart").getContext("2d");
var ctx = $("#myChart");
```

Once you have the element or context, you're ready to instantiate a pre-defined chart-type or create your own!

The following example instantiates a bar chart showing the number of votes for different colors and the y-axis starting at 0.

```html
<canvas id="myChart" width="400" height="400"></canvas>
<script>
var ctx = document.getElementById("myChart");
var myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
            label: '# of Votes',
            data: [12, 19, 3, 5, 2, 3]
        }]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero:true
                }
            }]
        }
    }
});
</script>
```

It's that easy to get started using Chart.js! From here you can explore the many options that can help you customise your charts with scales, tooltips, labels, colors, custom actions, and much more.

### Global chart configuration

This concept was introduced in Chart.js 1.0 to keep configuration DRY, and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges configurations and options in a few places with the global defaults using chart type defaults and scales defaults. This way you can be as specific as you want in your individual chart configs, or change the defaults for Chart.js as a whole.

The global options are defined in `Chart.defaults.global`.

Name | Type | Default | Description
--- | --- | --- | ---
responsive | Boolean | true | Resizes when the canvas container does.
responsiveAnimationDuration | Number | 0 | Duration in milliseconds it takes to animate to new size after a resize event.
maintainAspectRatio | Boolean | true | Maintain the original canvas aspect ratio `(width / height)` when resizing
events | Array[String] | `["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]` | Events that the chart should listen to for tooltips and hovering
hover |-|-|-
*hover*.onHover | Function | null | Called when any of the events fire. Called in the context of the chart and passed an array of active elements (bars, points, etc)
*hover*.mode | String | 'single' | Sets which elements hover. Acceptable options are `'single'`, `'label'`, or `'dataset'`. `single` highlights the closest element. `label` highlights elements in all datasets at the same `X` value. `dataset` highlights the closest dataset.
*hover*.animationDuration | Number | 400 | Duration in milliseconds it takes to animate hover style changes
onClick | Function | null | Called if the event is of type 'mouseup' or 'click'. Called in the context of the chart and passed an array of active elements
defaultColor | Color | 'rgba(0,0,0,0.1)' |
defaultFontColor | Color | '#666' | Default font color for all text
defaultFontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" | Default font family for all text
defaultFontSize | Number | 12 | Default font size (in px) for text. Does not apply to radialLinear scale point labels
defaultFontStyle | String | 'normal' | Default font style. Does not apply to tooltip title or footer. Does not apply to chart title
legendCallback | Function | ` function (chart) { }` | Function to generate a legend. Receives the chart object to generate a legend from. Default implementation returns an HTML string.

The global options for the chart title is defined in `Chart.defaults.global.title`

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | true | Show the title block
position | String | 'top' | Position of the title. 'top' or 'bottom' are allowed
fullWidth | Boolean | true | Marks that this box should take the full width of the canvas (pushing down other boxes)
fontColor | Color  | '#666' | Text color
fontFamily | String | 'Helvetica Neue' |
fontSize | Number | 12 |
fontStyle | String | 'bold' |
padding | Number | 10 | Number of pixels to add above and below the title text
text | String | '' | Title text

The global options for the chart legend is defined in `Chart.defaults.global.legend`

Name | Type | Default | Description
--- | --- | --- | ---
display | Boolean | true | Is the legend displayed
position | String | 'top' | Position of the legend. Options are 'top' or 'bottom'
fullWidth | Boolean | true | Marks that this box should take the full width of the canvas (pushing down other boxes)
onClick | Function | `function(event, legendItem) {}` | A callback that is called when a click is registered on top of a label item
labels |-|-|-
*labels*boxWidth | Number | 40 | Width of coloured box
*labels*fontSize | Number | 12 | Font size
*labels*fontStyle | String | "normal" |
*labels*fontColor | Color | "#666" |
*labels*fontFamily | String | "Helvetica Neue" |
*labels*padding | Number | 10 | Padding between rows of colored boxes
*labels*generateLabels: | Function | `function(data) {  }` | Generates legend items for each thing in the legend. Default implementation returns the text + styling for the color box. Styles that can be returned are `fillStyle`, `strokeStyle`, `lineCap`, `lineDash`, `lineDashOffset`, `lineWidth`, `lineJoin`. Return a `hidden` attribute to indicate that the label refers to something that is not visible. A strikethrough style will be given to the text in this case.

The global options for tooltips are defined in `Chart.defaults.global.tooltips`.

Name | Type | Default | Description
--- |:---:| --- | ---
enabled | Boolean | true |
custom | | null |
mode | String | 'single' | Sets which elements appear in the tooltip. Acceptable options are `'single'` or `'label'`. `single` highlights the closest element. `label` highlights elements in all datasets at the same `X` value.
backgroundColor | Color | 'rgba(0,0,0,0.8)' | Background color of the tooltip
 | | |
Label | | | There are three labels you can control. `title`, `body`, `footer` the star (\*) represents one of these three. *(i.e. titleFontFamily, footerSpacing)*
\*FontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" |
\*FontSize | Number | 12 |
\*FontStyle | String | title - "bold", body - "normal", footer - "bold" |
\*Spacing | Number | 2 |
\*Color | Color | "#fff" |
\*Align | String | "left" | text alignment. See [MDN Canvas Documentation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign)
titleMarginBottom | Number | 6 | Margin to add on bottom of title section
footerMarginTop | Number | 6 | Margin to add before drawing the footer
xPadding | Number | 6 | Padding to add on left and right of tooltip
yPadding | Number | 6 | Padding to add on top and bottom of tooltip
caretSize | Number | 5 | Size, in px, of the tooltip arrow
cornerRadius | Number | 6 | Radius of tooltip corner curves
multiKeyBackground | Color | "#fff" | Color to draw behind the colored boxes when multiple items are in the tooltip
 | | |
callbacks | - | - |  V2.0 introduces callback functions as a replacement for the template engine in v1. The tooltip has the following callbacks for providing text. For all functions, 'this' will be the tooltip object create from the Chart.Tooltip constructor
**Callback Functions** | | | All functions are called with the same arguments
xLabel | String or Array[Strings] | | This is the xDataValue for each item to be displayed in the tooltip
yLabel | String or Array[Strings] | | This is the yDataValue for each item to be displayed in the tooltip
index | Number | | Data index.
data | Object | | Data object passed to chart.
`return`| String or Array[Strings] | | All functions must return either a string or an array of strings. Arrays of strings are treated as multiple lines of text.
 | | |
*callbacks*.beforeTitle | Function | none | Text to render before the title
*callbacks*.title | Function | `function(tooltipItems, data) { //Pick first xLabel }` | Text to render as the title
*callbacks*.afterTitle | Function | none | Text to render after the ttiel
*callbacks*.beforeBody | Function | none | Text to render before the body section
*callbacks*.beforeLabel | Function | none | Text to render before an individual label
*callbacks*.label | Function | `function(tooltipItem, data) { // Returns "datasetLabel: tooltipItem.yLabel" }` | Text to render as label
*callbacks*.afterLabel | Function | none | Text to render after an individual label
*callbacks*.afterBody | Function | none | Text to render after the body section
*callbacks*.beforeFooter | Function | none | Text to render before the footer section
*callbacks*.footer | Function | none | Text to render as the footer
*callbacks*.afterFooter | Function | none | Text to render after the footer section

The global options for animations are defined in `Chart.defaults.global.animation`.

Name | Type | Default | Description
--- |:---:| --- | ---
duration | Number | 1000 | The number of milliseconds an animation takes.
easing | String | "easeOutQuart" | Easing function to use.
onProgress | Function | none | Callback called on each step of an animation. Passed a single argument, an object, containing the chart instance and an object with details of the animation.
onComplete | Function | none | Callback called at the end of an animation. Passed the same arguments as `onProgress`

The global options for elements are defined in `Chart.defaults.global.elements`.

Name | Type | Default | Description
--- |:---:| --- | ---
arc | - | - | -
*arc*.backgroundColor | Color | `Chart.defaults.global.defaultColor` | Default fill color for arcs
*arc*.borderColor | Color | "#fff" | Default stroke color for arcs
*arc*.borderWidth | Number | 2 | Default stroke width for arcs
line | - | - | -
*line*.tension | Number | 0.4 | Default bezier curve tension. Set to `0` for no bezier curves.
*line*.backgroundColor | Color | `Chart.defaults.global.defaultColor` | Default line fill color
*line*.borderWidth | Number | 3 | Default line stroke width
*line*.borderColor | Color | `Chart.defaults.global.defaultColor` | Default line stroke color
*line*.borderCapStyle | String | 'butt' | Default line cap style. See [MDN](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D/lineCap)
*line*.borderDash | Array | `[]` | Default line dash. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash)
*line*.borderDashOffset | Number | 0.0 | Default line dash offset. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset)
*line*.borderJoinStyle | String | 'miter' | Default line join style. See [MDN](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin)
*line*.fill | Boolean | true |
point | - | - | -
*point*.radius | Number | 3 | Default point radius
*point*.pointStyle | String | 'circle' | Default point style
*point*.backgroundColor | Color | `Chart.defaults.global.defaultColor` | Default point fill color
*point*.borderWidth | Number | 1 | Default point stroke width
*point*.borderColor | Color | `Chart.defaults.global.defaultColor` | Default point stroke color
*point*.hitRadius | Number | 1 | Extra radius added to point radius for hit detection
*point*.hoverRadius | Number | 4 | Default point radius when hovered
*point*.hoverBorderWidth | Number | 1 | Default stroke width when hovered
rectangle | - | - | -
*rectangle*.backgroundColor | Color | `Chart.defaults.global.defaultColor` | Default bar fill color
*rectangle*.borderWidth | Number | 0 | Default bar stroke width
*rectangle*.borderColor | Color | `Chart.defaults.global.defaultColor` | Default bar stroke color
*rectangle*.borderSkipped | String | 'bottom' | Default skipped (excluded) border for rectangle. Can be one of `bottom`, `left`, `top`, `right`

If for example, you wanted all charts created to be responsive, and resize when the browser window does, the following setting can be changed:

```javascript
Chart.defaults.global.responsive = true;
```

Now, every time we create a chart, `options.responsive` will be `true`.
