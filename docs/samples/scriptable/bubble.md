# Bubble Chart

```js chart-editor
// <block:setup:2>
const DATA_COUNT = 16;
const MIN_XY = -150;
const MAX_XY = 100;
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
  const data = [];
  let i;

  for (i = 0; i < DATA_COUNT; ++i) {
    data.push({
      x: Utils.rand(MIN_XY, MAX_XY),
      y: Utils.rand(MIN_XY, MAX_XY),
      v: Utils.rand(0, 1000)
    });
  }

  return data;
}

const data = {
  datasets: [{
    data: generateData()
  }, {
    data: generateData()
  }]
};
// </block:data>

// <block:options:0>
function channelValue(x, y, values) {
  return x < 0 && y < 0 ? values[0] : x < 0 ? values[1] : y < 0 ? values[2] : values[3];
}

function colorize(opaque, context) {
  const value = context.raw;
  const x = value.x / 100;
  const y = value.y / 100;
  const r = channelValue(x, y, [250, 150, 50, 0]);
  const g = channelValue(x, y, [0, 50, 150, 250]);
  const b = channelValue(x, y, [0, 150, 150, 250]);
  const a = opaque ? 1 : 0.5 * value.v / 1000;

  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

const config = {
  type: 'bubble',
  data: data,
  options: {
    aspectRatio: 1,
    plugins: {
      legend: false,
      tooltip: false,
    },
    elements: {
      point: {
        backgroundColor: colorize.bind(null, false),

        borderColor: colorize.bind(null, true),

        borderWidth: function(context) {
          return Math.min(Math.max(1, context.datasetIndex + 1), 8);
        },

        hoverBackgroundColor: 'transparent',

        hoverBorderColor: function(context) {
          return Utils.color(context.datasetIndex);
        },

        hoverBorderWidth: function(context) {
          return Math.round(8 * context.raw.v / 1000);
        },

        radius: function(context) {
          const size = context.chart.width;
          const base = Math.abs(context.raw.v) / 1000;
          return (size / 24) * base;
        }
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
