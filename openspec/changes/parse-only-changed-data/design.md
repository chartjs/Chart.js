## Context

`DatasetController._resyncElements` (`src/core/core.datasetController.js`, about lines 1020-1052) replays the array changes it was told about, then parses all data again (`this.parse(0, count)`), on every `chart.update()`:

> TODO: It is not optimal to always parse the old data. This is done because we are not detecting direct assignments: chart.data.datasets[0].data[5] = 10; chart.data.datasets[0].data[5].y = 10;

The full parse hides every input that changed without being recorded. What the parsed values (`meta._parsed`, `_sorted`, `_custom`, `_stacks`) depend on, and whether a change is seen today other than by that parse:

| Input | Read in | Changed by | Seen today |
|---|---|---|---|
| Data values | `parse*Data` | `push`/`pop`/`shift`/`splice`/`unshift` (listened, `helpers.collection.ts:121`); `data[i] = v`, `data[i].y = v`, `sort`/`reverse`/`fill`/`copyWithin` (not listened); a replaced array (`_dataCheck` compares identity); object data (`convertObjectDataToArray` makes a new array every update) | only by the full parse |
| Labels | `parsePrimitiveData` (`iScale.getLabels()`), category `parse` (`findOrAddLabel`) | `chart.data.labels`, `xLabels`/`yLabels`, a scale's `labels`: replaced, `push` (`docs/developers/updates.md`), `labels[i] = x` | the category axis drops its copy in `init()` on every update (`scale.category.js`) |
| Labels found in the data | category `parse` pushes onto the axis' copy | only by parsing every dataset again, in order | by the full parse |
| Scale objects and axes | `linkScales` (every update, `core.controller.js:444`); `buildOrUpdateScales` replaces a scale whose type changes | `xAxisID`/`yAxisID`, `indexAxis`, scale type; rework-options P16 can change a scale's axis | no record |
| Scale parse options | time scale: a new adapter each `init`, `_parseOpts` (`parser`, `round`, `isoWeekday`), the adapter's options and the chart's `locale` | options, `_adapters._date.override` | no record |
| `parsing` | `this._parsing`, set in `configure()` | dataset or chart options | `configure()` runs in `_updateDatasets` (`core.controller.js:727`) after `buildOrUpdateElements` (`:510`), so parse uses the previous update's value (verified: `yAxisKey` `'a'` → `'b'` shows `'a'` after one update, `'b'` after two) |
| Bubble radius | `controller.bubble.js` `parse*Data`: `_custom = resolveDataElementOptions(i).radius` | options | by the full parse; a scriptable `radius` reading `ctx.parsed` throws at parse time, since `parsed` is not set yet (verified, chromium and firefox) |
| `stack`, `stacked` | `buildOrUpdateElements` | dataset `stack`, scale `stacked` | yes, it restacks |
| Dataset index and order | `updateIndex` clears its stacks; `_removeUnreferencedMetasets` drops `chart._stacks` | `datasets.splice`, reordering | cleared, added back by the full parse |
| Visibility | `_top`/`_bottom` in `updateStacks` via `getMatchingVisibleMetas` | `hide`, `show`, `setDatasetVisibility` | only by the full parse |
| Logarithmic `_zero` | set during parse, never reset | — | already sticky |

Readers that rely on parsed values being current: the controllers' `getParsed` and `_parsed` reads (bar, bubble, doughnut, line, scatter, polar area, radar), `core.interaction.ts` (binary search on `_sorted`), `helpers.extras.ts` `_getStartAndCountOfVisiblePoints`, the tooltip (`getParsed`; `context.raw` reads the live `dataset.data`), `core.scale.js` `getMinMax`, `scale.time.js` `getAllParsedValues`. Animations take their targets from `updateElements`, which still runs on every update; unchanged parsed values give unchanged targets.

