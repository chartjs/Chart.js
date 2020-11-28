---
title: Area Chart
---

Both [line](./line.mdx) and [radar](./radar.mdx) charts support a `fill` option on the dataset object which can be used to create space between two datasets or a dataset and a boundary, i.e. the scale `origin`, `start,` or `end` (see [filling modes](#filling-modes)).

> **Note:** this feature is implemented by the [`filler` plugin](https://github.com/chartjs/Chart.js/blob/master/src/plugins/plugin.filler.js).

## Filling modes

| Mode | Type | Values |
| :--- | :--- | :--- |
| Absolute dataset index | `number` | `1`, `2`, `3`, ... |
| Relative dataset index | `string` | `'-1'`, `'-2'`, `'+1'`, ... |
| Boundary | `string` | `'start'`, `'end'`, `'origin'` |
| Disabled <sup>1</sup> | `boolean` | `false` |
| Stacked value below <sup>4</sup> | `string` | `'stack'` |
| Axis value | `object` | `{ value: number; }` |

> <sup>1</sup> for backward compatibility, `fill: true` is equivalent to `fill: 'origin'`<br/>

**Example**

```javascript
new Chart(ctx, {
    data: {
        datasets: [
            {fill: 'origin'},      // 0: fill to 'origin'
            {fill: '+2'},          // 1: fill to dataset 3
            {fill: 1},             // 2: fill to dataset 1
            {fill: false},         // 3: no fill
            {fill: '-2'},          // 4: fill to dataset 2
            {fill: {value: 25}}    // 5: fill to axis value 25
        ]
    }
});
```

If you need to support multiple colors when filling from one dataset to another, you may specify an object with the following option :

| Param | Type | Description |
| :--- | :--- | :--- |
| `target` | `number`, `string`, `boolean`, `object` | The accepted values are the same as the filling mode values, so you may use absolute and relative dataset indexes and/or boundaries. |
| `above` | `Color` | If no color is set, the default color will be the background color of the chart. |
| `below` | `Color` | Same as the above. |

**Example**

```javascript
new Chart(ctx, {
    data: {
        datasets: [
            {
              fill: {
                target: 'origin',
                above: 'rgb(255, 0, 0)',   // Area will be red above the origin
                below: 'rgb(0, 0, 255)'    // And blue below the origin
              }
            }
        ]
    }
});
```

## Configuration

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| [`plugins.filler.propagate`](#propagate) | `boolean` | `true` | Fill propagation when target is hidden.

### propagate

`propagate` takes a `boolean` value (default: `true`).

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
});
```

`propagate: true`:
-if dataset 2 is hidden, dataset 4 will fill to dataset 1
-if dataset 2 and 1 are hidden, dataset 4 will fill to `'origin'`

`propagate: false`:
-if dataset 2 and/or 4 are hidden, dataset 4 will not be filled
