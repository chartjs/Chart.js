# Integration

Chart.js can be integrated with plain JavaScript or with different module loaders. The examples below show how to load Chart.js in different systems.

If you're using a front-end framework (e.g., React, Angular, or Vue), please see [available integrations](https://github.com/chartjs/awesome#integrations).

## Script Tag

```html
<script src="path/to/chartjs/dist/chart.umd.js"></script>
<script>
    const myChart = new Chart(ctx, {...});
</script>
```

## Bundlers (Webpack, Rollup, etc.)

Chart.js is tree-shakeable, so it is necessary to import and register the controllers, elements, scales and plugins you are going to use.

### Quick start

If you don't care about the bundle size, you can use the `auto` package ensuring all features are available:

```javascript
import Chart from 'chart.js/auto';
```

### Bundle optimization

When optimizing the bundle, you need to import and register the components that are needed in your application.

The options are categorized into controllers, elements, plugins, scales. You can pick and choose many of these, e.g. if you are not going to use tooltips, don't import and register the `Tooltip` plugin. But each type of chart has its own bare-minimum requirements (typically the type's controller, element(s) used by that controller and scale(s)):

* Bar chart
  * `BarController`
  * `BarElement`
  * Default scales: `CategoryScale` (x), `LinearScale` (y)
* Bubble chart
  * `BubbleController`
  * `PointElement`
  * Default scales: `LinearScale` (x/y)
* Doughnut chart
  * `DoughnutController`
  * `ArcElement`
  * Not using scales
* Line chart
  * `LineController`
  * `LineElement`
  * `PointElement`
  * Default scales: `CategoryScale` (x), `LinearScale` (y)
* Pie chart
  * `PieController`
  * `ArcElement`
  * Not using scales
* PolarArea chart
  * `PolarAreaController`
  * `ArcElement`
  * Default scale: `RadialLinearScale` (r)
* Radar chart
  * `RadarController`
  * `LineElement`
  * `PointElement`
  * Default scale: `RadialLinearScale` (r)
* Scatter chart
  * `ScatterController`
  * `PointElement`
  * Default scales: `LinearScale` (x/y)

Available plugins:

* [`Decimation`](../configuration/decimation.md)
* `Filler` - used to fill area described by `LineElement`, see [Area charts](../charts/area.md)
* [`Legend`](../configuration/legend.md)
* [`SubTitle`](../configuration/subtitle.md)
* [`Title`](../configuration/title.md)
* [`Tooltip`](../configuration/tooltip.md)

Available scales:

* Cartesian scales (x/y)
  * [`CategoryScale`](../axes/cartesian/category.md)
  * [`LinearScale`](../axes/cartesian/linear.md)
  * [`LogarithmicScale`](../axes/cartesian/logarithmic.md)
  * [`TimeScale`](../axes/cartesian/time.md)
  * [`TimeSeriesScale`](../axes/cartesian/timeseries.md)

* Radial scales (r)
  * [`RadialLinearScale`](../axes/radial/linear.md)

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

## CommonJS

Because Chart.js is an ESM library, in CommonJS modules you should use a dynamic `import`:

```javascript
const { Chart } = await import('chart.js');
```

## RequireJS

**Important:** RequireJS can load only [AMD modules](https://requirejs.org/docs/whyamd.html), so be sure to require one of the UMD builds instead (i.e. `dist/chart.umd.js`).

```javascript
require(['path/to/chartjs/dist/chart.umd.js'], function(Chart){
    const myChart = new Chart(ctx, {...});
});
```

:::tip Note

In order to use the time scale, you need to make sure [one of the available date adapters](https://github.com/chartjs/awesome#adapters) and corresponding date library are fully loaded **after** requiring Chart.js. For this you can use nested requires:

```javascript
require(['chartjs'], function(Chart) {
    require(['moment'], function() {
        require(['chartjs-adapter-moment'], function() {
            new Chart(ctx, {...});
        });
    });
});
```
:::