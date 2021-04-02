# Radial Axes

Radial axes are used specifically for the radar and polar area chart types. These axes overlay the chart area, rather than being positioned on one of the edges. One radial axis is included by default in Chart.js.

* [radialLinear](./linear.md)

## Visual Components

A radial axis is composed of visual components that can be individually configured. These components are:

* [angle lines](#angle-lines)
* [grid lines](#grid-lines)
* [point labels](#point-labels)
* [ticks](#ticks)

### Angle Lines

The grid lines for an axis are drawn on the chart area. They stretch out from the center towards the edge of the canvas. In the example below, they are red.

```js chart-editor
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    data: [10, 20, 30, 40, 50, 0, 5],
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'radar',
  data,
  options: {
    scales: {
      r: {
        angleLines: {
          color: 'red'
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

### Grid Lines

The grid lines for an axis are drawn on the chart area. In the example below, they are red.

```js chart-editor
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    data: [10, 20, 30, 40, 50, 0, 5],
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'radar',
  data,
  options: {
    scales: {
      r: {
        grid: {
          color: 'red'
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

### Point Labels

The point labels indicate the value for each angle line. In the example below, they are red.

```js chart-editor
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    data: [10, 20, 30, 40, 50, 0, 5],
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'radar',
  data,
  options: {
    scales: {
      r: {
        pointLabels: {
          color: 'red'
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```

### Ticks

The ticks are used to label values based on how far they are from the center of the axis. In the example below, they are red.

```js chart-editor
// <block:setup:1>
const labels = Utils.months({count: 7});
const data = {
  labels: labels,
  datasets: [{
    label: 'My First dataset',
    backgroundColor: 'rgba(54, 162, 235, 0.5)',
    borderColor: 'rgb(54, 162, 235)',
    borderWidth: 1,
    data: [10, 20, 30, 40, 50, 0, 5],
  }]
};
// </block:setup>

// <block:config:0>
const config = {
  type: 'radar',
  data,
  options: {
    scales: {
      r: {
        ticks: {
          color: 'red'
        }
      }
    }
  }
};
// </block:config>

module.exports = {
  actions: [],
  config: config,
};
```
