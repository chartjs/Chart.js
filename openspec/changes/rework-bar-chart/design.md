## Context

All references are to `upstream/master` at f92cce77.

**Index axis.** `BarController` (`src/controllers/controller.bar.js`) rebuilds a ruler for each dataset in `_getRuler()`: the pixels of the dataset's own values, the smallest gap (`computeMinSampleSize`, over the sorted values of all bars of the type, cached as `scale._cache.$bar`), and a stack count. Each bar then calls `_getStacks()` once or twice through `_getStackCount(index)` and `_getStackIndex(...)`. That walks every visible metaset of the type and, with `skipNull`, runs `meta._parsed.find` on each. `_getAxis()` counts the index axes of every dataset in `chart.data.datasets`, whatever its type or visibility, and multiplies the slot count by that number (added in 4.5 by #12070).

The readers found:

- `_getRuler`, `_calculateBarIndexPixels` are called by `chartjs-chart-financial` (`controller.candlestick.js:18`, `controller.ohlc.js:18`, `controller.financial.js:126`).
- `_getStackCount`, `_getStackIndex` are called by `test/specs/controller.bar.tests.js` (85-575, 1803-1804).
- `docs/migration/v3-migration.md:434-438` names the private methods.
- Nothing else in `src`, `types` or the plugins reads them. `src/types/index.d.ts:161-164` types `BarController` as a plain `DatasetController`.

What goes wrong:

- **#12262**: a line on `x2` halves the bars, because `_getAxis` counts it. PR #12263 filters by type.
- **#10193, #11101**: `computeFlexCategoryTraits` takes `prev` and `next` from `ruler.pixels`, the dataset's own data in data order. A dataset with one value spans the whole scale. Two items at one category give a gap of 0, so the thickness is 0.
- **Overlaid index axes with unequal stack counts**: the chunk is size / (own stack count × axis count), and the slot is the own stack index plus the axis number. When the scales have different stack counts, the slots disagree. Example: x holds stacks a and b, x2 holds stack c. The x2 bar comes out twice as wide, centred at 0.6 of the category. PR #12222 still assumes equal counts.
- **skipNull**: it is decided by the dataset being laid out, which drops every other dataset's nulls. With mixed per-dataset `skipNull`, bars overlap. Example: A `{skipNull: true}`, B and C `[null, 1]`; A counts 2 slots and B counts 3.
- **Cost**: O((datasets × points)²) with `skipNull`.

**Value axis and stacks.** `updateStacks` (`src/core/core.datasetController.js:152-175`) stores, per stack key and index value, each dataset's value. It also stores `_top`, the last visible dataset with a positive value, and `_bottom`, the last with a negative value. It runs only when data is parsed.

The bar reads these values in three places:

