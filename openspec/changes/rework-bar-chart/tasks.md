## 1. P1: Only bar datasets count as index axes (adopts #12263)

- [x] 1.1 Spec in `test/specs/controller.bar.spec.js` (after #12505): labels a, b, c, a bar dataset on `x` and a line dataset on a category `x2`. The bar width is 0.72 × the category; it fails on master (0.36 ×).
- [x] 1.2 Take #12263's change with `Co-authored-by` for its author. The pull request says `Closes #12262` and closes #12263 as adopted.

## 2. P2: The bar element in TypeScript

- [x] 2.1 `git mv src/elements/element.bar.js src/elements/element.bar.ts`; type `BarProps` and the element fields as `element.arc.ts` does. Public types stay in `src/types/index.d.ts`.
- [x] 2.2 `tsc`, `pnpm lint-types`, the bar specs and every `controller.bar` fixture pass unchanged.

## 3. P3: Bar borders are fills

- [x] 3.1 Rebase over #11898 if it has moved. In `docs/charts/bar.md`, say that bar borders are drawn as fills, so `borderDash` does not apply to bars. The pull request says `Closes #11341`.

## 4. P4: The bar controller in TypeScript

- [ ] 4.1 Wait until P1, P2, #12334, #12331 and #12566 have merged. If rework-legend P18 has merged, convert its hook too. Close #12222 and #12335 with credit as superseded by P6 and P10 (design D9).
- [ ] 4.2 `git mv src/controllers/controller.bar.js src/controllers/controller.bar.ts`. Export `BarMeta`, `BarParsed` and `BarRuler` for sibling modules. Drop the unused `center` from `_calculateBarValuePixels`. Make no other change.
- [ ] 4.3 `tsc`, `pnpm lint-types`, every bar spec and fixture pass unchanged.

## 5. P5: The index layout module

- [ ] 5.1 New `test/specs/controller.bar.layout.spec.js`. With 1000 datasets of one point each, `getMatchingVisibleMetas` and `_getAxis` are called at most a few times per scale in an update; master calls them 2003 and 2000 times. With 3 datasets × 1000 points and `skipNull`, `meta._parsed.find` is called 0 times; it fails on master (18 000). A spec calls `_getRuler()` and `_calculateBarIndexPixels(i, ruler, options)` the way chartjs-chart-financial does.
- [ ] 5.2 The pull request says `Closes #12000`; its closing comment explains sub-pixel slots and an explicit `barThickness` (design D13).
- [ ] 5.3 New `src/controllers/controller.bar.layout.ts` with `ScaleLayout`, `BandLayout`, `getScaleLayout` and `getBandLayout` (design D2); move `getAllScaleValues` and `computeMinSampleSize` there, with rework-ticks P16's change if it has merged. Values stay shared by every bar type on the scale, as master's `$bar` (P21 keys them by type). Cache it in `scale._cache.$barLayout` and drop it in `configure()`.
- [ ] 5.4 `_getStacks`, `_getStackCount`, `_getStackIndex`, `_getRuler` and `_calculateBarIndexPixels` read the layout and return what they returned before, including today's `_getAxis` count. All bar specs and fixtures are unchanged, including #12331's stack-order specs: a hidden dataset holds the place of a stack that still has a visible bar at that index (design D15).

## 21. P21: Each bar type finds its own smallest gap

Built after P5 and before P6; the number was added after the design's pull request opened.

- [ ] 21.1 Layout spec: a `bar` dataset with points 1 h apart and a bar-derived type registered in the spec with points 1 day apart on one time scale. The second type's bars get a day's width; on master they are as thin as the first's.
- [ ] 21.2 Key the values in `scale._cache.$barLayout` by controller type (design D2). Release-note line: a second bar-derived type on one scale (chartjs-chart-financial over volume bars) uses its own gap.

## 6. P6: Index scales with the same range share the slots

- [ ] 6.1 Layout specs: stacked `x`/`x2` with one bar each (0.72 × own category, centred); overlaid `x` {a, b} and `x2` {c} (three equal slots a, b, c); overlaid category `x` [a, b, c] and `x2` [c, b, a] with one bar each (each bar at its own label, two slots). With `stacked: true` and datasets `[{}, {stack: 'a'}, {}]`, the first and third bars share a slot and the second has the other (design D15). The first two and the last fail on master. Add fixtures for the first two, using #12222's sample for the first.
- [ ] 6.2 Implement the band rule (design D4). Remove `_getAxis` and `_getAxisCount`. `stacking/stacked-and-multiple-axis` is unchanged.
- [ ] 6.3 Add a release-note line: `_getAxis` and `_getAxisCount` are removed.

## 7. P7: Flex neighbours from all bars on the scale

- [ ] 7.1 Layout specs: the #10193 input (dataset 0 spans 100-150 px) and the #11101 input (thickness above 0). Both fail on master.
- [ ] 7.2 Flex reads its neighbours from the layout's `values`. The `bar-thickness-flex*` fixtures are unchanged. The pull request says `Closes #10193` and `Closes #11101`, and that the overlay part of #11101 is #9080.

## 8. P8: A null frees its slot when skipNull is on in the band

- [ ] 8.1 Layout specs: A `{skipNull: true, [1, 1]}`, B `[1, 1]`, C `[null, 1]` give A and B two equal slots at 'a' (master overlaps them); A `{skipNull: true, [{x: 'a', y: 1}]}` and B `[{x: 'a', y: null}, {x: 'a', y: 2}]` give two slots (master draws both across the category); A `{skipNull: true, [1, 2]}`, B `[null, 3]` keep A full width at index 0, as on master.
- [ ] 8.2 `groupsAt` drops the groups whose value is null, undefined or NaN when any dataset of the type in the band has `skipNull` (design D6). A dataset with several entries at one value takes a slot when any of them has a value. Update the `skipNull` row in `docs/charts/bar.md` to say so. The `skipNull/*` fixtures are unchanged. The pull request says `Closes #11361`; its comment answers the number-x case (design D13).

## 9. P9: Zero-length bars draw nothing

- [ ] 9.1 New `test/specs/controller.bar.value.spec.js`: with `barThickness: 10` and `[5, 0]`, `inflateAmount` is 0, also after `toggleDataVisibility(1)`. It fails on master.
- [ ] 9.2 `setInflateAmount` gives 0 to a bar of zero length. The pull request says `Closes #11714`.

## 10. P10: Stack ends from the visible segments

- [ ] 10.1 Value specs: the four inputs in the pieces table, and #12335's cases with credit. They fail on master (the bar-and-line case only if it does; otherwise it guards the type filter).
- [ ] 10.2 New `src/controllers/controller.bar.stacks.ts` with `BarStackInfo` and `getStackInfo` (design D7): ends among the visible datasets of the bar's type, in stacking order; dropped in `beforeLayout` and `configure()`. `enableBorderRadius` and `setBorderSkipped` read it.
- [ ] 10.3 The `borderRadius` and `borderSkipped` fixtures are unchanged. The pull request says `Closes #11721` and `Closes #10245`.

## 11. P11: Short stacked segments chain

- [ ] 11.1 Value specs, each failing on master: `minBarLength: 10`, stacked `[100], [0], [30]` (dataset 2 starts at dataset 1's head); a value of 1 lengthened at 100 px and not after a resize to 600 px (no stale offset); an `order` that puts the lengthened segment lower but with the higher index (no overlap).
- [ ] 11.2 The first reader of a stack computes every segment's `base` and `head` in stacking order, from each dataset's own options; `_calculateBarValuePixels` reads them. Remove the `_visualValues` write. Release-note line: a line stacked with bars under one stack name sits on its data value, not on a bar lengthened by `minBarLength`. The pull request says `Closes #11515`.

## 12. P12: The stack fields leave core

- [ ] 12.1 Remove `_top`, `_bottom` and `_visualValues` from `updateStacks`, `clearStacks` and `applyStack`. Update the `_stacks` specs in `test/specs/core.datasetController.spec.js` (after #12499).
- [ ] 12.2 Release-note line: plugins that read these fields. No output changes; nothing reads them after P11.

## 13. P13: Floating bars keep their values in a stack

- [ ] 13.1 Value specs: `[[[0, 5]], [[5, 9]]]` and `[[[0, 5]], [3]]`, stacked. Both fail on master. Check #11290's sample against the result.
- [ ] 13.2 Add the `_stackValue` hook in `updateStacks` (design D8). The bar returns `NaN` for floating items. `updateRangeFromParsed` uses `[min, max]`.
- [ ] 13.3 Document the rule in `docs/charts/bar.md`, with a release-note line. The pull request says `Closes #12197`, and `Part of #11730` and `Part of #11290`.

## 14. P14: minBarLength is the visible length

- [ ] 14.1 Wait for rework-legend P18 (the hidden-item hook).
- [ ] 14.2 Value specs: the three inputs in the pieces table. They fail on master. The 10 `minBarLength/*` fixtures are unchanged.
- [ ] 14.3 Implement the rule; hidden items are those the rework-legend P18 hook leaves out of bounds.
- [ ] 14.4 Update `minBarLength` in `docs/charts/bar.md`: lines and the axis use data values. Release-note line. The pull request says `Closes #10487` and `Closes #7174`, and `Part of #11667`.

## 15. P15: Zero-length bars centre on their value

- [ ] 15.1 Value spec: y 0-10, `[[5, 5]]`, `minBarLength: 10` reaches ±5 px around px(5). It fails on master.
- [ ] 15.2 Centre unstacked zero-length bars when the centred bar fits in the chart area; otherwise move it inside, as master does (design D14). The 10 `minBarLength/*` fixtures are unchanged. Release-note line. The pull request says `Closes #11667`.

## 16. P16: Bars cut off by the chart area are found

- [x] 16.1 Interaction specs: the two inputs in the pieces table, including where the tooltip is anchored. They fail on master. The point spec "out-of-range datapoints are not shown in tooltip" still passes.
- [x] 16.2 Add an internal `BarElement#_getAreaCenter`; `getIntersectItems` and `getNearestCartesianItems` use it when present, and the tooltip's `average` and `nearest` positioners anchor a cut-off bar there. A subclass that overrides `getCenterPoint` keeps the generic rule. Say in `docs/configuration/interactions.md` that for bars the distance is to the visible part. The pull request says `Closes #11733`.

## 17. P17: index mode follows indexAxis

- [ ] 17.1 Interaction specs: the input in the pieces table (fails on master), and a radar chart in `index` mode (unchanged).
- [ ] 17.2 `index` mode without `axis` uses `chart.options.indexAxis` when it is `'x'` or `'y'`, else `'x'`. Update the `axis` comment in `src/types/index.d.ts` and `docs/configuration/interactions.md`, with a line for `nearest` on horizontal bars. Release-note line. The pull request says `Closes #10312`.

## 18. P18: The bar drawn on top wins

- [ ] 18.1 Interaction specs: the #11646 input (fails on master); two scatter datasets with equal points still return both items.
- [ ] 18.2 With `intersect: true`, when several bars contain the pointer, pick the one drawn on top (bars only: design D12). Release-note line. The pull request says `Closes #11646`.

## 19. P19: minBarThickness (adopts #11898)

- [ ] 19.1 Take #11898's spec into the layout spec, with `Co-authored-by`. It fails on master.
- [ ] 19.2 Add the option to the controller, `src/types/index.d.ts` and `docs/charts/bar.md`. `maxBarThickness` wins a conflict. The pull request closes #11898 as adopted.

## 20. P20: barAlign

- [ ] 20.1 Layout spec and a fixture: a time axis with 5-minute data, `offset: false` and `barAlign: 'start'` puts each bar's left edge at its value. It fails on master.
- [ ] 20.2 Add the option to the layout, the types and `docs/charts/bar.md`; document turning off `offset`. The pull request says `Closes #9748`.
