---
title: Publishing an extension
---

If you are planning on publishing an extension for Chart.js, here are a some pointers.

## Awesome

You'd probably want your extension to be listed in the [awesome](https://github.com/chartjs/awesome).

Note the minimum extension age requirement of 30 days.

## ESM

If you are utilizing ESM, you probably still want to publish an UMD bundle of your extension. Because Chart.js v3 is tree shakeable, the interface is a bit different.
UMD package's global `Chart` includes everything, while ESM package exports all the things separately.
Fortunately, most of the exports can be mapped automatically by the bundlers.

But not the helpers.

In UMD, helpers are available through `Chart.helpers`. In ESM, they are imported from `chart.js/helpers`.

There are multiple namespaces under helpers. Some of the namespaces are bundled directly under `Chart.helpers` for backward compatibility, those are: `core`, `color` and `extras`.

For example `import {isNullOrUndef} from 'chart.js/helpers/core'` is available at `Chart.helpers.isNullOrUndef` for UMD.

### Rollup

`output.globals` can be used to convert the helpers.

For convinience, a plugin is available for the configuration: [rollup-plugin-chartjs-globals](https://www.npmjs.com/package/rollup-plugin-chartjs-globals).
