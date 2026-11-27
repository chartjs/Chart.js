## Context

`DatasetController._resyncElements` (`src/core/core.datasetController.js`, about lines 1020-1052) replays the array changes it was told about, then parses all data again (`this.parse(0, count)`), on every `chart.update()`:

> TODO: It is not optimal to always parse the old data. This is done because we are not detecting direct assignments: chart.data.datasets[0].data[5] = 10; chart.data.datasets[0].data[5].y = 10;

The full parse hides every input that changed without being recorded. What the parsed values (`meta._parsed`, `_sorted`, `_custom`, `_stacks`) depend on, and whether a change is seen today other than by that parse:

| Input | Read in | Changed by | Seen today |
|---|---|---|---|
| Data values | `parse*Data` | `push`/`pop`/`shift`/`splice`/`unshift` (listened, `helpers.collection.ts:121`); `data[i] = v`, `data[i].y = v`, a `Date` mutated in place, `sort`/`reverse`/`fill`/`copyWithin` (not listened); a replaced array (`_dataCheck` compares identity); a length change by assignment (`_resyncElements` compares lengths) | values only by the full parse |
| A point's position | `parsePrimitiveData` (`iScale.parse(labels[index], index)`), the bar's `parseArrayOrPrimitive`, category `parse` (`sameLabel(labels[index], raw) ? index`), stack keys (`getOrCreateStack(stacks, key, index)`) | `shift`, `unshift`, a `splice` before the end: every later point moves | only by the full parse (`_removeElements` and `_insertElements` move `_parsed` slots without parsing them) |
| Object data (`data: {a: 1}`) | `convertObjectDataToArray` in `_dataCheck` | keys added, deleted or reordered in place | a new array every update, and the full parse |
| Labels | `parsePrimitiveData` via `iScale.getLabels()`; category `parse` (`findOrAddLabel`, and `validIndex` clamps by the label count) for array, object and primitive data on an index or value category axis | `chart.data.labels`, `xLabels`/`yLabels`, a scale's `labels`: replaced, `push` (`docs/developers/updates.md`), `labels[i] = x`, a `Date` label mutated | the category axis drops its copy in `init()` on every update (`scale.category.js`); everything else by the full parse |
| Labels the category axis adds itself | category `parse` pushes onto the axis' copy: from the data, from `min`/`max`/`suggestedMin`/`suggestedMax` in `init` and `beforeLayout`, and from a draw-time `getPixelForValue('x')` | each update | rebuilt by the full parse after the copy is dropped |
| Scale objects and axes | `linkScales` (every update, `core.controller.js:444`); `buildOrUpdateScales` replaces a scale whose type changes | `xAxisID`/`yAxisID`, `indexAxis`, scale type; rework-options P16 can change a scale's axis | no record |
| Scale parse options | time scale: a new adapter each `init`, `_parseOpts` (`parser`, `round`, `isoWeekday`), the adapter's options and the chart's `locale` | options, `_adapters._date.override`; state outside the options that a `parser` closure or the adapter reads (a Luxon default zone) | no record |
| `parsing` | `this._parsing`, set in `configure()` | dataset or chart options | `configure()` runs in `_updateDatasets` (`core.controller.js:727`) after `buildOrUpdateElements` (`:510`), and the options resolver caches what it read (`helpers.config.ts`), so parse uses the previous update's value (verified: `yAxisKey` `'a'` → `'b'` shows `'a'` after one update, `'b'` after two). Switching from `parsing: false`, where `meta._parsed` is the user's array, writes parsed items into `dataset.data` |
| Bubble radius | `controller.bubble.js` `parse*Data`: `_custom = resolveDataElementOptions(i).radius`; `resolveDataElementOptions` returns `valueOrDefault(parsed._custom, radius)` from the previous parse | the `radius` option | **not seen even today**: the old `_custom` shadows the new radius until `dataset.data` is replaced (verified). A scriptable `radius` reading `ctx.parsed` throws at parse time (verified, chromium and firefox). `_custom` is public: "`{x, y, _custom}` where `_custom` is the radius" (`docs/charts/bubble.md:133`, `BubbleParsedData`) |
| `stack`, `stacked` | `buildOrUpdateElements` | dataset `stack`, scale `stacked` | yes, it restacks; turning `stacked` off leaves `_stacks` on the items until the next full parse replaces them |
| Dataset index and order | `updateIndex` clears its stacks; `_removeUnreferencedMetasets` drops `chart._stacks` | `datasets.splice`, reordering | cleared, added back by the full parse |
| `_top`/`_bottom` | `updateStacks` via `getLastIndexInStack`: visible metasets of the type, in `order` | `hide`/`show`, `order`, another dataset's value removed or changed (`clearItemStack` never resets them) | only by the full parse |
| `_visualValues` | the bar writes it in `_calculateBarValuePixels` only when `minBarLength` applies; `updateStacks` resets it to the value on every parse | resize, scale range | only by the full parse |
| Logarithmic `_zero` | set during parse, never reset | — | already sticky |

