---
title: Canvas background
---

In some use cases you would want a background image or color over the whole canvas. There is no build in support for this, the way you can achieve this is by writing a custom plugin.

In the two example plugins underneath here you can see how you can draw an color or image to the canvas as background. This way of giving the chart a background is only necessary if you want to export the chart with that specific background.
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
const plugin = {
  id: 'custom_canvas_background_color',
  beforeDraw: (chart) => {
    const ctx = chart.canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = 'lightGreen';
    ctx.fillRect(0, 0, chart.canvas.width, chart.canvas.height);
    ctx.restore();
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
const image = new Image();
image.src = 'https://www.chartjs.org/img/chartjs-logo.svg';

const plugin = {
  id: 'custom_canvas_background_image',
  beforeDraw: (chart) => {
    if (image.complete) {
      const ctx = chart.canvas.getContext('2d');
      ctx.drawImage(image, chart.canvas.width/2-image.width/2, chart.canvas.height/2-image.height/2);
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
