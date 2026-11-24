## 1. P1: Drawing follows the hit boxes (#12346)

- [ ] 1.1 #12346's spec fails on master (the second item is drawn at NaN with `align: 'end'`). Take #12205's spec (defaults font changed after render) and confirm it throws on master. Credit its author with `Co-authored-by`.
- [ ] 1.2 Draw each item in `legendHitBoxes[i].row` or `.col`. Drop the fallback for missing hit boxes and the `1e-6` tolerance.
- [ ] 1.3 The pull request says `Closes #12345` and `Closes #12196`. Close #12205 as superseded, with a link.

## 2. P2: The title's width counts (#12330)

- [ ] 2.1 #12330's spec fails on master (legend 74 px wide, title 184 px).
- [ ] 2.2 Rebase onto P1. The pull request says `Closes #11850`.

## 3. P3: The title's padding moves it (#12187)

- [ ] 3.1 Add specs for `position: 'start'` with `padding.left` and `position: 'end'` with `padding.right`, in a top and a right legend. Each fails on master.
- [ ] 3.2 Rebase onto P2. The title's x includes the padding. The pull request says `Closes #12066` and `Closes #11280`.

## 4. P4: Hit boxes cover aligned text (#12316)

- [ ] 4.1 #12316's 12 specs fail on master.
- [ ] 4.2 Add a two-column spec with `textAlign: 'right'`: clicking item 7's symbol and text returns item 7, and each column's text ends at its own column's right edge. It fails on #12316 as it stands.
- [ ] 4.3 Bound the text area by the next column's left edge minus `labels.padding`, and the last column by the legend's right edge. Do this in the hit box and in drawing.
- [ ] 4.4 Every single-column legend fixture is unchanged. The pull request says `Closes #12067`.

## 5. P5: Only arrays are multi-line labels

- [ ] 5.1 A spec with a pie chart, labels `[2010, 2011]`, legend on the right: the chart renders. It fails on master.
- [ ] 5.2 Use `isArray` for the multi-line test in width and height. The pull request says `Closes #11594`.

## 6. P6: One press runs onClick once

- [ ] 6.1 Specs:
  - `events: ['click', 'mouseup', 'mousedown', 'mousemove']`, press and release on a legend item: legend `onClick` runs once (master twice);
  - `events: ['mouseup']`: it runs once;
  - the same two cases for the chart's `onClick` on a data element.
- [ ] 6.2 `_isClickEvent(e, events)`: with `events` given, `mouseup` counts only when `events` lacks `click`. The legend passes `this.options.events || chart.options.events`, and the chart's `onClick` passes its `events`. Replay keeps the one-argument call.
- [ ] 6.3 Docs: interactions.md (onClick events) and legend.md. The pull request says `Closes #11538`.

## 7. P7: The legend callbacks do not infer the chart type

- [ ] 7.1 Add `test/types/plugins/plugin.legend/` snippets: #10442's line chart with `legend: LegendElement<ChartType>` reading `options.scales?.x?.title` (fails on master), and #11666's pie default handler call (passes on master, kept as a guard).
- [ ] 7.2 Add a no-infer alias that works with TypeScript before 5.4, and wrap `TType` in the three callbacks' `this` and `legend` types.
- [ ] 7.3 The number of errors over `test/types` is unchanged. The pull request says `Closes #10442` and `Closes #11666`.

## 8. P8: Legend docs

- [ ] 8.1 legend.md: the custom `onClick` example for dataset charts and for doughnut, pie and polarArea (`toggleDataVisibility(legendItem.index)`).
- [ ] 8.2 legend.md: `onLeave` and `onHover` run on pointer events. Scrolling the page under a still pointer sends none.
- [ ] 8.3 samples/legend/html.md: a TypeScript note with the module augmentation for `htmlLegend`, and a container option that accepts an element, so it works in a shadow root.
- [ ] 8.4 The pull request says `Closes #12144`, `Closes #11877`, `Closes #10624` and `Closes #10384`.

## 9. P9: The legend layout (refactor)

- [ ] 9.1 Specs: `ctx.measureText` is not called during `chart.draw()` (fails on master); a label filter whose result changes between calls does not throw.
- [ ] 9.2 Add `_layout` (Decision 2). `fit()` measures once and wraps; `adjustHitBoxes()` places lines, symbols and text, and writes `legendHitBoxes`; `_draw()` reads `_layout` and `legendItems` styles.
- [ ] 9.3 `legendHitBoxes`, `lineWidths` and `columnSizes` keep their values: the existing specs that read them pass unchanged.
- [ ] 9.4 Every legend fixture is pixel-identical. Commit type `refactor`; the pull request says it is part of #9342.

## 10. P10: The title in the layout (refactor)

- [ ] 10.1 Spec: no measuring during `drawTitle`.
- [ ] 10.2 Put the title's box in `_layout`. `drawTitle` reads it, and `_computeTitleHeight` is called once per fit.
- [ ] 10.3 Every title fixture is pixel-identical.

## 11. P11: Rows as tall as their tallest item

