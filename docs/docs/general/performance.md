---
title: Performance
---

Chart.js charts are rendered on `canvas` elements, which makes rendering quite fast. For large datasets or performance sensitive applications, you may wish to consider the tips below.

## Data structure and format

### Parsing

Provide prepared data in the internal format accepted by the dataset and scales and set `parsing: false`. See [Data structures](data-structures.md) for more information.

### Data normalization

Chart.js is fastest if you provide data with indices that are unique, sorted, and consistent across datasets and provide the `normalized: true` option to let Chart.js know that you have done so. Even without this option, it can sometimes still be faster to provide sorted data.

### Decimation

Decimating your data will achieve the best results. When there is a lot of data to display on the graph, it doesn't make sense to show tens of thousands of data points on a graph that is only a few hundred pixels wide.

There are many approaches to data decimation and selection of an algorithm will depend on your data and the results you want to achieve. For instance, [min/max](https://digital.ni.com/public.nsf/allkb/F694FFEEA0ACF282862576020075F784) decimation will preserve peaks in your data but could require up to 4 points for each pixel. This type of decimation would work well for a very noisy signal where you need to see data peaks.

Line charts are able to do [automatic data decimation during draw](#automatic-data-decimation-during-draw), when certain conditions are met. You should still consider decimating data yourself before passing it in for maximum performance since the automatic decimation occurs late in the chart life cycle.

## Tick Calculation

### Rotation

[Specify a rotation value](./axes/cartesian/index.mdx#tick-configuration) by setting `minRotation` and `maxRotation` to the same value, which avoids the chart from having to automatically determine a value to use.

### Sampling

Set the [`ticks.sampleSize`](./axes/cartesian/index.mdx#tick-configuration) option. This will determine how large your labels are by looking at only a subset of them in order to render axes more quickly. This works best if there is not a large variance in the size of your labels.

## Disable Animations

If your charts have long render times, it is a good idea to disable animations. Doing so will mean that the chart needs to only be rendered once during an update instead of multiple times. This will have the effect of reducing CPU usage and improving general page performance.
Line charts use Path2D caching when animations are disabled.

To disable animations

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: false
    }
});
```

## Specify `min` and `max` for scales

If you specify the `min` and `max`, the scale does not have to compute the range from the data.

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'time',
                min: new Date('2019-01-01').valueOf(),
                max: new Date('2019-12-31').valueOf()
            },
            y: {
                type: 'linear',
                min: 0,
                max: 100
            }
        }
    }
});
```

## Parallel rendering with web workers (Chrome only)

Chrome (in version 69) added the ability to [transfer rendering control of a canvas](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/transferControlToOffscreen) to a web worker. Web workers can use the [OffscreenCanvas API](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) to render from a web worker onto canvases in the DOM. Chart.js is a canvas-based library and supports rendering in a web worker - just pass an OffscreenCanvas into the Chart constructor instead of a Canvas element. Note that as of today, this API is only supported in Chrome.

By moving all Chart.js calculations onto a separate thread, the main thread can be freed up for other uses. Some tips and tricks when using Chart.js in a web worker:
* Transferring data between threads can be expensive, so ensure that your config and data objects are as small as possible. Try generating them on the worker side if you can (workers can make HTTP requests!) or passing them to your worker as ArrayBuffers, which can be transferred quickly from one thread to another.
* You can't transfer functions between threads, so if your config object includes functions you'll have to strip them out before transferring and then add them back later.
* You can't access the DOM from worker threads, so Chart.js plugins that use the DOM (including any mouse interactions) will likely not work.
* Ensure that you have a fallback if you support browsers other than the most modern Chrome browser.
* Resizing the chart must be done manually. See an example in the worker code below.

Example main thread code:

```javascript
const config = {};
const canvas = new HTMLCanvasElement();
const offscreenCanvas = canvas.transferControlToOffscreen();

const worker = new Worker('worker.js');
worker.postMessage({canvas: offscreenCanvas, config}, [offscreenCanvas]);
```

Example worker code, in `worker.js`:

```javascript
onmessage = function(event) {
    const {canvas, config} = event.data;
    const chart = new Chart(canvas, config);

    // Resizing the chart must be done manually, since OffscreenCanvas does not include event listeners.
    canvas.width = 100;
    canvas.height = 100;
    chart.resize();
};
```

## Line Charts

### Disable Bezier Curves

If you are drawing lines on your chart, disabling bezier curves will improve render times since drawing a straight line is more performant than a bezier curve.

To disable bezier curves for an entire chart:

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        elements: {
            line: {
                tension: 0 // disables bezier curves
            }
        }
    }
});
```

### Automatic data decimation during draw

Line element will automatically decimate data, when the following conditions are met: `tension` is `0`, `stepped` is `false` (default) and `borderDash` is `[]` (default). This improves rendering speed by skipping drawing of invisible line segments.

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        elements: {
            line: {
                tension: 0, // disables bezier curves
                fill: false,
                stepped: false,
                borderDash: []
            }
        }
    }
});
```

### Enable spanGaps

If you have a lot of data points, it can be more performant to enable `spanGaps`. This disables segmentation of the line, which can be an unneeded step.

To enable `spanGaps`:

```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            spanGaps: true // enable for a single dataset
        }]
    },
    options: {
        spanGaps: true // enable for all datasets
    }
});
```

### Disable Line Drawing

If you have a lot of data points, it can be more performant to disable rendering of the line for a dataset and only draw points. Doing this means that there is less to draw on the canvas which will improve render performance.

To disable lines:

```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            showLine: false // disable for a single dataset
        }]
    },
    options: {
        showLine: false // disable for all datasets
    }
});
```

### Disable Point Drawing

If you have a lot of data points, it can be more performant to disable rendering of the points for a dataset and only draw line. Doing this means that there is less to draw on the canvas which will improve render performance.

To disable point drawing:

```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            pointRadius: 0 // disable for a single dataset
        }]
    },
    options: {
        datasets: {
            line: {
                pointRadius: 0 // disable for all `'line'` datasets
            }
        },
        elements: {
            point: {
                radius: 0 // default to disabled in all datasets
            }
        }
    }
});
```

## When transpiling with Babel, consider using `loose` mode

Babel 7.9 changed the way classes are constructed. It is slow, unless used with `loose` mode.
[More information](https://github.com/babel/babel/issues/11356)
