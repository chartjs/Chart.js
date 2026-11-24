# Category Axis

If the global configuration is used, labels are drawn from one of the label arrays included in the chart data. If only `data.labels` is defined, this will be used. If `data.xLabels` is defined and the axis is horizontal, this will be used. Similarly, if `data.yLabels` is defined and the axis is vertical, this property will be used. Using both `xLabels` and `yLabels` together can create a chart that uses strings for both the X and Y axes.

Specifying any of the settings above defines the x-axis as `type: 'category'` if not defined otherwise. For more fine-grained control of category labels, it is also possible to add `labels` as part of the category axis definition. Doing so does not apply the global defaults.

`data.labels` applies to every category axis that has no `labels` of its own and no `xLabels` or `yLabels` for its orientation. To give a second category axis different labels, use `data.yLabels` (or `data.xLabels`) or the axis' `labels` option.

## Labels found in the data

When the data holds a value that is not among the labels, such as `{x: 'March', y: 10}`, the axis adds it after the labels it was given, in data order. Each axis keeps the labels it adds to itself. They are not written to `data.labels`, `data.xLabels`, `data.yLabels` or the `labels` option, and other axes do not show them. Read the labels an axis uses with `chart.scales[scaleId].getLabels()`.

The axis builds its labels again on every update, from the label arrays and the current data. After changing the labels or the data, call `chart.update()`.

## Category Axis Definition

Globally:

```javascript
let chart = new Chart(ctx, {
    type: ...
    data: {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: ...
    }
});
```

As part of axis definition:

```javascript
let chart = new Chart(ctx, {
    type: ...
    data: ...
    options: {
        scales: {
            x: {
                type: 'category',
                labels: ['January', 'February', 'March', 'April', 'May', 'June']
            }
        }
    }
});
```

## Configuration Options

### Category Axis specific options

Namespace: `options.scales[scaleId]`

| Name | Type | Description
| ---- | ---- | -----------
| `min` | `string`\|`number` | The minimum item to display. [more...](#min-max-configuration)
| `max` | `string`\|`number` | The maximum item to display. [more...](#min-max-configuration)
| `labels` | `string[]`\|`string[][]` | An array of labels to display. When an individual label is an array of strings, each item is rendered on a new line.

!!!include(axes/cartesian/_common.md)!!!

!!!include(axes/_common.md)!!!

## Tick Configuration

!!!include(axes/cartesian/_common_ticks.md)!!!

!!!include(axes/_common_ticks.md)!!!

## Min Max Configuration

For both the `min` and `max` properties, the value must be `string` in the `labels` array or `numeric` value as an index of a label in that array. In the example below, the x axis would only display "March" through "June".

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            data: [10, 20, 30, 40, 50, 60]
        }],
        labels: ['January', 'February', 'March', 'April', 'May', 'June']
    },
    options: {
        scales: {
            x: {
                min: 'March'
            }
        }
    }
});
```

A `string` that is not among the labels is added after them as a new label, and the same applies to `suggestedMin` and `suggestedMax`.

## Internal data format

Internally category scale uses label indices
