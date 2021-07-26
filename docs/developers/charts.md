# New Charts

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
    // Defaults for charts of this type
    defaults: {
        // If set to `false` or `null`, no dataset level element is created.
        // If set to a string, this is the type of element to create for the dataset.
        // For example, a line create needs to create a line element so this is the string 'line'
        datasetElementType: string | null | false,

        // If set to `false` or `null`, no elements are created for each data value.
        // If set to a string, this is the type of element to create for each data value.
        // For example, a line create needs to create a point element so this is the string 'point'
        dataElementType: string | null | false,
    }

    // ID of the controller
    id: string;

    // Update the elements in response to new data
    // @param mode : update mode, core calls this method using any of `'active'`, `'hide'`, `'reset'`, `'resize'`, `'show'` or `undefined`
    update: function(mode) {}
}
```

The following methods may optionally be overridden by derived dataset controllers.

```javascript
{
    // Draw the representation of the dataset. The base implementation works in most cases, and an example of a derived version
    // can be found in the line controller
    draw: function() {},

    // Initializes the controller
    initialize: function() {},

    // Ensures that the dataset represented by this controller is linked to a scale. Overridden to helpers.noop in the polar area and doughnut controllers as these
    // chart types using a single scale
    linkScales: function() {},

    // Parse the data into the controller meta data. The default implementation will work for cartesian parsing, but an example of an overridden
    // version can be found in the doughnut controller
    parse: function(start, count) {},
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
        // Call bubble controller method to draw all the points
        super.draw(arguments);

        // Now we can do some custom drawing for this dataset. Here we'll draw a red box around the first point in each dataset
        const meta = this.getMeta();
        const pt0 = meta.data[0];

        const {x, y} = pt0.getProps(['x', 'y']);
        const {radius} = pt0.options;

        const ctx = this.chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - radius, y - radius, 2 * radius, 2 * radius);
        ctx.restore();
    }
};
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
