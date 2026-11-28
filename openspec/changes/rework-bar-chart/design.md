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
- **Overlaid index axes with unequal stack counts**: the chunk is size / (own stack count × axis count), and the slot is the own stack index plus the axis number. When the scales have different stack counts, the slots disagree. Example: x holds stacks a and b, x2 holds stack c. The x2 bar comes out twice as wide, centred at 0.7 of the category. PR #12222 still assumes equal counts.
- **skipNull**: it is decided by the dataset being laid out, which drops every other dataset's nulls. With mixed per-dataset `skipNull`, bars overlap. Example: A `{skipNull: true}`, B and C `[null, 1]`; A counts 2 slots and B counts 3.
- **Cost**: O((datasets × points)²) with `skipNull`.

**Value axis and stacks.** `updateStacks` (`src/core/core.datasetController.js:152-175`) stores, per stack key and index value, each dataset's value. It also stores `_top`, the last visible dataset with a positive value, and `_bottom`, the last with a negative value. It runs only when data is parsed.

The bar reads these values in three places:

- `setBorderSkipped` (218-227) and the `enableBorderRadius` test (410) read `(stack._bottom || 0) === index`. A positive-only stack has `_bottom === null`, so dataset 0 is taken as the bottom (#11721, #10245).
- `hide()` and `show()` do not parse, so after hiding the top dataset the new top keeps square corners.
- `_visualValues` is written by `_calculateBarValuePixels` when `minBarLength` lengthens a stacked bar (615), and read through `applyStack` by the datasets updated after it. With `order` it is read before it is written, and it is never reset.

`minBarLength` has these problems:

- A 0 value is centred on its start even inside a stack, which leaves a gap of half the length (#11515).
- PR #10157 (the fix of #10005) keeps a lengthened bar inside the chart area, so a zero value at the axis edge is drawn whole rather than cut in half. That is right while the bar's value is in the range, but the same clamp also draws a bar entirely outside the range at the edge (#11667).
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
- **Hit testing.** #10401 is won't-do: the hit area is the drawn shape. After P14 `minBarLength` is the visible length, and after P17 `index` mode follows the index axis.
- **#12162** (UMD "before initialization") is not bar code and is not reproduced from source.
- **Requests that are not this change** (each closed or left open with a comment, see the list after the pieces table): stacking by the value axis inside groups (#11556), superimposed bars (#11998, answered by `grouped: false` and `order`), waterfalls of several stacks (#11323), segmented bars (#12022), swapping bars by animation (#11367), the same row height across charts (#5409), the order of stacked scales (#9918, a scale question), lines following `minBarLength` (#11254, won't do).

## Decisions

### D1. TypeScript first, after the open bar PRs land

`element.bar.js` (P2) and `controller.bar.js` (P4) become `.ts` with no behaviour change, following `element.arc.ts` and `element.point.ts`:

- Public types stay in `src/types/index.d.ts`.
- Imports keep `.js` paths.
- Internal interfaces (`BarProps`, `BarMeta`, `BarParsed`, `BarRuler`) live in the files.

`controller.bar.ts` is the first `.ts` file that extends a JS class (`DatasetController`), so inherited types are loose and are narrowed locally. The unused, wrong `center` that `_calculateBarValuePixels` returns is dropped.

P4 waits for #12334 (rework-options P6) and #12331 to merge. #12263 is adopted as P1; #12335, #12222 and #11898 are closed as superseded or adopted (D9). Converting first and making every author rebase onto `.ts` was the alternative. It costs six contributors a rebase for no gain, since those PRs are small and near ready.

### D2. The index layout is a module, cached per scale and type

New `src/controllers/controller.bar.layout.ts` holds pure functions over the metas and the scales. `computeMinSampleSize` and `getAllScaleValues` move there; the tick loop stays a separate block, so rework-ticks P16 ("skip the end gap") can edit it there. The layout has two levels, because index scales that share a pixel range (D4) need not share their values: a category `x2` can have other labels, or be linear.

```ts
interface ScaleLayout {      // per index scale and controller type: scale._cache.$barLayout.get(type)
  values: number[];          // sorted unique index values of the visible datasets of the type on this scale
  pixels: number[];          // pixel of each value, on this scale
  min: number;               // smallest gap among values and this scale's ticks
}
interface BandLayout {       // per band (index scales with the same start and end pixel) and type
  groups: (string | undefined)[];                    // stack groups by scale, then sorted-meta order of all grouped datasets (D15)
  groupsAt(scale, value: number): (string | undefined)[]; // groups present at a value, for skipNull
  slot(meta, value?: number): {index: number; count: number};
}
```

- Both are built on first read during a dataset update, after layout, so pixels are final. The band layout is cached on the band's first scale.
- They are dropped in the scale's `beforeLayout` (as `$bar` is today) and in a `BarController.configure()` override, because new controllers are `reset()` before `_updateDatasets` configures the existing ones (`core.controller.js:516-525`, `652-663`).
- The width (`categoryPercentage`, `barPercentage`, `barThickness`, `maxBarThickness`, `minBarThickness`) stays per dataset.
- Values are keyed by type. Master's `$bar` holds the values of whichever type asked first (`controller.bar.js:8-17`), so a second bar-derived type on the same scale (financial candles over volume bars) used the first type's gap. Each type uses its own values from P21, a fix with its own release-note line; P5 keeps master's shared values so that it changes no output.

Rejected: a ruler shared through the chart (no lifetime hook); keeping the per-dataset ruler and fixing each bug in place (keeps the quadratic walks); one value list per band (wrong when the scales' values differ: review).

### D3. Private methods kept

- `_getRuler()` keeps `{min, pixels, start, end, stackCount, scale, grouped, ratio}` and adds `layout`; `ratio` is 1 when `barThickness` is set.
- `_calculateBarIndexPixels(index, ruler)` keeps `{base, head, center, size}` and ignores a third argument (financial passes `options`).
- `_getStacks`, `_getStackCount`, `_getStackIndex` return what they return today, read from the layout. Overriding them no longer changes the layout; no overrider was found.
- `getFirstScaleIdForIndexAxis()` has no underscore and stays unchanged.
- `_getAxis` and `_getAxisCount` are removed: private, added in 4.5, no outside reader.

### D4. Slots are shared by index scales with the same pixel range (the band rule)

Index scales on one axis are a band when their start and end pixels are equal. Within a band, scales are ordered by their first dataset; a dataset's slot is the slot counts of the earlier scales plus its own group index, and the count is the sum over the band. Only visible, grouped datasets of the same type count, and `iScale` comes from the meta, not from `chart.options.indexAxis`. This covers #12070 (its fixture is unchanged), #12222 (stacked axes have different ranges, so they are laid out apart) and unequal counts. Rejected: grouping by the scale's `stack` option (PR #12222), still wrong with unequal counts; every scale on its own, which reverts #12070.

### D5. Slot lists stay per controller type

A controller that extends bar with another id keeps its own slot list. chartjs-chart-financial's candles overlay volume bars through this. #12001 is this behaviour and is answered on the issue. Rejected: one slot list for every bar-derived type, which breaks the overlays that work today.

### D6. Flex uses the scale's values; a null frees its slot when skipNull is on in the band

- Flex neighbours are the previous and next entries of the scale's `values`.
- A null, undefined or NaN value frees its dataset's slot at that index value when any dataset of the type in the band has `skipNull`, and every dataset at that value sees the same slots. A dataset that has several entries at one index value takes a slot there when any of them has a value; master looks only at the first entry, so a null first entry hid a slot that a later entry then drew into (#11361). Chart-wide `skipNull` and `skipNull` on the dataset that should widen (master's reading) both give the same output as today; the overlap of mixed settings goes away. Rejected (review): freeing only the holder's own null, which changes charts where `skipNull` is set on the dataset that should widen.

### D7. Stack ends are a module, computed per stack on first read

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

- Keyed by the stack object core already shares per stack key and index value (`parsed._stacks[vAxis]`).
- `first`/`last` are found among the visible datasets of the bar's own type in stacking order (`order`, then index), as master's `getLastIndexInStack` filters by type; zero and non-finite values are no segment. Datasets of other types under the same stack name still count toward the offsets, as today.
- From P11 the first bar that reads a stack computes every segment's `base` and `head` in stacking order, reading each dataset's own `minBarLength` and `base` through its controller. Datasets update in index order (`core.controller.js:652-663`) while stacks follow `order`, so a pass filled bar by bar cannot see a later-updated segment (review).
- Dropped in `beforeLayout` and in `configure()`, as the index layout.
- Readers: `enableBorderRadius` (the bar is the `last` of its side, or floating, or not stacked) and `setBorderSkipped('middle')`: skip the inner edge unless the bar is the `first` of its side and the other side is empty, and the outer edge unless it is the `last`.
- P12 then removes `_top`, `_bottom` and `_visualValues` from core; core's `applyStack` reads data values again. Lines and scatters stacked with bars under one stack name then sit on the data values, not on a bar lengthened by `minBarLength`; P12's release note says so.

Rejected: recomputing `_top`/`_bottom` in core on hide and show (PR #12335's direction), which keeps a bar-only field in core and still reads `_bottom` as the wrong end.

### D8. Floating bars take no room in a stack

`updateStacks` stores `controller._stackValue(item, vAxis)`, a private hook whose default is `item[vAxis]`. The bar returns `NaN` for floating items; core's `applyStack` already skips non-finite values. `updateRangeFromParsed` uses only `[min, max]` for floating items. Today's offset is by the far ends of earlier segments, which has no coherent use. Rejected: a `floatingBarMode` option (#12197).

### D9. Open pull requests

- #12263: adopted as P1 for 4.6.3, with a spec and credit. P6 replaces its code.
- #12222: closed with credit as superseded by P6. Its category-labels half is on master (`isolate-category-scale-labels`). Its sample becomes P6's fixture.
- #12335: closed with credit as superseded by P10; its spec cases move in. Its `start === 0` test is wrong when `base` is set, and it still fails after the top dataset is hidden.
- #11898: adopted as P19 with `Co-authored-by`, after the conversion.
- #12334, #12331 and #12566 merge before P4. #12566 looks up `skipNull` values by position or binary search in sorted data (3-16× faster `skipNull` updates in 4.6.x); P5 then replaces the lookup with the layout's values.

### D10. Shared files and other designs

- `src/types/index.d.ts` is held by 14 open PRs in unrelated sections. P19 and P20 wait only on #11898, the one that edits the bar options, and rebase over the others.
- `src/core/core.datasetController.js` is held by #12332, #12284, #12241, #12176 and #12172, none of which touches `updateStacks` or `applyStack`. P12 and P13 rebase over them; a builder who finds a conflicting hunk stops and reports it.
- `docs/charts/bar.md` is held by #11898, which P19 adopts. Pieces before P19 rebase over it; none waits on it (that wait made a cycle: review).
- New specs go to `test/specs/controller.bar.layout.spec.js` (index axis) and `test/specs/controller.bar.value.spec.js` (value axis), so the two chains share no test file. `controller.bar.spec.js` (after #12505) keeps the existing specs.
- rework-ticks (open design, PR #12492) P16 changes `computeMinSampleSize`. If it lands before P5, P5 moves its change; otherwise rework-ticks P16 edits the function in `controller.bar.layout.ts`. Its bar-on-time fixture guards P5 as well.
- rework-legend P18 adds a protected hook "is this data item left out of bounds" (bar: `!getDataVisibility(i) || meta.data[i]?.hidden`) and edits `controller.bar.js`. If it lands before P4, P4 converts it; otherwise it is written in TypeScript. P14 reads that hook for hidden items and waits for it.

### D12. The user's answers (2026-11-26)

- **Floating bars in a stack** are drawn at their own values (D8, P13). The alternatives were a `floatingBarMode` option or keeping today's offset.
- **Bars entirely outside the value range** are not drawn. `minBarLength` is the visible length (P14). The #10157 clamp stays for bars whose value is in the range (D14).
- **Zero-length unstacked bars** that `minBarLength` lengthens are centred on their value. Stacked segments never are (P15).
- **`index` mode** without `axis` follows `indexAxis` when it is `'x'` or `'y'` (P17). For `nearest` there is a docs line only.
- **The top-drawn rule** applies to bars only, through the bar element's hook. Points keep the nearest-distance rule and ties (P18).
- **New options:** `minBarThickness` (P19, adopting #11898) and `barAlign: 'center' | 'start' | 'end'` as a dataset option (P20) are both built.
- **Open PRs:** #12263 and #11898 are adopted with credit. #12222 and #12335 are closed as superseded, with credit (D9).
- **Held files:** pieces rebase over open PRs that edit other sections of `index.d.ts` and `core.datasetController.js`, and wait only on PRs in the same section (D10).
- **Multi-axis and types:** the band rule (D4) and per-type slot lists (D5) are confirmed.
- **Private fields:** `_top`, `_bottom`, `_visualValues`, `_getAxis` and `_getAxisCount` are removed, with release-note lines.

### D11. What the plan review changed

- **Index layout (D2):** values, pixels and the smallest gap stay per scale. Only the slots are shared by a band, because overlaid scales can have other labels.
- **skipNull (D6):** nulls free slots when any dataset in the band has `skipNull`, not only the holder's. Freeing only the holder's narrowed charts that work on master.
- **Stack ends (D7):** ends come from the bar's own type. The segment pixels are computed for the whole stack on first read, because datasets update in index order and stacks follow `order`. The stack cache is also dropped in `configure()`.
- **Order of the value-axis pieces:** the chaining fix (P11) and the core cleanup (P12) come before the floating-bar change (P13), so they can ship as patches.
- **Waits:** P3 no longer waits on #11898, which made a cycle. P5 is ordered against rework-ticks P16, and P14 against rework-legend P18's hidden-item hook.
- **P11's failing inputs** are now ones that fail on master. The earlier ones passed there.
- **Interactions:** P16 also moves the tooltip anchor of a cut-off bar. P17 states its rule and keeps radar unchanged. P18 is for bars only (D12), because for points it changes ties and close points.
- **Issue outcomes:** #11254 is answered (won't do), not closed by a fix. #11730 and #11290 are advanced by P13. Ten issues without an outcome got one (Non-Goals and the close list).

### D14. The minBarLength clamp and commit types (2026-11-27)

- **The clamp of #10157 stays for bars in the range.** The design first listed #10157 as a fault and removed its clamp. #10157 is the fix of #10005: a zero value at the edge of the value range (`beginAtZero`, `[0]`, `minBarLength: 20`) is centred on its value and then moved inside the chart area, so it shows its whole length. Removing the clamp brings #10005 back and changes the `minBarLength/vertical-pos`, `vertical-neg` and `horizontal-pos` fixtures. P14 skips only bars entirely outside the value range. P15 centres a zero-length bar when the centred bar fits in the chart area and otherwise moves it inside, as master does. The 10 `minBarLength/*` fixtures stay unchanged through P14 and P15. User's choice; the alternative was to remove the clamp with a release-note line.
- **Commit types say what the release contains.** Releases come from master, and the release notes come from the pull request titles.
  - P5 is `perf:` and changes no output. Keying the values by bar type (D2) changes the gap of a second bar-derived type on one scale, so it is its own `fix:` piece, P21.
  - The line stacked on a bar lengthened by `minBarLength` moves to the data value in P11, which stops writing `_visualValues`, not in P12. Its release-note line goes with P11, and P12 removes fields nothing reads any more.
  - P13 changes what users see in a minor release with a release-note line. The proposal calls it a behaviour change, not **BREAKING**, which would mean a major.

### D15. Stack order and unnamed datasets (2026-11-27)

- **Hidden datasets hold their stack's place.** PR #12331 (P4 waits on it) orders the stacks by every grouped dataset of the type, visible or hidden, and lets a hidden dataset hold the place only of a stack that still has a visible bar at that index value. A hidden dataset with no value at that index holds no place, as it would hold none while visible. The band layout keeps this rule: `groups` and `groupsAt` follow it, so hiding a dataset never reorders the stacks. Ordering by visible datasets only, as master does, is #11978.
- **Unnamed datasets on a stacked index axis share one slot.** With `stacked: true`, every dataset without a `stack` name stacks on the value axis under one key (the type), but master's `_getStackIndex` gives an unnamed dataset the last slot seen so far (`stacks.length - 1`). With datasets `[{}, {stack: 'a'}, {}]` the third bar is drawn in stack `a`'s slot, over the second, while its value stacks on the first. The band layout gives the unnamed datasets one group, so P6 fixes it. User's choice: in this design, not a separate issue.

### D16. P16's anchor and cost (2026-11-29)

- **A cut-off bar's tooltip anchors in its visible part, in P16.** A bar cut off by the chart area at its base or at its head anchors its tooltip at the centre of the part inside the area. So a bar chart whose value axis starts above 0 (`min`, or `beginAtZero: false`) moves every tooltip from the bar's head to the middle of its visible part; the `core.interaction/nearest-partial-bar` fixture changes. A bar wholly inside keeps its tooltip at its head. User's choice; the alternative was to move the anchor only when the head is outside.
- **The nearest modes' cost is accepted.** Each bar now returns its visible centre as a new object, so a nearest mode that scans every bar (`axis: 'xy'`, or `includeInvisible`) takes 1.5–1.65× the time and 1.5–1.7× the GCs at 10 000 bars (two measurements; 0.27 ms → 0.40 ms per pointer event in the PR's). The binary-searched modes (`index`, nearest along one axis) gain about 0.3 µs per event; points are unchanged. User's choice.

### D13. Causes of #11361 and #12000, found without their samples (2026-11-26)

The samples could not be opened, so the causes were found by running master f92cce77 in Node with a stub canvas and fuzzing the layout: 3000 random charts of two or three datasets with `{x, y}` data, shared and unshared x values in any order, with and without `skipNull`, `labels` and null values.

- **#11361.** Without a repeated x value in one dataset, no chart had overlapping bars or a wrongly placed slot. Two inputs give the reported symptoms:
  - With `skipNull`, `_getStacks` checks another dataset with `meta._parsed.find`, which returns only the first entry at the x value. A: `[{x: 'a', y: 1}]` and B: `[{x: 'a', y: null}, {x: 'a', y: 2}]` put both bars across the whole category. P8's rule (D6) gives them two slots; P8 completes the issue.
  - A number x on a category axis that is not one of the labels (string labels, or `'564'` in another dataset) is placed at its data index: `findOrAddLabel` in `scale.category.js` falls back to it. `{x: 2010}` at index 0 is drawn under the first label. This is the category scale's parsing, outside this change; the closing comment answers it.
  - The empty slot beside a lone bar is master's behaviour without `skipNull`, and with `skipNull` when the other value is 0.
- **#12000.** With no explicit `barThickness`, no input overlapped: 3 to 5 datasets of 300 to 5000 points on category and linear axes, irregular linear x values, and 300 to 3000 datasets of one point each. Every category keeps a slot per dataset, so 3000 datasets make bars 0.03 px wide, which draws as an empty chart. `barThickness: 10` with 300 datasets overlaps 63 of 300 bars, as set. The layout time grows with the square of the dataset count: 72 ms at 300 datasets, 2593 ms at 3000, spent in the per-bar `_getAxis` and `_getStacks` loops over all datasets. With `skipNull` it also grows with the square of the point count (2003 ms for 5 × 5000). P5 computes this once per scale and completes the issue; the sub-pixel slots and the explicit thickness are answered on it.

## Risks / Trade-offs

- Every piece from P4 on edits `controller.bar.ts`, so P4 to P15, P19 and P20 are built one after another. Only P1 to P3 and P16 to P18 run beside them.
- P13 (floating bars), P14 (bars outside the range no longer drawn at the edge), P15 (zero-length bars centred), P17 (`index` mode on horizontal charts) and P18 (the top bar wins) change what users see; each is a minor release with a release-note line. Existing image fixtures stay unchanged unless the piece names the one that changes and why.
- Plugins reading `_top`, `_bottom` or `_visualValues`, or overriding `_getAxis` or `_getStacks` to change the layout, break or lose effect. P6's and P12's release notes say so. Financial's calls are covered by D3 and a spec.
- The layout and stack caches are stale when a plugin cancels `beforeLayout`, as `$bar` is today.
- `index` mode (P17) reads `chart.options.indexAxis`; a dataset-level `indexAxis` alone does not change it.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | fix: only bar datasets count as index axes (adopts #12263) | `src/controllers/controller.bar.js`, `test/specs/controller.bar.spec.js` | labels a, b, c; bars on `x`, a line on a category `x2`: bar width 0.36 × category on master, expect 0.72 × | ~40 | #12505 | | #12262 |
| P2 | refactor: `element.bar.js` in TypeScript | `src/elements/element.bar.js` → `.ts` | none: `tsc`, `pnpm lint-types` and every bar fixture unchanged | ~150 | | | |
| P3 | docs: bar borders are fills; `borderDash` does not apply | `docs/charts/bar.md` | none (docs) | ~10 | | | #11341 |
| P4 | refactor: `controller.bar.js` in TypeScript | `src/controllers/controller.bar.js` → `.ts` | none: `tsc`, every bar spec and fixture unchanged | ~350 | P1, P2, #12334, #12331, #12566 | | |
| P5 | perf: the index layout module; the private methods read it with today's results | `controller.bar.layout.ts` (new), `controller.bar.ts`, `test/specs/controller.bar.layout.spec.js` (new) | 1000 datasets of one point each: `getMatchingVisibleMetas` called 2003 times and `_getAxis` 2000 times per update on master, expect at most a few per scale; 3 datasets × 1000 points with `skipNull`: `meta._parsed.find` called 18 000 times on master, expect 0; a spec calls `_getRuler()` and `_calculateBarIndexPixels(i, ruler, options)` as financial does; #12331's specs (hidden datasets keep the stack order, also with `skipNull`) and all fixtures unchanged | ~300 | P4; rework-ticks P16 if it is in flight (D10) | | #12000 |
| P21 | fix: each bar type finds its own smallest gap (D2, D14) | `controller.bar.layout.ts`, layout spec | a `bar` dataset with points 1 h apart and a bar-derived type (registered in the spec) with points 1 day apart on one time scale: the second type's bars are as thin as the first's on master, expect a day's width | ~40 | P5 | | |
| P6 | fix: index scales with the same range share the slots | `controller.bar.layout.ts`, `controller.bar.ts`, layout spec, 3 fixtures | stacked `x`/`x2` (`stack: 'g'`), one bar each: 0.36 × own category, off-centre on master, expect 0.72 ×; overlaid `x` {a, b} + `x2` {c}: the x2 bar twice as wide on master, expect equal; overlaid category `x` [a, b, c] and `x2` [c, b, a], one bar each: two slots per category, each bar at its own label; `stacked-and-multiple-axis` unchanged; `stacked: true`, datasets `[{}, {stack: 'a'}, {}]`: the third bar in `a`'s slot on master, expect it in the first dataset's slot (D15) | ~170 | P21 | | |
| P7 | fix: flex neighbours from all bars on the scale | `controller.bar.layout.ts`, layout spec | labels A, B, C at 300 px, dataset 0 `[{x:'B', y:5}]`, dataset 1 `[1, 2, 3]`, flex, percentages 1: dataset 0 spans 0-150 px on master, expect 100-150; two items at one category: thickness 0 on master, expect the share | ~80 | P6 | | #10193, #11101 |
| P8 | fix: a null frees its slot for every dataset when skipNull is on in the band | `controller.bar.layout.ts`, `docs/charts/bar.md`, layout spec | A `{skipNull: true, [1, 1]}`, B `[1, 1]`, C `[null, 1]`: A and B overlap at 'a' on master, expect two equal slots for A and B; A `{skipNull: true, [{x: 'a', y: 1}]}`, B `[{x: 'a', y: null}, {x: 'a', y: 2}]`: both bars span the whole category on master, expect two slots; A `{skipNull: true, [1, 2]}`, B `[null, 3]`: A full width at index 0 (as master); skipNull fixtures unchanged | ~80 | P7 | | #11361 |
| P9 | fix: zero-length bars draw nothing | `controller.bar.ts`, `test/specs/controller.bar.value.spec.js` (new) | `barThickness: 10`, `[5, 0]`: `inflateAmount` 0.33 on master, expect 0; same after `toggleDataVisibility(1)` | ~50 | P6 | | #11714 |
| P10 | fix: stack ends from the visible segments of the bar's type | `controller.bar.stacks.ts` (new), `controller.bar.ts`, value spec | `middle`, radius 12, `[[10, 10], [null, 10]]`: dataset 0 skips `bottom` on master, expect none; default `'start'`, `[[10], [10]]`, `hide(1)`: dataset 0 `enableBorderRadius` false, expect true; `middle`, `hide(1)`: `{top: true}`, expect `{}`; a bar and a line with one `stack` name: the bar keeps its rounded top; #12335's cases | ~270 | P9 | | #11721, #10245 |
| P11 | fix: short stacked segments chain without gaps | `controller.bar.stacks.ts`, `controller.bar.ts`, value spec | stacked, `minBarLength: 10`, `[100], [0], [30]`: dataset 2 starts 5 px above dataset 1's head on master, expect at it; a value of 1 lengthened at 100 px high and not after growing to 600 px: dataset 1 keeps the stale offset on master; `order` that puts the lengthened segment lower but with the higher index: dataset 1 overlaps dataset 0 on master; a line stacked on a bar lengthened by `minBarLength` sits on the data value (release note) | ~280 | P10 | | #11515 |
| P12 | refactor: `_top`, `_bottom` and `_visualValues` leave core | `src/core/core.datasetController.js`, `test/specs/core.datasetController.spec.js` | none (refactor); the `_stacks` specs updated; nothing reads the removed fields after P11 | ~80 | P11, #12499 | | |
| P13 | feat: floating bars keep their values in a stack | `src/core/core.datasetController.js`, `controller.bar.ts`, `controller.bar.stacks.ts`, `docs/charts/bar.md`, value spec | stacked `[[[0, 5]], [[5, 9]]]`: dataset 1 at 10-14 and y max 14 on master, expect 5-9, max ≈ 9; `[[[0, 5]], [3]]`: dataset 1 starts at 5, expect 0 | ~180 | P12 | #11730, #11290 | #12197 |
| P14 | feat: `minBarLength` is the visible length | `controller.bar.ts`, `docs/charts/bar.md`, value spec | `y.min: 10`, `[10, 50]`, `minBarLength: 5` (#7174's case without setting `base`): 0 px on master, expect 5; y 10-20, `[[5, 5]]`, `minBarLength: 6`: 6 px at the bottom edge on master, expect none in the area; `toggleDataVisibility(1)`: height 5 on master, expect 0; the 10 minBarLength fixtures unchanged, so a zero at the axis edge keeps its whole length (#10005, D14) | ~220 | P13, rework-legend P18 | #11667 | #10487, #7174 |
| P15 | feat: zero-length bars centre on their value | `controller.bar.ts`, value spec | y 0-10, `[[5, 5]]`, `minBarLength: 10`: base at px(5), head 10 px above on master, expect ±5; y 0-10, `[[0, 0]]`, `minBarLength: 10`: kept whole inside the area, from px(0) up (as master); the 10 minBarLength fixtures unchanged | ~60 | P14 | | #11667 |
| P16 | fix: bars cut off by the chart area are found and pointed at through their visible part | `src/core/core.interaction.ts`, `element.bar.ts` (internal `_getAreaCenter`), `src/plugins/plugin.tooltip.js` (the `average` and `nearest` positioners), `docs/configuration/interactions.md`, `docs/configuration/tooltip.md`, `test/specs/core.interaction.spec.js`, `test/specs/plugin.tooltip.spec.js` | `y.min: 1`, `[1.5, 10]`, nearest, `intersect: false`, `axis: 'x'`: bar 1 on master, expect bar 0, with the tooltip anchored inside the chart area; `y.max: 50`, `[100, 20]`, index, intersect, inside bar 0: `[]` on master, expect bar 0; the point spec "out-of-range datapoints are not shown in tooltip" still passes | ~170 | P2, #12499 | | #11733 |
| P17 | feat: `index` mode follows `indexAxis` | `src/core/core.interaction.js`, `src/types/index.d.ts` (the `axis` comment), `docs/configuration/interactions.md`, interaction spec | `indexAxis: 'y'`, `[10, 2]`, index, `intersect: false`, pointer in row 0 at px(2): index 1 on master, expect 0; a radar chart in `index` mode unchanged | ~60 | P16 | | #10312 |
| P18 | feat: the bar drawn on top wins | `src/core/core.interaction.js`, interaction spec | `indexAxis: 'y'`, `x.stacked: false`, `[5]`, `[9]`, `[10]` with one stack name, pointer at 6: dataset 2 on master, expect dataset 1; two scatter datasets with equal points: both items returned (as master) | ~90 | P17 | | #11646 |
| P19 | feat: `minBarThickness` (adopts #11898) | `controller.bar.ts`, `src/types/index.d.ts`, `docs/charts/bar.md`, layout spec | #11898's spec: `minBarThickness: 1000` gives width 1000 for grouped and non-grouped bars; `maxBarThickness` wins | ~70 | P15, P8 | | |
| P20 | feat: `barAlign` places bars on their value | `controller.bar.layout.ts`, `controller.bar.ts`, `src/types/index.d.ts`, `docs/charts/bar.md`, layout spec, a fixture | time axis, 5-minute data, `offset: false`, `barAlign: 'start'`: bar centred on master, expect its left edge at the value | ~150 | P19 | | #9748 |

**Parallel:** P1, P2 and P3 at once; P16 to P18 beside the controller chain once P2 and #12499 have merged. Everything else is ordered by `controller.bar.ts`.

**Release lines.** Releases come from master. Patch (4.6.x): P1 to P12 and P21, and P16 when it merges before the first minor piece. Minor (4.7.0), each with a release-note line: P13, P14, P15, P17, P18, P19, P20. P13 follows P11 and P12 so that the patch fixes are not held behind a visible change (review).

**Closed with a comment, no piece:**

- #11660: done by #12377.
- #10360: a scriptable `borderSkipped`.
- #10401: won't do (Non-Goals).
- #12001: D5.
- #12162: not bar code; needs a reproduction against 4.6.x.
- #10258, #11545: rework-ticks.
- #11254: won't do; lines and the axis use data values (P14 documents it).
- #11730's legend half: one entry per label is `generateLabels`; closed with that and P13's link after P13.
- #11290: answered by P13 (floating bars in a stack at their own values); closed after it with the issue's sample checked.
- #11323: after P13, several waterfalls are floating bars in separate stacks; closed with a sample link.
- #11998: `grouped: false` with `order` overlays bars from 0; closed with a sample.
- #11391: `barPercentage` and `categoryPercentage` set the space between grouped bars; no reproduction.
- #10838: plugin code that swaps elements' values; no bug in Chart.js shown.
- #11556, #12022, #11367, #5409, #9918: requests outside this change (Non-Goals); left open with a comment saying so.
- #11361 (after P8): the closing comment also answers the number-x case (D13) and points repeated x values in one dataset to #9080.
- #12000 (after P5): the closing comment explains sub-pixel slots and an explicit `barThickness` wider than the slot (D13), with `maxBarThickness` and P19's `minBarThickness`.

## Contracts

- **P4 → all later pieces:** `src/controllers/controller.bar.ts` and `src/elements/element.bar.ts` exist. `BarMeta`, `BarParsed` (`_custom`, `_stacks`) and `BarRuler` are exported from the controller file for its sibling modules.
- **P5 → P21, P6, P7, P8, P20:** `getScaleLayout(controller): ScaleLayout` and `getBandLayout(controller): BandLayout` (D2), cached in `scale._cache.$barLayout`, dropped in `beforeLayout` and `configure()`. `_getRuler()` returns `{min, pixels, start, end, stackCount, scale, grouped, ratio, layout}`; `ratio` is 1 when `barThickness` is set.
- **P5 → P9:** `updateElements` still calls `_calculateBarValuePixels`, `setBorderSkipped` and `setInflateAmount` per bar, and `ruler.ratio` keeps its meaning.
- **P10 → P11, P12, P13:** `getStackInfo(vScale, parsed): BarStackInfo | undefined` (D7), cached in `vScale._cache.$barStacks`, dropped in `beforeLayout` and `configure()`. A zero or non-finite stack value is no segment.
- **P11 → P12:** nothing reads `_visualValues`; the first reader of a stack fills every segment's `base` and `head` in stacking order.
- **P13:** `DatasetController#_stackValue(item, vAxis): number` (private; default `item[vAxis]`).
- **rework-legend P18 → P14:** the protected "left out of bounds" hook of the bar controller.
- **P16 → P17, P18:** `getIntersectItems` and `getNearestCartesianItems` use `element._getAreaCenter(chartArea, useFinalPosition)` when the element has it; it returns `{x, y}`, `null` when no part of the bar is inside, or `undefined` for a subclass that overrides `getCenterPoint` (own geometry), which keeps the generic rule. `tooltipPosition` is unchanged: the tooltip's `average` and `nearest` positioners anchor a cut-off bar at that point through a helper in `plugin.tooltip.js`, and the `nearest` positioner also picks by it.
- **P17:** `index` mode without `axis` uses `chart.options.indexAxis` when it is `'x'` or `'y'`, else `'x'`.

## Open Questions

None. The causes of #11361 and #12000 were found from the issue texts (D13).
