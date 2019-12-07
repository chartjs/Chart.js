# Data structures

The `data` property of a dataset can be passed in various formats. By default, that `data` is parsed using the associated chart type and scales.

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

This is also the internal format used for parsed data. Property names are matched to scale-id. In this mode, parsing can be disabled by specifying `parsing: false` at chart options or dataset. If parsing is disabled, data must be in the formats the associated chart type and scales use internally.

## Object

```javascript
data: {
    January: 10,
    February: 20
}
```

In this mode, property name is used for `index` scale and value for `value` scale. For vertical charts, index scale is `x` and value scale is `y`.
