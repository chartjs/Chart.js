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

You can also grab Chart.js using bower:

```bash
bower install Chart.js --save
```

Also, Chart.js is available from CDN:

https://cdnjs.com/libraries/chart.js

###Creating a chart

To create a chart, we need to instantiate the `Chart` class. To do this, we need to pass in the 2d context of where we want to draw the chart. Here's an example.

```html
<canvas id="myChart" width="400" height="400"></canvas>
```

```javascript
// Get the context of the canvas element we want to select
var ctx = document.getElementById("myChart").getContext("2d");
var myNewChart = Chart.PolarArea(chart, {
    data: data,
    options: config
});
```

We can also get the context of our canvas with jQuery. To do this, we need to get the DOM node out of the jQuery collection, and call the `getContext("2d")` method on that.

```javascript
// Get context with jQuery - using jQuery's .get() method.
var ctx = $("#myChart").get(0).getContext("2d");
// This will get the first returned node in the jQuery collection.
var myNewChart = new Chart(ctx);
```

After we've instantiated the Chart class on the canvas we want to draw on, Chart.js will handle the scaling for retina displays.

With the Chart class set up, we can go on to create one of the charts Chart.js has available. In the example below, we would be drawing a Polar area chart.

```javascript
var myChart = Chart.PolarArea(ctx, {
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

Alternatively, we can use the more advanced API to create simple chart types. . In the example below, we are creating a line chart
```javascript
var myChart = new Chart(ctx, {
    type: 'line', // built in types are 'line', 'bar', 'radar', 'polarArea', 'doughnut',
    data: data,
    options: options
});
```

We call a method of the name of the chart we want to create. We pass in the data for that chart type, and the options for that chart as parameters. Chart.js will merge the global defaults with chart type specific defaults, then merge any options passed in as a second argument after data.

###Global chart configuration

This concept was introduced in Chart.js 1.0 to keep configuration DRY, and allow for changing options globally across chart types, avoiding the need to specify options for each instance, or the default for a particular chart type.

```javascript
Chart.defaults.global = {
    // Animation settings
    animation: {
    	// Length that animation should take in ms assuming 60fps. 
    	// Set to 0 to disable animation
        duration: 1000,

        // Easing type. Possible values are:
        // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
        //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
        //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
        //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
        //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
        //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
        //  easeOutElastic, easeInCubic]
        easing: "easeOutQuart",

        // Function - function to call each time an animation step occurs
        onProgress: function() {},

        // Function - function to call when animations finish
        onComplete: function() {},
    },

    // Boolean - if true, resize the charts when the page resizes
    responsive: false,

    // Boolean - if true, try to maintain the screen aspect ratio
    maintainAspectRatio: true,

    // Array - events to bind tooltips to
    events: ["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"],

    // Hover settings
    hover: {
    	// Function - called when the user hovers over the items.
    	// Parameters: array of active elements
        onHover: null,

        // String - hover mode. Options are 'single', 'label', and 'dataset'
        // 		'single' gets the nearest element
        //		'label' gets all of the elements at the given dataset index (do not use for scatter charts)
        //		'dataset' gets all the elements in the given dataset
        mode: 'single',

        // Number - duration (in ms) of the tooltip animation. 0 to disable
        animationDuration: 400,
    },

    // Function - click handler to bind to chart area
    onClick: null,

    // Tooltip configuration
    tooltips: {
    	// Boolean - if true show tooltips
        enabled: true,

        // Function - custom tooltip function to use
        custom: null,

        // String - color of tooltip background
        backgroundColor: "rgba(0,0,0,0.8)",

        // String - fonts to use
        fontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - font size
        fontSize: 10,

        // String - font style
        fontStyle: "normal",

        // String - font color
        fontColor: "#fff",

        // String - title fonts
        titleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

        // Number - title font size
        titleFontSize: 12,

        // String - title font style
        titleFontStyle: "bold",

        // String - title font color
        titleFontColor: "#fff",

        // Number - 
        yPadding: 6,

        // Number - 
        xPadding: 6,

        // Number - 
        caretSize: 8,

        // Number - radius of rounded corners
        cornerRadius: 6,

        // Number - 
        xOffset: 10,

        // String - template string to use for tooltips in single mode
        template: [
            '<% if(label){ %>',
            '<%=label %>:',
            '<% } %>',
            '<%=value %>',
        ].join(''),

        // String - template string to use for tooltips in label mode
        multiTemplate: [
            '<%if (datasetLabel){ %>',
            '<%=datasetLabel %>:',
            '<% } %>',
            '<%=value %>'
        ].join(''),

        // String -
        multiKeyBackground: '#fff',
    },

    // String - default grey color. 'rgba(0,0,0,0.1)'
    defaultColor: defaultColor, 

    // Element defaults
    elements: {
    	// Default settings for all line elements
        line: {
        	// Number - Bezier curve tension. Set to 0 for no bezier curves
            tension: 0.4,

            // String - the fill color
            backgroundColor: defaultColor,

            // Number - width of the line
            borderWidth: 3,

            // String - color of the line
            borderColor: defaultColor,

            // String - cap style of the line. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap
            borderCapStyle: 'butt',

            // Array - Length and spacing of dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash
            borderDash: [],

            // Number - Offset for line dashes. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineDashOffset
            borderDashOffset: 0.0,

            // String - line join style. See https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
            borderJoinStyle: 'miter',
            
            // Boolean - if true fill in the area between the line and the x axis with the background color
            fill: true,

            // Boolean - 
            skipNull: true,

            // Boolean - 
            drawNull: false,
        },
        // Settings for all point elements
        point: {
        	// Number - radius of point circle
            radius: 3,

            // String - fill color of point
            backgroundColor: defaultColor,

            // Number - width of stroke of point circle
            borderWidth: 1,

            // String - stroke color for point
            borderColor: defaultColor,

            // Number - extra radius added to radius for hit detection
            hitRadius: 1,

            // Number - radius of point circle when hovered
            hoverRadius: 4,

            // Number - radius of circle stroke when hovered
            hoverBorderWidth: 2,
        },
        // Settings for all bar elements
        rectangle: {
        	// String - fill color of bar
            backgroundColor: defaultColor,

            // Number - width of stroke of line surrounding bar fill
            borderWidth: 0,

            // String - Border color
            borderColor: defaultColor,
        },
        // Settings for all arc elements
        arc: {
        	// String - fill color
            backgroundColor: defaultColor,

            // String - border color
            borderColor: "#fff",

            // Number - border stroke width
            borderWidth: 2,
        },
    }
}
```

If for example, you wanted all charts created to be responsive, and resize when the browser window does, the following setting can be changed:

```javascript
Chart.defaults.global.responsive = true;
```

Now, every time we create a chart, `options.responsive` will be `true`.

## Scales

Scales in v2.0 of Chart.js are significantly different than those of v1.0. Multiple x & y axes are now supported. Datasets include 
additional properties to bind themselves to a specific axis.


### Category Scale
The category scale will be familiar to those who have used v1.0. Labels are drawn in from the labels array included in the chart data. The category scale has 
the following options.

```javascript
{
    // Boolean - if true, show the scale
    display: true,

    // String - position of the scale. possible options are "top" and "bottom" for category scales
    position: "bottom",

    // grid line settings
    gridLines: {
        // Boolean - if true, show the grid lines
        show: true,

        // String - color of the grid lines
        color: "rgba(0, 0, 0, 0.05)",

        // Number - width of the grid lines
        lineWidth: 1,

        // Boolean - if true draw lines on the chart area
        drawOnChartArea: true,

        // Boolean - if true draw ticks in the axis area
        drawTicks: true,

        // Number - width of the grid line for the first index (index 0)
        zeroLineWidth: 1,

        // String - color of the grid line for the first index
        zeroLineColor: "rgba(0,0,0,0.25)",

        // Boolean - if true, offset labels from grid lines
        offsetGridLines: false,
    },

    // label settings
    labels: {
        // Boolean - if true show labels
        show: true,

        // String - template string for labels
        template: "<%=value%>",

        // Number - label font size
        fontSize: 12,

        // String - label font style
        fontStyle: "normal",

        // String - label font color
        fontColor: "#666",

        // String - label font family
        fontFamily: "Helvetica Neue",

        // Function - Can be used to filter the labels. Passed the data label & index
        userCallback: null,
    },
}

