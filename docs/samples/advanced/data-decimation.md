# Data Decimation

This example shows how to use the built-in data decimation to reduce the number of points drawn on the graph for improved performance.

```js chart-editor
// <block:actions:3>
const actions = [
  {
    name: 'No decimation (default)',
    handler(chart) {
      chart.options.plugins.decimation.enabled = false;
      chart.update();
    }
  },
  {
    name: 'min-max decimation',
    handler(chart) {
      chart.options.plugins.decimation.algorithm = 'min-max';
      chart.options.plugins.decimation.enabled = true;
      chart.update();
    },
  },
  {
    name: 'LTTB decimation (50 samples)',
    handler(chart) {
      chart.options.plugins.decimation.algorithm = 'lttb';
      chart.options.plugins.decimation.enabled = true;
      chart.options.plugins.decimation.samples = 50;
      chart.update();
    }
  },
  {
    name: 'LTTB decimation (500 samples)',
    handler(chart) {
      chart.options.plugins.decimation.algorithm = 'lttb';
      chart.options.plugins.decimation.enabled = true;
      chart.options.plugins.decimation.samples = 500;
      chart.update();
    }
  }
];
// </block:actions>

// <block:data:1>
const NUM_POINTS = 100000;
Utils.srand(10);

// parseISODate returns a luxon date object to work with in the samples
// We will create points every 30s starting from this point in time
const start = Utils.parseISODate('2021-04-01T00:00:00Z').toMillis();
const pointData = [];

for (let i = 0; i < NUM_POINTS; ++i) {
  // Most data will be in the range [0, 20) but some rare data will be in the range [0, 100)
  const max = Math.random() < 0.001 ? 100 : 20;
  pointData.push({x: start + (i * 30000), y: Utils.rand(0, max)});
}

const data = {
  datasets: [{
    borderColor: Utils.CHART_COLORS.red,
    borderWidth: 1,
    data: pointData,
    label: 'Large Dataset',
    radius: 0,
  }]
};
// </block:data>

// <block:decimation:0>
const decimation = {
  enabled: false,
  algorithm: 'min-max',
};
// </block:decimation>

// <block:setup:2>
const config = {
  type: 'line',
  data: data,
  options: {
    // Turn off animations and data parsing for performance
    animation: false,
    parsing: false,

    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      decimation: decimation,
    },
    scales: {
      x: {
        type: 'time',
        ticks: {
          source: 'auto',
          // Disabled rotation for performance
          maxRotation: 0,
          autoSkip: true,
        }
      }
    }
  }
};
// </block:setup>

module.exports = {
  actions: actions,
  config: config,
};
```
## Docs
* [Data Decimation](../../configuration/decimation.html)
* [Line](../../charts/line.html)
* [Time Scale](../../axes/cartesian/time.html)

