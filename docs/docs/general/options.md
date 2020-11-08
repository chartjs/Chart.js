---
title: Options
---

## Scriptable Options

Scriptable options also accept a function which is called for each of the underlying data values and that takes the unique argument `context` representing contextual information (see [option context](options.md#option-context)).

Example:

```javascript
color: function(context) {
    var index = context.dataIndex;
    var value = context.dataset.data[index];
    return value < 0 ? 'red' :  // draw negative values in red
        index % 2 ? 'blue' :    // else, alternate values in blue and green
        'green';
}
```

## Indexable Options

Indexable options also accept an array in which each item corresponds to the element at the same index. Note that if there are less items than data, the items are looped over. In many cases, using a [function](#scriptable-options) is more appropriate if supported.

Example:

```javascript
color: [
    'red',    // color for data at index 0
    'blue',   // color for data at index 1
    'green',  // color for data at index 2
    'black',  // color for data at index 3
    //...
]
```

## Option Context

The option context is used to give contextual information when resolving options and currently only applies to [scriptable options](#scriptable-options).
The object is preserved, so it can be used to store and pass information between calls.

There are multiple levels of context objects:

- `chart`
  - `dataset`
    - `data`
  - `scale`
    - `tick`

Each level inherits its parent(s) and any contextual information stored in the parent is available through the child.

The context object contains the following properties:

### chart

- `chart`: the associated chart
- `type`: `'chart'`

### dataset

In addition to [chart](#chart)

- `active`: true if element is active (hovered)
- `dataset`: dataset at index `datasetIndex`
- `datasetIndex`: index of the current dataset
- `index`: getter for `datasetIndex`
- `type`: `'dataset'`

### data

In addition to [dataset](#dataset)

- `active`: true if element is active (hovered)
- `dataIndex`: index of the current data
- `dataPoint`: the parsed data values for the given `dataIndex` and `datasetIndex`
- `element`: the element (point, arc, bar, etc.) for this data
- `index`: getter for `dataIndex`
- `type`: `'data'`

### scale

In addition to [chart](#chart)

- `scale`: the associated scale
- `type`: `'scale'`

### tick

In addition to [scale](#scale)

- `tick`: the associated tick object
- `index`: tick index
- `type`: `'tick'`
