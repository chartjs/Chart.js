## Context

### The legend layout (src/plugins/plugin.legend.js)

The layout is worked out in three places, and the title in a fourth:

- `fit()` measures and wraps the items through `_fitRows` (top/bottom) and `_fitCols` (left/right). It writes `legendHitBoxes`, `lineWidths` and `columnSizes`.
  - `_fitRows` gives every item the same height.
  - Both wrap against the box the layout offers (`this.maxWidth`/`this.maxHeight`), not against the `maxWidth`/`maxHeight` options. The options only clamp the other dimension. On the main axis that clamp has no effect either, because a `fullSize` box is given the full width or height afterwards (`core.layouts.js` `placeBoxes`).
  - `_fitCols` does not count the title's width.
- `adjustHitBoxes()` (in `afterUpdate`) aligns rows and columns again and mirrors them for right-to-left. A hit box is the symbol plus the text placed at the left, whatever `textAlign` is.
- `_draw()` measures the text again and wraps with its own test (`x + width + padding > this.right` for rows, `y + lineHeight > this.bottom` for columns). It indexes `lineWidths[cursor.line]` and `columnSizes[cursor.line]`. Rows advance by one `lineHeight`, and column items by an item height that `typeof text !== 'string'` decides.
- `drawTitle()` takes its position from `lineWidths`/`columnSizes`. It uses only the title's top padding and does not measure.
- `_getLegendItemAt()` reads `legendHitBoxes`.
- `afterUpdate` calls `buildLabels()` again after `fit()`. A `generateLabels` or `filter` that returns a different count the second time leaves `legendItems` and `legendHitBoxes` with different lengths. On master that draws without error: with 3 hit boxes and 1 item, the probe drew fine.

Nothing in `src` or `docs` outside the file reads `legendHitBoxes`, `lineWidths` or `columnSizes`, and the types do not declare them:

```
git grep -n -E "legendHitBoxes|lineWidths|columnSizes|adjustHitBoxes|_getLegendItemAt|_fitRows|_fitCols" -- ':!dist' | grep -v plugin.legend.js
test/fixtures/plugin.legend/horizontal-rtl-hitbox.js:37
test/specs/plugin.legend.tests.js:563,566,627,630,660,665,698,1188,1232,1286
```

