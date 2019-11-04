# Chart.js 3.x Migration Guide

Chart.js 3.0 introduces a number of breaking changes. Chart.js 2.0 was released in April 2016. In the years since then, as Chart.js has grown in popularity and feature set, we've learned some lessons about how to better create a charting library. In order to improve performance, offer new features, and improve maintainability it was necessary to break backwards compatibility, but we aimed to do so only when necessary.

## Setup

Chart.js is no longer providing the `Chart.bundle.js` and `Chart.bundle.min.js`. Please see the [installation](installation.md) and [integration](integration.md) docs for details on the recommended way to setup Chart.js if you were using these builds.

## End user migration

### Ticks

* `options.ticks.userCallback` was renamed to `options.ticks.callback`

### Tooltip

* `xLabel` and `yLabel` were removed. Please use `index` and `value`

### Interactions

* `options.onClick` is now limited to the chart area
* `{mode: 'single'}` was replaced with `{mode: 'nearest', intersect: true}`
* `{mode: 'label'}` was replaced with `{mode: 'index'}`
* `modes['X-axis']` was replaced with `{mode: 'index', intersect: false}`

### Customizability

* `custom` attribute of elements was removed. Please use scriptable options

### Options

* `scales.[x/y]Axes.barPercentage` was moved to dataset option `barPercentage`
* `scales.[x/y]Axes.barThickness` was moved to dataset option `barThickness`
* `scales.[x/y]Axes.categoryPercentage` was moved to dataset option `categoryPercentage`
* `scales.[x/y]Axes.minBarLength` was moved to dataset option `minBarLength`
* `scales.[x/y]Axes.maxBarThickness` was moved to dataset option `maxBarThickness`
* `scales.[x/y]Axes.time.format` was renamed to `scales.[x/y]Axes.time.parser`
* `scales.[x/y]Axes.time.min` was renamed to `scales.[x/y]Axes.ticks.min`
* `scales.[x/y]Axes.time.max` was renamed to `scales.[x/y]Axes.ticks.max`

## Developer migration

### Removed

* `afterScaleUpdate`
* `helpers.addEvent`
* `helpers.aliasPixel`
* `helpers.configMerge`
* `helpers.indexOf`
* `helpers.min`
* `helpers.max`
* `helpers.numberOfLabelLines`
* `helpers.removeEvent`
* `helpers.scaleMerge`
* `scale.getRightValue`
* `scale.mergeTicksOptions`
* `scale.ticksAsNumbers`
* `Chart.Controller`
* `Chart.chart.chart`
* `Chart.types`
* `Line.calculatePointY`
* Made `scale.handleDirectionalChanges` private
* Made `scale.tickValues` private

### Renamed

* `helpers.clear` was renamed to `helpers.canvas.clear`
* `helpers.drawRoundedRectangle` was renamed to `helpers.canvas.roundedRect`
* `helpers.callCallback` was renamed to `helpers.callback`
* `helpers.getValueOrDefault` was renamed to `helpers.valueOrDefault`
* `helpers.getValueAtIndexOrDefault` was renamed to `helpers.valueAtIndexOrDefault`
* `helpers.easingEffects` was renamed to `helpers.easing.effects`
* `helpers.log10` was renamed to `helpers.math.log10`
* `Chart.Animation.animationObject` was renamed to `Chart.Animation`
* `Chart.Animation.chartInstance` was renamed to `Chart.Animation.chart`

### Changed

#### Scales

* `scale.getLabelForIndex` was replaced by `scale.getLabelForValue`
* `scale.getPixelForValue` now has only one parameter

##### Ticks

* `scale.ticks` now contains objects instead of strings
* `buildTicks` is now expected to return tick objects
* `afterBuildTicks` now has no parameters like the other callbacks
* `convertTicksToLabels` was renamed to `generateTickLabels`. It is now expected to set the label property on the ticks given as input

##### Time Scale

* `getValueForPixel` now returns milliseconds since the epoch
