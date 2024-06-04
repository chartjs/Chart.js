# Animation Progress Bar

## Initial animation

<progress id="initialProgress" max="1" value="0" style="width: 100%"></progress>

## Other animations

<progress id="animationProgress" max="1" value="0" style="width: 100%"></progress>

```js chart-editor
// <block:actions:2>
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: -100, max: 100});
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const data = chart.data;
      const dsColor = Utils.namedColor(chart.data.datasets.length);
      const newDataset = {
        label: 'Dataset ' + (data.datasets.length + 1),
        backgroundColor: Utils.transparentize(dsColor, 0.5),
        borderColor: dsColor,
        data: Utils.numbers({count: data.labels.length, min: -100, max: 100}),
      };
      chart.data.datasets.push(newDataset);
      chart.update();
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels = Utils.months({count: data.labels.length + 1});

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(-100, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach(dataset => {
        dataset.data.pop();
      });

      chart.update();
    }
  }
];
// </block:actions>

// <block:setup:1>
const initProgress = document.getElementById('initialProgress');
const progress = document.getElementById('animationProgress');

const DATA_COUNT = 7;
const NUMBER_CFG = {count: DATA_COUNT, min: -100, max: 100};

const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [
    {
      label: 'Dataset 1',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    },
    {
      label: 'Dataset 2',
      data: Utils.numbers(NUMBER_CFG),
      borderColor: Utils.CHART_COLORS.blue,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
    }
  ]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    animation: {
      duration: 2000,
      onProgress: function(context) {
        if (context.initial) {
          initProgress.value = context.currentStep / context.numSteps;
        } else {
          progress.value = context.currentStep / context.numSteps;
        }
      },
      onComplete: function(context) {
        if (context.initial) {
          console.log('Initial animation finished');
        } else {
          console.log('animation finished');
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    },
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Line Chart - Animation Progress Bar'
      }
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
  output: 'console.log output is displayed here'
};
```

## Docs
* [Animations](../../configuration/animations.md)
  * [Animation Callbacks](../../configuration/animations.md#animation-callbacks)
* [Data structures (`labels`)](../../general/data-structures.md)
* [Line](../../charts/line.md)
* [Options](../../general/options.md)
  * [Scriptable Options](../../general/options.md#scriptable-options)
