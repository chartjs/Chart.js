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

To use Chart.js, a simple import is all that is required.

```javascript
import Chart from 'chart.js';
var myChart = new Chart(ctx, {...});
```

### Tree Shaking

Chart.js 3 has optional tree shaking that is enabled via the `chart.js/tree` package. To use this, it is necessary to import and register the controllers, elements, scales and plugins you wish to use. The example below shows all of the available imports and how to register them.

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
} from 'chart.js/tree';

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

A short registration format is also available.

```javascript
import { Chart, controllers, elements, plugins, scales } from 'chart.js';
Chart.register(...[
    ...Object.values(controllers),
    ...Object.values(elements),
    ...Object.values(plugins),
    ...Object.values(scales),
]);
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
