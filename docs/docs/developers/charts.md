---
title: New Charts
---

Chart.js 2.0 introduced the concept of controllers for each dataset. Like scales, new controllers can be written as needed.

```javascript
class MyType extends Chart.DatasetController {

}

Chart.register(MyType);

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

    // Draw the representation of the dataset
    draw: function() {},

    // Remove hover styling from the given element
    removeHoverStyle: function(element, datasetIndex, index) {},

    // Add hover styling to the given element
    setHoverStyle: function(element, datasetIndex, index) {},

    // Update the elements in response to new data
    // @param mode : update mode, core calls this method using any of `'active'`, `'hide'`, `'reset'`, `'resize'`, `'show'` or `undefined`
    update: function(mode) {}
}
```

The following methods may optionally be overridden by derived dataset controllers.

```javascript
{
    // Initializes the controller
    initialize: function() {},

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

* `BarController`
* `BubbleController`
* `DoughnutController`
* `LineController`
* `PieController`
* `PolarAreaController`
* `RadarController`
* `ScatterController`

These controllers are also available in the UMD package, directly under `Chart`. Eg: `Chart.BarController`.

For example, to derive a new chart type that extends from a bubble chart, you would do the following.

```javascript
import {BubbleController} from 'chart.js';
class Custom extends BubbleController {
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
Custom.id = 'derivedBubble';
Custom.defaults = BubbleController.defaults;

// Stores the controller so that the chart initialization routine can look it up
Chart.register(Custom);

// Now we can create and use our new chart type
new Chart(ctx, {
    type: 'derivedBubble',
    data: data,
    options: options
});
```

## TypeScript Typings

If you want your new chart type to be statically typed, you must provide a `.d.ts` TypeScript declaration file. Chart.js provides a way to augment built-in types with user-defined ones, by using the concept of "declaration merging".

When adding a new chart type, `ChartTypeRegistry` must contains the declarations for the new type, either by extending an existing entry in `ChartTypeRegistry` or by creating a new one.

For example, to provide typings for a new chart type that extends from a bubble chart, you would add a `.d.ts` containing:

```ts
import { ChartTypeRegistry } from 'chart.js'

declare module 'chart.js' {
    interface ChartTypeRegistry {
        derivedBubble: ChartTypeRegistry['bubble']
    }
}
```