- [ ] 11.1 Spec: a top legend with a three-line label; the next row starts below its third line, and the legend is tall enough. It fails on master.
- [ ] 11.2 Row height is the tallest item's height. The pull request says `Closes #11824`.

## 12. P12: Wrap within maxWidth and maxHeight

- [ ] 12.1 Specs: a right legend with `maxHeight: 100` wraps into columns within 100 px; a top legend with `maxWidth: 150` wraps rows within 150 px. Both fail on master.
- [ ] 12.2 Wrap against the smaller of the layout's box and the option, and align lines within the legend's box.
- [ ] 12.3 legend.md says what the two options limit. The pull request says `Closes #11805`.

## 13. P13: Hidden data is not active

- [ ] 13.1 Specs:
  - a hovered line dataset with mode `'dataset'` and `intersect: false`, `hide(0)`: the border alpha at mid-animation is below its start (master: it goes opaque);
  - the same with the active elements set by `setActiveElements` and the update the legend makes;
  - a pie slice hidden from the legend is not in `getActiveElements()`.
- [ ] 13.2 One helper decides whether an active item is allowed. `_updateHoverStyles` drops the rest from the activated set and clears `active` on them without animating. The replay in `update()` moves into a helper that also filters `_active`.
- [ ] 13.3 samples/legend/html.md uses `hide`/`show` for datasets. The pull request says `Closes #10882`.

## 14. P14: The pointer's active elements end outside the chart area

- [ ] 14.1 Specs: hover a pie slice, move onto a legend item: the tooltip has no active elements (master 1); move back onto the slice: 1; a legend `onHover` that calls the tooltip's `setActiveElements` keeps the tooltip.
- [ ] 14.2 Change `plugin.tooltip.tests.js:1681`, `core.controller.tests.js:365` and the #12420 specs to set their active elements with `setActiveElements`.
- [ ] 14.3 The chart and the tooltip remember whether their active elements came from the pointer or from code. Outside the chart area, the pointer's set becomes empty, and the code's set stays, validity-filtered.
- [ ] 14.4 tooltip.md and interactions.md. Close #11849 as superseded. The pull request says `Closes #11801` and carries the release-note line.

## 15. P15: labels.boxYOffset (#12242)

- [ ] 15.1 #12242's spec fails on master. The author renames the option to `labels.boxYOffset` and declares it in the types instead of `datasetRadiusBuffer`.
- [ ] 15.2 The offset moves `_layout.items[i].symbol.y` for boxes and point styles; text stays.
- [ ] 15.3 Docs and the point-style sample. Commit type `feat`. The pull request says `Closes #11884`.

## 16. P16: Text decoration

- [ ] 16.1 Specs: an item with `textDecoration: 'underline'` draws an underline; a hidden item without `textDecoration` is struck through; `textDecoration: 'none'` on a hidden item draws no line; `labels.decorationWidth: 1` draws a 1 px line (master always 2).
- [ ] 16.2 `renderText` takes the decoration and its width. The legend passes the item's decoration, or `'line-through'` when hidden and none is given.
- [ ] 16.3 Types for `LegendItem.textDecoration` and `labels.decorationWidth`. A docs sample "legend item styling": underline on hover, a faded colour for hidden items through a wrapped `generateLabels`, and a solid border that ignores the dataset's dash.
- [ ] 16.4 Commit type `feat`. The pull request says `Closes #11692`, `#11725`, `#11571`, `#4438`, `#11885`, and that it is part of #11941.

## 17. P17: Legend padding

- [ ] 17.1 Spec: a top legend with `padding: {bottom: 30}`; the chart area starts 30 px lower than without it. A legend without `padding` is unchanged.
- [ ] 17.2 Add `padding` to the legend options, the types and the docs; `labels.padding` stays the gap between items.
- [ ] 17.3 Commit type `feat`. The pull request says `Closes #11740` and `Closes #11658`.

## 18. P18: Hidden state follows replaced labels

- [ ] 18.1 Specs: hide `a` of `[a, b, c]`, replace labels and data with `[b, c]`: both visible (master: `b` hidden); replace with an equal new array: the same item stays hidden; duplicate labels match by occurrence; no labels: by index; the existing mutation specs pass.
- [ ] 18.2 At update, when `data.labels` is a different array and something is hidden, move each hidden index to its label's index, or drop it. Copy the old labels only while something is hidden.
- [ ] 18.3 api.md for `toggleDataVisibility` and `getDataVisibility`. Commit type `feat`, with a release-note line. The pull request says `Closes #10120`.

## 19. P19: Hidden bars leave the value axis

- [ ] 19.1 Specs: bar `[10, 100]`, hide item 1: y max below 100 (master 100); show it: 100 again; the category axis keeps both categories; a line chart's axes do not change.
- [ ] 19.2 A protected controller hook (false in the base, `!getDataVisibility(i)` in the bar controller), checked in `getMinMax()` for the value axis only.
- [ ] 19.3 api.md. Commit type `feat`, with a release-note line. The pull request says it is part of #11949.
