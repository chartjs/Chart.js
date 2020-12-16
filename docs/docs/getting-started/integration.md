---
title: Integration
---

Chart.js can be integrated with plain JavaScript or with different module loaders. The examples below show how to load Chart.js in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.js"></script>
<script>
    var myChart = new Chart(ctx, {...});
</script>
```

## Common JS

```javascript
var Chart = require('chart.js');
var myChart = new Chart(ctx, {...});
```

## Bundlers (Webpack, Rollup, etc.)

Chart.js 3 is tree-shakeable, so it is necessary to import and register the controllers, elements, scales and plugins you are going to use.

For all available imports see the example below.
```javascript
import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Filler,
  Legend,
  Title,
  Tooltip
} from 'chart.js';

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Filler,
  Legend,
  Title,
  Tooltip
);

var myChart = new Chart(ctx, {...});
```

## Require JS

**Important:** RequireJS [can **not** load CommonJS module as is](https://requirejs.org/docs/commonjs.html#intro), so be sure to require one of the UMD builds instead (i.e. `dist/chart.js`, `dist/chart.min.js`, etc.).

```javascript
require(['path/to/chartjs/dist/chart.min.js'], function(Chart){
    var myChart = new Chart(ctx, {...});
});
```

**Note:** in order to use the time scale, you need to make sure [one of the available date adapters](https://github.com/chartjs/awesome#adapters) and corresponding date library are fully loaded **after** requiring Chart.js. For this you can use nested requires:

```javascript
require(['chartjs'], function(Chart) {
    require(['moment'], function() {
        require(['chartjs-adapter-moment'], function() {
            new Chart(ctx, {...});
        });
    });
});
```
