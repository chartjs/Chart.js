# Time Series Axis

The time series scale extends from the time scale and supports all the same options. However, for the time series scale, each data point is spread equidistant.

## Example

```javascript
const chart = new Chart(ctx, {
<<<<<<< HEAD
    type: 'line',
    data: data,
    options: {
        scales: {
            x: {
                type: 'timeseries',
            }
        }
=======
  type: "line",
  data: data,
  options: {
    scales: {
      x: {
        type: "timeseries"
      }
>>>>>>> 9e2c13b9b99a77009b14a7e73eb303ae5aa1b086
    }
  }
});
```

## More details

Please see [the time scale documentation](./time.md) for all other details.
