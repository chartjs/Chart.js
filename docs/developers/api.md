# Chart Prototype Methods

For each chart, there are a set of global prototype methods on the shared `ChartType` which you may find useful. These are available on all charts created with Chart.js, but for the examples, let's use a line chart we've made.

```javascript
// For example:
var myLineChart = new Chart(ctx, config);
```

## .destroy()

Use this to destroy any chart instances that are created. This will clean up any references stored to the chart object within Chart.js, along with any associated event listeners attached by Chart.js.
This must be called before the canvas is reused for a new chart.

```javascript
// Destroys a specific chart instance
myLineChart.destroy();
```

## .update(config)

Triggers an update of the chart. This can be safely called after updating the data object. This will update all scales, legends, and then re-render the chart.

```javascript
// duration is the time for the animation of the redraw in milliseconds
// lazy is a boolean. if true, the animation can be interrupted by other animations
myLineChart.data.datasets[0].data[2] = 50; // Would update the first dataset's value of 'March' to be 50
myLineChart.update(); // Calling update now animates the position of March from 90 to 50.
```

> **Note:** replacing the data reference (e.g. `myLineChart.data = {datasets: [...]}` only works starting **version 2.6**. Prior that, replacing the entire data object could be achieved with the following workaround: `myLineChart.config.data = {datasets: [...]}`.

A `config` object can be provided with additional configuration for the update process. This is useful when `update` is manually called inside an event handler and some different animation is desired.

The following properties are supported:
* **duration** (number): Time for the animation of the redraw in milliseconds
* **lazy** (boolean): If true, the animation can be interrupted by other animations
* **easing** (string): The animation easing function. See [Animation Easing](../configuration/animations.md) for possible values.

Example:
```javascript
myChart.update({
    duration: 800,
    easing: 'easeOutBounce'
})
```

See [Updating Charts](updates.md) for more details.

## .reset()

Reset the chart to it's state before the initial animation. A new animation can then be triggered using `update`.

```javascript
myLineChart.reset();
```

## .render(config)

Triggers a redraw of all chart elements. Note, this does not update elements for new data. Use `.update()` in that case.

See `.update(config)` for more details on the config object.

```javascript
// duration is the time for the animation of the redraw in milliseconds
// lazy is a boolean. if true, the animation can be interrupted by other animations
myLineChart.render({
	duration: 800,
	lazy: false,
	easing: 'easeOutBounce'
});
```

## .stop()

Use this to stop any current animation loop. This will pause the chart during any current animation frame. Call `.render()` to re-animate.

```javascript
// Stops the charts animation loop at its current frame
myLineChart.stop();
// => returns 'this' for chainability
```

## .resize()

Use this to manually resize the canvas element. This is run each time the canvas container is resized, but you can call this method manually if you change the size of the canvas nodes container element.

```javascript
// Resizes & redraws to fill its container element
myLineChart.resize();
// => returns 'this' for chainability
```

## .clear()

Will clear the chart canvas. Used extensively internally between animation frames, but you might find it useful.

```javascript
// Will clear the canvas that myLineChart is drawn on
myLineChart.clear();
// => returns 'this' for chainability
```

## .toBase64Image()

This returns a base 64 encoded string of the chart in it's current state.

```javascript
myLineChart.toBase64Image();
// => returns png data url of the image on the canvas
```

## .generateLegend()

Returns an HTML string of a legend for that chart. The legend is generated from the `legendCallback` in the options.

```javascript
myLineChart.generateLegend();
// => returns HTML string of a legend for this chart
```

## .getElementAtEvent(e)

Calling `getElementAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the single element at the event position. If there are multiple items within range, only the first is returned. The value returned from this method is an array with a single parameter. An array is used to keep a consistent API between the `get*AtEvent` methods.

```javascript
myLineChart.getElementAtEvent(e);
// => returns the first element at the event point.
```

## .getElementsAtEvent(e)

Looks for the element under the event point, then returns all elements at the same data index. This is used internally for 'label' mode highlighting.

Calling `getElementsAtEvent(event)` on your Chart instance passing an argument of an event, or jQuery event, will return the point elements that are at that the same position of that event.

```javascript
canvas.onclick = function(evt){
    var activePoints = myLineChart.getElementsAtEvent(evt);
    // => activePoints is an array of points on the canvas that are at the same position as the click event.
};
```

This functionality may be useful for implementing DOM based tooltips, or triggering custom behaviour in your application.

## .getDatasetAtEvent(e)

Looks for the element under the event point, then returns all elements from that dataset. This is used internally for 'dataset' mode highlighting

```javascript
myLineChart.getDatasetAtEvent(e);
// => returns an array of elements
```

## .getDatasetMeta(index)

Looks for the dataset that matches the current index and returns that metadata. This returned data has all of the metadata that is used to construct the chart.

The `data` property of the metadata will contain information about each point, rectangle, etc. depending on the chart type.

Extensive examples of usage are available in the [Chart.js tests](https://github.com/chartjs/Chart.js/tree/master/test).

```javascript
var meta = myChart.getDatasetMeta(0);
var x = meta.data[0]._model.x
```
