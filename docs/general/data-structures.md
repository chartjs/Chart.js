# Data structures

The `data` property of a dataset can be passed in various formats. By default, that `data` is parsed using the associated chart type and scales.

If the `labels` property of the main `data` property is used, it has to contain the same amount of elements as the dataset with the most values. These labels are used to label the index axis (default `x` axis). The values for the labels have to be provided in an array.
The provided labels can be of the type string or number to be rendered correctly. If you want multiline labels, you can provide an array with each line as one entry in the array.

## Primitive[]

```javascript
const cfg = {
  type: 'bar',
  data: {
    datasets: [{
      data: [20, 10],
    }],
    labels: ['a', 'b']
  }
}
```

When `data` is an array of numbers, values from the `labels` array at the same index are used for the index axis (`x` for vertical, `y` for horizontal charts).

## Array[]

```javascript
const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [[10, 20], [15, null], [20, 10]]
    }]
  }
}
```

When `data` is an array of arrays (or what TypeScript would call tuples), the first element of each tuple is the index  (`x` for vertical, `y` for horizontal charts) and the second element is the value (`y` by default).

## Object[]

```javascript
const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{x: 10, y: 20}, {x: 15, y: null}, {x: 20, y: 10}]
    }]
  }
}
```

```javascript
const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{x: '2016-12-25', y: 20}, {x: '2016-12-26', y: 10}]
    }]
  }
}
```

```javascript
const cfg = {
  type: 'bar',
  data: {
    datasets: [{
      data: [{x: 'Sales', y: 20}, {x: 'Revenue', y: 10}]
    }]
  }
}
```

This is also the internal format used for parsed data. In this mode, parsing can be disabled by specifying `parsing: false` at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.

The values provided must be parsable by the associated scales or in the internal format of the associated scales. For example, the `category` scale uses integers as an internal format, where each integer represents an index in the labels array; but, if parsing is enabled, it can also parse string labels.

`null` can be used for skipped values.

## Object[] using custom properties

```javascript
const cfg = {
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
}
```

When using the pie/doughnut, radar or polarArea chart type, the `parsing` object should have a `key` item that points to the value to look at. In this example, the doughnut chart will show two items with values 1500 and 500.

```javascript
const cfg = {
  type: 'doughnut',
  data: {
    datasets: [{
      data: [{id: 'Sales', nested: {value: 1500}}, {id: 'Purchases', nested: {value: 500}}]
    }]
  },
  options: {
    parsing: {
      key: 'nested.value'
    }
  }
}
```

If the key contains a dot, it needs to be escaped with a double slash:

```javascript
const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: [{'data.key': 'one', 'data.value': 20}, {'data.key': 'two', 'data.value': 30}]
    }]
  },
  options: {
    parsing: {
      xAxisKey: 'data\\.key',
      yAxisKey: 'data\\.value'
    }
  }
}
```

:::warning
When using object notation in a radar chart, you still need a `labels` array with labels for the chart to show correctly.
:::

## Object

```javascript
const cfg = {
  type: 'line',
  data: {
    datasets: [{
      data: {
        January: 10,
        February: 20
      }
    }]
  }
}
```

In this mode, the property name is used for the `index` scale and value for the `value` scale. For vertical charts, the index scale is `x` and value scale is `y`.

## Dataset Configuration

| Name | Type | Description
| ---- | ---- | -----------
| `label` | `string` | The label for the dataset which appears in the legend and tooltips.
| `clip` | `number`\|`object` | How to clip relative to chartArea. Positive value allows overflow, negative value clips that many pixels inside chartArea. 0 = clip at chartArea. Clipping can also be configured per side: clip: {left: 5, top: false, right: -2, bottom: 0}
| `order` | `number` | The drawing order of dataset. Also affects order for stacking, tooltip and legend.
| `stack` | `string` | The ID of the group to which this dataset belongs to (when stacked, each group will be a separate stack). Defaults to dataset `type`.
| `parsing` | `boolean`\|`object` | How to parse the dataset. The parsing can be disabled by specifying parsing: false at chart options or dataset. If parsing is disabled, data must be sorted and in the formats the associated chart type and scales use internally.
| `hidden`  | `boolean` | Configure the visibility of the dataset. Using `hidden: true` will hide the dataset from being rendered in the Chart.

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

## TypeScript

When using TypeScript, if you want to use a data structure that is not the default data structure, you will need to pass it to the type interface when instantiating the data variable.

```ts
import {ChartData} from 'chart.js';

const datasets: ChartData <'bar', {key: string, value: number} []> = {
  datasets: [{
    data: [{key: 'Sales', value: 20}, {key: 'Revenue', value: 10}],
    parsing: {
      xAxisKey: 'key',
      yAxisKey: 'value'
    }
  }],
};
```
