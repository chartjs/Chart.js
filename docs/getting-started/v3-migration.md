# Chart.js 3.x Migration Guide

Chart.js 3.0 introduces a number of breaking changes. Chart.js 2.0 was released in April 2016. In the years since then, as Chart.js has grown in popularity and feature set, we've learned some lessons about how to better create a charting library. In order to improve performance, offer new features, and improve maintainability it was necessary to break backwards compatibility, but we aimed to do so only when necessary.

## End user migration

### Setup and installation

* Chart.js is no longer providing the `Chart.bundle.js` and `Chart.bundle.min.js`. Please see the [installation](installation.md) and [integration](integration.md) docs for details on the recommended way to setup Chart.js if you were using these builds.
* `moment` is no longer specified as an npm dependency. If you are using the time scale, you must include one of [the available adapters](https://github.com/chartjs/awesome#adapters) and corresponding date library. If you are using a date library other than moment, you no longer need to exclude moment from your build.

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
* The `zeroLine*` options of axes were removed. Use scriptable scale options instead.
* The `hover` property of scriptable options `context` object was renamed to `active` to align it with the datalabels plugin.

### Options

* The dataset option `tension` was renamed to `lineTension`
* `scales.[x/y]Axes` arrays were removed. Scales are now configured directly to `options.scales` object with the object key being the scale Id.
* `scales.[x/y]Axes.barPercentage` was moved to dataset option `barPercentage`
* `scales.[x/y]Axes.barThickness` was moved to dataset option `barThickness`
* `scales.[x/y]Axes.categoryPercentage` was moved to dataset option `categoryPercentage`
* `scales.[x/y]Axes.minBarLength` was moved to dataset option `minBarLength`
* `scales.[x/y]Axes.maxBarThickness` was moved to dataset option `maxBarThickness`
* `scales.[x/y]Axes.ticks.beginAtZero` was renamed to `scales[id].beginAtZero`
* `scales.[x/y]Axes.ticks.max` was renamed to `scales[id].max`
* `scales.[x/y]Axes.ticks.min` was renamed to `scales[id].min`
* `scales.[x/y]Axes.ticks.reverse` was renamed to `scales[id].reverse`
* `scales.[x/y]Axes.ticks.suggestedMax` was renamed to `scales[id].suggestedMax`
* `scales.[x/y]Axes.ticks.suggestedMin` was renamed to `scales[id].suggestedMin`
* `scales.[x/y]Axes.time.format` was renamed to `scales[id].time.parser`
* `scales.[x/y]Axes.time.max` was renamed to `scales[id].max`
* `scales.[x/y]Axes.time.min` was renamed to `scales[id].min`

### Animations

Animation system was completely rewritten in Chart.js v3. Each property can now be animated separately. Please see [animations](../configuration/animations.md) docs for details.

* `hover.animationDuration` is now configured in `animation.active.duration`
* `responsiveAnimationDuration` is now configured in `animation.resize.duration`

## Developer migration

### Removed

* `helpers.addEvent`
* `helpers.aliasPixel`
* `helpers.configMerge`
* `helpers.indexOf`
* `helpers.lineTo`
* `helpers.min`
* `helpers.max`
* `helpers.nextItem`
* `helpers.numberOfLabelLines`
* `helpers.previousItem`
* `helpers.removeEvent`
* `helpers.roundedRect`
* `helpers.scaleMerge`
* `helpers.where`
* `Chart.Controller`
* `Chart.chart.chart`
* `Chart.types`
* `DatasetController.addElementAndReset`
* `DatasetController.createMetaData`
* `DatasetController.createMetaDataset`
* `Element.getArea`
* `Element.height`
* `Element.initialize`
* `Element.inLabelRange`
* `IPlugin.afterScaleUpdate`. Use `afterLayout` instead
* `Line.calculatePointY`
* `Scale.getRightValue`
* `Scale.mergeTicksOptions`
* `Scale.ticksAsNumbers`
* `Scale.handleDirectionalChanges` is now private
* `Scale.tickValues` is now private
* The tooltip item's `x` and `y` attributes were removed. Use `datasetIndex` and `index` to get the element and any corresponding data from it

#### Removal of private APIs

* `Chart.data.datasets[datasetIndex]._meta`
* `Element._ctx`
* `Element._model`
* `Element._view`
* `TimeScale._getPixelForOffset`
* `TimeScale.getLabelWidth`

### Renamed

* `helpers.clear` was renamed to `helpers.canvas.clear`
* `helpers.drawRoundedRectangle` was renamed to `helpers.canvas.roundedRect`
* `helpers.callCallback` was renamed to `helpers.callback`
* `helpers.getValueOrDefault` was renamed to `helpers.valueOrDefault`
* `helpers.getValueAtIndexOrDefault` was renamed to `helpers.valueAtIndexOrDefault`
* `helpers.easingEffects` was renamed to `helpers.easing.effects`
* `helpers.log10` was renamed to `helpers.math.log10`
* `helpers.almostEquals` was renamed to `helpers.math.almostEquals`
* `helpers.almostWhole` was renamed to `helpers.math.almostWhole`
* `helpers.distanceBetweenPoints` was renamed to `helpers.math.distanceBetweenPoints`
* `helpers.isNumber` was renamed to `helpers.math.isNumber`
* `helpers.sign` was renamed to `helpers.math.sign`
* `helpers.toDegrees` was renamed to `helpers.math.toDegrees`
* `helpers.toRadians` was renamed to `helpers.math.toRadians`
* `helpers.getAngleFromPoint` was renamed to `helpers.math.getAngleFromPoint`
* `helpers.splineCurveMonotone` was renamed to `helpers.curve.splineCurveMonotone`
* `helpers.splineCurve` was renamed to `helpers.curve.splineCurve`
* `helpers.retinaScale` was renamed to `helpers.dom.retinaScale`
* `helpers.getMaximumWidth` was renamed to `helpers.dom.getMaximumWidth`
* `helpers.getMaximumHeight` was renamed to `helpers.dom.getMaximumHeight`
* `helpers.getRelativePosition` was renamed to `helpers.dom.getRelativePosition`
* `helpers.getStyle` was renamed to `helpers.dom.getStyle`
* `Chart.Animation.animationObject` was renamed to `Chart.Animation`
* `Chart.Animation.chartInstance` was renamed to `Chart.Animation.chart`
* `DatasetController.updateElement` was renamed to `DatasetController.updateElements`
* `Scale.calculateTickRotation` was renamed to `Scale.calculateLabelRotation`
* `TimeScale.getLabelCapacity` was renamed to `TimeScale._getLabelCapacity`
* `TimeScale.tickFormatFunction` was renamed to `TimeScale._tickFormatFunction`
* `TimeScale.getPixelForOffset` was renamed to `TimeScale._getPixelForOffset`
* `Tooltip.options.legendColorBackgroupd` was renamed to `Tooltip.options.multiKeyBackground`

#### Renamed private APIs

* `helpers._alignPixel` was renamed to `helpers.canvas._alignPixel`
* `helpers._decimalPlaces` was renamed to `helpers.math._decimalPlaces`

### Changed

#### Scales

* `Scale.getLabelForIndex` was replaced by `scale.getLabelForValue`
* `Scale.getPixelForValue` now has only one parameter. For the `TimeScale` that parameter must be millis since the epoch

##### Ticks

* When the `autoSkip` option is enabled, `Scale.ticks` now contains only the non-skipped ticks instead of all ticks.
* `Scale.ticks` now contains objects instead of strings
* `Scale.buildTicks` is now expected to return tick objects
* `Scale.afterBuildTicks` now has no parameters like the other callbacks
* `Scale.convertTicksToLabels` was renamed to `generateTickLabels`. It is now expected to set the label property on the ticks given as input

##### Time Scale

* `getValueForPixel` now returns milliseconds since the epoch

#### Controllers

##### Core Controller

* The first parameter to `updateHoverStyle` is now an array of objects containing the `element`, `datasetIndex`, and `index`

##### Dataset Controllers

* `setHoverStyle` and `removeHoverStyle` now additionally take the `datasetIndex` and `index`

#### Interactions

* Interaction mode methods now return an array of objects containing the `element`, `datasetIndex`, and `index`
