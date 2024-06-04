# Padding

Padding values in Chart options can be supplied in a couple of different formats.

## Number

If this value is a number, it is applied to all sides (left, top, right, bottom).

For example, defining a 20px padding to all sides of the chart:

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        layout: {
            padding: 20
        }
    }
});
```

## {top, left, bottom, right} object

If this value is an object, the `left` property defines the left padding. Similarly, the `right`, `top` and `bottom` properties can also be specified.
Omitted properties default to `0`.

Let's say you wanted to add 50px of padding to the left side of the chart canvas, you would do:

```javascript
let chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        layout: {
            padding: {
                left: 50
            }
        }
    }
});
```

## {x, y} object

This is a shorthand for defining left/right and top/bottom to the same values.

For example, 10px left / right and 4px top / bottom padding on a Radial Linear Axis [tick backdropPadding](../axes/radial/linear.md#linear-radial-axis-specific-tick-options):

```javascript
let chart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
        scales: {
          r: {
            ticks: {
              backdropPadding: {
                  x: 10,
                  y: 4
              }
            }
        }
    }
});
```
