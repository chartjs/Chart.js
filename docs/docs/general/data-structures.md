---
title: Data structures
---

The `data` property of a dataset can be passed in various formats. By default, that `data` is parsed using the associated chart type and scales.

If the `labels` property of the main `data` property is used, it has to contain the same amount of elements as the dataset with the most values. These labels are used to label the index axis (default x axes). The values for the labels have to be provided in an array.
The provides labels can be of the type string or number to be rendered correctly. In case you want multiline labels you can provide an array with each line as one entry in the array.

## Primitive[]

```javascript
data: [20, 10],
labels: ['a', 'b']
```

When the `data` is an array of numbers, values from `labels` array at the same index are used for the index axis (`x` for vertical, `y` for horizontal charts).

## Object[]

```javascript
data: [{x: 10, y: 20}, {x: 15, y: 10}]
```

```javascript
data: [{x:'2016-12-25', y:20}, {x:'2016-12-26', y:10}]
```

```javascript
data: [{x:'Sales', y:20}, {x:'Revenue', y:10}]
```

This is also the internal format used for parsed data. In this mode, parsing can be disabled by specifying `parsing: false` at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.

## Object[] using custom properties

```javascript
type: 'bar',
data: {
    datasets: [{
        data: [{id: 'Sales', nested: {value: 1500}}, {id: 'Purchases', nested: {value: 500}}]
    }]
},
options: {
    parsing: {
        xAxisKey: 'id',
        yAxisKey: 'nested.value'
    }
}
```

## Object

```javascript
data: {
    January: 10,
    February: 20
}
```

In this mode, property name is used for `index` scale and value for `value` scale. For vertical charts, index scale is `x` and value scale is `y`.

## Dataset Configuration

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `string` | The label for the dataset which appears in the legend and tooltips.
| `clip` | `number`\|`object` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
| `order` | `number` | The drawing order of dataset. Also affects order for stacking, tooltip and legend.
| `stack` | `string` | The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack).
| `parsing` | `boolean`\|`object` | How to parse the dataset. The parsing can be disabled by specifying parsing: false at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.

### parsing

```javascript
const data = [{x: 'Jan', net: 100, cogs: 50, gm: 50}, {x: 'Feb', net: 120, cogs: 55, gm: 75}];
const cfg = {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb'],
        datasets: [{
            label: 'Net sales',
            data: data,
            parsing: {
                yAxisKey: 'net'
            }
        }, {
            label: 'Cost of goods sold',
            data: data,
            parsing: {
                yAxisKey: 'cogs'
            }
        }, {
            label: 'Gross margin',
            data: data,
            parsing: {
                yAxisKey: 'gm'
            }
        }]
    },
};
```
