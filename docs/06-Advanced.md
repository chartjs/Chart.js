---
title: Advanced usage
anchor: advanced-usage
---


### Prototype methods

For each chart, there are a set of global prototype methods on the shared `ChartType` which you may find useful. These are available on all charts created with Chart.js, but for the examples, let's use a line chart we've made.

```javascript
// For example:
var myLineChart = new Chart(ctx).Line(data);
```

#### .clear()

Will clear the chart canvas. Used extensively internally between animation frames, but you might find it useful.

```javascript
// Will clear the canvas that myLineChart is drawn on
myLineChart.clear();
// => returns 'this' for chainability
```

#### .stop()

Use this to stop any current animation loop. This will pause the chart during any current animation frame. Call `.render()` to re-animate.

```javascript
// Stops the charts animation loop at its current frame
myLineChart.stop();
// => returns 'this' for chainability
```

#### .resize()

Use this to manually resize the canvas element. This is run each time the browser is resized, but you can call this method manually if you change the size of the canvas nodes container element.

```javascript
// Resizes & redraws to fill its container element
myLineChart.resize();
// => returns 'this' for chainability
```

#### .destroy()

Use this to destroy any chart instances that are created. This will clean up any references stored to the chart object within Chart.js, along with any associated event listeners attached by Chart.js.

```javascript
// Destroys a specific chart instance
myLineChart.destroy();
```

#### .toBase64Image()

This returns a base 64 encoded string of the chart in it's current state.

```javascript
myLineChart.toBase64Image();
// => returns png data url of the image on the canvas
```

#### .generateLegend()

Returns an HTML string of a legend for that chart. The template for this legend is at `legendTemplate` in the chart options.

```javascript
myLineChart.generateLegend();
// => returns HTML string of a legend for this chart
```

### External Tooltips

You can enable custom tooltips in the global or chart configuration like so:

```javascript
var myPieChart = new Chart(ctx).Pie(data, {
	customTooltips: function(tooltip) {

        // tooltip will be false if tooltip is not visible or should be hidden
        if (!tooltip) {
            return;
        }

        // Otherwise, tooltip will be an object with all tooltip properties like:

        // tooltip.caretHeight
        // tooltip.caretPadding
        // tooltip.chart
        // tooltip.cornerRadius
        // tooltip.fillColor
        // tooltip.font...
        // tooltip.text
        // tooltip.x
        // tooltip.y
        // etc...

    };
});
```

See files `sample/pie-customTooltips.html` and `sample/line-customTooltips.html` for examples on how to get started.


### Writing new chart types

Chart.js 1.0 has been rewritten to provide a platform for developers to create their own custom chart types, and be able to share and utilise them through the Chart.js API.

The format is relatively simple, there are a set of utility helper methods under `Chart.helpers`, including things such as looping over collections, requesting animation frames, and easing equations.

On top of this, there are also some simple base classes of Chart elements, these all extend from `Chart.Element`, and include things such as points, bars and scales.

```javascript
Chart.Type.extend({
	// Passing in a name registers this chart in the Chart namespace
	name: "Scatter",
	// Providing a defaults will also register the deafults in the chart namespace
	defaults : {
		options: "Here",
		available: "at this.options"
	},
	// Initialize is fired when the chart is initialized - Data is passed in as a parameter
	// Config is automatically merged by the core of Chart.js, and is available at this.options
	initialize:  function(data){
		this.chart.ctx // The drawing context for this chart
		this.chart.canvas // the canvas node for this chart
	},
	// Used to draw something on the canvas
	draw: function() {
	}
});

// Now we can create a new instance of our chart, using the Chart.js API
new Chart(ctx).Scatter(data);
// initialize is now run
```

### Extending existing chart types

We can also extend existing chart types, and expose them to the API in the same way. Let's say for example, we might want to run some more code when we initialize every Line chart.

```javascript
// Notice now we're extending the particular Line chart type, rather than the base class.
Chart.types.Line.extend({
	// Passing in a name registers this chart in the Chart namespace in the same way
	name: "LineAlt",
	initialize: function(data){
		console.log('My Line chart extension');
		Chart.types.Line.prototype.initialize.apply(this, arguments);
	}
});

// Creates a line chart in the same way
new Chart(ctx).LineAlt(data);
// but this logs 'My Line chart extension' in the console.
```

### Community extensions

- <a href="https://github.com/Regaddi/Chart.StackedBar.js" target"_blank">Stacked Bar Chart</a> by <a href="https://twitter.com/Regaddi" target="_blank">@Regaddi</a>
- <a href="https://github.com/CAYdenberg/Chart.js" target"_blank">Error bars (bar and line charts)</a> by <a href="https://twitter.com/CAYdenberg" target="_blank">@CAYdenberg</a>

### Creating custom builds

Chart.js uses <a href="http://gulpjs.com/" target="_blank">gulp</a> to build the library into a single JavaScript file. We can use this same build script with custom parameters in order to build a custom version.

Firstly, we need to ensure development dependencies are installed. With node and npm installed, after cloning the Chart.js repo to a local directory, and navigating to that directory in the command line, we can run the following:

```bash
npm install
npm install -g gulp
```

This will install the local development dependencies for Chart.js, along with a CLI for the JavaScript task runner <a href="http://gulpjs.com/" target="_blank">gulp</a>.

Now, we can run the `gulp build` task, and pass in a comma seperated list of types as an argument to build a custom version of Chart.js with only specified chart types.

Here we will create a version of Chart.js with only Line, Radar and Bar charts included:

```bash
gulp build --types=Line,Radar,Bar
```

This will output to the `/custom` directory, and write two files, Chart.js, and Chart.min.js with only those chart types included.
