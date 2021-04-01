# Line Chart Boundaries

:::: tabs

::: tab "Fill: false"

```js chart-editor
// <block:setup:2>
const inputs = {
  min: -100,
  max: 100,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

const generateData = () => (Utils.numbers(inputs));
// </block:setup>

// <block:data:0>
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'Dataset',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      fill: false
    }
  ]
};
// </block:data>

// <block:actions:3>
let smooth = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      // Utils.srand(Utils.rand())
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:1>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false,
      }
    },
    interaction: {
      intersect: false,
    }
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```

:::

::: tab "Fill: origin"

```js chart-editor
// <block:setup:2>
const inputs = {
  min: -100,
  max: 100,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

const generateData = () => (Utils.numbers(inputs));
// </block:setup>

// <block:data:0>
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'Dataset',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      fill: 'origin'
    }
  ]
};
// </block:data>

// <block:actions:3>
let smooth = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      // Utils.srand(Utils.rand())
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:1>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false,
      }
    },
    interaction: {
      intersect: false
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```

:::

::: tab "Fill: start"

```js chart-editor
// <block:setup:1>
const inputs = {
  min: -100,
  max: 100,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

const generateData = () => (Utils.numbers(inputs));
// </block:setup>

// <block:data:0>
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'Dataset',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      fill: 'start'
    }
  ]
};
// </block:data>

// <block:actions:2>
let smooth = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      // Utils.srand(Utils.rand())
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:0>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false,
      }
    },
    interaction: {
      intersect: false,
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```

:::

::: tab "Fill: end"

```js chart-editor
// <block:setup:2>
const inputs = {
  min: -100,
  max: 100,
  count: 8,
  decimals: 2,
  continuity: 1
};

const generateLabels = () => {
  return Utils.months({count: inputs.count});
};

const generateData = () => (Utils.numbers(inputs));
// </block:setup>

// <block:data:0>
const data = {
  labels: generateLabels(),
  datasets: [
    {
      label: 'Dataset',
      data: generateData(),
      borderColor: Utils.CHART_COLORS.red,
      backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red),
      fill: 'end'
    }
  ]
};
// </block:data>

// <block:actions:3>
let smooth = false;

const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      // Utils.srand(Utils.rand())
      chart.data.datasets.forEach(dataset => {
        dataset.data = generateData();
      });
      chart.update();
    }
  },
  {
    name: 'Smooth',
    handler(chart) {
      smooth = !smooth;
      chart.options.elements.line.tension = smooth ? 0.4 : 0;
      chart.update();
    }
  }
];
// </block:actions>

// <block:config:1>
const config = {
  type: 'line',
  data: data,
  options: {
    plugins: {
      filler: {
        propagate: false,
      }
    },
    interaction: {
      intersect: false,
    },
  },
};
// </block:config>

module.exports = {
  actions: actions,
  config: config,
};
```

:::

::::
