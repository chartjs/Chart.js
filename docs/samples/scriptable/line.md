# Line Chart

```js chart-editor
// <block:setup:2>
const DATA_COUNT = 12;
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
  labels: Utils.months({count: DATA_COUNT}),
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

function adjustRadiusBasedOnData(ctx) {
  const v = ctx.parsed.y;
  return v < 10 ? 5
    : v < 25 ? 7
    : v < 50 ? 9
    : v < 75 ? 11
    : 15;
}

const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      legend: false,
      tooltip: true,
    },
    elements: {
      line: {
        fill: false,
        backgroundColor: getLineColor,
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
* [Line](../../charts/line.html)
  * [Point Styling](../../charts/line.html#point-styling)
* [Options](../../general/options.html)
  * [Scriptable Options](../../general/options.html#scriptable-options)
* [Data structures (`labels`)](../../general/data-structures.html)

