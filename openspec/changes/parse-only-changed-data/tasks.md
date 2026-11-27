## 1. P1 fix(bubble): radius resolved at update

- [ ] 1.1 Add specs to `test/specs/controller.bubble.spec.js`: `radius: ctx => ctx.parsed.y` with data without `r` draws radii 5 and 8 (throws on master); `radius: 3` changed to `10` draws 10 after one update (3 on master); `parsed._custom` is the drawn radius; the hover radius of a bubble without `r` stays 7; the tooltip still shows the radius
- [ ] 1.2 Keep the given `r` apart from the resolved radius at parse; resolve the default radius in `updateElements`, and keep `_custom` the radius readers see (`getMaxOverflow`, `getLabelAndValue`, `resolveDataElementOptions` in active and inactive modes)
- [ ] 1.3 Run the bubble specs and fixtures in chromium and firefox

## 2. P2 fix: parsing option applies on the same update

- [ ] 2.1 Add specs to `test/specs/core.datasetController.spec.js`: `parsing: {yAxisKey: 'a'}` changed to `'b'`, one update, y comes from `'b'` (from `'a'` on master); `parsing: false` changed to keys leaves the user's data objects unchanged (they lose a field on master)
- [ ] 2.2 Run each controller's `configure()` before `buildOrUpdateElements` in `core.controller.js`, check the order against the `beforeElementsUpdate` hook, and start a fresh `_parsed` when the resolved `parsing` changes
- [ ] 2.3 Run the controller and plugin specs

## 3. P3 feat(helpers): listeners for sort, reverse, fill, copyWithin

- [ ] 3.1 Add specs to `test/specs/helpers.collection.unit.spec.js`: `fill(0, -2)` calls `_onDataFill` with normalised indices; `sort()`, `reverse()`, `copyWithin()` call their listener after the change; `unlistenArrayEvents` restores all nine methods
- [ ] 3.2 Extend `arrayEvents` and `ArrayListener` in `src/helpers/helpers.collection.ts`; update `etc/chart.js-helpers.api.md`
- [ ] 3.3 Add the listener methods to `DatasetController`, outside `_sync`; behaviour unchanged

## 4. P4 refactor(scale): parse dependencies and the label check

- [ ] 4.1 Add specs: the time scale's `getParseDependencies()` changes after a `time.parser` change and an adapter option change and not after a plain update; `_labelsChanged()` is true after `labels[1] = 'x'` and after labels replaced in `beforeUpdate` with `min` set, false after a plain update; a category axis reports added labels after `min: 'zz'` and after labels found in the data
- [ ] 4.2 Add the protected `getParseDependencies()` to `Scale` (none) and `TimeScale`; add `_labelsChanged()` to `Scale` and `_addedLabels()` to `CategoryScale`
- [ ] 4.3 Run the scale specs and the `category-scale-*` spec scenarios

## 5. P5 refactor(core): marks, snapshot and decision, full parse kept

- [ ] 5.1 Add specs on the private decision: nothing after a plain update; the new slot after `push`; the moved slot after `push` then `shift`; from 0 to the end after `shift` on primitive data; all after a replaced array, object data, a scale type change, an `indexAxis` change and a removed dataset above; all after any change for a controller without `parsesRanges`
- [ ] 5.2 Add `_marks` kept in step with `_parsed` by `_insertElements` and `_removeElements`, the `_parseInputs` snapshot written in `_resyncElements`, and `_parseDecision()` computed in `buildOrUpdateElements`; mark all when `core.controller.js` drops `_stacks`
- [ ] 5.3 Set `static parsesRanges = true` on the built-in controllers; keep `parse(0, count)` in `_resyncElements`

## 6. P6 feat: markDataChanged

- [ ] 6.1 Add a type test under `test/types/` and a spec: after `chart.markDataChanged(0, 1, 1)` the decision marks slot 1 of dataset 0; with no arguments every dataset reads all
- [ ] 6.2 Add `Chart#markDataChanged` and `DatasetController#markDataChanged` with types in `src/types/index.d.ts`; update `etc/chart.js.api.md`
- [ ] 6.3 Call it in `docs/developers/api.md`, `docs/samples/scales/time-line.md`, `docs/samples/scales/time-max-span.md` and the four specs that assign in place; add "Changing values in place" (since 4.7.0) to `docs/developers/updates.md`

## 7. P7 feat: 4.7.0 warning for changes in place

- [ ] 7.1 Add specs: `data[1] = 39; update()` warns once on line, pie and bubble charts; a second time it does not; with the signal, `push`, a label change or a scale change there is no warning
- [ ] 7.2 In `_resyncElements`, keep the previous parsed axis values and `_custom` of datasets whose decision says nothing changed, compare them with `Object.is` after the full parse, and warn once per chart naming the dataset and the migration guide
- [ ] 7.3 Measure update CPU against master, one process per variant; above about 3%, ship no warning and keep the comparison as a test-suite assertion

## 8. P8 feat!: parse only what changed (5.0.0)

- [ ] 8.1 Add specs: a time axis `parser` callback is called 0 times on an update without changes and once after a `push`; with fixed labels `data.shift(); data.push(4)` puts every value on its label; the in-place, scale, stack, found-labels and third-party scenarios of `data-updates`; bar border radius after `hide(1)` and after a `pop` on the top dataset
- [ ] 8.2 Apply `_parseDecision()` in `_resyncElements`: read marked slots and position-dependent tails with the order check at both ends, clear the read points' stack entries first, read all for the D1 rule 1 causes into a fresh `_parsed`, remove `_stacks` when `stacked` is turned off; remove the TODO, the full parse and P7's warning
- [ ] 8.3 Add the protected `DatasetController#getParseDependencies()`; read `parsesRanges`; update `src/types/index.d.ts` and `etc/chart.js.api.md`
- [ ] 8.4 Measure update time and bytes against master and master with rework-bar-chart P12, one process per variant

## 9. P9 docs: v5 migration guide

- [ ] 9.1 Write "Updating data" in `docs/migration/v5-migration.md` (create it unless another v5 piece did): in-place changes and `Date` objects need the signal, outside parser state, plugins and wrappers that write data, custom controllers (`parsesRanges`, `getParseDependencies()`), and that the change may still show on some charts and must not be relied on; add it to `docs/.vitepress/sidebar.ts` and `docs/.vuepress/config.ts`
- [ ] 9.2 Add "give `labels`" and the signal to `docs/general/performance.md`
