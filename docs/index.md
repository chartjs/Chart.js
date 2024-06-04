# Chart.js

Welcome to Chart.js!

* **[Get started with Chart.js](./getting-started/) — best if you're new to Chart.js**
* Migrate from [Chart.js v3](./migration/v4-migration.md) or [Chart.js v2](./migration/v3-migration.md)
* Join the community on [Discord](https://discord.gg/HxEguTK6av) and [Twitter](https://twitter.com/chartjs)
* Post a question tagged with `chart.js` on [Stack Overflow](https://stackoverflow.com/questions/tagged/chart.js)
* [Contribute to Chart.js](./developers/contributing.md)

## Why Chart.js

Among [many charting libraries](https://awesome.cube.dev/?tools=charts&ref=eco-chartjs) for JavaScript application developers, Chart.js is currently the most popular one according to [GitHub stars](https://github.com/chartjs/Chart.js) (~60,000) and [npm downloads](https://www.npmjs.com/package/chart.js) (~2,400,000 weekly).

Chart.js was created and [announced](https://twitter.com/_nnnick/status/313599208387137536) in 2013 but has come a long way since then. It’s open-source, licensed under the very permissive [MIT license](https://github.com/chartjs/Chart.js/blob/master/LICENSE.md), and maintained by an active community.

### Features

Chart.js provides a set of frequently used chart types, plugins, and customization options. In addition to a reasonable set of [built-in chart types](./charts/area.md), you can use additional community-maintained [chart types](https://github.com/chartjs/awesome#charts). On top of that, it’s possible to combine several chart types into a [mixed chart](./charts/mixed.md) (essentially, blending multiple chart types into one on the same canvas).

Chart.js is highly customizable with [custom plugins](https://github.com/chartjs/awesome#plugins) to create annotations, zoom, or drag-and-drop functionalities to name a few things.

### Defaults

Chart.js comes with a sound default configuration, making it very easy to start with and get an app that is ready for production. Chances are you will get a very appealing chart even if you don’t specify any options at all. For instance, Chart.js has animations turned on by default, so you can instantly bring attention to the story you’re telling with the data.

### Integrations

Chart.js comes with built-in TypeScript typings and is compatible with all popular [JavaScript frameworks](https://github.com/chartjs/awesome#javascript) including [React](https://github.com/reactchartjs/react-chartjs-2), [Vue](https://github.com/apertureless/vue-chartjs/), [Svelte](https://github.com/SauravKanchan/svelte-chartjs), and [Angular](https://github.com/valor-software/ng2-charts). You can use Chart.js directly or leverage well-maintained wrapper packages that allow for a more native integration with your frameworks of choice.

### Developer experience

Chart.js has very thorough documentation (yes, you're reading it), [API reference](./api/), and [examples](./samples/information.md). Maintainers and community members eagerly engage in conversations on [Discord](https://discord.gg/HxEguTK6av), [GitHub Discussions](https://github.com/chartjs/Chart.js/discussions), and [Stack Overflow](https://stackoverflow.com/questions/tagged/chart.js) where more than 11,000 questions are tagged with `chart.js`.

### Canvas rendering

Chart.js renders chart elements on an HTML5 canvas unlike several others, mostly D3.js-based, charting libraries that render as SVG. Canvas rendering makes Chart.js very performant, especially for large datasets and complex visualizations that would otherwise require thousands of SVG nodes in the DOM tree. At the same time, canvas rendering disallows CSS styling, so you will have to use built-in options for that, or create a custom plugin or chart type to render everything to your liking.

### Performance

Chart.js is very well suited for large datasets. Such datasets can be efficiently ingested using the internal format, so you can skip data [parsing](./general/performance.md#parsing) and [normalization](./general/performance.md#data-normalization). Alternatively, [data decimation](./configuration/decimation.md) can be configured to sample the dataset and reduce its size before rendering.

In the end, the canvas rendering that Chart.js uses reduces the toll on your DOM tree in comparison to SVG rendering. Also, tree-shaking support allows you to include minimal parts of Chart.js code in your bundle, reducing bundle size and page load time.

### Community

Chart.js is [actively developed](https://github.com/chartjs/Chart.js/pulls?q=is%3Apr+is%3Aclosed) and maintained by the community. With minor [releases](https://github.com/chartjs/Chart.js/releases) on an approximately bi-monthly basis and major releases with breaking changes every couple of years, Chart.js keeps the balance between adding new features and making it a hassle to keep up with them.
