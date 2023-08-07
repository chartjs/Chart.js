# Time Scale - Max Span

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data.forEach(function(dataObj, j) {
          const newVal = Utils.rand(0, 100);

          if (typeof dataObj === 'object') {
            dataObj.y = newVal;
          } else {
            dataset.data[j] = newVal;
          }
        });
      });
      chart.update();
    }
  },
];
// </block:actions>

// <block:setup:1>
const data = {
  datasets: [{
    label: 'Dataset with string point data',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    borderColor: Utils.CHART_COLORS.red,
    fill: false,
    data: [{
      x: Utils.newDateString(0),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(2),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(4),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDateString(6),
      y: Utils.rand(0, 100)
    }],
  }, {
    label: 'Dataset with date object point data',
    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    borderColor: Utils.CHART_COLORS.blue,
    fill: false,
    data: [{
      x: Utils.newDate(0),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDate(2),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDate(5),
      y: Utils.rand(0, 100)
    }, {
      x: Utils.newDate(6),
      y: Utils.rand(0, 100)
    }]
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    spanGaps: 1000 * 60 * 60 * 24 * 2, // 2 days
    responsive: true,
    interaction: {
      mode: 'nearest',
    },
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Time - spanGaps: 172800000 (2 days in ms)'
      },
    },
    scales: {
      x: {
        type: 'time',
        display: true,
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          autoSkip: false,
          maxRotation: 0,
          major: {
            enabled: true
          },
          // color: function(context) {
          //   return context.tick && context.tick.major ? '#FF0000' : 'rgba(0,0,0,0.1)';
          // },
          font: function(context) {
            if (context.tick && context.tick.major) {
              return {
                weight: 'bold',
              };
            }
          }
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'value'
        }
      }
    }
  },
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

## Docs
* [Line](../../charts/line.md)
  * [`spanGaps`](../../charts/line.md#line-styling)
* [Time Scale](../../axes/cartesian/time.md)
