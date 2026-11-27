## 1. P1 fix(bubble): radius resolved at update

- [ ] 1.1 Add specs to `test/specs/controller.bubble.spec.js`: `radius: ctx => ctx.parsed.y` with data without `r` draws radii 5 and 8 (throws on master); changing `radius` with the data unchanged resizes the bubbles; the tooltip still shows the radius
- [ ] 1.2 Keep only a given `r` in `_custom` in the bubble's `parse*Data`; resolve the default radius in `updateElements` and wherever `_custom` is read (`getMaxOverflow`, `getLabelAndValue`, `resolveDataElementOptions`)
- [ ] 1.3 Run the bubble specs and fixtures in chromium and firefox

## 2. P2 fix: parsing option applies on the same update

- [ ] 2.1 Add a spec to `test/specs/core.datasetController.spec.js`: `parsing: {yAxisKey: 'a'}` changed to `'b'`, one update, y comes from `'b'` (from `'a'` on master)
- [ ] 2.2 Refresh `_parsing` from the dataset's resolved options before `buildOrUpdateElements` parses, without moving `configure()`
- [ ] 2.3 Run the controller specs

## 3. P3 feat(helpers): listeners for sort, reverse, fill, copyWithin

- [ ] 3.1 Add specs to `test/specs/helpers.collection.unit.spec.js`: `fill(0, -2)` calls `_onDataFill` with normalised indices; `sort()`, `reverse()`, `copyWithin()` call their listener after the change; `unlistenArrayEvents` restores all nine methods
- [ ] 3.2 Extend `arrayEvents` and `ArrayListener` in `src/helpers/helpers.collection.ts`; update `etc/chart.js-helpers.api.md`
- [ ] 3.3 Add the listener methods to `DatasetController`, recording all (sort, reverse) or a range (fill, copyWithin) for P6; behaviour unchanged

## 4. P4 refactor(scale): scales report parse changes

- [ ] 4.1 Add specs: the epoch stays after a plain `update()`; it goes up after `labels[1] = 'x'`, a `time.parser` change and an adapter option change; the label diff after `labels.push` is `[n, n + 1)`
- [ ] 4.2 Add `_parseEpoch` and the lazy label-source diff (`_labelChanges()`) to `Scale`, taken at the first `getLabels()` after `init`
- [ ] 4.3 Raise the epoch in `TimeScale.init` when `parser`, `round`, `isoWeekday`, the adapter's options or the locale change

## 5. P5 refactor(category): label copy kept across updates

- [ ] 5.1 Add a spec: with `labels` given, `getLabels()` returns the same array over two updates (a new one on master); with labels found in the data, `_volatile` is true
- [ ] 5.2 Keep the copy in `CategoryScale.init` when the source is unchanged and nothing was found in the data; drop it otherwise
- [ ] 5.3 Run the category specs and the `category-scale-*` spec scenarios

## 6. P6 refactor(core): change record and decision, full parse kept

- [ ] 6.1 Add specs on the private decision: none after a plain update; `[[n, 1]]` after `push`; all after a replaced array, a scale type change and an `indexAxis` change; restack after a dataset above is removed
- [ ] 6.2 Add `_changes` and `_parseInputs` to `DatasetController`; write them from the listeners, `_dataCheck`, `updateIndex` and the stack checks in `buildOrUpdateElements`; set restack when `core.controller.js` drops `_stacks`
- [ ] 6.3 Add `_parseDecision()`; keep `parse(0, count)` in `_resyncElements`

## 7. P7 feat: markDataChanged

- [ ] 7.1 Add a type test under `test/types/` and a spec: `chart.markDataChanged(0, 1, 1)` records `[1, 1]` for dataset 0; with no arguments all datasets record all
- [ ] 7.2 Add `Chart#markDataChanged` and `DatasetController#markDataChanged` with types in `src/types/index.d.ts`
- [ ] 7.3 Call it in `docs/developers/api.md`, `docs/samples/scales/time-line.md`, `docs/samples/scales/time-max-span.md` and the four specs that assign in place; add "Changing values in place" to `docs/developers/updates.md`

## 8. P8 feat: 4.7.0 warning for changes in place

- [ ] 8.1 Add specs: `data[1] = 39; update()` warns once; a second time does not; with the signal or `push` there is no warning
- [ ] 8.2 Compare the new axis values and `_custom` with the old ones outside the recorded changes during the full parse; warn once per chart, naming the dataset and the migration guide
- [ ] 8.3 Measure update CPU against master (one process per variant); keep the warning only within 3%

## 9. P9 feat!: parse only what changed (5.0.0)

- [ ] 9.1 Add specs: a time axis `parser` callback is called 0 times on an update without changes and once after a `push`; the in-place, scale, stack and found-labels scenarios of `data-updates`; bar border radius after `hide(1)`
- [ ] 9.2 Apply `_parseDecision()` in `_resyncElements`: parse ranges with the order check at both ends, restack without reading, read all for volatile category axes; remove the TODO, the full parse and P8's warning
- [ ] 9.3 Add the protected `getParseDependencies()` to `DatasetController` and `Scale`, and `static parseOnEveryUpdate`
- [ ] 9.4 Measure update time and bytes against master and master with rework-bar-chart P12, one process per variant

## 10. P10 docs: v5 migration guide

- [ ] 10.1 Write "Updating data" in `docs/migration/v5-migration.md` (create it unless another v5 piece did), and add it to `docs/.vitepress/sidebar.ts` and `docs/.vuepress/config.ts`
- [ ] 10.2 Add "give `labels`" and the signal to `docs/general/performance.md`
