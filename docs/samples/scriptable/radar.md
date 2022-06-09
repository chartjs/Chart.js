# Radar Chart

```js chart-editor
// <block:setup:2>
const DATA_COUNT = 7;
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
    min: 0,
    max: 100
  });
}

const data = {
  labels: [['Eating', 'Dinner'], ['Drinking', 'Water'], 'Sleeping', ['Designing', 'Graphics'], 'Coding', 'Cycling', 'Running'],
  datasets: [{
    data: generateData()
  }]
};
// </block:data>

// <block:options:0>
function getLineColor(ctx) {
  return Utils.color(ctx.datasetIndex);
}

function alternatePointStyles(ctx) {
  const index = ctx.dataIndex;
  return index % 2 === 0 ? 'circle' : 'rect';
}

function makeHalfAsOpaque(ctx) {
  return Utils.transparentize(getLineColor(ctx));
}

function make20PercentOpaque(ctx) {
  return Utils.transparentize(getLineColor(ctx), 0.8);
}

function adjustRadiusBasedOnData(ctx) {
  const v = ctx.parsed.y;
  return v < 10 ? 5
    : v < 25 ? 7
    : v < 50 ? 9
    : v < 75 ? 11
    : 15;
}

const config = {
  type: 'radar',
  data: data,
  options: {
    plugins: {
      legend: false,
      tooltip: false,
    },
    elements: {
      line: {
        backgroundColor: make20PercentOpaque,
        borderColor: getLineColor,
      },
      point: {
        backgroundColor: getLineColor,
        hoverBackgroundColor: makeHalfAsOpaque,
        radius: adjustRadiusBasedOnData,
        pointStyle: alternatePointStyles,
        hoverRadius: 15,
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
* [Options](../../general/options.html)
  * [Scriptable Options](../../general/options.html#scriptable-options)
* [Radar](../../charts/radar.html)
