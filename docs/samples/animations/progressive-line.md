# Progressive Line

```js chart-editor

// <block:data:2>
const data = [];
const data2 = [];
let prev = 100;
let prev2 = 80;
for (let i = 0; i < 1000; i++) {
  prev += 5 - Math.random() * 10;
  data.push({x: i, y: prev});
  prev2 += 5 - Math.random() * 10;
  data2.push({x: i, y: prev2});
}
// </block:data>

// <block:animation:1>
const totalDuration = 10000;
const delayBetweenPoints = totalDuration / data.length;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: delayBetweenPoints,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return ctx.index * delayBetweenPoints;
    }
  }
};
// </block:animation>

// <block:config:0>
const config = {
  type: 'line',
  data: {
    datasets: [{
      borderColor: Utils.CHART_COLORS.red,
      borderWidth: 1,
      radius: 0,
      data: data,
    },
    {
      borderColor: Utils.CHART_COLORS.blue,
      borderWidth: 1,
      radius: 0,
      data: data2,
    }]
  },
  options: {
    animation,
    interaction: {
      intersect: false
    },
    plugins: {
      legend: false
    },
    scales: {
      x: {
        type: 'linear'
      }
    }
  }
};
// </block:config>

module.exports = {
  config
};

```

## Api 
* [Chart](../../api/classes/Chart.md)
  * [`getDatasetMeta`](../../api/classes/Chart.md#getdatasetmeta)
* [Scale](../../api/classes/Scale.md)
  * [`getPixelForValue`](../../api/classes/Scale.md#getpixelforvalue)
## Docs
* [Animations](../../configuration/animations.md)
  * [animation](../../configuration/animations.md#animation)
    * `delay`
    * `duration`
    * `easing`
    * `loop`
* [Line](../../charts/line.md)
* [Options](../../general/options.md)
  * [Scriptable Options](../../general/options.md#scriptable-options)
    * [Data Context](../../general/options.md#data)
