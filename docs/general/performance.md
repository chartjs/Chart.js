# Performance

Chart.js charts are rendered on `canvas` elements, which makes rendering quite fast. For large datasets or performance sensitive applications, you may wish to consider the tips below.

## Tick Calculation

### Rotation

[Specify a rotation value](https://www.chartjs.org/docs/latest/axes/cartesian/#tick-configuration) by setting `minRotation` and `maxRotation` to the same value, which avoids the chart from having to automatically determine a value to use.

### Sampling

Set the [`ticks.sampleSize`](../axes/cartesian/README.md#tick-configuration) option. This will determine how large your labels are by looking at only a subset of them in order to render axes more quickly. This works best if there is not a large variance in the size of your labels.

## Disable Animations

If your charts have long render times, it is a good idea to disable animations. Doing so will mean that the chart needs to only be rendered once during an update instead of multiple times. This will have the effect of reducing CPU usage and improving general page performance.

To disable animations

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        animation: {
            duration: 0 // general animation time
        },
        hover: {
            animationDuration: 0 // duration of animations when hovering an item
        },
        responsiveAnimationDuration: 0 // animation duration after a resize
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

## Data structure and format

Provide prepared data in the internal format accepted by the dataset and scales and set `parsing: false`. See [Data structures](data-structures.md) for more information.

## Data Decimation

Decimating your data will achieve the best results. When there is a lot of data to display on the graph, it doesn't make sense to show tens of thousands of data points on a graph that is only a few hundred pixels wide.

There are many approaches to data decimation and selection of an algorithm will depend on your data and the results you want to achieve. For instance, [min/max](https://digital.ni.com/public.nsf/allkb/F694FFEEA0ACF282862576020075F784) decimation will preserve peaks in your data but could require up to 4 points for each pixel. This type of decimation would work well for a very noisy signal where you need to see data peaks.

Line charts are able to do [automatic data decimation during draw](#automatic-data-decimation-during-draw), when certain conditions are met. You should still consider decimating data yourself before passing it in for maximum performance since the automatic decimation occurs late in the chart life cycle.

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

Line element will automatically decimate data, when the following conditions are met: `tension` is `0`, `steppedLine` is `false` (default), `fill` is `false` and `borderDash` is `[]` (default).`
This improves rendering speed by skipping drawing of invisible line segments.

```javascript
new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        elements: {
            line: {
                tension: 0, // disables bezier curves
                fill: false,
                steppedLine: false,
                borderDash: []
            }
        }
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
        showLines: false // disable for all datasets
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
