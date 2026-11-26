## 1. P1: Only bar datasets count as index axes (adopts #12263)

- [ ] 1.1 Spec in `test/specs/controller.bar.spec.js` (after #12505): labels a, b, c, a bar dataset on `x` and a line dataset on a category `x2`. The bar width is 0.72 × the category; it fails on master (0.36 ×).
- [ ] 1.2 Take #12263's change with `Co-authored-by` for its author. The pull request says `Closes #12262` and closes #12263 as adopted.

## 2. P2: The bar element in TypeScript

- [ ] 2.1 `git mv src/elements/element.bar.js src/elements/element.bar.ts`; type `BarProps` and the element fields as `element.arc.ts` does. Public types stay in `src/types/index.d.ts`.
- [ ] 2.2 `tsc`, `pnpm lint-types`, the bar specs and every `controller.bar` fixture pass unchanged.

## 3. P3: Bar borders are fills

- [ ] 3.1 In `docs/charts/bar.md`, say that bar borders are drawn as fills, so `borderDash` does not apply to bars. The pull request says `Closes #11341`.

## 4. P4: The bar controller in TypeScript

- [ ] 4.1 Wait until P1, P2, #12334 and #12331 have merged. Close #12222 and #12335 with credit as superseded by P6 and P10 (design D9).
- [ ] 4.2 `git mv src/controllers/controller.bar.js src/controllers/controller.bar.ts`. Export `BarMeta`, `BarParsed` and `BarRuler` for sibling modules. Drop the unused `center` from `_calculateBarValuePixels`. Make no other change.
- [ ] 4.3 `tsc`, `pnpm lint-types`, every bar spec and fixture pass unchanged.

## 5. P5: The index layout module

- [ ] 5.1 New `test/specs/controller.bar.layout.spec.js`. With 3 datasets × 1000 points and `skipNull`, `meta._parsed.find` is called 0 times; it fails on master (18 000). A spec calls `_getRuler()` and `_calculateBarIndexPixels(i, ruler, options)` the way chartjs-chart-financial does.
- [ ] 5.2 Open the samples of #11361 and #12000 in a browser. Claim an issue only with a failing input whose cause is in this layout.
- [ ] 5.3 New `src/controllers/controller.bar.layout.ts` with `IndexLayout` and `getIndexLayout` (design D2); move `getAllScaleValues` and `computeMinSampleSize` there. Cache it in `scale._cache.$barLayout` and drop it in `configure()`.
- [ ] 5.4 `_getStacks`, `_getStackCount`, `_getStackIndex`, `_getRuler` and `_calculateBarIndexPixels` read the layout and return what they returned before, including today's `_getAxis` count. All bar specs and fixtures are unchanged.

## 6. P6: Index scales with the same range share the slots

- [ ] 6.1 Layout specs: stacked `x`/`x2` with one bar each (0.72 × own category, centred); overlaid `x` {a, b} and `x2` {c} (three equal slots a, b, c). Both fail on master. Add fixtures for both, using #12222's sample for the first.
- [ ] 6.2 Implement the band rule (design D4). Remove `_getAxis` and `_getAxisCount`. `stacking/stacked-and-multiple-axis` is unchanged.
- [ ] 6.3 Add a release-note line: `_getAxis` and `_getAxisCount` are removed.

## 7. P7: Flex neighbours from all bars on the scale

- [ ] 7.1 Layout specs: the #10193 input (dataset 0 spans 100-150 px) and the #11101 input (thickness above 0). Both fail on master.
- [ ] 7.2 Flex reads its neighbours from the layout's `values`. The `bar-thickness-flex*` fixtures are unchanged. The pull request says `Closes #10193` and `Closes #11101`, and that the overlay part of #11101 is #9080.

## 8. P8: skipNull frees the holder's slot

- [ ] 8.1 Layout spec: A `{skipNull: true, [1, 1]}`, B `[1, 1]`, C `[null, 1]` give three equal slots at 'a'. It fails on master.
- [ ] 8.2 `groupsAt` drops a group only for datasets that skip their own null. Update the `skipNull` row in `docs/charts/bar.md`. The `skipNull/*` fixtures are unchanged.

## 9. P9: Zero-length bars draw nothing

- [ ] 9.1 New `test/specs/controller.bar.value.spec.js`: with `barThickness: 10` and `[5, 0]`, `inflateAmount` is 0, also after `toggleDataVisibility(1)`. It fails on master.
- [ ] 9.2 `setInflateAmount` gives 0 to a bar of zero length. The pull request says `Closes #11714`.

## 10. P10: Stack ends from the visible segments

- [ ] 10.1 Value specs: the three inputs in the pieces table, and #12335's cases with credit. They fail on master.
- [ ] 10.2 New `src/controllers/controller.bar.stacks.ts` with `BarStackInfo` and `getStackInfo` (design D7). `enableBorderRadius` and `setBorderSkipped` read it.
- [ ] 10.3 The `borderRadius` and `borderSkipped` fixtures are unchanged. The pull request says `Closes #11721` and `Closes #10245`.

## 11. P11: Floating bars keep their values in a stack

- [ ] 11.1 Value specs: `[[[0, 5]], [[5, 9]]]` and `[[[0, 5]], [3]]`, stacked. Both fail on master.
- [ ] 11.2 Add the `_stackValue` hook in `updateStacks` (design D8). The bar returns `NaN` for floating items. `updateRangeFromParsed` uses `[min, max]`.
- [ ] 11.3 Document the rule in `docs/charts/bar.md` and add a release-note line. The pull request says `Closes #12197` and `Closes #11730`, and that #11730's legend half is answered by `generateLabels`.

## 12. P12: Short stacked segments chain

- [ ] 12.1 Value specs: `minBarLength: 10`, `[[0], [50]]`, stacked. Dataset 1 starts at dataset 0's head with the default and with swapped `order`, and after a resize from small to large. They fail on master.
- [ ] 12.2 The stack info's pixel pass fills `base` and `head` in stacking order, and `_calculateBarValuePixels` reads them. Remove the `_visualValues` write. The pull request says `Closes #11515`.

## 13. P13: minBarLength is the visible length

- [ ] 13.1 Value specs: the three inputs in the pieces table. They fail on master. The 10 `minBarLength/*` fixtures are unchanged.
- [ ] 13.2 Implement the rule. Use rework-legend P18's hidden-item hook if it has merged, or else `getDataVisibility` and `element.hidden`.
- [ ] 13.3 Update `minBarLength` in `docs/charts/bar.md`: lines and the axis use data values. Add a release-note line. The pull request says `Closes #10487`, `Closes #7174` and `Closes #11254`, and `Part of #11667`.

## 14. P14: Zero-length bars centre on their value

- [ ] 14.1 Value spec: y 0-10, `[[5, 5]]`, `minBarLength: 10` reaches ±5 px around px(5). It fails on master.
- [ ] 14.2 Centre unstacked zero-length bars. Add a release-note line. The pull request says `Closes #11667`.

## 15. P15: The stack fields leave core

- [ ] 15.1 Remove `_top`, `_bottom` and `_visualValues` from `updateStacks`, `clearStacks` and `applyStack`. Update the `_stacks` specs in `test/specs/core.datasetController.spec.js` (after #12499).
- [ ] 15.2 Add a release-note line for plugins that read these fields.

## 16. P16: Bars cut off by the chart area are found

- [ ] 16.1 Interaction specs: the two inputs in the pieces table. They fail on master. The point spec "out-of-range datapoints are not shown in tooltip" still passes.
- [ ] 16.2 Add a private `BarElement#_getAreaCenter`. `getIntersectItems` and `getNearestCartesianItems` use it when present. The pull request says `Closes #11733`.

## 17. P17: index mode follows indexAxis

- [ ] 17.1 Interaction spec: the input in the pieces table. It fails on master.
- [ ] 17.2 `index` mode defaults `axis` to the chart's `indexAxis`. Update `docs/configuration/interactions.md`, including the line for `nearest` on horizontal bars. Add a release-note line. The pull request says `Closes #10312`.

## 18. P18: The item drawn on top wins

- [ ] 18.1 Interaction spec: the #11646 input in the pieces table. It fails on master. The line and scatter interaction specs pass unchanged.
- [ ] 18.2 With `intersect: true`, when several items contain the pointer, pick the first in drawing-on-top order. Add a release-note line. The pull request says `Closes #11646`.

## 19. P19: minBarThickness (adopts #11898)

- [ ] 19.1 Take #11898's spec into the layout spec, with `Co-authored-by`. It fails on master.
- [ ] 19.2 Add the option to the controller, `src/types/index.d.ts` and `docs/charts/bar.md`. `maxBarThickness` wins a conflict. The pull request closes #11898 as adopted.

## 20. P20: barAlign

- [ ] 20.1 Layout spec and a fixture: a time axis with 5-minute data, `offset: false` and `barAlign: 'start'` puts each bar's left edge at its value. It fails on master.
- [ ] 20.2 Add the option to the layout, the types and `docs/charts/bar.md`; document turning off `offset`. The pull request says `Closes #9748`.
