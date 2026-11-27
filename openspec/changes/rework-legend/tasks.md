## 1. P1: Drawing follows the hit boxes (#12346)

- [x] 1.1 #12346's spec fails on master (the second item is drawn at NaN with `align: 'end'`). Take #12205's spec (defaults font changed after render) and confirm it throws on master. Credit its author with `Co-authored-by`.
- [x] 1.2 Add a spec with a `generateLabels` whose count changes between calls: drawing does not throw.
- [x] 1.3 Draw each item in `legendHitBoxes[i].row` or `.col`; an item without a hit box is not drawn. Drop the `1e-6` tolerance.
- [x] 1.4 The pull request says `Closes #12345` and `Closes #12196`. Close #12205 as superseded, with a link.

## 2. P2: The title's width counts (#12330)

- [ ] 2.1 #12330's spec fails on master (legend 74 px wide, title 184 px).
- [ ] 2.2 Rebase onto P1. The pull request says `Closes #11850`.

## 3. P3: The title's padding moves it (#12187)

- [x] 3.1 Add specs for `position: 'start'` with `padding.left`, `'end'` with `padding.right`, and `'center'` with unequal left and right padding, in a top and a left legend. Each fails on master.
- [x] 3.2 Rebase onto P2. The title's x includes the padding. The pull request says `Closes #12066` and that #11280 is answered by the legend `padding` (P16).

## 4. P4: Hit boxes cover aligned text (#12316)

- [x] 4.1 #12316's 9 specs fail on master: 8 left/right center/right cases and the per-item alignment.
- [x] 4.2 Add a two-column spec with `textAlign: 'right'`: clicking item 8's symbol and text returns item 8, and each column's text ends at its own column's right edge. It fails on #12316 as it stands.
- [x] 4.3 Bound the text area by the next column's left edge minus `labels.padding`, and the last column by the legend's right edge. Do this in the hit box and in drawing.
- [x] 4.4 Every single-column legend fixture is unchanged. The pull request says `Closes #12067`.

## 5. P5: Only arrays are multi-line labels

- [x] 5.1 Specs: a pie chart with labels `[2010, 2011]` and the legend on the right renders, and every hit box's `top`, `height` and drawn `y` is finite (fails on master); a numeric label next to an array label.
- [x] 5.2 Use one `isArray` test for multi-line labels in `calculateItemHeight`, `calculateLegendItemHeight`, the width and the draw cursor; any other label is one line. The pull request says `Closes #11594`.

## 6. P6: One press runs onClick once

- [x] 6.1 Specs:
  - `events: ['click', 'mouseup', 'mousedown', 'mousemove']`, press and release on a legend item: legend `onClick` runs once (master twice);
  - `events: ['mouseup']`: it runs once;
  - the same two cases for the chart's `onClick` on a data element;
  - a click followed by `chart.update()`: the chart's `onClick` has run once in total.
- [x] 6.2 `_isClickEvent(e, events)`: with `events` given, `mouseup` counts only when `events` lacks `click`. The legend passes `this.options.events || chart.options.events`, and the chart's `onClick` passes its `events`. The chart passes its `events` to the replay decision too, so a `mouseup` kept as the last event is not replayed as a click.
- [x] 6.3 Docs: interactions.md (onClick events), legend.md and the `onClick` doc comment in `index.d.ts`. The pull request says `Closes #11538`.

## 7. P7: The legend callbacks do not infer the chart type

- [x] 7.1 Add `test/types/plugins/plugin.legend/` snippets: #10442's line chart with `legend: LegendElement<ChartType>` reading `options.scales?.x?.title` (fails on master), and #11666's pie default handler call (passes on master, kept as a guard).
- [x] 7.2 Add a no-infer alias that works with TypeScript before 5.4, and wrap `TType` in the three callbacks' `this` and `legend` types.
- [x] 7.3 The number of errors over `test/types` is unchanged. The pull request says `Closes #10442`, and `Closes #11666` with a note that it was not reproduced and the snippet guards it.

## 8. P8: Legend docs

