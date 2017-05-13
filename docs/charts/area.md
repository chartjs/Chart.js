# Area Charts

Both [line](line.md) and [radar](radar.md) charts support a `fill` option on the dataset object which can be used to create area between two datasets or a dataset and a boundary, i.e. the scale `origin`, `start` or `end` (see [filling modes](#filling-modes)).

> **Note:** this feature is implemented by the [`filler` plugin](https://github.com/chartjs/Chart.js/blob/master/src/plugins/plugin.filler.js).

## Filling modes

| Mode | Type | Values |
| :--- | :--- | :--- |
| Absolute dataset index <sup>1</sup> | `Number` | `1`, `2`, `3`, ... |
| Relative dataset index <sup>1</sup> | `String` | `'-1'`, `'-2'`, `'+1'`, ... |
| Boundary <sup>2</sup> | `String` | `'start'`, `'end'`, `'origin'` |
| Disabled <sup>3</sup> | `Boolean` | `false` |

> <sup>1</sup> dataset filling modes have been introduced in version 2.6.0<br>
> <sup>2</sup> prior version 2.6.0, boundary values was `'zero'`, `'top'`, `'bottom'` (deprecated)<br>
> <sup>3</sup> for backward compatibility, `fill: true` (default) is equivalent to `fill: 'origin'`<br>

**Example**
```javascript
new Chart(ctx, {
    data: {
        datasets: [
            {fill: 'origin'},      // 0: fill to 'origin'
            {fill: '+2'},          // 1: fill to dataset 3
            {fill: 1},             // 2: fill to dataset 1
            {fill: false},         // 3: no fill
            {fill: '-2'}           // 4: fill to dataset 2
        ]
    }
})
```

## Configuration
| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| [`plugins.filler.propagate`](#propagate) | `Boolean` | `true` | Fill propagation when target is hidden

### propagate
Boolean (default: `true`)

If `true`, the fill area will be recursively extended to the visible target defined by the `fill` value of hidden dataset targets:

**Example**
```javascript
new Chart(ctx, {
    data: {
        datasets: [
            {fill: 'origin'},   // 0: fill to 'origin'
            {fill: '-1'},       // 1: fill to dataset 0
            {fill: 1},          // 2: fill to dataset 1
            {fill: false},      // 3: no fill
            {fill: '-2'}        // 4: fill to dataset 2
        ]
    },
    options: {
        plugins: {
            filler: {
                propagate: true
            }
        }
    }
})
```

`propagate: true`:
- if dataset 2 is hidden, dataset 4 will fill to dataset 1
- if dataset 2 and 1 are hidden, dataset 4 will fill to `'origin'`

`propagate: false`:
- if dataset 2 and/or 4 are hidden, dataset 4 will not be filled
