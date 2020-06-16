---
title: New Charts
---

Chart.js 2.0 introduces the concept of controllers for each dataset. Like scales, new controllers can be written as needed.

```javascript
class MyType extends Chart.DatasetController {

}

Chart.controllers.MyType = MyType;

// Now we can create a new instance of our chart, using the Chart.js API
new Chart(ctx, {
    // this is the string the constructor was registered at, ie Chart.controllers.MyType
    type: 'MyType',
    data: data,
    options: options
});
```

## Dataset Controller Interface

Dataset controllers must implement the following interface.

```javascript
{
    // Create elements for each piece of data in the dataset. Store elements in an array on the dataset as dataset.metaData
    addElements: function() {},

    // Create a single element for the data at the given index and reset its state
    addElementAndReset: function(index) {},

    // Draw the representation of the dataset
    // @param ease : if specified, this number represents how far to transition elements. See the implementation of draw() in any of the provided controllers to see how this should be used
    draw: function(ease) {},

    // Remove hover styling from the given element
    removeHoverStyle: function(element, datasetIndex, index) {},

    // Add hover styling to the given element
    setHoverStyle: function(element, datasetIndex, index) {},

    // Update the elements in response to new data
    // @param reset : if true, put the elements into a reset state so they can animate to their final values
    update: function(reset) {}
}
```

The following methods may optionally be overridden by derived dataset controllers.
```javascript
{
    // Initializes the controller
    initialize: function(chart, datasetIndex) {},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Called by the main chart controller when an update is triggered. The default implementation handles the number of data points changing and creating elements appropriately.
    buildOrUpdateElements: function() {}
}
```

## Extending Existing Chart Types

Extending or replacing an existing controller type is easy. Simply replace the constructor for one of the built in types with your own.

The built in controller types are:

* `Chart.controllers.line`
* `Chart.controllers.bar`
* `Chart.controllers.radar`
* `Chart.controllers.doughnut`
* `Chart.controllers.polarArea`
* `Chart.controllers.bubble`

For example, to derive a new chart type that extends from a bubble chart, you would do the following.

```javascript
// Sets the default config for 'derivedBubble' to be the same as the bubble defaults.
// We look for the defaults by doing Chart.defaults[chartType]
// It looks like a bug exists when the defaults don't exist
Chart.defaults.derivedBubble = Chart.defaults.bubble;

// I think the recommend using Chart.controllers.bubble.extend({ extensions here });
class Custom extends Chart.controllers.bubble {
    draw() {
        // Call super method first
        super.draw(arguments);

        // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
        var meta = this.getMeta();
        var pt0 = meta.data[0];
        var radius = pt0.radius;

        var ctx = this.chart.chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(pt0.x - radius, pt0.y - radius, 2 * radius, 2 * radius);
        ctx.restore();
    }
});

// Stores the controller so that the chart initialization routine can look it up with
// Chart.controllers[type]
Chart.controllers.derivedBubble = Custom;

// Now we can create and use our new chart type
new Chart(ctx, {
    type: 'derivedBubble',
    data: data,
    options: options
});
```
