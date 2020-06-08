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

The context object contains the following properties:

- `chart`: the associated chart
- `dataIndex`: index of the current data
- `dataset`: dataset at index `datasetIndex`
- `datasetIndex`: index of the current dataset
- `active`: true if element is active (hovered)

**Important**: since the context can represent different types of entities (dataset, data, ticks, etc.), some properties may be `undefined` so be sure to test any context property before using it.