Plugins outside this repository do read `legendHitBoxes` (for example the workaround in #11280), so the field keeps its shape.

Each bug was reproduced on master ab3ac077 with a probe spec. Each comes from the places above disagreeing:

| Issue | Observed on master | Cause |
|---|---|---|
| #12345 | end-aligned row that fills the width exactly: the last item's edge minus `right` is 0, and it is drawn at NaN depending on rounding | draw's wrap test differs from fit's; at equality rounding decides, and `lineWidths[1]` is undefined |
| #12196 | changing `Chart.defaults.font` after render throws "reading 'height'" | draw measures with the new font and wraps into a column fit never made |
| #11824 | a three-line label in a top legend: hit box 12 px tall, next row at 32 | one item height per row |
| #11594 | numeric labels with the legend on the right throw "reduce is not a function" | anything that is not a string is treated as an array, in the width, the height and the draw cursor |
| #11850 | a right legend 72 px wide with a 149 px title | `_fitCols` ignores the title |
| #12066 | title drawn at x=0 with `padding.left: 50` | `drawTitle` ignores left and right padding |
| #12067 | `textAlign: 'right'`: hit box ends at 446, text at about 502 | the hit box is at the left; the text is placed with `_textX` up to `this.right` |
| (no issue) | several columns with `textAlign: 'right'`: every column draws its text at the legend's right edge, so they overlap | draw passes `this.right` as the text area's end for every column |
| #11805 | right legend with `maxHeight: 100`: one column, items down to 400 px; top legend with `maxWidth: 150`: one row 400 px wide | wraps against the layout's box, not the option |
| #11280 | `align: 'start'` and a centred title with `padding.left: 20`: the items do not move | there is no space option around the legend; the title padding only moves the title |

### Events

- `isListened()` in the legend treats both `click` and `mouseup` as clicks. `_isClickEvent()` in `helpers.core.ts` does the same for the chart's `onClick`. With `events: ['click', 'mouseup', ...]`, one press runs `onClick` twice (#11538; probe count 2).
  - `mouseup` has been there since v2 (01b88f19), for charts that list `mouseup`, `touchend` or `pointerup` instead of `click`. `platform.dom.js` maps the last two to `mouseup`. The default `events` never had `mouseup`.
  - `_isClickEvent` also decides, through `determineLastEvent`, which event is kept for replay after `update()`. A click is never kept.
- Outside the chart area, `plugin.tooltip.js` (`_getActiveElements`) and `core.controller.js` (`_getActiveElements`) keep the last active elements.
  - This came in with #9970 (v3.7.0), so that a tooltip set by a legend `onHover` through `setActiveElements` stays.
  - As a side effect, a tooltip and a hover style that the pointer started also stay when the pointer moves onto the legend (#11801; probe: 1 active before and after).
  - `plugin.tooltip.tests.js:1681` and `core.controller.tests.js:365` pin this behaviour.
  - Plugin order is legend, then tooltip, so in one event a legend `onHover` runs before the tooltip handles the same event.
  - Both `setActiveElements` change state only when the elements or the position changed.

### Visibility

- `_updateVisibility()` in `core.controller.js` animates `visible` and updates the dataset in `'hide'` mode, which sends colours to transparent.
  - When the hidden dataset was active, the update replays the last event, or re-applies `_active` when the pointer is outside the chart area.
  - With the pointer over the chart, the replay no longer finds the hidden dataset (`meta.visible` is already false), so it removes its hover style. With the pointer outside, the update re-applies the hover style.
  - Either one starts an `'active'` colour animation, and `Animation.update()` retargets the running hide animation to that colour: the un-hover on the pointer path, the hover on the other.
  - Probe for #10882: without hover, borderColor goes from `#FF000087` to transparent. With hover it goes from `#F10000` to `#F00`, and then the line vanishes.
  - Every controller resolves `active ? 'active' : mode` for its elements, so a hidden element that is still active also gets its hover options (`hoverRadius`, `hoverBorderWidth`) in the hide update.
- There are two hidden states for a data item:
  - `chart._hiddenIndices`, set by `toggleDataVisibility`, keyed by data index and shared by all datasets;
  - `meta.data[i].hidden`, set by `hide(datasetIndex, dataIndex)`.

  `_updateHiddenIndices()` shifts the first for push, splice and shift. Replacing the labels array keeps the old indices (#10120; probe: after hiding `a` and replacing with `[b, c]`, `b` is hidden).
- `getMinMax()` in `core.datasetController.js` never asks whether a data item is hidden. A hidden bar collapses to its base on purpose (#7870) but still counts towards the value axis (#11949; probe: y max stays 100). polarArea already leaves hidden data out of its own `getMinMax`.

### Types

`onClick`, `onHover` and `onLeave` are typed `(this: LegendElement<TType>, …, legend: LegendElement<TType>)` (`index.d.ts` 2464–2473). A handler whose `legend` parameter is annotated `LegendElement<ChartType>` becomes a second inference site for `TType`, so a line chart is typed as `ChartType`. `c.options.scales?.x?.title` then fails against the radialLinear options (#10442). This reproduces on TypeScript 4.9.5 and 6.0.3, and the fix in Decision 9 was compiled against it.

#11666 did not reproduce with TypeScript 4.6 to 6.0, on master or on v4.4.1, by two independent tries.

## Goals / Non-Goals

**Goals**

- One legend layout, decided in `fit()`, that hit-testing and drawing only read.
- Every open legend issue is either completed by one piece or answered with the evidence for why no code is needed (see the list after the pieces).
- The open legend pull requests that fit go first.
- Patch releases for the fixes. The new options go in 4.7.0.

**Non-Goals**

- Overflow when the items do not fit: paging, scrolling, ellipsis, word wrap (#10893, #11397, #12129, #11825). This needs its own design on top of the layout.
- The v5 legend refactor (#9342): merging items and hit boxes into one state, a scriptable legend context, and replacing the styling in `generateLabels`.
- Text spacing on canvas (#12246), which would be a font option for all chart text.
- Following page scroll with a still pointer (#10384).
- Removing hidden categories from the category axis, and widening the remaining bars (#11949's second half, #11319). This is also a non-goal of isolate-category-scale-labels.
- Bold or italic text on hover (part of #11571), and decorations for other text than the legend (part of #11941).
- Aligned legend columns in a horizontal legend (#11658).

## Decisions

1. **The hit boxes are the layout.** `fit()` decides, for each item, everything drawing needs:
   - its row or column;
   - its size;
   - its text width.

   It keeps these on the item's entry in `legendHitBoxes`; what every item shares (the font, the symbol size, the one-line item height) it keeps once on the legend. The new fields are private and start with `_`. The text itself is not kept: `afterUpdate` builds `legendItems` again after `fit()`, so drawing takes the text from the item it draws the symbol of.

   `adjustHitBoxes()` keeps doing what only it can: placing lines in the final box, mirroring for right-to-left, and writing the absolute text and symbol positions. It does not measure or wrap. `_draw()` reads the hit boxes for geometry and `legendItems[i]` for colours and styles. The font is resolved once in fit and kept on the legend, so a later change to the defaults cannot move items (#12196).

   Alternatives:
   - A separate private `_layout` next to the hit boxes. Rejected in review: it would store every item's geometry twice.
   - Merging `legendItems` and the hit boxes (#9342). Rejected: breaking, and the user chose 4.x.
   - The title gets no layout piece. `drawTitle()` does not measure, and P2/P3 fix its size and position where they are computed today.
2. **The public fields keep their meaning.**
   - `legendHitBoxes[i]` is `{left, top, width, height, row | col}` in canvas coordinates, plus private fields.
   - `lineWidths[r]` is the sum of `itemWidth + padding` over row `r`.
   - `columnSizes[c]` is `{width, height}`.

   The hit box grows to cover aligned text (P4). That is the fix for #12067, not a change of meaning.
3. **The open PRs go first, before the refactor.** The user asked for that. Each is small and has a test that fails on master, so each is a releasable fix on its own. The refactor then keeps their tests green, and those tests guard it.
   - #12346 already makes draw follow the hit box's row or column in both orientations. That also fixes #12196, so #12205 (the same lines) is superseded, and its test moves into P1 with credit.
   - An item without a hit box is not drawn. That replaces #12346's fallback. Master's size comparison as a fallback still throws for a vertical legend: past the last column, `columnSizes[cursor.line]` is undefined. A count that changes between fit and draw must not throw in a patch release.
   - #12316 as it stands makes column-0 hit boxes 197 px wide in a two-column legend, so clicking an item in column 1 can return an item of column 0. Its author bounds the text area by the next column's left edge minus padding before it lands (P4).
   - If an author does not answer within two weeks, the piece is built by a maintainer on top of the PR, with credit.
4. **Refactor and behaviour stay apart.** P9 changes no output.
   - Every legend fixture stays pixel-identical.
   - A spec counts `measureText` calls during `draw()` for a legend with no hidden or decorated items, and expects zero. A decoration still measures its line inside `renderText`, and that is the only measuring allowed in draw.

   The layout fixes that need the refactor (#11824, #11805) are their own pieces after it.
5. **`mouseup` counts as a click only when `click` is not listened to.** This keeps charts that list `mouseup`, `touchend` or `pointerup` instead of `click` working, and stops the double call.
   - The rule sits in `_isClickEvent(e, events)`, which already owns "what is a click".
   - The legend passes `this.options.events || chart.options.events`, mirroring the plugin event filter at `core.controller.js:1174`.
   - The chart passes `options.events`, both for `onClick` and for the replay decision in `determineLastEvent`. Otherwise a `mouseup` that is no longer a click would be kept as the last event and replayed as a click on every `update()`.
   - The chart's `onClick` is fixed in the same piece even though #11538 reports only the legend. It runs through the same helper with the same double call, and fixing one but not the other would split the rule.
6. **Active elements remember where they came from.** The chart and the tooltip each keep a flag saying whether their active set was set by the pointer or by `setActiveElements`.
   - `setActiveElements` sets the flag before its "changed" test, so a legend `onHover` that sets the elements already active still marks them as set by code.
   - A pointer event that changes the set clears the flag.
   - Outside the chart area, a set made by the pointer becomes empty. A set made by code is kept, validity-filtered as today.

   Both owners get the flag. Otherwise the tooltip would close while the slice stays drawn in its hover style, which is the same stale state.

   Rejected: #11849's extra `update()` parameter. With it, moving back onto the same slice no longer showed the tooltip (found in its review), and it spreads the rule over the update path.

   This restores the pointer's behaviour before 3.7.0 and keeps what #9970 wanted for code. The two pinned tests are changed to set their active elements with `setActiveElements`.
7. **Hidden data cannot be active.** One private chart method, `_filterActive(items)`, leaves out the items whose dataset is not visible or whose data item the dataset's controller does not show.
   - The data item part is the controller's private `_isDataVisible(index)`: by default the element is not `hidden`. Bar, doughnut and polar area also ask `chart.getDataVisibility(index)`, because they are the controllers that honour `toggleDataVisibility`. A line point at a toggled index is still drawn, so it can still be active.
   - The dataset part is decided once for each run of a dataset's items, the data item part for each item.
   - `_active` is filtered where it is assigned: in `setActiveElements` before its "changed" test, in `_handleEvent` before `onHover` and `onClick` get the elements and again after them (a handler may hide data, and its update has then already dropped it, so the event compares with what the update left), and at the start of `update()`, before the datasets update. The datasets then resolve their normal options, not their hover options.
   - At the start of `update()`, the dropped items only get `active = false` (and in mode `'dataset'` the dataset element too, when none of its items is kept), with no un-hover animation: the update animates them in its own mode, so the hide transition keeps its colours. The controller's private `_clearHoverStyle(element, index)` does it, and gives an element of a controller that shares its options (line points, bars) the shared options back, because the update animates those and leaves an element's own hover options alone. `_updateHoverStyles` stays as it was. Hidden items reach its deactivated set only when visibility changed without an update, and there the un-hover animation is the right one for an element that is still drawn.
   - The replay at the end of `update()` moves into a helper, and so does the filter at its start, so `update()` does not grow. It is at the max-statements limit.
   - The tooltip calls the same private method for its code-set elements in P13, as a built-in plugin may.
8. **Hidden state is re-keyed by label only when the labels array is replaced.** At update, when `data.labels` is a different array and something is hidden:
   - each hidden index is moved to its label's index in the new array;
   - equal labels match by occurrence, and arrays are compared by content;
   - a hidden label that is gone is dropped.

   The re-key runs first, and the array-mutation shifts recorded since the last update are discarded, because the labels describe the new order. The old labels are copied only while something is hidden. The comparison lives in a helper, not in `update()`. Wrappers that pass a new but equal array on every render keep their state, because the move is the identity.

   Rejected:
   - resetting on a new array, because wrappers would lose state on every render;
   - keying everything by label, because it breaks charts without labels or with duplicate labels.
9. **The legend callbacks use a no-infer alias** (`[T][T extends any ? 0 : never]`) for `TType` in `this` and `legend`. The built-in `NoInfer` needs TypeScript 5.4, and the repository supports `^4.7.4`.
10. **Hidden bars leave the value axis.**
    - A protected controller hook says whether a data item is left out of bounds. It is false in the base class. In the bar controller it is `!getDataVisibility(i) || meta.data[i]?.hidden`, so both kinds of hidden item count.
    - `getMinMax()` checks it only for the value axis. The index axis' sorted fast path would trim only the first and last categories.
    - This matches polarArea. Line and scatter do not hide such points, so they are unchanged.
11. **The legend symbol offset is `labels.boxYOffset`.** #12242 calls it `pointStyleYOffset`, and its types declare `datasetRadiusBuffer`, but it moves box symbols too. The name sits next to `boxWidth` and `boxHeight`. #11884 is answered by the option, not by moving the text: measured, the ink sits 0.4–0.8 px above the symbol's centre at 12–24 px, and moving it would change every legend image.
12. **Text decoration is a legend item property.** `LegendItem.textDecoration` (`'line-through' | 'underline' | 'none'`), with the hidden default kept, plus `labels.decorationWidth` (default 2).
    - `renderText` already supports `underline` and `decorationWidth`, and the types already declare them. Only the legend changes.
    - A width that scales with the font size would also answer #11692 without an option, but it would change every image with a hidden item at a font size other than 12. The option keeps images unchanged.
    - #4438 (transparency of hidden items) and #11885 (a border that does not follow the dataset) are possible today with `generateLabels`. P15's docs sample shows how, and the issues are closed as answered, not as built.
13. **`padding` is the legend's outer space.** It moves the items and the title away from the legend's edges, and so from the chart area (#11740) and the canvas edge (#11280). `labels.padding` stays the gap between items. A legend without `padding` lays out as before.
14. **`maxWidth` and `maxHeight` limit the wrapping.** A `fullSize` legend still gets the full width or height of the canvas on its main axis. The two options limit how far the items run, and `align` places that block in the box. The docs say so instead of "maximum height of the legend".
15. **Pieces that share a file with an open PR.** `plugin.legend.js`, `core.controller.js`, `index.d.ts`, `controller.bar.js` and `plugin.tooltip.js` are each held by several open PRs.
    - Where those PRs are 4.6.3 candidates, the piece waits for them, so the release goes first.
    - Where they are left out of the release plan, superseded or a feature, they rebase onto the piece instead: #11825, #12255, #12242 before it becomes P14, #12314, #12172, #11836 and #12218.
    - A piece in the legend chain rebases over whatever has landed. It does not wait for an author-owned PR it shares no lines with.
16. **Tests sit with the test migration.** P1 to P5 add specs to `test/specs/plugin.legend.tests.js`. If migrate-tests-to-vitest converts that file first, they move with its recipe. Pieces written after the conversion use `plugin.legend.spec.js`. New image fixtures are made by whichever runner owns fixtures at the time.

### Decided by the user (2026-11-24)

23. **The legend plugin is converted to TypeScript, in its own piece (P19), after P6 and before P9.**
    - It goes after P1 to P6, because those PRs and pieces edit `plugin.legend.js`, and converting first would make every open PR conflict.
    - It goes before P9, so that the refactor and every later legend piece are written and type-checked in TypeScript, and the private hit-box fields get an interface from the start.
    - It is a refactor with no behaviour change, done like the earlier conversions of the config helpers (#11121) and the canvas helpers (#11100): the file is renamed in the same commit as its annotations, so git still sees a rename.
    - The public types stay in `src/types/index.d.ts` (`LegendElement`, `LegendItem`, `LegendOptions`), which is copied to `dist/types`. The `.ts` file imports them as types and adds an interface only for its own internal shapes.
    - Renaming the file on master gives 124 errors, all in that file: 121 are TS2339 (fields assigned in the constructor and not declared) and 3 are TS2345.
    - #11825 and #12242 rebase onto it; #12242 is ported by its author when it becomes P14.


17. **P13 ships as a fix in a patch release, with a release-note line.** The tooltip and hover style the pointer started end outside the chart area. For the pointer this restores the behaviour before 3.7.
18. **P17 and P18 ship in 4.7.0, each with a release-note line.**
19. **P14's option is `labels.boxYOffset`.**
20. **P15 adds `labels.decorationWidth`** (default 2), not a width that scales with the font.
21. **#11825 rebases onto P19 and P9, and drops its copies of the #11280 and #11824 fixes.** Overflow (#10893, #11397, #12129) is designed next, for 4.8.
22. **Collapsed hidden bars that hover can still find are a follow-up issue**, not part of P12. P12 already keeps a bar hidden by `toggleDataVisibility` out of the active elements and out of the `active` that `onHover` and `onClick` get, although the interaction modes still find it. The follow-up is only whether the modes should skip such bars.

### Decided by the user (2026-11-26)

24. **A right-click never runs the legend's `onClick`.** The legend calls `_isClickEvent(e, events)` for the `mouseup` rule of decision 5, and leaves out `contextmenu`, as it did before P6. The chart's `onClick` still runs on `contextmenu`.
25. **The open type PRs #12342, #12317, #12313, #12250 and #12221 are not 4.6.3 candidates.** P7 does not wait for them; they rebase onto P7.

### Decided by the user (2026-11-27)

26. **P12 lands before #12547 (the radar/polarArea TypeScript conversion); #12547 rebases over `_isDataVisible` in controller.polarArea.**

### What the review changed

- The separate `_layout` became private fields on the hit boxes. The title layout piece was dropped, because its test passed on master (complexity review).
- P1 does not draw an item without a hit box, so a count that changes between fit and draw does not throw (root-cause review).
- P5 covers all three places that test for multi-line labels, and its spec checks every position is finite (root-cause review).
- P6 passes `events` to the replay decision too (architecture review).
- P13's flag is set before the "changed" test (architecture and rule-readers reviews).
- P12's spec moved from the box size to the extent of the items, because a `fullSize` box takes the full height (root-cause review).
- #11280 moved from P3 to P16. P3 also covers the default `'center'` title position (root-cause review).
- P15 no longer changes `renderText` (architecture review).
- P17 re-keys before the mutation shifts and discards them (rule-readers review).
- P18 also counts items hidden with `hide(datasetIndex, dataIndex)` (rule-readers review).
- `index.d.ts`'s `onClick` doc line joined P6 (rule-readers review).
- #11978, #11806, #11937, #9773, #11319, #12179, #11609, #10280, #3787, #12030, #11425 and #11429 are accounted for. #11571, #11658, #11885 and #4438 are no longer claimed as built (scope review).

## Risks / Trade-offs

- **Counts that change between fit and draw** (a `generateLabels` that reads the scales, which is the workaround for #11194) draw only the items with a hit box. Today they draw at guessed positions. P1 and P9 have a spec for it.
- **The pointer rule (P13) changes visible behaviour.** With `intersect: false`, the tooltip now hides when the pointer moves over the axes or the legend. It ships as a fix with a release-note line (Decision 17).
- **Data visibility (P17, P18) changes defaults** for charts that replace labels or hide bars. That is why they are minor releases with a release-note line.
- **#11825 must rebase onto P19 and P9.** It changes 666 lines of `plugin.legend.js` and re-implements two fixes this change makes. Its author is asked to build pages as ranges of hit-box lines.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12346: drawing follows each hit box's row or column, an item without one is not drawn; #12205's test moves in with credit | `src/plugins/plugin.legend.js`, `test/specs/plugin.legend.tests.js` | #12346's spec (master draws Beta at NaN); #12205's spec (master throws "reading 'height'"); a `generateLabels` whose count changes between calls draws without throwing | ~70 | the author's changes (drop the `1e-6`) | | #12345, #12196 |
| P2 | #12330: the title's width counts in a vertical legend | same | #12330's spec (master: legend 74 px, title 184 px) | ~70 | P1 (same lines region) | | #11850 |
| P3 | #12187: the title's left and right padding move it | same | new specs for `'start'`, `'center'` and `'end'`, horizontal and vertical (master: x=0 with `padding.left: 50`) | ~50 | P2 (so the padding also widens a vertical legend); the author's tests | | #12066 |
| P4 | #12316: hit boxes cover aligned text; each column's text area ends at the next column | same | #12316's 9 specs (8 left/right center/right cases and the per-item alignment); a new two-column spec (clicking item 8 returns item 8) | ~110 | P1 (same lines); the author's column fix | | #12067 |
| P5 | Only arrays are multi-line labels, in width, height and the draw cursor | same | pie with labels `[2010, 2011]` on the right: renders, and every hit box's and item's position is finite (master throws); a numeric label mixed with an array label | ~35 | P1 | | #11594 |
| P6 | One press runs `onClick` once (legend and chart) | `src/helpers/helpers.core.ts`, `src/plugins/plugin.legend.js` (event lines only), `src/core/core.controller.js`, `src/types/index.d.ts` (the `onClick` doc line), `docs/configuration/interactions.md`, `docs/configuration/legend.md`, `test/specs/plugin.legend.tests.js`, `test/specs/core.controller.tests.js` | events `['click', 'mouseup']`: count 1 (master 2); `['mouseup']` only: count 1; the chart's `onClick` count 1; click then `update()`: still 1 | ~100 | P5 (same file); #12391 (same file, 4.6.3); #12438 (other lines of helpers.core.ts, 4.6.3) | | #11538 |
| P7 | The legend callbacks do not infer the chart type | `src/types/index.d.ts`, `src/types/utils.d.ts`, `etc/chart.js.api.md`, `etc/chart.js-helpers.api.md`, `test/types/plugins/plugin.legend/*.ts`, `test/integration/typescript-node/src/legend.ts`, `test/integration/typescript-latest/src/legend.ts` | `pnpm lint-types` on the #10442 snippet, and `pnpm test-ci-integration` on it with TypeScript 4.7.4 and the newest TypeScript; a #11666 snippet (passes on master, kept as a guard; the PR says it was not reproduced) | ~50 | P6 (same file); the 4.6.3 type PR on `index.d.ts` (#12349). The other type PRs rebase onto it (decision 25) | | #10442, #11666 |
| P8 | Docs: the custom `onClick` per chart type; the TypeScript note for the HTML legend; a container option in the HTML legend sample that accepts an element (works in a shadow root); `onLeave` and scrolling | `docs/configuration/legend.md`, `docs/samples/legend/html.md` | none (docs) | ~60 | P6 (same doc) | | #12144, #11877, #10624, #10384 |
| P19 | refactor: `plugin.legend.js` becomes `plugin.legend.ts`; class fields, method signatures and an internal hit-box interface are typed; public types stay in `src/types/index.d.ts` | `src/plugins/plugin.legend.js` → `src/plugins/plugin.legend.ts`; `src/core/core.layouts.js` (JSDoc only) | none (no behaviour change): `tsc` reports no errors in the file (124 on a plain rename), `pnpm lint-types` passes, every legend spec and fixture is unchanged | ~250 | P6 (same file); P8 only for order | | |
| P9 | refactor: the hit boxes carry what drawing needs; drawing reads them | `src/plugins/plugin.legend.ts`, `test/specs/plugin.legend.spec.js` | `measureText` count during `draw()` is 0 for a legend without hidden or decorated items (master > 0); every legend fixture unchanged | ~220 | P19 (same file) | #9342 | |
| P10 | Rows as tall as their tallest item; an item at least as tall as its symbol; an array label as wide as its widest line in a top or bottom legend | same | three-line label in a top legend: the next row starts below line 3 (master overlaps); `boxHeight: 40` with a two-line label in a left legend: the next item starts below the box (master overlaps); a top legend's array label: hit box and `lineWidths` follow the widest line (master measures the joined string) | ~60 | P9 | | #11824 |
| P11 | Wrap within `maxWidth` / `maxHeight` | same, plus `docs/configuration/legend.md` and the `maxWidth`/`maxHeight` comments in `src/types/index.d.ts` | right legend with `maxHeight: 100`: every hit box within 100 px of the first, in two or more columns (master: one column to 400 px); top legend with `maxWidth: 150`: every row within 150 px | ~50 | P10 | | #11805 |
| P12 | Hidden data is not active | `src/core/core.controller.js`, `src/core/core.datasetController.js`, `src/controllers/controller.bar.js`, `src/controllers/controller.doughnut.js`, `src/controllers/controller.polarArea.js`, `test/specs/core.controller.spec.js`, `docs/developers/api.md`, `docs/samples/legend/html.md` (hide/show instead of setDatasetVisibility + update), `etc/chart.js.api.md`, `etc/chart.js-helpers.api.md` | hovered line, `hide(0)`: border alpha at mid-animation is below its start; a slice hidden from the legend is not in `getActiveElements()`; a code-set point is back to `radius` after `hide(0)` | 176 source lines (+168/−8) | P6 (same file), P8 (same sample); #12391 | | #10882 |
| P13 | The pointer's active elements end outside the chart area | `src/plugins/plugin.tooltip.js`, `src/core/core.controller.js`, `test/specs/plugin.tooltip.tests.js`, `test/specs/core.controller.tests.js`, `docs/configuration/tooltip.md`, `docs/configuration/interactions.md` | pie: hover a slice, move onto a legend item: tooltip active 0 (master 1); back on the slice: 1; a legend `onHover` that sets the already-active element keeps the tooltip | ~200 | P12 (same file); #12275 (same file, 4.6.3) | | #11801 |
| P14 | feat: `labels.boxYOffset` (#12242 renamed) | `src/plugins/plugin.legend.ts`, `src/types/index.d.ts`, `docs/configuration/legend.md`, `docs/samples/legend/point-style.md`, fixture | #12242's spec (the symbol moves, the text does not) | ~60 | P11 (same file); the author's rename; 4.7.0 | | #11884 |
| P15 | feat: `LegendItem.textDecoration`, `labels.decorationWidth`; a legend item styling sample | `src/plugins/plugin.legend.ts`, `src/types/index.d.ts`, `docs/configuration/legend.md`, `docs/samples/legend/item-style.md` | underline drawn; strike width 1 with `decorationWidth: 1` (master always 2); `'none'` on a hidden item draws no line | ~80 | P14 (same file); 4.7.0 | #11571, #11941 | #11692, #11725 |
| P16 | feat: legend `padding` | `src/plugins/plugin.legend.ts`, `src/types/index.d.ts`, `docs/configuration/legend.md` | the gap between a top legend and the chart area grows by `padding.bottom`; `align: 'start'` with `padding.left: 20` moves the first item 20 px right | ~60 | P15 (same file); 4.7.0 | | #11740, #11280 |
| P17 | feat: hidden state follows replaced labels | `src/core/core.controller.js`, `test/specs/core.controller.tests.js`, `docs/developers/api.md` | hide `a`, replace with `[b, c]`: `b` visible (master hidden); equal new array keeps it; splice plus replaced labels hides the right item; existing mutation specs stay green | ~150 | P13 (same file); 4.7.0 | | #10120 |
| P18 | feat: hidden bars leave the value axis | `src/core/core.datasetController.js`, `src/controllers/controller.bar.js`, `test/specs/controller.bar.tests.js`, `docs/developers/api.md` | bar `[10, 100]`: `toggleDataVisibility(1)` and `hide(0, 1)` each give y max below 100 (master 100) | ~100 | P17 (same doc); #12332, #12241 and the 4.6.3 bar PRs (#12335, #12334, #12331, #12263) on the same files; 4.7.0 | #11949 | |

**In parallel:**
- P7 needs only P6's line in `index.d.ts`.
- P8 needs only P6.
- The legend chain (P19 → P9 → P10 → P11 → P14 → P15 → P16) and the controller chain (P12 → P13 → P17) run beside each other after P6. P19 comes first in the legend chain although its number is last, because piece numbers were fixed when the design's pull request opened.
- P18 can be built beside P14 to P16.
- P2 to P5 all build on P1, and they are ordered only by the file they share.

### Issues completed by no piece, and why

- **Fixed on master:**
  - #11804 (#11858);
  - #11263 (`initData` always defines `labels`);
  - #5665 (`pointStyleWidth`, 3.8);
  - #11234 (#12292, in 4.6.2).
- **Fixed by an open PR outside this change:** #11978, by #12331, which is a 4.6.3 candidate.
- **Possible today, answered with how:**
  - #11194 and #11730 (`generateLabels`/`filter`);
  - #4438 and #11885 (the P15 sample);
  - #11609 (array labels, and the HTML legend);
  - #10280 (`padding`, after P16);
  - #11806 (`textDirection` sets the canvas `direction`, as a maintainer showed);
  - #3787 (`position: 'chartArea'`).
- **Not a legend bug:**
  - #11380 (`generateLabels` called with the legend instead of the chart);
  - #12030 (the reporter found a workaround);
  - #10196 (HTML legend);
  - #11425, #11429 and #9773 (a doughnut gives space to its legend by design; overflow is a non-goal).
- **Non-goals, with their reasons above:**
  - #10893, #11397, #12129 (overflow);
  - #12246, #9342, #11319, #11658;
  - #11937 (rtl for axes);
  - #12179 (speed of many hidden datasets).

## Contracts

- **P1 → P4, P9:** drawing places item `i` in `legendHitBoxes[i].row` (horizontal) or `.col` (vertical). An item without a hit box is not drawn.
- **P4 → P9:** an item's text area runs from after its symbol to the next column's left edge minus `labels.padding`. For the last column, it runs to the legend's right edge. The hit box covers the symbol and the text inside that area.
- **P19 → P9 and every later legend piece:** the plugin is `src/plugins/plugin.legend.ts`; its internal shapes have interfaces in that file, and its public types come from `src/types/index.d.ts`.
- **P9 → P10, P11, P14, P15, P16:**
  - `fit()` writes each hit box's size, row or column, and the private `_text.width` it measured. What every item shares (the label font, `boxWidth`, `boxHeight`, the one-line `itemHeight`, `usePointStyle` and `pointStyleWidth`) it keeps once on the legend, in private `_labelLayout`.
  - `adjustHitBoxes()` writes the absolute positions: the hit box's, `_text` (`x`, `y`, `align`, after right-to-left mirroring) and `_symbol` (`x`, `y`: the box's top left corner, or the point style's center).
  - `_draw()` reads the hit boxes, `_labelLayout` and the styles and text of `legendItems`, and nothing else. It draws `legendItems[i].text`, because `afterUpdate` builds the items again after `fit()`.
  - A row's or column's size comes from the items `fit()` measured; the drawn text comes from the items `afterUpdate` rebuilt.
- **P6:** `_isClickEvent(e, events?)`. With `events` given, `mouseup` counts only when `events` lacks `click`. The chart passes its `events` everywhere it calls the helper.
- **P12 → P13:** the private chart method `_filterActive(items)` leaves out hidden data (dataset not visible, or `controller._isDataVisible(index)` false). P13 calls the same method for the tooltip's code-set elements, and sets its "set by code" flag from the call, before the filter and the "changed" test.
- **P13:** the chart and the tooltip each keep a flag for "set by code". `setActiveElements` sets it before its "changed" test. A pointer event that changes the set clears it.
- **P14 → P15:** `labels.boxYOffset` moves only the symbol's y.

## Open Questions

None. The user's answers are recorded under Decisions ("Decided by the user").
