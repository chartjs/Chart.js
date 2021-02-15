---
title: Options
---

## Option resolution

Options are resolved from top to bottom, using a context dependent route.

### Chart level options

* options
* defaults.controllers[`config.type`]
* defaults

### Dataset level options

`dataset.type` defaults to `config.type`, if not specified.

* dataset
* options.datasets[`dataset.type`]
* options.controllers[`dataset.type`].datasets
* options
* defaults.datasets[`dataset.type`]
* defaults.controllers[`dataset.type`].datasets
* defaults

### Dataset animation options

* dataset.animation
* options.controllers[`dataset.type`].datasets.animation
* options.animation
* defaults.controllers[`dataset.type`].datasets.animation
* defaults.animation

### Dataset element level options

Each scope is looked up with `elementType` prefix in the option name first, then wihtout the prefix. For example, `radius` for `point` element is looked up using `pointRadius` and if that does not hit, then `radius`.

* dataset
* options.datasets[`dataset.type`]
* options.controllers[`dataset.type`].datasets
* options.controllers[`dataset.type`].elements[`elementType`]
* options.elements[`elementType`]
* options
* defaults.datasets[`dataset.type`]
* defaults.controllers[`dataset.type`].datasets
* defaults.controllers[`dataset.type`].elements[`elementType`]
* defaults.elements[`elementType`]
* defaults

### Scale options

* options.scales
* defaults.controllers[`config.type`].scales
* defaults.controllers[`dataset.type`].scales
* defaults.scales

### Plugin options

A plugin can provide `additionalOptionScopes` array of paths to additionally look for its options in. For root scope, use empty string: `''`. Most core plugins also take options from root scope.

* options.plugins[`plugin.id`]
* options.controllers[`config.type`].plugins[`plugin.id`]
* (options.[`...plugin.additionalOptionScopes`])
* defaults.controllers[`config.type`].plugins[`plugin.id`]
* defaults.plugins[`plugin.id`]
* (defaults.[`...plugin.additionalOptionScopes`])

## Scriptable Options

Scriptable options also accept a function which is called for each of the underlying data values and that takes the unique argument `context` representing contextual information (see [option context](options.md#option-context)).
A resolver is passed as second parameter, that can be used to access other options in the same context.

Example:

```javascript
color: function(context) {
    var index = context.dataIndex;
    var value = context.dataset.data[index];
    return value < 0 ? 'red' :  // draw negative values in red
        index % 2 ? 'blue' :    // else, alternate values in blue and green
        'green';
},
borderColor: function(context, options) {
    var color = options.color; // resolve the value of another scriptable option: 'red', 'blue' or 'green'
    return Chart.helpers.color(color).lighten(0.2);
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

* `chart`
  * `dataset`
    * `data`
  * `scale`
    * `tick`

Each level inherits its parent(s) and any contextual information stored in the parent is available through the child.

The context object contains the following properties:

### chart

* `chart`: the associated chart
* `type`: `'chart'`

### dataset

In addition to [chart](#chart)

* `active`: true if element is active (hovered)
* `dataset`: dataset at index `datasetIndex`
* `datasetIndex`: index of the current dataset
* `index`: getter for `datasetIndex`
* `mode`: the update mode
* `type`: `'dataset'`

### data

In addition to [dataset](#dataset)

* `active`: true if element is active (hovered)
* `dataIndex`: index of the current data
* `parsed`: the parsed data values for the given `dataIndex` and `datasetIndex`
* `raw`: the raw data values for the given `dataIndex` and `datasetIndex`
* `element`: the element (point, arc, bar, etc.) for this data
* `index`: getter for `dataIndex`
* `mode`: the update mode
* `type`: `'data'`

### scale

In addition to [chart](#chart)

* `scale`: the associated scale
* `type`: `'scale'`

### tick

In addition to [scale](#scale)

* `tick`: the associated tick object
* `index`: tick index
* `type`: `'tick'`
