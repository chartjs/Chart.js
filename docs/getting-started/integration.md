# Integration

Chart.js can be integrated with plain JavaScript or with different module loaders. The examples below show how to load Chart.js in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.umd.js"></script>
<script>
    const myChart = new Chart(ctx, {...});
</script>
```

## Bundlers (Webpack, Rollup, etc.)

Chart.js 3 is tree-shakeable, so it is necessary to import and register the controllers, elements, scales and plugins you are going to use.

Until you are working on bundle optimization, the following snippet will ensure all features are available:

```javascript
import Chart from 'chart.js/auto';
var myChart = new Chart(ctx, {...});
```

You can achieve the same thing while explicitly calling `register()` as follows:

```javascript
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
```

And you can achieve the same while listing all possible imports as follows:

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
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
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
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);
```

### How to choose the imports you require.

The options are categorised (inspect `registerables`) into controllers, elements, plugins, scales. You can pick and choose many of these, e.g. if you are not going to use tooltips, don't import and register the `Tooltip` plugin. But each type of chart has its own bare-minimum requirements (typically the type's controller and a suitable element):

* Bar chart
   * `BarController`
   * `BarElement`
   * `CategoryScale`
   * One of `LinearScale` (default) or `LogarithmicScale`
* Pie chart
   * `PieController`
   * `ArcElement`
* Doughnut chart
   * `DoughnutController`
   * `ArcElement`
* ...@todo...

The plugin imports are

* [`Decimation`](../configuration/decimation.md)
* `Filler` - used to fill the area under the line, see [Area charts](../charts/area.md)
* `Legend`
* `Title`
* `Tooltip`
* `SubTitle`

The scale imports are:

* `CategoryScale`
* `LinearScale` default scale, you probably want this
* `LogarithmicScale`
* `RadialLinearScale`
* `TimeScale`
* `TimeSeriesScale`

## CommonJS

Because Chart.js is an ESM library, in CommonJS modules you should use a dynamic `import`:

```javascript
const { Chart } = await import('chart.js');
```

### Helper functions

If you want to use the helper functions, you will need to import these separately from the helpers package and use them as stand-alone functions.

Example of [Converting Events to Data Values](../configuration/interactions.md#converting-events-to-data-values) using bundlers.

```javascript
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

const chart = new Chart(ctx, {
  type: 'line',
  data: data,
  options: {
    onClick: (e) => {
      const canvasPosition = getRelativePosition(e, chart);

      // Substitute the appropriate scale IDs
      const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
      const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
    }
  }
});
```

## Require JS

**Important:** RequireJS can load only [AMD modules](https://requirejs.org/docs/whyamd.html), so be sure to require one of the UMD builds instead (i.e. `dist/chart.umd.js`).

```javascript
require(['path/to/chartjs/dist/chart.umd.js'], function(Chart){
    const myChart = new Chart(ctx, {...});
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