Docs and tests that assign in place: `docs/developers/api.md:25` (`data[2] = 50` before `.update()`), `docs/samples/scales/time-line.md:14,16` and `time-max-span.md:14,16`, `test/specs/core.datasetController.spec.js:972,1769`, `test/specs/core.interaction.spec.js:592,621`. About 45 samples replace `dataset.data` or `data.labels`, which stays seen.

Measured with the built bundle in Node (stub canvas), 30 datasets × 300 points: `parse` is about 15% of a line chart's update CPU and allocation; in a stacked bar chart `_resyncElements` is 39% of update CPU, 23% of it `updateStacks` (`getLastIndexInStack` filters and reverses the visible metasets twice per point), and 38% of allocation.

Overlapping designs:

- rework-bar-chart: P11 stops writing `_visualValues`; P12 (4.6.x) removes `_top`, `_bottom` and `_visualValues` from `updateStacks`, which removes the visibility input and the 23%; P13 (4.7.0) adds the private `_stackValue(item, vAxis)` hook in `updateStacks`; P5 removes the bar's `_parsed.find`.
- finalize-typescript-conversion: P22 converts `core.datasetController`, P23 bubble, P25 `core.controller`, P29 `core.scale`; decision 24: v5 work lands on master after 4.7.0, with no long-lived branch.
- rework-options: P16 can change a scale's axis; P9 holds `docs/developers/updates.md`.
- #11836 makes `getDatasetMeta` O(1), the other half of #11814.

## Goals / Non-Goals

Goals:

- In 5.0.0, an update reads a dataset's data again only for a change it knows of, and only the changed points where the change says which.
- One explicit signal for changes made in place, available in 4.7.0 so code can migrate first, with a warning that finds such code.
- Every change seen today without help stays seen: array methods, replaced arrays and datasets, labels, scales and options.
- Every piece before the breaking one leaves the output unchanged except for the two fixes.

Non-goals:

