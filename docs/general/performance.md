# Performance

Chart.js charts are rendered on `canvas` elements, which makes rendering quite fast. For large datasets or performance sensitive applications, you may wish to consider the tips below:

* Set `animation: { duration: 0 }` to disable [animations](../configuration/animations.md).
* For large datasets:
  * You may wish to sample your data before providing it to Chart.js. E.g. if you have a data point for each day, you may find it more performant to pass in a data point for each week instead
  * Set the [`ticks.sampleSize`](../axes/cartesian/README.md#tick-configuration) option in order to render axes more quickly
