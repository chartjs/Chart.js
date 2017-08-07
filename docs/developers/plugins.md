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

* beforeInit
* afterInit
* beforeUpdate *(cancellable)*
* afterUpdate
* beforeLayout *(cancellable)*
* afterLayout
* beforeDatasetsUpdate *(cancellable)*
* afterDatasetsUpdate
* beforeDatasetUpdate *(cancellable)*
* afterDatasetUpdate
* beforeRender *(cancellable)*
* afterRender
* beforeDraw *(cancellable)*
* afterDraw
* beforeDatasetsDraw *(cancellable)*
* afterDatasetsDraw
* beforeDatasetDraw *(cancellable)*
* afterDatasetDraw
* beforeEvent *(cancellable)*
* afterEvent
* resize
* destroy
