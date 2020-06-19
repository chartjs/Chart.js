---
title: Time Series Axis
---

The time series scale extends from the time scale and supports all the same options. However, for the time series scale, each data point is spread equidistant. Also, the data indices are expected to be unique, sorted, and consistent across datasets.

## Example

```javascript
var chart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'timeseries',
            }
        }
    }
});
```

## More details

Please see [the time scale documentation](./time.md) for all other details.