- [x] 8.1 legend.md: the custom `onClick` example for dataset charts and for doughnut, pie and polarArea (`toggleDataVisibility(legendItem.index)`).
- [x] 8.2 legend.md: `onLeave` and `onHover` run on pointer events. Scrolling the page under a still pointer sends none.
- [x] 8.3 samples/legend/html.md: a TypeScript note with the module augmentation for `htmlLegend`, and a container option that accepts an element, so it works in a shadow root.
- [x] 8.4 The pull request says `Closes #12144`, `Closes #11877`, `Closes #10624` and `Closes #10384`.

## 9. P19: The legend plugin in TypeScript (refactor)

- [x] 9.1 Rename `src/plugins/plugin.legend.js` to `src/plugins/plugin.legend.ts` in the same commit as its annotations, so git records a rename. Imports keep the `.js` extension.
- [x] 9.2 Declare the class fields, type the method signatures and the helper functions, and add an internal interface for a hit box. Import `LegendItem`, `LegendOptions` and the chart types from `src/types` as types; do not move public types out of `src/types/index.d.ts`.
- [x] 9.3 `tsc --noEmit` reports no errors in the file (a plain rename gives 124), `pnpm lint-types` passes, and the legend specs and fixtures pass unchanged.
- [x] 9.4 Commit type `refactor`. The pull request asks #11825 and #12242 to rebase onto it.

## 10. P9: Drawing reads the hit boxes (refactor)

- [ ] 10.1 Spec: `ctx.measureText` is not called during `chart.draw()` for a legend with no hidden or decorated items (fails on master).
- [ ] 10.2 In `plugin.legend.ts`, `fit()` resolves the font once and writes private `_text` (lines, width) and `_symbol` (offset, size) on each hit box. `adjustHitBoxes()` writes the absolute text and symbol positions. `_draw()` reads the hit boxes and the `legendItems` styles.
- [ ] 10.3 `legendHitBoxes`, `lineWidths` and `columnSizes` keep their values: the existing specs that read them pass unchanged. P1's changing-count spec still passes.
- [ ] 10.4 Every legend fixture is pixel-identical. Commit type `refactor`; the pull request says it is part of #9342.

## 11. P10: Rows as tall as their tallest item

- [ ] 11.1 Spec: a top legend with a three-line label; the next row starts below its third line, and the legend is tall enough. It fails on master.
- [ ] 11.2 Row height is the tallest item's height. The pull request says `Closes #11824`.

## 12. P11: Wrap within maxWidth and maxHeight

- [ ] 12.1 Specs: a right legend with `maxHeight: 100` puts its items in two or more columns, all within 100 px of the first item's top; a top legend with `maxWidth: 150` keeps every row within 150 px. Both fail on master. The legend box itself keeps the full height or width.
- [ ] 12.2 Wrap against the smaller of the layout's box and the option, and align lines within the legend's box.
- [ ] 12.3 legend.md says the two options limit how far the items run, and `align` places them in the box. The pull request says `Closes #11805`.

## 13. P12: Hidden data is not active

- [x] 13.1 Specs:
  - a hovered line dataset with mode `'dataset'` and `intersect: false`, `hide(0)`: the border alpha at mid-animation is below its start (master: it goes opaque);
  - the same with the active elements set by `setActiveElements` and the update the legend makes;
  - a pie slice hidden from the legend is not in `getActiveElements()`;
  - `hoverRadius` on a hovered or code-set point is back to `radius` after `hide(0)`, and the hover options of a bar or doughnut slice after `toggleDataVisibility(i)`;
  - bar and line, `toggleDataVisibility(1)`: the line's point 1 can still be active, the bar's item 1 cannot.
- [x] 13.2 `_filterActive` decides which active items are allowed, with the controller's `_isDataVisible`. `_active` is filtered in `setActiveElements`, in `_handleEvent` and at the start of `update()`. At the start of `update()` the dropped items lose `active` without animating. The replay in `update()` moves into a helper.
- [x] 13.3 samples/legend/html.md uses `hide`/`show` for datasets. The pull request says `Closes #10882`.

## 14. P13: The pointer's active elements end outside the chart area