- A per-point check of raw values, or an opt-in flag as the main mechanism (offered to the user; not chosen).
- Partial updates of the rest of `update()` (layout, `updateElements` for unchanged datasets) and O(1) `getDatasetMeta` (#11836). #11814 needs both and stays open after this change.
- Seeing in-place changes through a `Proxy` on the data or its items.

## Decisions

### D1. The rule: what makes a dataset read its data again

At each update a dataset reads:

1. **All its data** when it is new; its data array (or data object) was replaced; a scale it parses through (index, value, and the x, y or r scale) is another object, has another axis, or reports a parse change (D3); its resolved `parsing` differs from the last parse; `markDataChanged` was called for the dataset or the chart without a range; `sort` or `reverse` ran on its data; it has object data on a category axis whose labels changed; or its category axis found labels in the data (D4).
2. **A range** for the points `push`/`unshift`/`splice` inserted, the range of `fill`/`copyWithin`, `markDataChanged(datasetIndex, start, count)`, and for primitive data the indices whose label changed.
3. **Nothing, but restacks** when its index, `stack` or `stacked` changed or `chart._stacks` was dropped: its stack entries are cleared and stored again from the parsed values it has, through `updateStacks` (so rework-bar-chart P13's `_stackValue` applies).
4. **Nothing** otherwise: `_parsed`, `_sorted`, `_custom` and `_stacks` stay.

A partial parse checks the order against the items before and after each range; removals keep `_sorted`.

Alternatives: a per-point comparison of raw values (keeps O(n) reads on every update; not chosen); a `Proxy` on the data array (changes the identity of `dataset.data`, slows every read, and still misses `data[i].y = v`).

### D2. What records a change

Each controller keeps a private change record (`all`, merged index ranges, `restack`) and a snapshot of the parse inputs of its last parse: the data's identity; per x, y, r, index and value scale the scale object, its axis and its parse epoch (D3); the resolved `parsing` compared by value; the stack key; the stacked flag; the index. The array listeners write into the record; the decision is made in `buildOrUpdateElements` before `_resyncElements`. Before 5.0 (pieces P6 to P8) the decision is computed and tested but the full parse still runs.

### D3. Scales report parse changes

A scale keeps a private `_parseEpoch` that goes up when one of its parse inputs changes. The base `Scale` compares its label source with the last update's once per update, by identity and shallowly by content, at the first `getLabels()` after `init` (so labels set in a `beforeUpdate` hook still count, as the archived isolate-category-scale-labels design requires), and exposes the changed index range. `TimeScale` adds `parser`, `round`, `isoWeekday` and the adapter's options and locale. Linear, logarithmic and the base parse are pure.

Alternatives: array listeners on the labels plus the signal for `labels[i] = x` (breaks the assignment, which works today and needs no signal for a label); the signal only (breaks the documented `labels.push` pattern).

### D4. Category axis keeps its copy unless it found labels in the data

A category axis keeps its label copy across updates when its source is unchanged and the last update found no labels in the data. When it found some, it is volatile: it drops its copy in `init` as today, and its datasets read all their data. That keeps the order the labels were found in and drops the labels of removed values. The performance docs say to give `labels` to avoid the cost.

Alternative: rebuilding the found labels incrementally, in two phases in `Chart.update` (changes the order of `update()` for a case the docs can steer away from).

### D5. The signal

`chart.markDataChanged(datasetIndex?: number, start?: number, count?: number): void`. Without arguments every dataset and the labels are read at the next update; with `datasetIndex` that dataset; with a range those points. A dataset without a controller yet is ignored (a new controller parses everything). `DatasetController#markDataChanged(start?, count?)` is public for plugins and custom controllers; the chart's method calls it. It marks and does not update. `update()` takes no hint: `mode` can already be a function, and a broader partial update needs its own design.

Replacing `dataset.data` stays the simplest documented way. `data.splice(i, 1, v)` is not recommended for changing a value: the new element animates from the base; the signal animates from the old value.

### D6. Custom controllers and scales

A protected `getParseDependencies(): unknown[]` on `DatasetController` and `Scale`, compared item by item by identity, reports parse inputs that come from options. A static `parseOnEveryUpdate = true` keeps the 4.x behaviour for a class in one line. Third-party classes default to stable, since 5.0.0 is the breaking release; the migration guide says so. P1 makes the bubble chart not need the hook.

### D7. 4.7.0 warns once per chart

While 4.x still parses everything, the parse compares the new values of the axes (with `Object.is`) and `_custom`'s start and end with the old ones, outside the recorded changes. The first difference on a chart logs one `console.warn` naming the dataset and the migration guide. Chart.js has no development build, so it is a production warning; the builder measures its cost and it stays only under about 3% of update CPU. 5.0.0 removes it with the full parse. It also finds parse inputs this design missed before 5.0.0 ships.

### D8. Object data and `parsing: false`

Object data (`data: {a: 1, b: 2}`) follows the same rule: its identity and the signal. `parsing: false` too: positions follow the data objects directly, but stacks and `_sorted` need the signal after a change in place.

### D9. Order with other designs

P9 waits for rework-bar-chart P11 and P12, which remove the stack fields that depend on visibility, and for P13 so that restacking goes through `_stackValue`. P6 and P9 do not wait for finalize-typescript-conversion P22; whichever lands second rebases, and P22 types the new fields. The first v5 piece that needs a migration guide line creates `docs/migration/v5-migration.md`; the others append.

## Risks / Trade-offs

- Code that assigns in place and upgrades to 5.0.0 shows stale values without an error. Mitigation: the 4.7.0 signal and warning, the migration guide, and the docs' own examples changed in 4.7.0.
- A parse input this design missed shows stale values in 5.0.0. Mitigation: D7's warning reports any difference the full parse finds outside the record during the 4.7.x line, and the test suite still parses fully until P9.
- Third-party controllers and scales whose parse reads options go stale in 5.0.0 unless they implement D6's hook or set `parseOnEveryUpdate`.
- The label diff is O(labels) per scale per update. It is one array per scale, not per point.
- A category axis that finds its labels in the data gains nothing.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | fix(bubble): the default radius is resolved at update, not in parse; `_custom` holds only a given `r` | `src/controllers/controller.bubble.js`, `test/specs/controller.bubble.spec.js` | `radius: ctx => ctx.parsed.y` with data without `r` throws on master (`ctx.parsed is undefined`), expect radii 5 and 8; changing `radius` with the data unchanged resizes the bubbles; the tooltip still shows the radius | ~50 | finalize-typescript-conversion P23 if in flight | | |
| P2 | fix: a changed `parsing` option applies on the update that changes it | `src/core/core.datasetController.js` (refresh `_parsing` before `buildOrUpdateElements` parses), `test/specs/core.datasetController.spec.js` | `parsing: {yAxisKey: 'a'}` → `'b'`, one update: y from `'a'` on master, expect from `'b'` | ~40 | #12284, #12176 | | |
| P3 | feat(helpers): array listeners for `sort`, `reverse`, `fill` and `copyWithin`; the controller records all or a range for them | `src/helpers/helpers.collection.ts`, `src/core/core.datasetController.js` (listener methods), `etc/chart.js-helpers.api.md`, `test/specs/helpers.collection.unit.spec.js` | the listener gets `_onDataFill(start, end)` normalised after `fill(0, -2)`; `sort()` calls `_onDataSort` | ~110 | P2 | | |
| P4 | refactor(scale): scales report parse changes: `_parseEpoch`, the label-source diff with the changed range, the time scale's parse and adapter options | `src/core/core.scale.js`, `src/scales/scale.time.js`, `test/specs/core.scale.spec.js`, `test/specs/scale.time.spec.js` | the epoch stays after a plain `update()` and goes up after `labels[1] = 'x'`, a `time.parser` change and an adapter option change; the diff after `labels.push` is `[n, n + 1)` | ~180 | the open PRs on `core.scale.js` sections it edits | | |
| P5 | refactor(category): the axis keeps its label copy across updates when the source is unchanged and no labels were found in the data, and marks itself volatile otherwise | `src/scales/scale.category.js`, `test/specs/scale.category.spec.js` | with `labels` given, `getLabels()` returns the same array over two updates (master: a new one); the specs in `openspec/specs/category-scale-*` still pass | ~90 | P4; #12222 | | |
| P6 | refactor(core): the controller records what changed (range, all, restack) and the parse-input snapshot, and computes D1's decision, still parsing everything | `src/core/core.datasetController.js`, `src/core/core.controller.js` (dropping `_stacks` sets restack), `test/specs/core.datasetController.spec.js` | specs on the private decision: none after a plain update; `[[n, 1]]` after `push`; all after a replaced array, a scale type change and an `indexAxis` change; restack after a dataset above is removed | ~250 | P3, P4, P5; #12284, #12172 | #11814 | |
| P7 | feat: `chart.markDataChanged()` and `DatasetController#markDataChanged()`, types and docs; the docs, samples and specs that assign in place call it | `src/core/core.controller.js`, `src/core/core.datasetController.js`, `src/types/index.d.ts`, `test/types/`, `docs/developers/api.md`, `docs/developers/updates.md`, `docs/samples/scales/time-line.md`, `docs/samples/scales/time-max-span.md`, `test/specs/core.datasetController.spec.js`, `test/specs/core.interaction.spec.js` | the type test does not compile on master; the spec records `[1, 1]` for dataset 0 after `markDataChanged(0, 1, 1)` | ~150 | P6; #12400, rework-options P9 (`updates.md`) | #11814 | |
| P8 | feat: 4.7.0 warns once per chart when the full parse finds a value changed in place without the signal | `src/core/core.datasetController.js`, `test/specs/core.datasetController.spec.js`, `docs/developers/updates.md` | `data[1] = 39; update()`: one `console.warn` (master: none); a second time: none; with the signal or `push`: none; update CPU within 3% of master (measured) | ~120 | P1, P6, P7 | | |
| P9 | feat!: parse only what changed (D1), restack without reading, the order check at both ends of a range, volatile category axes, D6's hook; the TODO, the full parse and P8's warning removed | `src/core/core.datasetController.js`, `src/core/core.controller.js`, `src/core/core.scale.js`, `test/specs/core.datasetController.spec.js`, `test/specs/core.interaction.spec.js`, `test/specs/scale.category.spec.js` | a time axis `parser` callback: called once per value per update on master, expect 0 with no change and 1 after a `push`; the in-place, scale, stack and found-labels scenarios of `data-updates`; bar border radius after `hide(1)`; update time and bytes measured against master and master with rework-bar-chart P12 | ~300 | P1-P8; rework-bar-chart P11, P12, P13; master at 5.0 | #11814 | |
| P10 | docs: the v5 migration guide's "Updating data" section, `performance.md` (give `labels`, the signal), the sidebars | `docs/migration/v5-migration.md` (new unless another v5 piece made it), `docs/.vitepress/sidebar.ts`, `docs/.vuepress/config.ts`, `docs/general/performance.md` | none (docs) | ~100 | P9 | | |

Release lines: P1 and P2 are 4.6.x fixes. P3 and P7 are 4.7.0 features, P8 a 4.7.0 behaviour (a warning); P4 to P6 change no behaviour and can ship in any 4.x release. P9 and P10 are 5.0.0. #11814 stays open after this change: it also needs #11836 and a partial update of the rest of `update()`.

Parallel: P1, P2 and P4 can be built at once; P3 after P2 (same file); P5 after P4; P6 after P3 to P5; P7, P8, P9 and P10 in order.

## Contracts

- **P3 → P6:** `ArrayListener` has optional `_onDataSort()`, `_onDataReverse()`, `_onDataFill(start, end)`, `_onDataCopyWithin(target, start, end)` with normalised non-negative indices; they are called after the change.
- **P4 → P5, P6, P9:** `scale._parseEpoch: number`, raised when a parse input changes; `scale._labelChanges(): {all: boolean, ranges: [start, end][]}` for the current update.
- **P5 → P6, P9:** `categoryScale._volatile: boolean`, true when the last update found labels in the data.
- **P6 → P7, P8, P9:** `controller._changes: {all: boolean, ranges: [start, count][], restack: boolean}`, `controller._parseInputs` (the snapshot), and `controller._parseDecision(): 'none' | 'restack' | {all: true} | {ranges}`.
- **P7 → P8, P9, P10:** `Chart#markDataChanged(datasetIndex?, start?, count?)` and `DatasetController#markDataChanged(start?, count?)` write into `_changes`.
- **P9:** `DatasetController#getParseDependencies(): unknown[]` and `Scale#getParseDependencies(): unknown[]` (protected), and `static parseOnEveryUpdate`.

## Open Questions

1. **Public names (P7).** `markDataChanged` / `invalidateData` / `dataChanged`. Recommendation: `markDataChanged`, on the chart and the controller; the verb says it marks for the next update.
2. **A hint in `update()` (P7).** `update({mode, dataChanged})` or none. Recommendation: none.
3. **The 4.7.0 warning (P8).** Once per chart / none, docs only / behind an option. Recommendation: once per chart, no option.
4. **Label changes (P4).** A shallow diff per scale per update / listeners plus the signal / the signal only. Recommendation: the diff.
5. **Object data (P9).** The same rule / always read. Recommendation: the same rule.
6. **Category axis finding labels in the data (P5, P9).** Volatile / an incremental rebuild. Recommendation: volatile.
7. **The hook for custom classes (P9).** `getParseDependencies()` with `parseOnEveryUpdate` / the flag only / always read for third-party classes. Recommendation: the method and the flag, stable by default.
8. **`parsing: false` with stacks (P9).** The same rule / always read. Recommendation: the same rule.
