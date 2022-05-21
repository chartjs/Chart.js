# Line Segment Styling
Using helper functions to style each segment. Gaps in the data ('skipped') are set to dashed lines and segments with values going 'down' are set to a different color.

```js chart-editor

// <block:segmentUtils:1>
const skipped = (ctx, value) => ctx.p0.skip || ctx.p1.skip ? value : undefined;
const down = (ctx, value) => ctx.p0.parsed.y > ctx.p1.parsed.y ? value : undefined;
// </block:segmentUtils>

// <block:genericOptions:2>
const genericOptions = {
  fill: false,
  interaction: {
    intersect: false
  },
  radius: 0,
};
// </block:genericOptions>

// <block:config:0>
const config = {
  type: 'line',
  data: {
    labels: Utils.months({count: 7}),
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, NaN, 48, 56, 57, 40],
      borderColor: 'rgb(75, 192, 192)',
      segment: {
        borderColor: ctx => skipped(ctx, 'rgb(0,0,0,0.2)') || down(ctx, 'rgb(192,75,75)'),
        borderDash: ctx => skipped(ctx, [6, 6]),
      },
      spanGaps: true
    }]
  },
  options: genericOptions
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Docs
* [Data structures (`labels`)](../../general/data-structures.html)
* [Line](../../charts/line.html)
  * [Line Styling](../../charts/line.html#line-styling)
  * [Segment](../../charts/line.html#segment)
* [Options](../../general/options.html)
  * [Scriptable Options](../../general/options.html#scriptable-options)