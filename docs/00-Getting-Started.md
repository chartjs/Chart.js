---
title: Getting started
anchor: getting-started
---

###Include Chart.js

First we need to include the Chart.js library on the page. The library occupies a global variable of `Chart`.

```html
<script src="Chart.js"></script>
```

Alternatively, if you're using an AMD loader for JavaScript modules, that is also supported in the Chart.js core. Please note: the library will still occupy a global variable of `Chart`, even if it detects `define` and `define.amd`. If this is a problem, you can call `noConflict` to restore the global Chart variable to it's previous owner.

```javascript
// Using requirejs
require(['path/to/Chartjs'], function(Chart){
	// Use Chart.js as normal here.

	// Chart.noConflict restores the Chart global variable to it's previous owner
	// The function returns what was previously Chart, allowing you to reassign.
	var Chartjs = Chart.noConflict();

});
```

You can also grab Chart.js using bower, npm, or CDN:

```bash
bower install Chart.js --save
```
```bash
npm install Chart.js --save
```

https://cdnjs.com/libraries/chart.js

###Creating a chart

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

The following example instantiates a the pre-defined Polar Area chart type with a config object of data and options.
```javascript
var myNewChart = Chart.PolarArea(ctx, {
    data: data,
    options: options
});
```

To create a scatter chart, which is a special configuration of a line chart, we use the following.
```javascript
var myScatterChart = Chart.Scatter(ctx, {
    data: data,
    options: options
});
```

Alternatively, we can use the more advanced API to create simple or advanced chart types. In the example below, we are creating a line chart.
```javascript
var myChart = new Chart(ctx, {
    type: 'line', // built in types are 'line', 'bar', 'radar', 'polarArea', 'doughnut', 'scatter'
    data: data,
    options: options
});
```

###Global chart configuration

This concept was introduced in Chart.js 1.0 to keep configuration DRY, and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

Chart.js merges configurations and options in a few places with the global defaults using chart type defaults and scales defaults. This way you can be as specific as you want in your individual chart configs, or change the defaults for Chart.js as a whole.

The global options are defined in `Chart.defaults.global`.

Name | Type | Default | Description
--- | --- | --- | ---
responsive | Boolean | true | Resizes when the browser window does.
responsiveAnimationDuration | Number | 0 | Duration in milliseconds it takes to animate to new size after a resize event.
maintainAspectRatio | Boolean | true |
maintainAspectRatio | Array[String] | `["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]` |
hover |-|-|-
*hover*.onHover | Function | null |
*hover*.mode | String | 'single' |
*hover*.animationDuration | Number | 400 |
onClick | Function | null |
defaultColor | Color | 'rgba(0,0,0,0.1)' |
legendCallback | Function | ` function (chart) { // the chart object to generate a legend from.  }` |

The global options for tooltips are defined in `Chart.defaults.global.tooltips`.

Name | Type | Default | Description
--- |:---:| --- | ---
enabled | Boolean | true |
custom | | null |
mode | String | 'single' |
backgroundColor | Color | 'rgba(0,0,0,0.8)' |
 | | |
Label | | | There are three labels you can control. `title`, `body`, `footer` the star (\*) represents one of these three. *(i.e. titleFontFamily, footerSpacing)*
\*FontFamily | String | "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif" |
\*FontSize | Number | 12 |
\*FontStyle | String | title - "bold", body - "normal", footer - "bold" |
\*Spacing | Number | 2 |
\*Color | Color | "#fff" |
\*Align | String | "left" |
titleMarginBottom | Number | 6 |
footerMarginTop | Number | 6 |
xPadding | Number | 6 |
yPadding | Number | 6 |
caretSize | Number | 5 |
cornerRadius | Number | 6 |
xOffset | Number | 10 |
multiKeyBackground | Color | "#fff" |
 | | |
callbacks | - | - |  V2.0 introduces callback functions as a replacement for the template engine in v1. The tooltip has the following callbacks for providing text. For all functions, 'this' will be the tooltip object create from the Chart.Tooltip constructor
**Callback Functions** | | | All functions are called with the same arguments
xLabel | String or Array[Strings] | | This is the xDataValue for each item to be displayed in the tooltip
yLabel | String or Array[Strings] | | This is the yDataValue for each item to be displayed in the tooltip
index | Number | | Data index.
data | Object | | Data object passed to chart.
 | | |
*callbacks*.beforeTitle | Function | none |
*callbacks*.title | Function | `function(tooltipItems, data) { //Pick first xLabel }` |
*callbacks*.afterTitle | Function | none |
*callbacks*.beforeBody | Function | none |
*callbacks*.beforeLabel | Function | none |
*callbacks*.label | Function | `function(tooltipItem, data) { // Returns "datasetLabel: tooltipItem.yLabel" }` |
*callbacks*.afterLabel | Function | none |
*callbacks*.afterBody | Function | none |
*callbacks*.beforeFooter | Function | none |
*callbacks*.footer | Function | none |
*callbacks*.afterFooter | Function | none |

The global options for animations are defined in `Chart.defaults.global.animation`.

Name | Type | Default | Description
--- |:---:| --- | ---
duration | Number | 1000 | The number of milliseconds an animation takes.
easing | String | "easyOutQuart" |
onProgress | Function | none |
onComplete | Function |none |

The global options for elements are defined in `Chart.defaults.global.elements`.

Name | Type | Default | Description
--- |:---:| --- | ---
arc | - | - | -
*arc*.backgroundColor | Color | `Chart.defaults.global.defaultColor` |
*arc*.borderColor | Color | "#fff" |
*arc*.borderWidth | Number | 2 |
line | - | - | -
*line*.tension | Number | 0.4 |
*line*.backgroundColor | Color | `Chart.defaults.global.defaultColor` |
*line*.borderWidth | Number | 3 |
*line*.borderColor | Color | `Chart.defaults.global.defaultColor` |
*line*.borderCapStyle | String | 'butt' |
*line*.borderDash | Array | [] |
*line*.borderDashOffset | Number | 0.0 |
*line*.borderJoinStyle | String | 'miter' |
*line*.fill | Boolean | true |
point | - | - | -
*point*.radius | Number | 3 |
*point*.backgroundColor | Color | `Chart.defaults.global.defaultColor` |
*point*.borderWidth | Number | 1 |
*point*.borderColor | Color | `Chart.defaults.global.defaultColor` |
*point*.hitRadius | Number | 1 |
*point*.hoverRadius | Number | 4 |
*point*.hoverBorderWidth | Number | 1 |
rectangle | - | - | -
*rectangle*.backgroundColor | Color | `Chart.defaults.global.defaultColor` |
*rectangle*.borderWidth | Number | 0 |
*rectangle*.borderColor | Color | `Chart.defaults.global.defaultColor` |

If for example, you wanted all charts created to be responsive, and resize when the browser window does, the following setting can be changed:

```javascript
Chart.defaults.global.responsive = true;
```

Now, every time we create a chart, `options.responsive` will be `true`.