- `setBorderSkipped` (218-227) and the `enableBorderRadius` test (410) read `(stack._bottom || 0) === index`. A positive-only stack has `_bottom === null`, so dataset 0 is taken as the bottom (#11721, #10245).
- `hide()` and `show()` do not parse, so after hiding the top dataset the new top keeps square corners.
- `_visualValues` is written by `_calculateBarValuePixels` when `minBarLength` lengthens a stacked bar (615), and read through `applyStack` by the datasets updated after it. With `order` it is read before it is written, and it is never reset.

`minBarLength` has these problems:

- A 0 value is centred on its start even inside a stack, which leaves a gap of half the length (#11515).
- A bar outside the range is clamped into view (#10157, #11667).
- A bar whose base is below `min` but which shows less than `minBarLength` is not lengthened (#10487).

Other value-axis faults:

- **#12197, #11730**: a floating bar adds its `start` to the stack offset (`start += value`, 586), so floating bars in a stack move.
- **#11714**: `setInflateAmount` gives 0.33 when `ratio === 1`, which is always so with `barThickness`. The element inflates even a 0-length rect, so a 0.66 px line shows.

**Interaction.** `src/core/core.interaction.js` has three relevant faults:

- `getIntersectItems` (122) drops an element whose `x/y`, the bar's head, is outside the chart area. So a bar cut off by `max` cannot be hovered with `intersect: true`.
- `getNearestCartesianItems` (179-185) needs the centre in the area or the pointer in range. A bar whose base is below `min` has its centre outside the area (#11733).
- `index` mode uses `options.axis || 'x'` (272) whatever `indexAxis` is (#10312).

**#11646** comes from overlapping bars: the index axis is not stacked and the datasets share a stack name, so they share one slot. Nearest-centre then picks a bar under another one.

**Other designs.**

- `rework-options` P6 (PR #12334) makes `base` per bar in `_calculateBarValuePixels`.
- `rework-legend` P18 makes hidden bars leave the value axis.
- The open `rework-ticks` design (PR #12492) changes `computeMinSampleSize` (its P16).
- PR #12505 renames `controller.bar.tests.js` to `controller.bar.spec.js`.
- PR #12499 renames the core specs.

## Goals / Non-Goals

**Goals**

- One index-axis layout per scale and bar type, read by every bar, with today's results except where a fix below changes them.
- Stack ends computed from the visible segments on every update, and the bar's private stack fields removed from core.
- The index-axis, stacking, `minBarLength` and interaction bugs listed in the proposal.
- `minBarThickness` and `barAlign`.
- The bar element and controller in TypeScript.

**Non-Goals**

- **Element drawing.** Out of scope:
  - stroked or dashed borders (#6686, #11341, #12103);
  - a radius for the whole stack (#11958, #10060);
  - the seams of the two-fill border (#12094, #9906, #10477).
  P3 documents that `borderDash` does not apply to bars.
- **Several values at one index in a dataset** (#9080, #11202), and line points aligned to bar slots (#10756, #11610).
- **Category widths that vary** (#11731), aligning the categories themselves (#5822), and a thickness per bar (#9775). Each is a scale feature or needs its own design.
- **Hiding data items.** The value axis (rework-legend P18), widening the remaining bars (#11319), and the gap a hidden item leaves in a stack go to a follow-up issue.
- **Time-scale ticks** (#11545, #10258's offset grid): rework-ticks.
- **Hit testing.** #10401 is won't-do: the hit area is the drawn shape. After P13 `minBarLength` is the visible length, and after P17 `index` mode follows the index axis.
- **#12162** (UMD "before initialization") is not bar code and is not reproduced from source.

## Decisions

### D1. TypeScript first, after the open bar PRs land

`element.bar.js` (P2) and `controller.bar.js` (P4) become `.ts` with no behaviour change, following `element.arc.ts` and `element.point.ts`:

- Public types stay in `src/types/index.d.ts`.
- Imports keep `.js` paths.
- Internal interfaces (`BarProps`, `BarMeta`, `BarParsed`, `BarRuler`) live in the files.

`controller.bar.ts` is the first `.ts` file that extends a JS class (`DatasetController`), so inherited types are loose and are narrowed locally. The unused, wrong `center` that `_calculateBarValuePixels` returns is dropped.

P4 waits for #12334 (rework-options P6) and #12331 to merge. #12263 is adopted as P1; #12335, #12222 and #11898 are closed as superseded or adopted (D9). Converting first and making every author rebase onto `.ts` was the alternative. It costs six contributors a rebase for no gain, since those PRs are small and near ready.

### D2. The index layout is a module, cached per scale and type

New `src/controllers/controller.bar.layout.ts` holds pure functions over the metas and the scale. `computeMinSampleSize` and `getAllScaleValues` move there, and the tick loop stays a separate block for rework-ticks P16. It is cached as `scale._cache.$barLayout`, a map from controller type to:

```ts
interface IndexLayout {
  type: string;
  values: number[];   // sorted unique index values of the visible datasets of `type` on the band
  pixels: number[];   // pixel of each value
  min: number;        // smallest gap among values and ticks
  groups: (string | undefined)[];                   // stack groups of the grouped visible datasets, in sorted-meta order
  groupsAt(value: number): (string | undefined)[];  // groups present at a value, for skipNull
  slot(meta, value?: number): {index: number; count: number};
}
```

How the cache is filled and dropped:

- It is built on first read during a dataset update, after layout, so the pixels are final.
- It is dropped in the scale's `beforeLayout`, as `$bar` is today.
- It is also dropped in a `BarController.configure()` override, because new controllers are `reset()` before `_updateDatasets` configures the existing ones (`core.controller.js:516-525`, `652-663`).
- The width (`categoryPercentage`, `barPercentage`, `barThickness`, `maxBarThickness`, `minBarThickness`) stays per dataset.

The alternatives were a ruler shared through the chart, which has no lifetime hook, and keeping the per-dataset ruler while fixing each bug in place, which keeps the quadratic walks. Neither was taken.

### D3. Private methods kept

These are kept with the same results, reading the layout:

- `_getRuler()` keeps `{min, pixels, start, end, stackCount, scale, grouped, ratio}` and adds `layout`.
- `_calculateBarIndexPixels(index, ruler)` ignores a third argument (financial passes `options`).
- `_getStacks`, `_getStackCount` and `_getStackIndex`.
- `getFirstScaleIdForIndexAxis()` has no underscore, so it stays unchanged.

`_getAxis` and `_getAxisCount` are removed: they are private, were added in 4.5, and have no outside reader. Overriding `_getStacks` no longer changes the layout; no overrider was found.

### D4. Slots are shared by index scales with the same pixel range (the band rule)

Index scales on one axis share a slot list when their start and end pixels are equal. Within a band:

- scales are ordered by their first dataset;
- a dataset's slot is the slot counts of the earlier scales plus its own group index;
- the count is the sum over the band;
- only visible, grouped datasets of the same type count;
- `iScale` is taken from the meta, not from `chart.options.indexAxis`.

This covers #12070 (its fixture is unchanged), #12222 (stacked axes have different ranges, so they are laid out apart) and unequal counts. The alternatives were grouping by the scale's `stack` option (PR #12222), which is still wrong with unequal counts, and treating every scale on its own, which reverts #12070.

### D5. Slot lists stay per controller type

A controller that extends bar with another id keeps its own slot list. chartjs-chart-financial's candles overlay volume bars through this. #12001 is this behaviour: its custom type and plain bars overlay, and hiding a plain dataset re-slots only the plain ones. It is answered on the issue, not changed. Sharing slots across every bar-derived type would break the overlays that work today.

### D6. Flex uses the shared values, skipNull the holder's null

- Flex neighbours are the previous and next entries of the layout's `values`.
- With `skipNull`, the dataset whose value is null frees its slot, and every dataset at that value sees the same list.

Chart-wide `skipNull` gives the same output as today. The docs already describe skipNull as per dataset.

### D7. Stack ends are a module, computed per layout

New `src/controllers/controller.bar.stacks.ts`:

```ts
interface BarSegment { datasetIndex: number; side: 1 | -1; start: number; end: number; base?: number; head?: number }
interface BarStackInfo {
  segments: Map<number, BarSegment>;   // by dataset index
  first: {[side in 1 | -1]?: number};  // innermost dataset index per side
  last: {[side in 1 | -1]?: number};   // outermost dataset index per side
}
// vScale._cache.$barStacks: WeakMap<StackEntry, BarStackInfo>
```

How it is keyed, built and read:

- **Key:** the stack object core already shares per stack key and index value, `parsed._stacks[vAxis]`.
- **Building:** it is built lazily from `chart._getSortedDatasetMetas(true)` in stacking order. Zero values are left out of `first`/`last`. Datasets of other types under the same stack name count toward the offsets, as today. The pixel pass (P12) fills `base` and `head` in stacking order, so a short segment's length is known before the next one reads it.
- **Readers:** `enableBorderRadius` (the bar is the `last` of its side, or floating, or not stacked) and `setBorderSkipped('middle')`. The middle rule skips the inner edge unless the bar is the `first` of its side and the other side is empty, and the outer edge unless it is the `last`.

P15 then removes `_top`, `_bottom` and `_visualValues` from core, and core's `applyStack` reads plain values again. The alternative, recomputing `_top`/`_bottom` in core on hide and show (PR #12335's direction), keeps a bar-only field in core and still reads `_bottom` as the wrong end.

### D8. Floating bars take no room in a stack

`updateStacks` stores `controller._stackValue(item, vAxis)`, a private hook whose default is `item[vAxis]`. The bar returns `NaN` for floating items, and core's `applyStack` already skips non-finite values. `updateRangeFromParsed` uses only `[min, max]` for floating items. Today's offset is by the far ends of earlier segments, which has no coherent use. The alternative was a `floatingBarMode` option (#12197). *Pending the user's answer (Open Questions).*

### D9. Open pull requests

- **#12263**: adopted as P1 for 4.6.3, with a spec, crediting the author. P6 replaces its code.
- **#12222**: closed with credit as superseded by P6. Its category-labels half is already on master (`isolate-category-scale-labels`). Its sample becomes P6's fixture.
- **#12335**: closed with credit as superseded by P10. Its spec cases move in. Its `start === 0` test is wrong when `base` is set, and it still fails after the top dataset is hidden.
- **#11898**: adopted as P19 with `Co-authored-by`. It waits behind the conversion.
- **#12334, #12331**: merge before P4.

### D10. Shared files

- **`src/types/index.d.ts`** is held by 14 open PRs in unrelated sections. P19 and P20 wait only on #11898, the one that edits the bar options. They rebase over the others, which do not touch the bar section.
- **`src/core/core.datasetController.js`** is held by #12332, #12284, #12241, #12176 and #12172. P11 and P15 rebase over them rather than waiting: none touches `updateStacks` or `applyStack`. A builder who finds a conflicting hunk stops and reports it.
- **New spec files.** New specs go to `test/specs/controller.bar.layout.spec.js` (index axis) and `test/specs/controller.bar.value.spec.js` (value axis). The index-axis and value-axis pieces then do not share a test file. `controller.bar.spec.js` (after #12505) keeps the existing specs.

## Risks / Trade-offs

- **Every piece from P4 on edits `controller.bar.ts`.** So P4 to P15, P19 and P20 are built one after another. Only P1 to P3, P16 to P18, and P15 after P12 run beside them.
- **Visible changes.** P11 (floating bars), P13 (bars outside the range no longer drawn at the edge), P14 (zero-length bars centred), P17 (`index` mode on horizontal charts) and P18 (the top item wins) change what users see. Each is a minor release with a release-note line. The existing image fixtures must stay unchanged unless the piece says which one changes and why.
- **Third-party plugins.** Plugins reading `_top`, `_bottom` or `_visualValues`, or overriding `_getAxis` or `_getStacks` to change the layout, break or lose effect. P15's and P6's release notes say so. Financial's calls are covered by D3 and checked by a spec that calls `_getRuler()` and `_calculateBarIndexPixels(i, ruler, options)`.
- **Stale layout.** The layout is stale when a plugin cancels `beforeLayout`, as `$bar` is today.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | fix: only bar datasets count as index axes (adopts #12263) | `src/controllers/controller.bar.js`, `test/specs/controller.bar.spec.js` | labels a, b, c; bars on `x`, a line on a category `x2`: bar width 0.36 × category on master, expect 0.72 × | ~40 | #12505 | | #12262 |
| P2 | refactor: `element.bar.js` in TypeScript | `src/elements/element.bar.js` → `.ts` | none: `tsc`, `pnpm lint-types` and every bar fixture unchanged | ~150 | | | |
| P3 | docs: bar borders are fills; `borderDash` does not apply | `docs/charts/bar.md` | none (docs) | ~10 | #11898 (D9) | | #11341 |
| P4 | refactor: `controller.bar.js` in TypeScript | `src/controllers/controller.bar.js` → `.ts` | none: `tsc`, every bar spec and fixture unchanged | ~350 | P1, P2, #12334, #12331 | | |
| P5 | refactor: the index layout module; the private methods read it with today's results | `controller.bar.layout.ts` (new), `controller.bar.ts`, `test/specs/controller.bar.layout.spec.js` (new) | 3 datasets × 1000 points with `skipNull`: `meta._parsed.find` called 18 000 times on master, expect 0; a spec calls `_getRuler()` and `_calculateBarIndexPixels(i, ruler, options)` as financial does; all fixtures unchanged | ~300 | P4 | | |
| P6 | fix: index scales with the same range share the slots | `controller.bar.layout.ts`, `controller.bar.ts`, layout spec, 2 fixtures | stacked `x`/`x2` (`stack: 'g'`), one bar each: 0.36 × own category, off-centre on master, expect 0.72 ×; overlaid `x` {a, b} + `x2` {c}: the x2 bar twice as wide on master, expect equal; `stacked-and-multiple-axis` unchanged | ~150 | P5 | | |
| P7 | fix: flex neighbours from all bars on the scale | `controller.bar.layout.ts`, layout spec | labels A, B, C at 300 px, dataset 0 `[{x:'B', y:5}]`, dataset 1 `[1, 2, 3]`, flex, percentages 1: dataset 0 spans 0-150 px on master, expect 100-150; two items at one category: thickness 0 on master, expect the share | ~80 | P6 | | #10193, #11101 |
| P8 | fix: skipNull frees the slot of the dataset that holds the null | `controller.bar.layout.ts`, `docs/charts/bar.md`, layout spec | A `{skipNull: true, [1, 1]}`, B `[1, 1]`, C `[null, 1]`: A and B overlap at 'a' on master, expect 3 equal slots; skipNull fixtures unchanged | ~80 | P7, P3 | | |
| P9 | fix: zero-length bars draw nothing | `controller.bar.ts`, `test/specs/controller.bar.value.spec.js` (new) | `barThickness: 10`, `[5, 0]`: `inflateAmount` 0.33 on master, expect 0; same after `toggleDataVisibility(1)` | ~50 | P6 | | #11714 |
| P10 | fix: stack ends from the visible segments | `controller.bar.stacks.ts` (new), `controller.bar.ts`, value spec | `middle`, radius 12, `[[10, 10], [null, 10]]`: dataset 0 skips `bottom` on master, expect none; default `'start'`, `[[10], [10]]`, `hide(1)`: dataset 0 `enableBorderRadius` false, expect true; `middle`, `hide(1)`: `{top: true}`, expect `{}`; #12335's cases | ~260 | P9 | | #11721, #10245 |
| P11 | feat: floating bars keep their values in a stack | `src/core/core.datasetController.js`, `controller.bar.ts`, `controller.bar.stacks.ts`, `docs/charts/bar.md`, value spec | stacked `[[[0, 5]], [[5, 9]]]`: dataset 1 at 10-14 and y max 14 on master, expect 5-9, max ≈ 9; `[[[0, 5]], [3]]`: dataset 1 starts at 5, expect 0 | ~180 | P10, P8 | | #12197, #11730 |
| P12 | fix: short stacked segments chain without gaps | `controller.bar.stacks.ts`, `controller.bar.ts`, value spec | stacked, `minBarLength: 10`, `[[0], [50]]`: dataset 1's base 5 px from dataset 0's head on master, expect equal; same with swapped `order`; same after a resize from small to large | ~250 | P11 | | #11515 |
| P13 | feat: `minBarLength` is the visible length | `controller.bar.ts`, `docs/charts/bar.md`, value spec | `y.min: 10`, `[10, 50]`, `minBarLength: 5`: 0 px on master, expect 5; y 10-20, `[[5, 5]]`, `minBarLength: 6`: 6 px at the bottom edge on master, expect none in the area; `toggleDataVisibility(1)`: height 5 on master, expect 0; the 10 minBarLength fixtures unchanged | ~220 | P12 | #11667 | #10487, #7174, #11254 |
| P14 | feat: zero-length bars centre on their value | `controller.bar.ts`, value spec | y 0-10, `[[5, 5]]`, `minBarLength: 10`: base at px(5), head 10 px above on master, expect ±5 | ~60 | P13 | | #11667 |
| P15 | refactor: `_top`, `_bottom` and `_visualValues` leave core | `src/core/core.datasetController.js`, `test/specs/core.datasetController.spec.js` | none (refactor); the `_stacks` specs updated | ~80 | P11, P12, #12499 | | |
| P16 | fix: bars cut off by the chart area are found through their visible part | `src/core/core.interaction.js`, `element.bar.ts` (private `_getAreaCenter`), `test/specs/core.interaction.spec.js` | `y.min: 1`, `[1.5, 10]`, nearest, `intersect: false`, `axis: 'x'`: bar 1 on master, expect bar 0; `y.max: 50`, `[100, 20]`, index, intersect, inside bar 0: `[]` on master, expect bar 0; the point spec "out-of-range datapoints are not shown in tooltip" still passes | ~150 | P2, #12499 | | #11733 |
| P17 | feat: `index` mode follows `indexAxis` | `src/core/core.interaction.js`, `docs/configuration/interactions.md`, interaction spec | `indexAxis: 'y'`, `[10, 2]`, index, `intersect: false`, pointer in row 0 at px(2): index 1 on master, expect 0 | ~50 | P16 | | #10312 |
| P18 | feat: the item drawn on top wins | `src/core/core.interaction.js`, interaction spec | `indexAxis: 'y'`, `x.stacked: false`, `[5]`, `[9]`, `[10]` with one stack name, pointer at 6: dataset 2 on master, expect dataset 1; line and scatter interaction specs unchanged | ~80 | P17 | | #11646 |
| P19 | feat: `minBarThickness` (adopts #11898) | `controller.bar.ts`, `src/types/index.d.ts`, `docs/charts/bar.md`, layout spec | #11898's spec: `minBarThickness: 1000` gives width 1000 for grouped and non-grouped bars; `maxBarThickness` wins | ~70 | P14, P13, P8 | | |
| P20 | feat: `barAlign` places bars on their value | `controller.bar.layout.ts`, `controller.bar.ts`, `src/types/index.d.ts`, `docs/charts/bar.md`, layout spec, a fixture | time axis, 5-minute data, `offset: false`, `barAlign: 'start'`: bar centred on master, expect its left edge at the value | ~150 | P19 | | #9748 |

**Parallel:**

- P1, P2 and P3 can be built at once.
- P16 to P18 run beside the controller chain once P2 and #12499 have merged.
- P15 runs beside P13 and P14.
- Everything else is ordered by `controller.bar.ts`.

**Release lines:**

- Patch (4.6.x): P1 to P10, P12, P15, P16.
- Minor (4.7.0), each with a release-note line: P11, P13, P14, P17, P18, P19, P20.

**Closed with a comment, no piece:**

- #11660: done by #12377.
- #10360: a scriptable `borderSkipped`.
- #10401: won't do.
- #12001: D5.
- #12162: not bar code; needs a reproduction against 4.6.x.
- #10258, #11545: rework-ticks.
- #11361, #12000: see Open Questions.

## Contracts

- **P4 → all later pieces:** `src/controllers/controller.bar.ts` and `src/elements/element.bar.ts` exist. `BarMeta`, `BarParsed` (`_custom`, `_stacks`) and `BarRuler` are exported from the controller file for its sibling modules.
- **P5 → P6, P7, P8, P20:** `getIndexLayout(controller): IndexLayout` (D2), cached in `scale._cache.$barLayout` and dropped in `beforeLayout` and `configure()`. `_getRuler()` returns `{min, pixels, start, end, stackCount, scale, grouped, ratio, layout}`. `ratio` is 1 when `barThickness` is set.
- **P5 → P9:** `updateElements` still calls `_calculateBarValuePixels`, `setBorderSkipped` and `setInflateAmount` for each bar, and `ruler.ratio` keeps its meaning.
- **P10 → P11, P12, P15:** `getStackInfo(vScale, parsed): BarStackInfo | undefined` (D7), cached in `vScale._cache.$barStacks`. A non-finite stack value is no segment.
- **P11 → P15:** `DatasetController#_stackValue(item, vAxis): number` (private; default `item[vAxis]`).
- **P12 → P15:** nothing reads `_visualValues` any more.
- **P16 → P17, P18:** `getIntersectItems` and `getNearestCartesianItems` use `element._getAreaCenter(chartArea, useFinalPosition)` when the element has it. It returns `{x, y}` or `null`.

## Open Questions

1. **Floating bars in a stack (P11).** (a) Always at their own values. (b) A `floatingBarMode` option. (c) Keep today's offset. Recommended: (a).
2. **Bars outside the value range (P13).** Stop drawing them at the edge, or keep the #10157 clamp? Recommended: stop.
3. **Zero-length bars (P14).** Centre them on their value (never inside a stack), or keep growing them in the sign direction? Recommended: centre.
4. **`index` mode and `indexAxis` (P17).** This changes horizontal charts that use `index` without `axis`. Should `nearest` follow too? Recommended: only `index`, plus a docs line for `nearest`.
5. **The top item wins (P18).** (a) For all element types. (b) For bars only. (c) Docs only. Recommended: (a).
6. **The band rule (D4)** and **slot lists per type (D5)**: confirm, or prefer grouping by the scale's `stack`, or one list for all bar-derived types.
7. **skipNull (D6):** the holder's null frees its slot. Recommended: yes.
8. **Option name for P20:** `barAlign: 'center' | 'start' | 'end'` as a dataset option (recommended), or `categoryAlign`.
9. **Removed private fields (P15, D3):** `_top`, `_bottom`, `_visualValues`, `_getAxis` and `_getAxisCount`, in a minor release with a note. Recommended: yes.
10. **Open PRs (D9):** adopt #12263 for 4.6.3; close #12222 and #12335 as superseded; adopt #11898 into P19. Recommended: yes.
11. **#11361 and #12000** have no confirmed cause: their samples could not be opened. Candidates:
    - #11361: numbers against string labels in the category scale.
    - #12000: `skipNull` over thousands of points (P5 removes the walks), or repeated x values (#9080).
    Recommended: open both samples before P5 is built, and claim them in P5 or P8 only with a failing input.
