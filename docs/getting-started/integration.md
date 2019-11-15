# Integration

Chart.js can be integrated with plain JavaScript or with different module loaders. The examples below show how to load Chart.js in different systems.

## Script Tag

```html
<script src="path/to/chartjs/dist/Chart.js"></script>
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

```javascript
import Chart from 'chart.js';
var myChart = new Chart(ctx, {...});
```

## Require JS

**Important:** RequireJS [can **not** load CommonJS module as is](https://requirejs.org/docs/commonjs.html#intro), so be sure to require one of the UMD builds instead (i.e. `dist/Chart.js`, `dist/Chart.min.js`, etc.).

```javascript
require(['path/to/chartjs/dist/Chart.min.js'], function(Chart){
    var myChart = new Chart(ctx, {...});
});
```

**Note:** in order to use the time scale, you need to make sure [one of the available date adapters](https://github.com/chartjs/awesome#adapters) and corresponding date library are fully loaded **before** requiring Chart.js. The date adapter for Moment.js is included with Chart.js, but you still need to include Moment.js itself if this is the date adapter you choose to use. You can either use a shim:

```javascript
require.config({
    shim: {
        'chartjs': {
            deps: ['moment']    // enforce moment to be loaded before chartjs
        }
    },
    paths: {
        'chartjs': 'path/to/chartjs/dist/Chart.min.js',
        'moment': 'path/to/moment'
    }
});

require(['chartjs'], function(Chart) {
    new Chart(ctx, {...});
});
```

or simply use two nested `require()`:

```javascript
require(['moment'], function() {
    require(['chartjs'], function(Chart) {
        new Chart(ctx, {...});
    });
});
```

## Content Security Policy

By default, Chart.js injects CSS directly into the DOM. For webpages secured using [Content Security Policy (CSP)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), this requires to allow `style-src 'unsafe-inline'`. For stricter CSP environments, where only `style-src 'self'` is allowed, the following CSS file needs to be manually added to your webpage:

```html
<link rel="stylesheet" type="text/css" href="path/to/chartjs/dist/Chart.min.css">
```

And the style injection must be turned off **before creating the first chart**:

```javascript
// Disable automatic style injection
Chart.platform.disableCSSInjection = true;
```
