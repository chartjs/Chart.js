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

```javascript
Chart.defaults.global = {
    responsive: true,
    responsiveAnimationDuration: 0,
    maintainAspectRatio: true,
    events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],
    hover: {
        onHover: null,
        mode: 'single',
        animationDuration: 400,
    },
    onClick: null,
    defaultColor: 'rgba(0,0,0,0.1)',

    // Element defaults defined in element extensions
    elements: {},

    // Legend callback function. 
    // @param {Chart} chart : the chart object to generate a legend for
    legendCallback: function(chart) {
        var text = [];
        text.push('<ul class="' + chart.id + '-legend">');
        for (var i = 0; i < chart.data.datasets.length; i++) {
            text.push('<li><span style="background-color:' + chart.data.datasets[i].backgroundColor + '">');
            if (chart.data.datasets[i].label) {
                text.push(chart.data.datasets[i].label);
            }
            text.push('</span></li>');
        }
        text.push('</ul>');

        return text.join("");
    },

    animation: {
        duration: 1000,
        easing: "easeOutQuart",
        onProgress: function() {},
        onComplete: function() {},
    },

    tooltips:{
        enabled: true,
        custom: null,
        backgroundColor: "rgba(0,0,0,0.8)",
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        fontSize: 10,
        fontStyle: "normal",
        fontColor: "#fff",
        titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",
        titleFontSize: 12,
        titleFontStyle: "bold",
        titleFontColor: "#fff",
        yPadding: 6,
        xPadding: 6,
        caretSize: 8,
        cornerRadius: 6,
        xOffset: 10,
        // V2.0 introduces callback functions as a replacement for the template engine in v1. The tooltip
        // has the following callbacks for providing text. For all functions, 'this' will be the tooltip object
        // create from the Chart.Tooltip constructor
        //
        // All functions are called with the same arguments
        // - xLabel : string or array of strings. This is the xDataValue for each item to be displayed in the tooltip
        // - yLabel : string or array of strings. This is the yDataValue for each item to be displayed in the tooltip
        // - index : number. Data index
        // - datasetIndex : number. Dataset index 
        // - data : object. Data object passed to chart
        callbacks: {
            beforeTitle: helpers.noop,
            title: function(xLabel, yLabel, index, datasetIndex, data) {
                // If there are multiple items, use the xLabel of the 
                return helpers.isArray(xLabel) ? xLabel[0] : xLabel;
            },
            afterTitle: helpers.noop,

            beforeBody: helpers.noop,

            beforeLabel: helpers.noop,
            label: function(xLabel, yLabel, index, datasetIndex, data) {
                return this._data.datasets[datasetIndex].label + ': ' + yLabel;
            },
            afterLabel: helpers.noop,

            afterBody: helpers.noop,

            beforeFooter: helpers.noop,
            footer: helpers.noop,
            afterFooter: helpers.noop,
        },
        multiKeyBackground: '#fff',
    },

    elements: {
        arc: {   
            backgroundColor: Chart.defaults.global.defaultColor,
            borderColor: "#fff",
            borderWidth: 2
        },
        line: {
            tension: 0.4,
            backgroundColor: Chart.defaults.global.defaultColor,
            borderWidth: 3,
            borderColor: Chart.defaults.global.defaultColor,
            borderCapStyle: 'butt',
            borderDash: [],
            borderDashOffset: 0.0,
            borderJoinStyle: 'miter',
            fill: true, // do we fill in the area between the line and its base axis
            skipNull: true,
            drawNull: false,
        },
        point: {
            radius: 3,
            backgroundColor: Chart.defaults.global.defaultColor,
            borderWidth: 1,
            borderColor: Chart.defaults.global.defaultColor,
            // Hover
            hitRadius: 1,
            hoverRadius: 4,
            hoverBorderWidth: 1,
        },
        rectangle: {
            backgroundColor: Chart.defaults.global.defaultColor,
            borderWidth: 0,
            borderColor: Chart.defaults.global.defaultColor,
        }

    }
}
```

If for example, you wanted all charts created to be responsive, and resize when the browser window does, the following setting can be changed:

```javascript
Chart.defaults.global.responsive = true;
```

Now, every time we create a chart, `options.responsive` will be `true`.