```

The `userCallback` method may be useful when there are a lot of labels. The following callback would filter out every second label on a category scale
```javascript
{
    scales: {
        xAxes: [{
            labels: {
                userCallback: function(labelString, index) {
                    return (index % 2 === 0) ? labelString : '';
                }
            }
        }]
    }
}
```

### Linear Scale
The linear scale can be used to display numerical data. It can be placed on either the x or y axis. The scatter chart type automatically configures a line chart to
use one of these scales for the x axis.

The linear scale supports the following options
```javascript
{
    // Boolean - if true, show the scale
    display: true,

    // String - position of axis. Vertical axes can have either "left" or "right"
    position: "left",

    // grid line settings
    gridLines: {
        // Boolean - if true, show the grid lines
        show: true,

        // String - color of the grid lines
        color: "rgba(0, 0, 0, 0.05)",

        // Number - width of the grid lines
        lineWidth: 1,

        // Boolean - if true draw lines on the chart area
        drawOnChartArea: true,

        // Boolean - if true draw ticks in the axis area
        drawTicks: true,

        // Number - width of the grid line representing a numerical value of 0
        zeroLineWidth: 1,

        // String - color of the grid line representing a numerical value of 0
        zeroLineColor: "rgba(0,0,0,0.25)",
    },

    // Boolean - if true ensures that the scale always has a 0 point
    beginAtZero: false,

    // Object - if specified, allows the user to override the step generation algorithm.
    //          Contains the following values
    //              start: // number to start at
    //              stepWidth: // size of step
    //              steps: // number of steps
    override: null,

    // label settings
    labels: {
        // Boolean - if true show labels
        show: true,

        // String - template string for labels
        template: "<%=value%>",

        // Function - if specified this is passed the tick value, index, and the array of all tick values. Returns a string that is used as the label for that value
        userCallback: null,

        // Number - label font size
        fontSize: 12,

        // String - label font style
        fontStyle: "normal",

        // String - label font color
        fontColor: "#666",

        // String - label font family
        fontFamily: "Helvetica Neue",
    },
}
```

The `userCallback` function allows the user fine grained control over how labels are generated. For instance, to generate every second labels in scientific notation, one could do the following
```javascript
{
    labels: {
        userCallback: function(value, index, values) {
            return (index % 2 === 0) ? values.toExponential() : '';
        }
    }
}
```