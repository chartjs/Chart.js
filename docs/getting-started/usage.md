# Step-by-step guide

Follow this guide to get familiar with all major concepts of Chart.js: chart types and elements, datasets, customization, plugins, components, and tree-shaking. Don't hesitate to follow the links in the text.

We'll build a Chart.js data visualization with a couple of charts from scratch:

![result](./usage-8.png)

## Build a new application with Chart.js

In a new folder, create the `package.json` file with the following contents:

```json
{
  "name": "chartjs-example",
  "version": "1.0.0",
  "license": "MIT",
  "scripts": {
    "dev": "parcel src/index.html",
    "build": "parcel build src/index.html"
  },
  "devDependencies": {
    "parcel": "^2.6.2"
  },
  "dependencies": {
    "@cubejs-client/core": "^0.31.0",
    "chart.js": "^4.0.0"
  }
}
```

Modern front-end applications often use JavaScript module bundlers, so we’ve picked [Parcel](https://parceljs.org) as a nice zero-configuration build tool. We’re also installing Chart.js v4 and a JavaScript client for [Cube](https://cube.dev/?ref=eco-chartjs), an open-source API for data apps we’ll use to fetch real-world data (more on that later).

Run `npm install`, `yarn install`, or `pnpm install` to install the dependencies, then create the `src` folder. Inside that folder, we’ll need a very simple `index.html` file:

```html
<!doctype html>
<html lang="en">
  <head>
    <title>Chart.js example</title>
  </head>
  <body>
    <!-- <div style="width: 500px;"><canvas id="dimensions"></canvas></div><br/> -->
    <div style="width: 800px;"><canvas id="acquisitions"></canvas></div>

    <!-- <script type="module" src="dimensions.js"></script> -->
    <script type="module" src="acquisitions.js"></script>
  </body>
</html>
```

As you can see, Chart.js requires minimal markup: a `canvas` tag with an `id` by which we’ll reference the chart later. By default, Chart.js charts are [responsive](../configuration/responsive.md) and take the whole enclosing container. So, we set the width of the `div` to control chart width.

Lastly, let’s create the `src/acquisitions.js` file with the following contents:

```jsx
import Chart from 'chart.js/auto'

(async function() {
  const data = [
    { year: 2010, count: 10 },
    { year: 2011, count: 20 },
    { year: 2012, count: 15 },
    { year: 2013, count: 25 },
    { year: 2014, count: 22 },
    { year: 2015, count: 30 },
    { year: 2016, count: 28 },
  ];

  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
})();
```

Let’s walk through this code:

- We import `Chart`, the main Chart.js class, from the special `chart.js/auto` path. It loads [all available Chart.js components](./integration) (which is very convenient) but disallows tree-shaking. We’ll address that later.
- We instantiate a new `Chart` instance and provide two arguments: the canvas element where the chart would be rendered and the options object.
- We just need to provide a chart type (`bar`) and provide `data` which consists of `labels` (often, numeric or textual descriptions of data points) and an array of `datasets` (Chart.js supports multiple datasets for most chart types). Each dataset is designated with a `label` and contains an array of data points.
- For now, we only have a few entries of dummy data. So, we extract `year` and `count` properties to produce the arrays of `labels` and data points within the only dataset.

Time to run the example with `npm run dev`, `yarn dev`, or `pnpm dev` and navigate to [localhost:1234](http://localhost:1234) in your web browser:

![result](./usage-1.png)

With just a few lines of code, we’ve got a chart with a lot of features: a [legend](../configuration/legend.md), [grid lines](../samples/scale-options/grid.md), [ticks](../samples/scale-options/ticks.md), and [tooltips](../configuration/tooltip.md) shown on hover. Refresh the web page a few times to see that the chart is also [animated](../configuration/animations.md#animations). Try clicking on the “Acquisitions by year” label to see that you’re also able to toggle datasets visibility (especially useful when you have multiple datasets). 

### Simple customizations

Let’s see how Chart.js charts can be customized. First, let’s turn off the animations so the chart appears instantly. Second, let’s hide the legend and tooltips since we have only one dataset and pretty trivial data.

Replace the `new Chart(...);` invocation in `src/acquisitions.js` with the following snippet:

```jsx
  new Chart(
    document.getElementById('acquisitions'),
    {
      type: 'bar',
      options: {
        animation: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        }
      },
      data: {
        labels: data.map(row => row.year),
        datasets: [
          {
            label: 'Acquisitions by year',
            data: data.map(row => row.count)
          }
        ]
      }
    }
  );
```

As you can see, we’ve added the `options` property to the second argument—that’s how you can specify all kinds of customization options for Chart.js. The [animation is disabled](../configuration/animations.md#disabling-animation) with a boolean flag provided via `animation`. Most chart-wide options (e.g., [responsiveness](../configuration/responsive.md) or [device pixel ratio](../configuration/device-pixel-ratio.md)) are configured like this.

The legend and tooltips are hidden with boolean flags provided under the respective sections in `plugins`. Note that some of Chart.js features are extracted into plugins: self-contained, separate pieces of code. A few of them are available as a part of [Chart.js distribution](https://github.com/chartjs/Chart.js/tree/master/src/plugins), other plugins are maintained independently and can be located in the [awesome list](https://github.com/chartjs/awesome) of plugins, framework integrations, and additional chart types.

You should be able to see the updated minimalistic chart in your browser.

### Real-world data

With hardcoded, limited-size, unrealistic data, it’s hard to show the full potential of Chart.js. Let’s quickly connect to a data API to make our example application closer to a production use case.

Let’s create the `src/api.js` file with the following contents:

```jsx
import { CubejsApi } from '@cubejs-client/core';

const apiUrl = 'https://heavy-lansford.gcp-us-central1.cubecloudapp.dev/cubejs-api/v1';
const cubeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjEwMDAwMDAwMDAsImV4cCI6NTAwMDAwMDAwMH0.OHZOpOBVKr-sCwn8sbZ5UFsqI3uCs6e4omT7P6WVMFw';

const cubeApi = new CubejsApi(cubeToken, { apiUrl });

export async function getAquisitionsByYear() {
  const acquisitionsByYearQuery = {
    dimensions: [
      'Artworks.yearAcquired',
    ],
    measures: [
      'Artworks.count'
    ],
    filters: [ {
      member: 'Artworks.yearAcquired',
      operator: 'set'
    } ],
    order: {
      'Artworks.yearAcquired': 'asc'
    }
  };

  const resultSet = await cubeApi.load(acquisitionsByYearQuery);

  return resultSet.tablePivot().map(row => ({
    year: parseInt(row['Artworks.yearAcquired']),
    count: parseInt(row['Artworks.count'])
  }));
}

export async function getDimensions() {
  const dimensionsQuery = {
    dimensions: [
      'Artworks.widthCm',
      'Artworks.heightCm'
    ],
    measures: [
      'Artworks.count'
    ],
    filters: [
      {
        member: 'Artworks.classification',
        operator: 'equals',
        values: [ 'Painting' ]
      },
      {
        member: 'Artworks.widthCm',
        operator: 'set'
      },
      {
        member: 'Artworks.widthCm',
        operator: 'lt',
        values: [ '500' ]
      },
      {
        member: 'Artworks.heightCm',
        operator: 'set'
      },
      {
        member: 'Artworks.heightCm',
        operator: 'lt',
        values: [ '500' ]
      }
    ]
  };

  const resultSet = await cubeApi.load(dimensionsQuery);

  return resultSet.tablePivot().map(row => ({
    width: parseInt(row['Artworks.widthCm']),
    height: parseInt(row['Artworks.heightCm']),
    count: parseInt(row['Artworks.count'])
  }));
}
```

Let’s see what’s happening there:

- We `import` the JavaScript client library for [Cube](https://cube.dev/?ref=eco-chartjs), an open-source API for data apps, configure it with the API URL (`apiUrl`) and the authentication token (`cubeToken`), and finally instantiate the client (`cubeApi`).
- Cube API is hosted in [Cube Cloud](https://cube.dev/cloud/?ref=eco-chartjs) and connected to a database with a [public dataset](https://github.com/MuseumofModernArt/collection) of ~140,000 records representing all of the artworks in the collection of the [Museum of Modern Art](https://www.moma.org) in New York, USA. Certainly, a more real-world dataset than what we’ve got now.
- We define a couple of asynchronous functions to fetch data from the API: `getAquisitionsByYear` and `getDimensions`. The first one returns the number of artworks by the year of acquisition, the other returns the number of artworks for every width-height pair (we’ll need it for another chart).
- Let’s take a look at `getAquisitionsByYear`. First, we create a declarative, JSON-based query in the `acquisitionsByYearQuery` variable. As you can see, we specify that for every `yearAcquired` we’d like to get the `count` of artworks; `yearAcquired` has to be set (i.e., not undefined); the result set would be sorted by `yearAcquired` in the ascending order.
- Second, we fetch the `resultSet` by calling `cubeApi.load` and map it to an array of objects with desired `year` and `count` properties.

Now, let’s deliver the real-world data to our chart. Please apply a couple of changes to `src/acquisitions.js`: add an import and replace the definition of the `data` variable.

```jsx
import { getAquisitionsByYear } from './api'

// ...

const data = await getAquisitionsByYear();
```

Done! Now, our chart with real-world data looks like this. Looks like something interesting happened in 1964, 1968, and 2008!

![result](./usage-2.png)

We’re done with the bar chart. Let’s try another Chart.js chart type.

### Further customizations

Chart.js supports many common chart types.

For instance, [Bubble chart](../charts/bubble.md) allows to display three dimensions of data at the same time: locations on `x` and `y` axes represent two dimensions, and the third dimension is represented by the size of the individual bubbles.

To create the chart, stop the already running application, then go to `src/index.html`, and uncomment the following two lines:

```html
<div style="width: 500px;"><canvas id="dimensions"></canvas></div><br/>

<script type="module" src="dimensions.js"></script>
```

Then, create the `src/dimensions.js` file with the following contents:

```jsx
import Chart from 'chart.js/auto'
import { getDimensions } from './api'

(async function() {
  const data = await getDimensions();

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      data: {
        labels: data.map(x => x.year),
        datasets: [
          {
            label: 'Dimensions',
            data: data.map(row => ({
              x: row.width,
              y: row.height,
              r: row.count
            }))
          }
        ]
      }
    }
  );
})();
```

Probably, everything is pretty straightforward there: we get data from the API and render a new chart with the `bubble` type, passing three dimensions of data as `x`, `y`, and `r` (radius) properties.

Now, reset caches with `rm -rf .parcel-cache` and start the application again with `npm run dev`, `yarn dev`, or `pnpm dev`. We can review the new chart now:

![result](./usage-3.png)

Well, it doesn’t look pretty.

First of all, the chart is not square. Artworks’ width and height are equally important so we’d like to make the chart width equal to its height as well. By default, Chart.js charts have the [aspect ratio](../configuration/responsive.md) of either 1 (for all radial charts, e.g., a doughnut chart) or 2 (for all the rest). Let’s modify the aspect ratio for our chart:

```jsx
// ...

	new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
      },

// ...
```

Looks much better now:

![result](./usage-4.png)

However, it’s still not ideal. The horizontal axis spans from 0 to 500 while the vertical axis spans from 0 to 450. By default, Chart.js automatically adjusts the range (minimum and maximum values) of the axes to the values provided in the dataset, so the chart “fits” your data. Apparently, MoMa collection doesn’t have artworks in the range of 450 to 500 cm in height. Let’s modify the [axes configuration](../axes/) for our chart to account for that:

```jsx
// ...

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500
          },
          y: {
            max: 500
          }
        }
      },

// ...
```

Great! Behold the updated chart:

![result](./usage-5.png)

However, there’s one more nitpick: what are these numbers? It’s not very obvious that the units are centimetres. Let’s apply a [custom tick format](../axes/labelling.md#creating-custom-tick-formats) to both axes to make things clear. We’ll provide a callback function that would be called to format each tick value. Here’s the updated axes configuration:

```jsx
// ...

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      options: {
        aspectRatio: 1,
        scales: {
          x: {
            max: 500,
            ticks: {
              callback: value => `${value / 100} m`
            }
          },
          y: {
            max: 500,
            ticks: {
              callback: value => `${value / 100} m`
            }
          }
        }
      },

// ...
```

Perfect, now we have proper units on both axes:

![result](./usage-6.png)

### Multiple datasets

Chart.js plots each dataset independently and allows to apply custom styles to them.

Take a look at the chart: there’s a visible “line” of bubbles with equal `x` and `y` coordinates representing square artworks. It would be cool to put these bubbles in their own dataset and paint them differently. Also, we can separate “taller” artworks from “wider” ones and paint them differently, too. 

Here’s how we can do that. Replace the `datasets` with the following code:

```jsx
// ...

        datasets: [
          {
            label: 'width = height',
            data: data
              .filter(row => row.width === row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          },
          {
            label: 'width > height',
            data: data
              .filter(row => row.width > row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          },
          {
            label: 'width < height',
            data: data
              .filter(row => row.width < row.height)
              .map(row => ({
                x: row.width,
                y: row.height,
                r: row.count
              }))
          }
        ]

// ..
```

As you can see, we define three datasets with different labels. Each dataset gets its own slice of data extracted with `filter`. Now they are visually distinct and, as you already know, you can toggle their visibility independently.

![result](./usage-7.png)

Here we rely on the default color palette. However, keep in mind every chart type supports a lot of [dataset options](../charts/bubble.md#dataset-properties) that you can feel free to customize.

### Plugins

Another—and very powerful!—way to customize Chart.js charts is to use plugins. You can find some in the [plugin directory](https://github.com/chartjs/awesome#plugins) or create your own, ad-hoc ones. In Chart.js ecosystem, it’s idiomatic and expected to fine tune charts with plugins. For example, you can customize [canvas background](../configuration/canvas-background.md) or [add a border](../samples/plugins/chart-area-border.md) to it with simple ad-hoc plugins. Let’s try the latter.

Plugins have an [extensive API](../developers/plugins.md) but, in a nutshell, a plugin is defined as an object with a `name` and one or more callback functions defined in the extension points. Insert the following snippet before and in place of the `new Chart(...);` invocation in `src/dimensions.js`:

```jsx
// ...

  const chartAreaBorder = {
    id: 'chartAreaBorder',

    beforeDraw(chart, args, options) {
      const { ctx, chartArea: { left, top, width, height } } = chart;

      ctx.save();
      ctx.strokeStyle = options.borderColor;
      ctx.lineWidth = options.borderWidth;
      ctx.setLineDash(options.borderDash || []);
      ctx.lineDashOffset = options.borderDashOffset;
      ctx.strokeRect(left, top, width, height);
      ctx.restore();
    }
  };

  new Chart(
    document.getElementById('dimensions'),
    {
      type: 'bubble',
      plugins: [ chartAreaBorder ],
      options: {
        plugins: {
          chartAreaBorder: {
            borderColor: 'red',
            borderWidth: 2,
            borderDash: [ 5, 5 ],
            borderDashOffset: 2,
          }
        },
        aspectRatio: 1,

// ...
```

As you can see, in this `chartAreaBorder` plugin, we acquire the canvas context, save its current state, apply styles, draw a rectangular shape around the chart area, and restore the canvas state. We’re also passing the plugin in `plugins` so it’s only applied to this particular chart. We also pass the plugin options in `options.plugins.chartAreaBorder`; we could surely hardcode them in the plugin source code but it’s much more reusable this way.

Our bubble chart looks fancier now:

![result](./usage-8.png)

### Tree-shaking

In production, we strive to ship as little code as possible, so the end users can load our data applications faster and have better experience. For that, we’ll need to apply [tree-shaking](https://cube.dev/blog/how-to-build-tree-shakeable-javascript-libraries/?ref=eco-chartjs) which is fancy term for removing unused code from the JavaScript bundle.

Chart.js fully supports tree-shaking with its component design. You can register all Chart.js components at once (which is convenient when you’re prototyping) and get them bundled with your application. Or, you can register only necessary components and get a minimal bundle, much less in size.

Let’s inspect our example application. What’s the bundle size? You can stop the application and run `npm run build`, or `yarn build`, or `pnpm build`. In a few moments, you’ll get something like this:

```bash
% yarn build
yarn run v1.22.17
$ parcel build src/index.html
✨ Built in 88ms

dist/index.html              381 B   164ms
dist/index.74a47636.js   265.48 KB   1.25s
dist/index.ba0c2e17.js       881 B    63ms
✨ Done in 0.51s.
```

We can see that Chart.js and other dependencies were bundled together in a single 265 KB file.

To reduce the bundle size, we’ll need to apply a couple of changes to `src/acquisitions.js` and `src/dimensions.js`. First, we’ll need to remove the following import statement from both files: `import Chart from 'chart.js/auto'`.

Instead, let’s load only necessary components and “register” them with Chart.js using `Chart.register(...)`. Here’s what we need in `src/acquisitions.js`:

```jsx
import {
  Chart,
  Colors,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
  Legend
} from 'chart.js'

Chart.register(
  Colors,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Legend
);
```

And here’s the snippet for `src/dimensions.js`:

```jsx
import {
  Chart,
  Colors,
  BubbleController,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend
} from 'chart.js'

Chart.register(
  Colors,
  BubbleController,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend
);
```

You can see that, in addition to the `Chart` class, we’re also loading a controller for the chart type, scales, and other chart elements (e.g., bars or points). You can look all available components up in the [documentation](./integration.md#bundle-optimization).

Alternatively, you can follow Chart.js advice in the console. For example, if you forget to import `BarController` for your bar chart, you’ll see the following message in the browser console:

```
Unhandled Promise Rejection: Error: "bar" is not a registered controller.
```

Remember to carefully check for imports from `chart.js/auto` when preparing your application for production. It takes only one import like this to effectively disable tree-shaking.

Now, let’s inspect our application once again. Run `yarn build` and you’ll get something like this:

```bash
% yarn build
yarn run v1.22.17
$ parcel build src/index.html
✨ Built in 88ms

dist/index.html              381 B   176ms
dist/index.5888047.js    208.66 KB   1.23s
dist/index.dcb2e865.js       932 B    58ms
✨ Done in 0.51s.
```

By importing and registering only select components, we’ve removed more than 56 KB of unnecessary code. Given that other dependencies take ~50 KB in the bundle, tree-shaking helps remove ~25% of Chart.js code from the bundle for our example application. 

## Next steps

Now you’re familiar with all major concepts of Chart.js: chart types and elements, datasets, customization, plugins, components, and tree-shaking.

Feel free to review many [examples of charts](../samples/information.md) in the documentation and check the [awesome list](https://github.com/chartjs/awesome) of Chart.js plugins and additional chart types as well as [framework integrations](https://github.com/chartjs/awesome#integrations) (e.g., React, Vue, Svelte, etc.). Also, don’t hesitate to join [Chart.js Discord](https://discord.gg/HxEguTK6av) and follow [Chart.js on Twitter](https://twitter.com/chartjs).

Have fun and good luck building with Chart.js!