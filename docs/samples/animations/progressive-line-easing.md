# Progressive Line With Easing

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
let easing = helpers.easingEffects.easeOutQuad;
let restart = false;
const totalDuration = 5000;
const duration = (ctx) => easing(ctx.index / data.length) * totalDuration / data.length;
const delay = (ctx) => easing(ctx.index / data.length) * totalDuration;
const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['y'], true).y;
const animation = {
  x: {
    type: 'number',
    easing: 'linear',
    duration: duration,
    from: NaN, // the point is initially skipped
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.xStarted) {
        return 0;
      }
      ctx.xStarted = true;
      return delay(ctx);
    }
  },
  y: {
    type: 'number',
    easing: 'linear',
    duration: duration,
    from: previousY,
    delay(ctx) {
      if (ctx.type !== 'data' || ctx.yStarted) {
        return 0;
      }
      ctx.yStarted = true;
      return delay(ctx);
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
      legend: false,
      title: {
        display: true,
        text: () => easing.name
      }
    },
    scales: {
      x: {
        type: 'linear'
      }
    }
  }
};
// </block:config>

// <block:actions:2>
function restartAnims(chart) {
  chart.stop();
  const meta0 = chart.getDatasetMeta(0);
  const meta1 = chart.getDatasetMeta(1);
  for (let i = 0; i < data.length; i++) {
    const ctx0 = meta0.controller.getContext(i);
    const ctx1 = meta1.controller.getContext(i);
    ctx0.xStarted = ctx0.yStarted = false;
    ctx1.xStarted = ctx1.yStarted = false;
  }
  chart.update();
}

const actions = [
  {
    name: 'easeOutQuad',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuad;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutCubic',
    handler(chart) {
      easing = helpers.easingEffects.easeOutCubic;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutQuart',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuart;
      restartAnims(chart);
    }
  },
  {
    name: 'easeOutQuint',
    handler(chart) {
      easing = helpers.easingEffects.easeOutQuint;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuad',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuad;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInCubic',
    handler(chart) {
      easing = helpers.easingEffects.easeInCubic;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuart',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuart;
      restartAnims(chart);
    }
  },
  {
    name: 'easeInQuint',
    handler(chart) {
      easing = helpers.easingEffects.easeInQuint;
      restartAnims(chart);
    }
  },
];
// </block:actions>

module.exports = {
  config,
  actions
};

```
