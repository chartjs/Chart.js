# Interaction Modes

When configuring interaction with the graph via hover or tooltips, a number of different modes are available.

The modes are detailed below and how they behave in conjunction with the `intersect` setting.

## point
Finds all of the items that intersect the point.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'point'
        }
    }
})
```

## nearest
Gets the item that is nearest to the point. The nearest item is determined based on the distance to the center of the chart item (point, bar). If 2 or more items are at the same distance, the one with the smallest area is used. If `intersect` is true, this is only triggered when the mouse position intersects an item in the graph. This is very useful for combo charts where points are hidden behind bars.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'nearest'
        }
    }
})
```

## single (deprecated)
Finds the first item that intersects the point and returns it. Behaves like 'nearest' mode with intersect = true.

## label (deprecated)
See `'index'` mode

## index
Finds item at the same index. If the `intersect` setting is true, the first intersecting item is used to determine the index in the data. If `intersect` false the nearest item, in the x direction, is used to determine the index. 

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'index'
        }
    }
})
```

To use index mode in a chart like the horizontal bar chart, where we search along the y direction, you can use the `axis` setting introduced in v2.7.0. By setting this value to `'y'` on the y direction is used.

```javascript
var chart = new Chart(ctx, {
    type: 'horizontalBar',
    data: data,
    options: {
        tooltips: {
            mode: 'index',
            axis: 'y'
        }
    }
})
```

## x-axis (deprecated)
Behaves like `'index'` mode with `intersect = false`.

## dataset
Finds items in the same dataset. If the `intersect` setting is true, the first intersecting item is used to determine the index in the data. If `intersect` false the nearest item is used to determine the index.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'dataset'
        }
    }
})
```

## x
Returns all items that would intersect based on the `X` coordinate of the position only. Would be useful for a vertical cursor implementation. Note that this only applies to cartesian charts

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'x'
        }
    }
})
```

## y
Returns all items that would intersect based on the `Y` coordinate of the position. This would be useful for a horizontal cursor implementation. Note that this only applies to cartesian charts.

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        tooltips: {
            mode: 'y'
        }
    }
})
```