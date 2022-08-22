# Canvas background

In some use cases you would want a background image or color over the whole canvas. There is no built-in support for this, the way you can achieve this is by writing a custom plugin.

In the two example plugins underneath here you can see how you can draw a color or image to the canvas as background. This way of giving the chart a background is only necessary if you want to export the chart with that specific background.
For normal use you can set the background more easily with [CSS](https://www.w3schools.com/cssref/css3_pr_background.asp).

:::: tabs

::: tab Color

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};
// </block:setup>

// <block:plugin:2>
// Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
const plugin = {
  id: 'customCanvasBackgroundColor',
  beforeDraw: (chart, args, options) => {
    const {ctx} = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = options.color || '#99ffff';
    ctx.fillRect(0, 0, chart.width, chart.height);
    ctx.restore();
  }
};
// </block:plugin>

// <block:config:0>
const config = {
  type: 'doughnut',
  data: data,
  options: {
    plugins: {
      customCanvasBackgroundColor: {
        color: 'lightGreen',
      }
    }
  },
  plugins: [plugin],
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

:::

::: tab Image

```js chart-editor
// <block:setup:1>
const data = {
  labels: [
    'Red',
    'Blue',
    'Yellow'
  ],
  datasets: [{
    label: 'My First Dataset',
    data: [300, 50, 100],
    backgroundColor: [
      'rgb(255, 99, 132)',
      'rgb(54, 162, 235)',
      'rgb(255, 205, 86)'
    ],
    hoverOffset: 4
  }]
};
// </block:setup>

// <block:plugin:2>
// Note: changes to the plugin code is not reflected to the chart, because the plugin is loaded at chart construction time and editor changes only trigger an chart.update().
const image = new Image();
image.src = 'https://www.chartjs.org/img/chartjs-logo.svg';

const plugin = {
  id: 'customCanvasBackgroundImage',
  beforeDraw: (chart) => {
    if (image.complete) {
      const ctx = chart.ctx;
      const {top, left, width, height} = chart.chartArea;
      const x = left + width / 2 - image.width / 2;
      const y = top + height / 2 - image.height / 2;
      ctx.drawImage(image, x, y);
    } else {
      image.onload = () => chart.draw();
    }
  }
};
// </block:plugin>

// <block:config:0>
const config = {
  type: 'doughnut',
  data: data,
  plugins: [plugin],
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

:::

::::