Readers that rely on parsed values being current: the controllers' `getParsed` and `_parsed` reads (bar, bubble, doughnut, line, scatter, polar area, radar), `core.interaction.ts` and `helpers.extras.ts` `_getStartAndCountOfVisiblePoints` (`_sorted`), the tooltip (`getParsed`; `context.raw` reads the live `dataset.data`), scriptable contexts (`context.parsed`), `core.scale.js` `getMinMax`, `scale.time.js` `getAllParsedValues` (its cache is reset in `beforeLayout`), the bar's `enableBorderRadius` and `setBorderSkipped` (`_stacks`, `_top`, `_bottom`), `applyStack` (`_visualValues`). Animations take their targets from `updateElements`, which still runs on every update.

Third-party controllers in this workspace: chartjs-chart-sankey's `parseObjectData` rebuilds its whole layout from all links and returns a slice; chartjs-chart-treemap overrides `_dataCheck` and `buildOrUpdateElements` and ignores `start`/`count`; circlepack relies on `parse(start, count)` for inserted ranges. `DoughnutController.parse` writes `_parsed[i] = +data[i]` without the base `parse`.

Docs and tests that assign in place: `docs/developers/api.md:25` (`data[2] = 50` before `.update()`), `docs/samples/scales/time-line.md:14,16` and `time-max-span.md:14,16`, `test/specs/core.datasetController.spec.js:972,1769`, `test/specs/core.interaction.spec.js:592,621`. About 45 samples replace `dataset.data` or `data.labels`, which stays seen.

Measured with the built bundle in Node (stub canvas), 30 datasets × 300 points: `parse` is about 15% of a line chart's update CPU and allocation; in a stacked bar chart `_resyncElements` is 39% of update CPU, 23% of it `updateStacks` (`getLastIndexInStack` filters and reverses the visible metasets twice per point), and 38% of allocation.

Overlapping designs:

- rework-bar-chart: P11 stops writing `_visualValues`; P12 (4.6.x) removes `_top`, `_bottom` and `_visualValues` from core's `updateStacks`, which removes the visibility, order and removal inputs and the 23%; P13 (4.7.0) adds the private `_stackValue(item, vAxis)` in `updateStacks`; P5 removes the bar's `_parsed.find`.
- finalize-typescript-conversion: P22 converts `core.datasetController`, P23 bubble, P25 `core.controller`, P29 `core.scale`; decision 24: v5 work lands on master after 4.7.0, with no long-lived branch.
- rework-options: P16 can change a scale's axis; P9 holds `docs/developers/updates.md`.
- #11836 makes `getDatasetMeta` O(1), the other half of #11814.

## Goals / Non-Goals

Goals:

- In 5.0.0, an update reads a dataset's data again only for a change it knows of, and only the changed points where the change says which and the controller can parse a range.
- One explicit signal for changes made in place, available in 4.7.0 so code can migrate first, with a warning that finds such code.
- Every change seen today without help stays seen: array methods, replaced arrays and datasets, a length change, labels, scales and options.
- Every piece before the breaking one leaves the output unchanged except for the two fixes, the new method and the warning.

Non-goals:

