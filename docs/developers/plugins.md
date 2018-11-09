# Plugins

Plugins are the most efficient way to customize or change the default behavior of a chart. They have been introduced at [version 2.1.0](https://github.com/chartjs/Chart.js/releases/tag/2.1.0) (global plugins only) and extended at [version 2.5.0](https://github.com/chartjs/Chart.js/releases/tag/v2.5.0) (per chart plugins and options).

## Using plugins

Plugins can be shared between chart instances:

```javascript
var plugin = { /* plugin implementation */ };

// chart1 and chart2 use "plugin"
var chart1 = new Chart(ctx, {
    plugins: [plugin]
});

var chart2 = new Chart(ctx, {
    plugins: [plugin]
});

// chart3 doesn't use "plugin"
var chart3 = new Chart(ctx, {});
```

Plugins can also be defined directly in the chart `plugins` config (a.k.a. *inline plugins*):

```javascript
var chart = new Chart(ctx, {
    plugins: [{
        beforeInit: function(chart, options) {
            //..
        }
    }]
});
```

However, this approach is not ideal when the customization needs to apply to many charts.

## Global plugins

Plugins can be registered globally to be applied on all charts (a.k.a. *global plugins*):

```javascript
Chart.plugins.register({
    // plugin implementation
});
```

> Note: *inline* plugins can't be registered globally.

## Configuration

### Plugin ID

Plugins must define a unique id in order to be configurable.

This id should follow the [npm package name convention](https://docs.npmjs.com/files/package.json#name):

- can't start with a dot or an underscore
- can't contain any non-URL-safe characters
- can't contain uppercase letters
- should be something short, but also reasonably descriptive

If a plugin is intended to be released publicly, you may want to check the [registry](https://www.npmjs.com/search?q=chartjs-plugin-) to see if there's something by that name already. Note that in this case, the package name should be prefixed by `chartjs-plugin-` to appear in Chart.js plugin registry.

### Plugin options

Plugin options are located under the `options.plugins` config and are scoped by the plugin ID: `options.plugins.{plugin-id}`.

```javascript
var chart = new Chart(ctx, {
    config: {
        foo: { ... },           // chart 'foo' option
        plugins: {
            p1: {
                foo: { ... },   // p1 plugin 'foo' option
                bar: { ... }
            },
            p2: {
                foo: { ... },   // p2 plugin 'foo' option
                bla: { ... }
            }
        }
    }
});
```

#### Disable plugins

To disable a global plugin for a specific chart instance, the plugin options must be set to `false`:

```javascript
Chart.plugins.register({
    id: 'p1',
    // ...
});

var chart = new Chart(ctx, {
    config: {
        plugins: {
            p1: false   // disable plugin 'p1' for this instance
        }
    }
});
```

## Plugin Core API

Available hooks (as of version 2.6):

| Hook | Description
| ---- | -----------
| `beforeInit` | Called before initializing `chart`.
| `afterInit` | Called after `chart` has been initialized and before the first update.
| `beforeUpdate` *(cancellable)* | Called before updating `chart`. If any plugin returns `false`, the update is cancelled (and thus subsequent render(s)) until another `update` is triggered
| `afterUpdate` | Called after `chart` has been updated and before rendering. Note that this hook will not be called if the chart update has been previously cancelled.
| `beforeLayout` *(cancellable)* | Called before laying out `chart`. If any plugin returns `false`, the layout update is cancelled until another `update` is triggered.
| `afterLayout` | Called after the `chart` has been layed out. Note that this hook will not be called if the layout update has been previously cancelled.
| `beforeDatasetsUpdate` *(cancellable)* | Called before updating the `chart` datasets. If any plugin returns `false`, the datasets update is cancelled until another `update` is triggered.
| `afterDatasetsUpdate` | Called after the `chart` datasets have been updated. Note that this hook will not be called if the datasets update has been previously cancelled.
| `beforeDatasetUpdate` *(cancellable)* | Called before updating the `chart` dataset at the given `args.index`. If any plugin returns `false`, the datasets update is cancelled until another `update` is triggered.
| `afterDatasetUpdate` | Called after the `chart` datasets at the given `args.index` has been updated. Note that this hook will not be called if the datasets update has been previously cancelled.
| `beforeRender` *(cancellable)* | Called before rendering `chart`. If any plugin returns `false`, the rendering is cancelled until another `render` is triggered.
| `afterRender` | Called after the `chart` has been fully rendered (and animation completed). Note that this hook will not be called if the rendering has been previously cancelled.
| `beforeDraw` *(cancellable)* | Called before drawing `chart` at every animation frame specified by the given easing value. If any plugin returns `false`, the frame drawing is cancelled until another `render` is triggered.
| `afterDraw` | Called after the `chart` has been drawn for the specific easing value. Note that this hook will not be called if the drawing has been previously cancelled.
| `beforeDatasetsDraw` *(cancellable)* | Called before drawing the `chart` datasets. If any plugin returns `false`, the datasets drawing is cancelled until another `render` is triggered.
| `afterDatasetsDraw` | Called after the `chart` datasets have been drawn. Note that this hook will not be called if the datasets drawing has been previously cancelled.
| `beforeDatasetDraw` *(cancellable)* | Called before drawing the `chart` dataset at the given `args.index` (datasets are drawn in the reverse order). If any plugin returns `false`, the datasets drawing is cancelled until another `render` is triggered.
| `afterDatasetDraw` | Called after the `chart` datasets at the given `args.index` have been drawn (datasets are drawn in the reverse order). Note that this hook will not be called if the datasets drawing has been previously cancelled.
| `beforeEvent` *(cancellable)* | Called before processing the specified `event`. If any plugin returns `false`, the event will be discarded.
| `afterEvent` | Called after the `event` has been consumed. Note that this hook will not be called if the `event` has been previously discarded.
| `resize` | Called after the chart as been resized.
| `destroy` | Called after the chart as been destroyed.
