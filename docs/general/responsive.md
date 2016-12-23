# Responsive Charts

Chart.js provides a few options for controlling resizing behaviour of charts.

## responsive
**Type:** Boolean
**Default:** `true`
Resizes the chart canvas when its container does.

```javascript
var options = {
    responsive: false
};
```

## responsiveAnimationDuration
**Type:** Number
**Default:** `0`
Duration in milliseconds it takes to animate to new size after a resize event.

```javascript
var options = {
    responsiveAnimationDuration: 100
};
```

## maintainAspectRatio
**Type:** Boolean
**Default:** `true`
Maintain the original canvas aspect ratio `(width / height)` when resizing.

```javascript
var options = {
    maintainAspectRatio: false
};
```

## onResize
**Type:** Function
**Default:** `null`
Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.

```javascript
var options = {
    onResize: function(chart, newSize) {
        // the chart is now at the new size. If you need to change configurations you could do it here.
    }
};)
```