- A per-point check of raw values, or an opt-in flag as the main mechanism (offered to the user; not chosen).
- Partial updates of the rest of `update()` (layout, `updateElements` for unchanged datasets) and O(1) `getDatasetMeta` (#11836). #11814 needs both and stays open after this change.
- Seeing in-place changes through a `Proxy` on the data or its items.
- Renumbering moved points instead of parsing them (the user chose to parse the tail; a faster path can follow after measuring).

## Decisions

### D1. The rule: what makes a dataset read its data again

At each update a dataset reads:

1. **All its data** when it is new; its data array was replaced; it has object data (`data: {…}`, which is converted to a new array every update and gains nothing); a scale it parses through (index, value, and the x, y or r scale) is another object, has another axis, or reports other parse dependencies (D3); its resolved `parsing` differs from the last parse; the labels of a category scale it parses through changed (D3); that category axis added labels of its own in the last update (D4); `markDataChanged` was called for the dataset or the chart without a range; `sort` or `reverse` ran on its data; its index, `stack` or `stacked` changed or `chart._stacks` was dropped (restacking is rare, so it reads all instead of keeping a separate restack path); or its controller does not parse ranges (D6) and anything at all changed.
2. **From a position to the end** when its parse depends on position (primitive data, and every controller unless D6 says otherwise) and a point was inserted or removed before the end: the first changed position to the end is read. A rolling window (`shift` with `push`) therefore reads the whole dataset; appends read only the new points.
3. **The marked points** otherwise: the points `push` (or a `splice`/`unshift` at the end) added, the range of `fill`/`copyWithin`, `markDataChanged(datasetIndex, start, count)`, and points added by a length change.
4. **Nothing** otherwise: `_parsed`, `_sorted`, `_custom` and `_stacks` stay.

A read of all data parses the full length into a fresh `_parsed` (so `_sorted` is computed from the start, and `parsing: false` no longer shares the user's array after the option changes), and clears the dataset's stack entries first. A partial read clears the stack entries of the points it reads, and checks the order against the items before and after each range; it can only turn `_sorted` false, which is safe but loses the sorted fast path until the next full read. Turning `stacked` off removes `_stacks` from the items.

Alternatives: a per-point comparison of raw values (keeps O(n) reads on every update; not chosen); a `Proxy` on the data array (changes the identity of `dataset.data`, slows every read, and still misses `data[i].y = v`); renumbering moved points instead of parsing them (more code; deferred until measured).

### D2. What records a change: marks that move with `_parsed`

A record of event-time index ranges breaks when a later `shift` or `splice` lands before the update (a `push` then a `shift` leaves the range one past the end). So the record is kept in the structure the replay already shifts: each controller keeps a marker array in step with `_parsed`, spliced by the same `_insertElements` and `_removeElements`; a marked slot is read at the next update. `_syncList` stays the record of structural changes; `_insertElements` marks the slots it inserts, `markDataChanged` and `fill`/`copyWithin` mark theirs, a position-dependent insert or removal marks the rest of the array, and a flag says "all". `_parsed` itself keeps its old items until they are read, so a hover between the change and the update reads the old value rather than a hole.

Beside it, a snapshot of the parse inputs of the last read: per x, y, r, index and value scale the scale object, its axis and its parse dependencies (D3); the resolved `parsing`, compared by value; the stack key; the stacked flag; the index. It is written in `_resyncElements`, not in `parse`, which controllers override (doughnut, third-party). The decision is one object, `{all, marked, restackAll}`, computed in `buildOrUpdateElements` before `_resyncElements`.

### D3. Scales report parse changes through `getParseDependencies()`

A scale's parse inputs that come from options are reported by a protected `getParseDependencies(): unknown[]`, compared item by item with `Object.is`; items must be primitives or functions, since option objects come from a resolver made anew each update. The base `Scale` returns none (linear, logarithmic, radial linear and the base parse are pure). `TimeScale` returns `parser`, `round`, `isoWeekday`, the adapter's option values and the locale. There is no separate epoch counter: core uses the same hook it offers custom scales.

Label changes are checked by an explicit call, once per scale per update, from the decision step in `buildOrUpdateElements`, after the `beforeUpdate` hook and after `init` has run its own `parse(min/max)` (a check at the first `getLabels()` would run inside `init` whenever `min` or `max` is set, before `beforeUpdate`, and would not run at all when no dataset parses). It compares the label source with the last update's by identity and shallowly by content and answers changed or not; a changed label reads all data of the datasets that parse through that scale, whatever the data shape (array and object data and category value axes depend on the whole label list through `findOrAddLabel` and `validIndex`). A label array (a multi-line label) recreated on every update counts as changed: safe, but it loses the gain.

Alternatives: listeners on the labels plus the signal for `labels[i] = x` (breaks an assignment that works today); the signal only (breaks the documented `labels.push`); a changed index range (rare in practice; the data push that goes with a label push already marks its points).

### D4. The category axis keeps rebuilding its copy

The category axis keeps dropping its label copy in `init` as today; with `labels` given, the copy is the source again without any parse. An axis whose copy was longer than its source at the end of the last update added labels of its own (from the data, from `min`/`max`, or from a draw-time `getPixelForValue`); its datasets then read all their data, which rebuilds those labels in order and drops the labels of removed values. This is derived from the lengths; no flag is stored. The performance docs say to give `labels` to avoid the cost.

Alternatives: keeping the copy across updates (visible to code that mutates `getLabels()`'s result, and keeps a `min` label after `min` changes); rebuilding found labels incrementally (changes the order of `update()`).

### D5. The signal

`chart.markDataChanged(datasetIndex?: number, start?: number, count?: number): void` (the user's choice of name). Without arguments every dataset and the labels are read at the next update; with `datasetIndex` that dataset; with a range those points. A dataset without a controller yet is ignored (a new controller parses everything). `DatasetController#markDataChanged(start?, count?)` is public for plugins and custom controllers; the chart's method calls it. It marks and does not update. The docs and samples say "since 4.7.0".

`update()` takes no hint: `mode` can already be a function, and a broader partial update needs its own design (this session's recommendation; adding one later does not break).

Replacing `dataset.data` stays the simplest documented way. `data.splice(i, 1, v)` is not recommended for changing a value: the new element animates from the base; the signal animates from the old value.

### D6. Range parsing is opt-in per controller class

Range and tail reads (D1 rules 2 and 3) apply only to a controller class that says its parse is local to each item, with a static `parsesRanges = true`; core's built-in controllers set it (the user's choice). Every other controller reads all its data when anything changed, and nothing when nothing did. Sankey, whose parse rebuilds its layout from all links, and treemap, which ignores `start`/`count`, keep working without a change. A controller's parse inputs from options are reported by the same protected `getParseDependencies()` as a scale's; returning a fresh object makes it parse on every update, which keeps the 4.x behaviour (a documented one-liner, not a separate flag). Private hooks third-party controllers override (`_dataCheck`, `buildOrUpdateElements`, `parse(start, count)`) keep their signatures; treemap's override of `buildOrUpdateElements` bypasses the decision and so keeps parsing as it does.

### D7. 4.7.0 warns once per chart

While 4.x still parses everything, `_resyncElements` (not `parse`, so pie and doughnut and `parsing: false` are covered) keeps the previous parsed values of the axes and `_custom` for datasets whose decision says nothing changed, and compares them with `Object.is` after the full parse. The first difference on a chart logs one `console.warn` naming the dataset and the migration guide, worded so that it also covers inputs outside the options (a changed `Date`, a parser reading outside state). With `parsing: false`, positions follow the data objects, so the comparison covers the stacked values only. Chart.js has no development build, so it is a production warning; the builder measures its cost and it ships only under about 3% of update CPU, otherwise P7 ships no warning and the comparison becomes a test-suite assertion. 5.0.0 removes it with the full parse (the user's choice: warn once per chart).

### D8. Object data and `parsing: false`

Object data always reads all (D1): it is converted to a new array every update, so the rule gains nothing there, and keys added, deleted or reordered in place stay seen. `parsing: false` follows the rule: positions follow the data objects directly; stacks need the signal after a change in place; `_sorted` is always true there, as today.

### D9. Order with other designs

P8 waits for rework-bar-chart P11 and P12, which remove `_visualValues`, `_top` and `_bottom` from what parse stores, and so the inputs of visibility, order, removals and resizes. Restacking reads all (D1), so P8 does not wait for P13's `_stackValue`. P5 and P8 do not wait for finalize-typescript-conversion P22; whichever lands second rebases, and P22 types the new fields. The first v5 piece that needs a migration guide line creates `docs/migration/v5-migration.md`; the others append.

### D10. Review changes

The design review changed: ranges became marks that move with `_parsed` (D2); a point's position became an input, read from the change to the end (D1); labels are checked by an explicit call and answer changed or not, for every category axis (D3); the scale epoch, the label ranges, the restack path, the category copy kept across updates (the old P5) and the `parseOnEveryUpdate` flag were removed; object data reads all (D8); P1 keeps `_custom` as the radius; P2 moves `configure()`; the warning compares outside `parse` and only where nothing was recorded (D7); third-party controllers read all on any change (D6); the types and API reports joined P6 and P8.

## Risks / Trade-offs

- Code that assigns in place and upgrades to 5.0.0 shows stale values without an error on some charts, and the change still shows on others (a category axis that finds its labels in the data, `parsing: false` positions, decimation, any chart where something else forced a full read). Mitigation: the 4.7.0 signal and warning, the migration guide saying not to rely on it, and the docs' own examples changed in 4.7.0.
- A parse input this design missed shows stale values in 5.0.0. Mitigation: D7's warning during the 4.7.x line, and the full parse stays until P8.
- A rolling window gains nothing in 5.0.0; appends and option-only updates gain fully.
- Plugins and framework wrappers that write values in place and call `chart.update()` need a release (the migration guide has a paragraph for them).
- The label check is O(labels) per scale per update: one array per scale, not per point.
- A console warning in 4.7.0 can fail test suites that fail on console output.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | fix(bubble): the default radius is resolved at update, so a changed `radius` applies and a scriptable `radius` sees `ctx.parsed`; `_custom` stays the radius readers see, the given `r` is kept apart from it | `src/controllers/controller.bubble.js`, `test/specs/controller.bubble.spec.js` | `radius: ctx => ctx.parsed.y` with data without `r` throws on master, expect radii 5 and 8; `radius: 3` → `10` keeps 3 on master, expect 10; `parsed._custom` is the radius; the hover radius of a bubble without `r` stays 7 | ~70 | finalize-typescript-conversion P23 if in flight | | |
| P2 | fix: a changed `parsing` option applies on the update that changes it, and leaving `parsing: false` no longer writes into the user's data | `src/core/core.controller.js` (`configure()` before `buildOrUpdateElements`; the `beforeElementsUpdate` hook order checked), `src/core/core.datasetController.js` (a fresh `_parsed` when `parsing` changes), `test/specs/core.datasetController.spec.js` | `parsing: {yAxisKey: 'a'}` → `'b'`, one update: y from `'a'` on master, expect `'b'`; `parsing: false` → keys: the user's objects lose a field on master, expect unchanged | ~60 | #12284, #12176, #12565 | | |
| P3 | feat(helpers): array listeners for `sort`, `reverse`, `fill` and `copyWithin`; the controller marks all or the range, outside `_sync` so hidden indices do not move | `src/helpers/helpers.collection.ts`, `src/core/core.datasetController.js` (listener methods), `etc/chart.js-helpers.api.md`, `test/specs/helpers.collection.unit.spec.js` | `fill(0, -2)` calls `_onDataFill` with normalised indices; `sort()` calls `_onDataSort`; `unlistenArrayEvents` restores all nine methods | ~110 | P2 | | |
| P4 | refactor(scale): `getParseDependencies()` on scales (the time scale's parse and adapter options) and the explicit label check; changes nothing visible | `src/core/core.scale.js`, `src/scales/scale.time.js`, `src/scales/scale.category.js` (the length comparison of D4), `test/specs/core.scale.spec.js`, `test/specs/scale.time.spec.js` | the time scale's dependencies change after a `time.parser` change and an adapter option change and not after a plain update; the label check says changed after `labels[1] = 'x'` and after labels replaced in `beforeUpdate` with `min` set, and unchanged after a plain update; a category axis reports added labels after `min: 'zz'` | ~150 | the open PRs on the `core.scale.js` sections it edits; #12222 | | |
| P5 | refactor(core): the marker array, the parse-input snapshot and D1's decision, computed while still parsing everything; `parsesRanges` on core's controllers | `src/core/core.datasetController.js`, `src/core/core.controller.js` (dropping `_stacks` marks all), the built-in controllers (`parsesRanges`), `test/specs/core.datasetController.spec.js` | specs on the private decision: nothing after a plain update; the new slot after `push`; the new slot after `push` then `shift` (moved with `_parsed`); from 0 to the end after `shift` on primitive data; all after a replaced array, object data, a scale type change, an `indexAxis` change and a removed dataset above; all after any change for a controller without `parsesRanges` | ~280 | P3, P4; #12284, #12172 | | |
| P6 | feat: `chart.markDataChanged()` and `DatasetController#markDataChanged()`, with types and docs; the docs, samples and specs that assign in place call it | `src/core/core.controller.js`, `src/core/core.datasetController.js`, `src/types/index.d.ts`, `etc/chart.js.api.md`, `test/types/`, `docs/developers/api.md`, `docs/developers/updates.md`, `docs/samples/scales/time-line.md`, `docs/samples/scales/time-max-span.md`, `test/specs/core.datasetController.spec.js`, `test/specs/core.interaction.spec.js` | the type test does not compile on master; after `markDataChanged(0, 1, 1)` the decision marks slot 1 of dataset 0 | ~150 | P5; #12400, rework-options P9 (`updates.md`) | #11814 | |
| P7 | feat: 4.7.0 warns once per chart when the full parse finds a value that changed where nothing was recorded | `src/core/core.datasetController.js`, `test/specs/core.datasetController.spec.js`, `docs/developers/updates.md` | `data[1] = 39; update()`: one `console.warn` on line, pie and bubble charts (master: none); a second time: none; with the signal, `push`, a label change or a scale change: none; update CPU within 3% of master (measured; otherwise no warning ships) | ~120 | P1, P5, P6 | | |
| P8 | feat!: parse only what changed (D1): marked slots, the tail of position-dependent data, all for the D1 rule 1 causes; the order check at both ends of a range; `getParseDependencies()` on controllers; the TODO, the full parse and P7's warning removed | `src/core/core.datasetController.js`, `src/core/core.controller.js`, `src/types/index.d.ts`, `etc/chart.js.api.md`, `test/specs/core.datasetController.spec.js`, `test/specs/core.interaction.spec.js`, `test/specs/scale.category.spec.js` | a time axis `parser` callback: called once per value per update on master, expect 0 with no change and 1 after a `push`; with fixed labels `data.shift(); data.push(4)` puts every value on its label; the in-place, scale, stack and found-labels scenarios of `data-updates`; a controller without `parsesRanges` reads all after a `push`; update time and bytes measured against master and master with rework-bar-chart P12 | ~300 | P1-P7; rework-bar-chart P11, P12; master at 5.0 | #11814 | |
| P9 | docs: the v5 migration guide's "Updating data" section (in-place changes, `Date` objects, outside parser state, plugins and wrappers that write data, custom controllers and `parsesRanges`/`getParseDependencies()`, sankey and treemap need no change), `performance.md` (give `labels`, the signal), the sidebars | `docs/migration/v5-migration.md` (new unless another v5 piece made it), `docs/.vitepress/sidebar.ts`, `docs/.vuepress/config.ts`, `docs/general/performance.md` | none (docs) | ~120 | P8 | | |

Release lines: P1 and P2 are 4.6.x fixes. P3 and P6 are 4.7.0 features, P7 a 4.7.0 behaviour (a warning); P4 and P5 change nothing visible and can ship in any 4.x release (P5's decision is read by P7). P8 and P9 are 5.0.0. #11814 stays open after this change: it also needs #11836 and a partial update of the rest of `update()`.

Parallel: P1, P2 and P4 can be built at once; P3 after P2 (same file); P5 after P3 and P4; P6, P7, P8 and P9 in order.

## Contracts

- **P3 → P5:** `ArrayListener` has optional `_onDataSort()`, `_onDataReverse()`, `_onDataFill(start, end)`, `_onDataCopyWithin(target, start, end)` with normalised non-negative indices, called after the change.
- **P4 → P5, P8:** `Scale#getParseDependencies(): unknown[]` (protected; primitives or functions, compared with `Object.is`); `scale._labelsChanged(): boolean`, called once per update by the decision step; `categoryScale._addedLabels(): boolean`, true when its copy was longer than its source at the end of the last update.
- **P5 → P6, P7, P8:** `controller._marks` (kept in step with `_parsed` by `_insertElements` and `_removeElements`), `controller._parseInputs` (the snapshot, written in `_resyncElements`), `controller._parseDecision(): {all: boolean, marked: boolean, restackAll: boolean}`, and `static parsesRanges` on `DatasetController` (false) and the built-in controllers (true).
- **P6 → P7, P8, P9:** `Chart#markDataChanged(datasetIndex?, start?, count?)` and `DatasetController#markDataChanged(start?, count?)` write marks.
- **P8:** `DatasetController#getParseDependencies(): unknown[]` (protected), with the same rules as the scale's.

## Open Questions

None. The user chose the shape (parse on known changes, 5.0.0), the tail read for moved points, the 4.7.0 warning, the name `markDataChanged`, and opt-in range parsing per controller class.
