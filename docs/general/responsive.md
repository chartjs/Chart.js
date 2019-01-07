# Responsive Charts

When it comes to change the chart size based on the window size, a major limitation is that the canvas *render* size (`canvas.width` and `.height`) can **not** be expressed with relative values, contrary to the *display* size (`canvas.style.width` and `.height`). Furthermore, these sizes are independent from each other and thus the canvas *render* size does not adjust automatically based on the *display* size, making the rendering inaccurate.

The following examples **do not work**:

- `<canvas height="40vh" width="80vw">`: **invalid** values, the canvas doesn't resize ([example](https://codepen.io/chartjs/pen/oWLZaR))
- `<canvas style="height:40vh; width:80vw">`: **invalid** behavior, the canvas is resized but becomes blurry ([example](https://codepen.io/chartjs/pen/WjxpmO))

Chart.js provides a [few options](#configuration-options) to enable responsiveness and control the resize behavior of charts by detecting when the canvas *display* size changes and update the *render* size accordingly.

## Configuration Options

| Name | Type | Default | Description
| ---- | ---- | ------- | -----------
| `responsive` | `Boolean` | `true` | Resizes the chart canvas when its container does ([important note...](#important-note)).
| `responsiveAnimationDuration` | `Number` | `0` | Duration in milliseconds it takes to animate to new size after a resize event.
| `maintainAspectRatio` | `Boolean` | `true` | Maintain the original canvas aspect ratio `(width / height)` when resizing.
| `aspectRatio` | `Number` | `2` | Canvas aspect ratio (i.e. `width / height`, a value of 1 representing a square canvas). Note that this option is ignored if the height is explicitly defined either as attribute or via the style.
| `onResize` | `Function` | `null` | Called when a resize occurs. Gets passed two arguments: the chart instance and the new size.

## Important Note

Detecting when the canvas size changes can not be done directly from the `CANVAS` element. Chart.js uses its parent container to update the canvas *render* and *display* sizes. However, this method requires the container to be **relatively positioned** and **dedicated to the chart canvas only**. Responsiveness can then be achieved by setting relative values for the container size ([example](https://codepen.io/chartjs/pen/YVWZbz)):

```html
<div class="chart-container" style="position: relative; height:40vh; width:80vw">
    <canvas id="chart"></canvas>
</div>
```

The chart can also be programmatically resized by modifying the container size:

```javascript
chart.canvas.parentNode.style.height = '128px';
```

## Printing Resizeable Charts

CSS media queries allow changing styles when printing a page. The CSS applied from these media queries may cause charts to need to resize. However, the resize won't happen automatically. To support resizing charts when printing, one needs to hook the [onbeforeprint](https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeprint) event and manually trigger resizing of each chart.

```javascript
function beforePrintHandler () {
  for (var id in Chart.instances) {
    Chart.instances[id].resize()
  }
}
```
