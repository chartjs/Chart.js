# Publishing an extension

If you are planning on publishing an extension for Chart.js, here are some pointers.

## Awesome

You'd probably want your extension to be listed in the [awesome](https://github.com/chartjs/awesome).

Note the minimum extension age requirement of 30 days.

## ESM

If you are utilizing ESM, you probably still want to publish a UMD bundle of your extension. Because Chart.js v3 is tree shakeable, the interface is a bit different.
UMD package's global `Chart` includes everything, while ESM package exports all the things separately.
Fortunately, most of the exports can be mapped automatically by the bundlers.

But not the helpers.

In UMD, helpers are available through `Chart.helpers`. In ESM, they are imported from `chart.js/helpers`.

For example `import {isNullOrUndef} from 'chart.js/helpers'` is available at `Chart.helpers.isNullOrUndef` for UMD.

### Rollup

`output.globals` can be used to convert the helpers.

```js
module.exports = {
  // ...
  output: {
    globals: {
      'chart.js': 'Chart',
      'chart.js/helpers': 'Chart.helpers'
    }
  }
};
```
