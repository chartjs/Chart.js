# Events
The following properties define how the chart interacts with events.

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `events` | `String[]` | `["mousemove", "mouseout", "click", "touchstart", "touchmove", "touchend"]` | The `events` option defines the browser events that the chart should listen to for tooltips and hovering. [more...](#event-option)
| `onHover` | `Function` | `null` | Called when any of the events fire. Called in the context of the chart and passed the event and an array of active elements (bars, points, etc).
| `onClick` | `Function` | `null` | Called if the event is of type 'mouseup' or 'click'. Called in the context of the chart and passed the event and an array of active elements

## Event Option
For example, to have the chart only respond to click events, you could do
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
