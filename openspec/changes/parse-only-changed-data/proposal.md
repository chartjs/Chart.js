## Why

Every `chart.update()` parses all data of every dataset again, because a value assigned in place (`data[5] = 10`, `data[5].y = 10`) can only be seen that way (`_resyncElements`, the TODO in `src/core/core.datasetController.js`). With 30 datasets of 300 points that is about 15% of a line chart's update and 39% of a stacked bar chart's (with the stack bookkeeping it triggers), and an update that changes only an option pays it in full (#11814).

## What Changes

- In 5.0.0 a dataset reads its data again only when Chart.js knows it changed: the array methods `push`, `pop`, `shift`, `unshift`, `splice`, and newly `sort`, `reverse`, `fill` and `copyWithin`; a replaced `dataset.data`, dataset or `chart.data`; changed labels; a changed scale, axis, scale type or parse option; a changed `parsing` option. Only the changed points are read where the change says which.
- **BREAKING** (5.0.0): a value assigned in place is no longer shown after `chart.update()` unless the code calls the new `chart.markDataChanged(datasetIndex?, start?, count?)` first. Without it the chart keeps the old position and the tooltip the old parsed value.
- New in 4.7.0: `chart.markDataChanged()` and `DatasetController#markDataChanged()`. In 4.x they change nothing visible, so code can migrate before upgrading. 4.7.0 also warns once per chart when an update finds a value that changed in place without the signal.
- Fixes in 4.6.x that the change needs and that are bugs today:
  - a change to a dataset's `parsing` option applies on the update that makes it (it lags one update now);
  - a bubble chart's scriptable `radius` that reads `ctx.parsed` works (it throws now), and a change to `radius` no longer depends on the data being parsed again.
- A category axis that is given `labels` keeps its label copy between updates. One that finds its labels in the data reads its datasets on every update, as in 4.x.
- Custom dataset controllers and scales whose parsing reads options report those inputs through a protected hook, or opt back into parsing on every update.
- A v5 migration guide section, "Updating data", and docs for the signal.

## Capabilities

### New Capabilities

- `data-updates`: which changes to a chart's data, labels, scales and parsing options an update shows, and the signal for changes made in place.

### Modified Capabilities

None.

## Impact

- Code: `src/core/core.datasetController.js`, `src/core/core.controller.js`, `src/core/core.scale.js`, `src/scales/scale.category.js`, `src/scales/scale.time.js`, `src/controllers/controller.bubble.js`, `src/helpers/helpers.collection.ts`, `src/types/index.d.ts`.
- Public API: `Chart#markDataChanged`, `DatasetController#markDataChanged` (4.7.0); `ArrayListener` gains optional `_onDataSort`, `_onDataReverse`, `_onDataFill`, `_onDataCopyWithin` (4.7.0); a protected `getParseDependencies()` on controllers and scales (5.0.0).
- Docs: `docs/developers/api.md`, `docs/developers/updates.md`, `docs/general/performance.md`, the time samples that assign in place, a new `docs/migration/v5-migration.md`.
- Other designs: waits on rework-bar-chart P11 and P12 (stack fields that depend on visibility) and P13 (`_stackValue`); rebases with finalize-typescript-conversion P22, P23, P25 and P29.
