---
title: Events
---

The following properties define how the chart interacts with events.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `events` | `string[]` | `['mousemove', 'mouseout', 'click', 'touchstart', 'touchmove']` | The `events` option defines the browser events that the chart should listen to for tooltips and hovering. [more...](#event-option)
| `onHover` | `function` | `null` | Called when any of the events fire. Passed the event, an array of active elements (bars, points, etc), and the chart.
| `onClick` | `function` | `null` | Called if the event is of type `'mouseup'` or `'click'`. Passed the event, an array of active elements, and the chart.

## Event Option
For example, to have the chart only respond to click events, you could do:
```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        // This chart will not respond to mousemove, etc
        events: ['click']
    }
});
```

## Converting Events to Data Values

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
