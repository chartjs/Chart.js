# 4.x Migration Guide

Chart.js 4.0 introduces a number of breaking changes. We tried keeping the amount of breaking changes to a minimum. For some features and bug fixes it was necessary to break backwars compatibility, but we aimed to do so only when worth the benefit.

## End user migration

### Options

A number of changes were made to the configuration options passed to the `Chart` constructor. Those changes are documented below.

#### Specific changes

* The radialLinear grid indexable and scriptable options don't decrease the index of the specified grid line anymore.
* The `destroy` plugin hook has been removed and replaced with `afterDestroy`.
* Ticks callback on time scale now receives timestamp instead of a formatted label.

#### Type changes
* The order of the `ChartMeta` parameters have been changed from `<Element, DatasetElement, Type>` to `<Type, Element, DatasetElement>`
