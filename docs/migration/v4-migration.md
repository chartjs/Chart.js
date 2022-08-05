# 4.x Migration Guide

Chart.js 4.0 introduces a number of breaking changes. We tried keeping the amount of breaking changes to a minimum. For some features and bug fixes it was necessary to break backwars compatibility, but we aimed to do so only when worth the benefit.

## End user migration

### Options

A number of changes were made to the configuration options passed to the `Chart` constructor. Those changes are documented below.

#### Specific changes

* The radialLinear grid indexable and scriptable options don't decrease the index of the specified grid line anymore.
* Ticks callback on time scale now receives timestamp instead of a formatted label.
* `scales[scaleId].grid.drawBorder` has been renamed to `scales[scaleId].border.display`
* `scales[scaleId].grid.borderWidth` has been renamed to `scales[scaleId].border.width`
* `scales[scaleId].grid.borderColor` has been renamed to `scales[scaleId].border.color`
* `scales[scaleId].grid.borderDash` has been renamed to `scales[scaleId].border.dash`
* `scales[scaleId].grid.borderDashOffset` has been renamed to `scales[scaleId].border.dashOffset`

#### Type changes
* The order of the `ChartMeta` parameters have been changed from `<Element, DatasetElement, Type>` to `<Type, Element, DatasetElement>`
