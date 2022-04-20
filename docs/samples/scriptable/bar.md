# Bar Chart
Demo selecting bar color based on the bar's y value.

```js chart-editor
// <block:setup:2>
const DATA_COUNT = 16;
Utils.srand(110);

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
];
// </block:setup>

// <block:data:1>
function generateData() {
  return Utils.numbers({
    count: DATA_COUNT,
    min: -100,
    max: 100
  });
}

const data = {
  labels: Utils.months({count: DATA_COUNT}),
  datasets: [{
    data: generateData(),
  }]
};
// </block:data>

// <block:options:0>
function colorize(opaque) {
  return (ctx) => {
    const v = ctx.parsed.y;
    const c = v < -50 ? '#D60000'
      : v < 0 ? '#F46300'
      : v < 50 ? '#0358B6'
      : '#44DE28';

    return opaque ? c : Utils.transparentize(c, 1 - Math.abs(v / 150));
  };
}

const config = {
  type: 'bar',
  data: data,
  options: {
    plugins: {
      legend: false,
    },
    elements: {
      bar: {
        backgroundColor: colorize(false),
        borderColor: colorize(true),
        borderWidth: 2
      }
    }
  }
};
// </block:options>

module.exports = {
  actions,
  config,
};
```

## Docs
* [Bar](../../charts/bar.html)
* [Data structures (`labels`)](../../general/data-structures.html)
  * [Dataset Configuration (`stack`)](../../general/data-structures.html#dataset-configuration)
* [Options](../../general/options.html)
  * [Scriptable Options](../../general/options.html#scriptable-options)