- [ ] 14.1 Specs: hover a pie slice, move onto a legend item: the tooltip has no active elements (master 1); move back onto the slice: 1; a legend `onHover` that calls the tooltip's `setActiveElements` keeps the tooltip, also when it sets the element that the pointer had already made active.
- [ ] 14.2 Change `plugin.tooltip.tests.js:1681`, `core.controller.tests.js:365` and the #12420 specs to set their active elements with `setActiveElements`.
- [ ] 14.3 The chart and the tooltip remember whether their active elements came from the pointer or from code. `setActiveElements` sets the flag before its "changed" test. Outside the chart area, the pointer's set becomes empty, and the code's set stays, filtered by P12's method.
- [ ] 14.4 tooltip.md and interactions.md. Close #11849 as superseded. The pull request says `Closes #11801` and carries the release-note line.

## 15. P14: labels.boxYOffset (#12242)

- [ ] 15.1 #12242's spec fails on master. The author renames the option to `labels.boxYOffset` and declares it in the types instead of `datasetRadiusBuffer`.
- [ ] 15.2 The offset moves the symbol's y (the hit box's `_symbol` offset) for boxes and point styles; text stays.
- [ ] 15.3 Docs and the point-style sample. Commit type `feat`. The pull request says `Closes #11884`.

## 16. P15: Text decoration

- [ ] 16.1 Specs: an item with `textDecoration: 'underline'` draws an underline; a hidden item without `textDecoration` is struck through; `textDecoration: 'none'` on a hidden item draws no line; `labels.decorationWidth: 1` draws a 1 px line (master always 2).
- [ ] 16.2 The legend passes `strikethrough`, `underline` and `decorationWidth` to `renderText`, which already supports them: the item's `textDecoration`, or `'line-through'` when hidden and none is given.
- [ ] 16.3 Types for `LegendItem.textDecoration` and `labels.decorationWidth`. A docs sample "legend item styling": underline on hover, a faded colour for hidden items through a wrapped `generateLabels` (#4438), and a solid border that ignores the dataset's dash (#11885).
- [ ] 16.4 Commit type `feat`. The pull request says `Closes #11692` and `Closes #11725`, and that it is part of #11571 (bold and italic are not built) and #11941 (the legend only).

## 17. P16: Legend padding

- [ ] 17.1 Specs: a top legend with `padding: {bottom: 30}`; the chart area starts 30 px lower than without it. `align: 'start'` with `padding: {left: 20}` moves the first item and the title 20 px right. A legend without `padding` is unchanged.
- [ ] 17.2 Add `padding` to the legend options, the types and the docs; `labels.padding` stays the gap between items.
- [ ] 17.3 Commit type `feat`. The pull request says `Closes #11740` and `Closes #11280`.

## 18. P17: Hidden state follows replaced labels

- [ ] 18.1 Specs: hide `a` of `[a, b, c]`, replace labels and data with `[b, c]`: both visible (master: `b` hidden); replace with an equal new array: the same item stays hidden; duplicate labels match by occurrence; a splice of the data plus replaced labels before one update hides the right item; no labels: by index; the existing mutation specs pass.
- [ ] 18.2 At update, when `data.labels` is a different array and something is hidden, move each hidden index to its label's index, or drop it, and discard the mutation shifts recorded since the last update. Copy the old labels only while something is hidden. The comparison lives in a helper, not in `update()`.
- [ ] 18.3 api.md for `toggleDataVisibility` and `getDataVisibility`. Commit type `feat`, with a release-note line. The pull request says `Closes #10120`.

## 19. P18: Hidden bars leave the value axis

- [ ] 19.1 Specs: bar `[10, 100]`, hide item 1 with `toggleDataVisibility(1)` and, separately, with `hide(0, 1)`: y max below 100 (master 100); show it: 100 again; the category axis keeps both categories; a line chart's axes do not change.
- [ ] 19.2 A protected controller hook (false in the base, `!getDataVisibility(i) || meta.data[i]?.hidden` in the bar controller), checked in `getMinMax()` for the value axis only.
- [ ] 19.3 api.md. Commit type `feat`, with a release-note line. The pull request says it is part of #11949.
