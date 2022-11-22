# 4.x Migration Guide

Chart.js 4.0 introduces a number of breaking changes. We tried keeping the amount of breaking changes to a minimum. For some features and bug fixes it was necessary to break backwards compatibility, but we aimed to do so only when worth the benefit.

## End user migration

### Charts

* Charts don't override the default tooltip callbacks, so all chart types have the same-looking tooltips.
* Default scale override has been removed if the configured scale starts with `x`/`y`. Defining `xAxes` in your config will now create a second scale instead of overriding the default `x` axis.

### Options

A number of changes were made to the configuration options passed to the `Chart` constructor. Those changes are documented below.

#### Specific changes

* The radialLinear grid indexable and scriptable options don't decrease the index of the specified grid line anymore.
* The `destroy` plugin hook has been removed and replaced with `afterDestroy`.
* Ticks callback on time scale now receives timestamp instead of a formatted label.
* `scales[id].grid.drawBorder` has been renamed to `scales[id].border.display`.
* `scales[id].grid.borderWidth` has been renamed to `scales[id].border.width`.
* `scales[id].grid.borderColor` has been renamed to `scales[id].border.color`.
* `scales[id].grid.borderDash` has been renamed to `scales[id].border.dash`.
* `scales[id].grid.borderDashOffset` has been renamed to `scales[id].border.dashOffset`.
* The z index for the border of a scale is now configurable instead of being 1 higher as the grid z index.
* Linear scales now add and subtracts `5%` of the max value to the range if the min and max are the same instead of `1`.
* If the tooltip callback returns `undefined`, then the default callback will be used.
* `maintainAspectRatio` respects container height.
* Time and timeseries scales use `ticks.stepSize` instead of `time.stepSize`, which has been removed.
* `maxTickslimit` wont be used for the ticks in `autoSkip` if the determined max ticks is less then the `maxTicksLimit`.
* `dist/chart.js` has been removed.
* `dist/chart.min.js` has been renamed to `dist/chart.umd.js`.
* `dist/chart.esm.js` has been renamed to `dist/chart.js`.

#### Type changes
* The order of the `ChartMeta` parameters have been changed from `<Element, DatasetElement, Type>` to `<Type, Element, DatasetElement>`.

### General
* Chart.js becomes an [ESM-only package](https://nodejs.org/api/esm.html) ([the UMD bundle is still available](../getting-started/installation.md#cdn)). To use Chart.js, your project should also be an ES module. Make sure to have this in your `package.json`:
  ```json
  {
    "type": "module"
  }
  ```
  If you are experiencing problems with [Jest](https://jestjs.io), follow its [documentation](https://jestjs.io/docs/ecmascript-modules) to enable the ESM support. Or, we can recommend you migrating to [Vitest](https://vitest.dev/). Vitest has the ESM support out of the box and [almost the same API as Jest](https://vitest.dev/guide/migration.html#migrating-from-jest). See an [example of migration](https://github.com/reactchartjs/react-chartjs-2/commit/7f3ec96101d21e43cae8cbfe5e09a46a17cff1ef).
* Removed fallback to `fontColor` for the legend text and strikethrough color.
* Removed `config._chart` fallback for `this.chart` in the filler plugin.
* Removed `this._chart` in the filler plugin.
