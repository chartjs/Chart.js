# Interactions

Namespace: `options.interaction`, the global interaction configuration is at `Chart.defaults.interaction`. To configure which events trigger chart interactions, see [events](#events).

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `mode` | `string` | `'nearest'` | Sets which elements appear in the interaction. See [Interaction Modes](#modes) for details.
| `intersect` | `boolean` | `true` | if true, the interaction mode only applies when the mouse position intersects an item on the chart.
| `axis` | `string` | `'x'` | Can be set to `'x'`, `'y'`, `'xy'` or `'r'` to define which directions are used in calculating distances. Defaults to `'x'` for `'index'` mode and `'xy'` in `dataset` and `'nearest'` modes.

By default, these options apply to both the hover and tooltip interactions. The same options can be set in the `options.hover` namespace, in which case they will only affect the hover interaction. Similarly, the options can be set in the `options.plugins.tooltip` namespace to independently configure the tooltip interactions.

## Events

The following properties define how the chart interacts with events.
Namespace: `options`

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `events` | `string[]` | `['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']` | The `events` option defines the browser events that the chart should listen to for. Each of these events trigger hover and are passed to plugins. [more...](#event-option)
| `onHover` | `function` | `null` | Called when any of the events fire over chartArea. Passed the event, an array of active elements (bars, points, etc), and the chart.
| `onClick` | `function` | `null` | Called if the event is of type `'mouseup'`, `'click'` or '`'contextmenu'` over chartArea. Passed the event, an array of active elements, and the chart.

### Event Option

For example, to have the chart only respond to click events, you could do:

```javascript
const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // This chart will not respond to mousemove, etc
    events: ['click']
  }
});
```

Events for each plugin can be further limited by defining (allowed) events array in plugin options:

```javascript
const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // All of these (default) events trigger a hover and are passed to all plugins,
    // unless limited at plugin options
    events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
    plugins: {
      tooltip: {
        // Tooltip will only receive click events
        events: ['click']
      }
    }
  }
});
```

Events that do not fire over chartArea, like `mouseout`, can be captured using a simple plugin:

```javascript
const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    // these are the default events:
    // events: ['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove'],
  },
  plugins: [{
    id: 'myEventCatcher',
    beforeEvent(chart, args, pluginOptions) {
      const event = args.event;
      if (event.type === 'mouseout') {
        // process the event
      }
    }
  }]
});
```

For more information about plugins, see [Plugins](../developers/plugins.md)

### Converting Events to Data Values

A common occurrence is taking an event, such as a click, and finding the data coordinates on the chart where the event occurred. Chart.js provides helpers that make this a straightforward process.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        onClick: (e) => {
            const canvasPosition = Chart.helpers.getRelativePosition(e, chart);

            // Substitute the appropriate scale IDs
            const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
            const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
        }
    }
});
```

## Modes

When configuring the interaction with the graph via `interaction`, `hover` or `tooltips`, a number of different modes are available.

`options.hover` and `options.plugins.tooltip` extend from `options.interaction`. So if `mode`, `intersect` or any other common settings are configured only in `options.interaction`, both hover and tooltips obey that.

The modes are detailed below and how they behave in conjunction with the `intersect` setting.

See how different modes work with the tooltip in [tooltip interactions sample](../samples/tooltip/interactions.md )

### point

Finds all of the items that intersect the point.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'point'
        }
    }
});
```

### nearest

Gets the items that are at the nearest distance to the point. The nearest item is determined based on the distance to the center of the chart item (point, bar). You can use the `axis` setting to define which coordinates are considered in distance calculation. If `intersect` is true, this is only triggered when the mouse position intersects an item in the graph. This is very useful for combo charts where points are hidden behind bars.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'nearest'
        }
    }
});
```

### index

Finds item at the same index. If the `intersect` setting is true, the first intersecting item is used to determine the index in the data. If `intersect` false the nearest item, in the x direction, is used to determine the index.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'index'
        }
    }
});
```

To use index mode in a chart like the horizontal bar chart, where we search along the y direction, you can use the `axis` setting introduced in v2.7.0. By setting this value to `'y'` on the y direction is used.

```javascript
const chart = new Chart(ctx, {
    type: 'bar',
    data: data,
    options: {
        interaction: {
            mode: 'index',
            axis: 'y'
        }
    }
});
```

### dataset

Finds items in the same dataset. If the `intersect` setting is true, the first intersecting item is used to determine the index in the data. If `intersect` false the nearest item is used to determine the index.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'dataset'
        }
    }
});
```

### x

Returns all items that would intersect based on the `X` coordinate of the position only. Would be useful for a vertical cursor implementation. Note that this only applies to cartesian charts.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'x'
        }
    }
});
```

### y

Returns all items that would intersect based on the `Y` coordinate of the position. This would be useful for a horizontal cursor implementation. Note that this only applies to cartesian charts.

```javascript
const chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        interaction: {
            mode: 'y'
        }
    }
});
```
