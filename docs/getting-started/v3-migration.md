# Chart.js 3.x Migration Guide

Chart.js 3.0 introduces a number of breaking changes. Chart.js 2.0 was released in April 2016. In the years since then, as Chart.js has grown in popularity and feature set, we've learned some lessons about how to better create a charting library. In order to improve performance, offer new features, and improve maintainability, it was necessary to break backwards compatibility, but we aimed to do so only when worth the benefit. Some major highlights of v3 include:

* Large [performance](../general/performance.md) improvements including the ability to skip data parsing and render charts in parallel via webworkers
* Additional configurability and scriptable options with better defaults
* Completely rewritten animation system
* Rewritten filler plugin with numerous bug fixes
* API Documentation generated and verified by TypeScript
* No more CSS injection
* Tons of bug fixes

## End user migration

### Setup and installation

* Chart.js is no longer providing the `Chart.bundle.js` and `Chart.bundle.min.js`. Please see the [installation](installation.md) and [integration](integration.md) docs for details on the recommended way to setup Chart.js if you were using these builds.
* `moment` is no longer specified as an npm dependency. If you are using the time scale, you must include one of [the available adapters](https://github.com/chartjs/awesome#adapters) and corresponding date library. You no longer need to exclude moment from your build.

### Ticks

* `options.ticks.userCallback` was renamed to `options.ticks.callback`
* `options.ticks.major` and `options.ticks.minor` were replaced with scriptable options for tick fonts.
* `Chart.Ticks.formatters.linear` and `Chart.Ticks.formatters.logarithmic` were replaced with `Chart.Ticks.formatters.numeric`.

### Tooltip

* `xLabel` and `yLabel` were removed. Please use `index` and `value`

### Interactions

* `interactions` are now limited to the chart area
* `{mode: 'label'}` was replaced with `{mode: 'index'}`
* `{mode: 'single'}` was replaced with `{mode: 'nearest', intersect: true}`
* `modes['X-axis']` was replaced with `{mode: 'index', intersect: false}`
* `options.onClick` is now limited to the chart area

### Customizability

* `custom` attribute of elements was removed. Please use scriptable options
* The `hover` property of scriptable options `context` object was renamed to `active` to align it with the datalabels plugin.
* The `zeroLine*` options of axes were removed. Use scriptable scale options instead.

## Defaults

* `global` namespace was removed from `defaults`. So `Chart.defaults.global` is now `Chart.defaults`
* `default` prefix was removed from defaults. For example `Chart.defaults.global.defaultColor` is now `Chart.defaults.color`
  * `defaultColor` was renamed to `color`
  * `defaultFontColor` was renamed to `fontColor`
  * `defaultFontFamily` was renamed to `fontFamily`
  * `defaultFontSize` was renamed to `fontSize`
  * `defaultFontStyle` was renamed to `fontStyle`
  * `defaultLineHeight` was renamed to `lineHeight`

### Options

* Dataset options are now configured as `options[type].datasets` rather than `options.datasets[type]`
* `Polar area` `startAngle` option is now consistent with `Radar`, 0 is at top and value is in degrees. Default is changed from `-½π` to  `0`.
* `scales.[x/y]Axes` arrays were removed. Scales are now configured directly to `options.scales` object with the object key being the scale Id.
* `scales.[x/y]Axes.barPercentage` was moved to dataset option `barPercentage`
* `scales.[x/y]Axes.barThickness` was moved to dataset option `barThickness`
* `scales.[x/y]Axes.categoryPercentage` was moved to dataset option `categoryPercentage`
* `scales.[x/y]Axes.maxBarThickness` was moved to dataset option `maxBarThickness`
* `scales.[x/y]Axes.minBarLength` was moved to dataset option `minBarLength`
* `scales.[x/y]Axes.ticks.beginAtZero` was renamed to `scales[id].beginAtZero`
* `scales.[x/y]Axes.ticks.max` was renamed to `scales[id].max`
* `scales.[x/y]Axes.ticks.min` was renamed to `scales[id].min`
* `scales.[x/y]Axes.ticks.reverse` was renamed to `scales[id].reverse`
* `scales.[x/y]Axes.ticks.suggestedMax` was renamed to `scales[id].suggestedMax`
* `scales.[x/y]Axes.ticks.suggestedMin` was renamed to `scales[id].suggestedMin`
* `scales.[x/y]Axes.ticks.unitStepSize` was removed. Use `scales[id].ticks.stepSize`
* `scales.[x/y]Axes.time.format` was renamed to `scales[id].time.parser`
* `scales.[x/y]Axes.time.max` was renamed to `scales[id].max`
* `scales.[x/y]Axes.time.min` was renamed to `scales[id].min`
* The dataset option `steppedLine` was removed. Use `stepped`
* The dataset option `tension` was removed. Use `lineTension`
* To override the platform class used in a chart instance, pass `platform: PlatformClass` in the config object. Note that the class should be passed, not an instance of the class.

### Animations

Animation system was completely rewritten in Chart.js v3. Each property can now be animated separately. Please see [animations](../configuration/animations.md) docs for details.

* `hover.animationDuration` is now configured in `animation.active.duration`
* `responsiveAnimationDuration` is now configured in `animation.resize.duration`

## Developer migration

### Removed

* `Chart.borderWidth`
* `Chart.chart.chart`
* `Chart.Controller`
* `Chart.innerRadius`
* `Chart.offsetX`
* `Chart.offsetY`
* `Chart.outerRadius`
* `Chart.prototype.generateLegend`
* `Chart.platform`. It only contained `disableCSSInjection`. CSS is never injected in v3.
* `Chart.radiusLength`
* `Chart.types`
* `Chart.Tooltip` is now provided by the tooltip plugin. The positioners can be accessed from `tooltipPlugin.positioners`
* `DatasetController.addElementAndReset`
* `DatasetController.createMetaData`
* `DatasetController.createMetaDataset`
* `Element.getArea`
* `Element.height`
* `Element.initialize`
* `Element.inLabelRange`
* `helpers.addEvent`
* `helpers.aliasPixel`
* `helpers.configMerge`
* `helpers.findIndex`
* `helpers.findNextWhere`
* `helpers.findPreviousWhere`
* `helpers.extend`. Use `Object.assign` instead
* `helpers.indexOf`
* `helpers.lineTo`
* `helpers.longestText` was moved to the `helpers.canvas` namespace and made private
* `helpers.max`
* `helpers.measureText` was moved to the `helpers.canvas` namespace and made private
* `helpers.min`
* `helpers.nextItem`
* `helpers.niceNum`
* `helpers.numberOfLabelLines`
* `helpers.previousItem`
* `helpers.removeEvent`
* `helpers.roundedRect`
* `helpers.scaleMerge`
* `helpers.where`
* `ILayoutItem.minSize`
* `IPlugin.afterScaleUpdate`. Use `afterLayout` instead
* `Legend.margins` is now private
* `Line.calculatePointY`
* `LogarithmicScale.minNotZero`
* `Scale.getRightValue`
* `Scale.longestLabelWidth`
* `Scale.longestTextCache` is now private
* `Scale.margins` is now private
* `Scale.mergeTicksOptions`
* `Scale.ticksAsNumbers`
* `Scale.tickValues` is now private
* `TimeScale.getLabelCapacity` is now private
* `TimeScale.tickFormatFunction` is now private
* `Title.margins` is now private
* The tooltip item's `x` and `y` attributes were removed. Use `datasetIndex` and `index` to get the element and any corresponding data from it

#### Removal of private APIs

* `Chart.data.datasets[datasetIndex]._meta`
* `Element._ctx`
* `Element._model`
* `Element._view`
* `LogarithmicScale._valueOffset`
* `TimeScale.getPixelForOffset`
* `TimeScale.getLabelWidth`
* `Tooltip._lastActive`

### Renamed

* `Chart.Animation.animationObject` was renamed to `Chart.Animation`
* `Chart.Animation.chartInstance` was renamed to `Chart.Animation.chart`
* `helpers._decimalPlaces` was renamed to `helpers.math._decimalPlaces`
* `helpers.almostEquals` was renamed to `helpers.math.almostEquals`
* `helpers.almostWhole` was renamed to `helpers.math.almostWhole`
* `helpers.callCallback` was renamed to `helpers.callback`
* `helpers.clear` was renamed to `helpers.canvas.clear`
* `helpers.distanceBetweenPoints` was renamed to `helpers.math.distanceBetweenPoints`
* `helpers.drawRoundedRectangle` was renamed to `helpers.canvas.roundedRect`
* `helpers.getAngleFromPoint` was renamed to `helpers.math.getAngleFromPoint`
* `helpers.getMaximumHeight` was renamed to `helpers.dom.getMaximumHeight`
* `helpers.getMaximumWidth` was renamed to `helpers.dom.getMaximumWidth`
* `helpers.getRelativePosition` was renamed to `helpers.dom.getRelativePosition`
* `helpers.getStyle` was renamed to `helpers.dom.getStyle`
* `helpers.getValueAtIndexOrDefault` was renamed to `helpers.valueAtIndexOrDefault`
* `helpers.getValueOrDefault` was renamed to `helpers.valueOrDefault`
* `helpers.easingEffects` was renamed to `helpers.easing.effects`
* `helpers.log10` was renamed to `helpers.math.log10`
* `helpers.isNumber` was renamed to `helpers.math.isNumber`
* `helpers.sign` was renamed to `helpers.math.sign`
* `helpers.retinaScale` was renamed to `helpers.dom.retinaScale`
* `helpers.splineCurve` was renamed to `helpers.curve.splineCurve`
* `helpers.splineCurveMonotone` was renamed to `helpers.curve.splineCurveMonotone`
* `helpers.toDegrees` was renamed to `helpers.math.toDegrees`
* `helpers.toRadians` was renamed to `helpers.math.toRadians`
* `Scale.calculateTickRotation` was renamed to `Scale.calculateLabelRotation`
* `Tooltip.options.legendColorBackgroupd` was renamed to `Tooltip.options.multiKeyBackground`

#### Renamed private APIs

* `BarController.calculateBarIndexPixels` was renamed to `BarController._calculateBarIndexPixels`
* `BarController.calculateBarValuePixels` was renamed to `BarController._calculateBarValuePixels`
* `BarController.getStackCount` was renamed to `BarController._getStackCount`
* `BarController.getStackIndex` was renamed to `BarController._getStackIndex`
* `BarController.getRuler` was renamed to `BarController._getRuler`
* `Chart.destroyDatasetMeta` was renamed to `Chart._destroyDatasetMeta`
* `Chart.drawDataset` was renamed to `Chart._drawDataset`
* `Chart.drawDatasets` was renamed to `Chart._drawDatasets`
* `Chart.eventHandler` was renamed to `Chart._eventHandler`
* `Chart.handleEvent` was renamed to `Chart._handleEvent`
* `Chart.initialize` was renamed to `Chart._initialize`
* `Chart.resetElements` was renamed to `Chart._resetElements`
* `Chart.unbindEvents` was renamed to `Chart._unbindEvents`
* `Chart.updateDataset` was renamed to `Chart._updateDataset`
* `Chart.updateDatasets` was renamed to `Chart._updateDatasets`
* `Chart.updateLayout` was renamed to `Chart._updateLayout`
* `DatasetController.destroy` was renamed to `DatasetController._destroy`
* `DatasetController.insertElements` was renamed to `DatasetController._insertElements`
* `DatasetController.onDataPop` was renamed to `DatasetController._onDataPop`
* `DatasetController.onDataPush` was renamed to `DatasetController._onDataPush`
* `DatasetController.onDataShift` was renamed to `DatasetController._onDataShift`
* `DatasetController.onDataSplice` was renamed to `DatasetController._onDataSplice`
* `DatasetController.onDataUnshift` was renamed to `DatasetController._onDataUnshift`
* `DatasetController.removeElements` was renamed to `DatasetController._removeElements`
* `DatasetController.resyncElements` was renamed to `DatasetController._resyncElements`
* `RadialLinearScale.setReductions` was renamed to `RadialLinearScale._setReductions`
* `Scale.handleMargins` was renamed to `Scale._handleMargins`
* `helpers._alignPixel` was renamed to `helpers.canvas._alignPixel`
* `helpers._decimalPlaces` was renamed to `helpers.math._decimalPlaces`

### Changed

#### Scales

* `Scale.getLabelForIndex` was replaced by `scale.getLabelForValue`
* `Scale.getPixelForValue` now has only one parameter. For the `TimeScale` that parameter must be millis since the epoch
* `ScaleService.registerScaleType` was renamed to `ScaleService.registerScale` and now takes a scale constructors which is expected to have `id` and `defaults` properties.

##### Ticks

* `Scale.afterBuildTicks` now has no parameters like the other callbacks
* `Scale.buildTicks` is now expected to return tick objects
* `Scale.convertTicksToLabels` was renamed to `generateTickLabels`. It is now expected to set the label property on the ticks given as input
* `Scale.ticks` now contains objects instead of strings
* When the `autoSkip` option is enabled, `Scale.ticks` now contains only the non-skipped ticks instead of all ticks.

##### Time Scale

* `getValueForPixel` now returns milliseconds since the epoch

#### Controllers

##### Core Controller

* The first parameter to `updateHoverStyle` is now an array of objects containing the `element`, `datasetIndex`, and `index`

##### Dataset Controllers

* `updateElement` was replaced with `updateElements` now taking the elements to update, the `start` index, and `mode`
* `setHoverStyle` and `removeHoverStyle` now additionally take the `datasetIndex` and `index`

#### Interactions

* Interaction mode methods now return an array of objects containing the `element`, `datasetIndex`, and `index`

#### Layout

* `ILayoutItem.update` no longer has a return value

#### Helpers

##### Canvas Helper

* The second parameter to `drawPoint` is now the full options object, so `style`, `rotation`, and `radius` are no longer passed explicitly

#### Platform

* `Chart.platform` is no longer the platform object used by charts. Every chart instance now has a separate platform instance.
* `Chart.platforms` is an object that contains two usable platform classes, `BasicPlatform` and `DomPlatform`. It also contains `BasePlatform`, a class that all platforms must extend from.
* If the canvas passed in is an instance of `OffscreenCanvas`, the `BasicPlatform` is automatically used.
