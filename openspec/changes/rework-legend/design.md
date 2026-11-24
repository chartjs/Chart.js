## Context

### The legend layout (src/plugins/plugin.legend.js)

The layout is worked out in three places, and the title in a fourth:

- `fit()` measures and wraps the items, through `_fitRows` (top/bottom) and `_fitCols` (left/right). It writes `legendHitBoxes`, `lineWidths` and `columnSizes`.
  - `_fitRows` gives every item the same height.
  - Both wrap against the box the layout offers (`this.maxWidth`/`this.maxHeight`), not against the `maxWidth`/`maxHeight` options. The options only clamp the other dimension.
  - `_fitCols` does not count the title's width.
- `adjustHitBoxes()` (in `afterUpdate`) aligns rows and columns again and mirrors them for right-to-left. A hit box is the symbol plus the text placed at the left, whatever `textAlign` is.
- `_draw()` measures the text again and wraps with its own test: `x + width + padding > this.right` for rows, and `y + lineHeight > this.bottom` for columns. It then indexes `lineWidths[cursor.line]` and `columnSizes[cursor.line]`, and moves down one `lineHeight` per row.
- `drawTitle()` works out its position from `lineWidths`/`columnSizes`, and uses only the top padding.
- `_getLegendItemAt()` reads `legendHitBoxes`.

Nothing in `src` or `docs` outside the file reads `legendHitBoxes`, `lineWidths` or `columnSizes`, and the types do not declare them:

```
git grep -n -E "legendHitBoxes|lineWidths|columnSizes|adjustHitBoxes|_getLegendItemAt|_fitRows|_fitCols" -- ':!dist' | grep -v plugin.legend.js
test/fixtures/plugin.legend/horizontal-rtl-hitbox.js:37
test/specs/plugin.legend.tests.js:563,566,627,630,660,665,698,1188,1232,1286
```

Plugins outside this repository do read `legendHitBoxes` (for example the workaround in #11280), so the field keeps its shape.

Each bug below was reproduced on master ab3ac077 with a probe spec. It is caused by the places above disagreeing:

| Issue | Observed on master | Cause |
|---|---|---|
| #12345 | an end-aligned row that fills the width exactly: the item's right edge minus `right` is 0, and the item is drawn at NaN depending on rounding | draw's wrap test differs from fit's, so at equality rounding decides, and `lineWidths[1]` is undefined |
| #12196 | changing `Chart.defaults.font` after render throws "reading 'height'" | draw measures with the new font and wraps into a column fit never made |
| #11824 | a three-line label in a top legend: hit box 12 px tall, next row at 32 | one item height per row |
| #11594 | numeric labels with the legend on the right throw "reduce is not a function" | anything that is not a string is treated as an array |
| #11850 | a right legend 72 px wide with a 149 px title | `_fitCols` ignores the title |
| #12066, #11280 | title drawn at x=0 with `padding.left: 50` | `drawTitle` ignores left and right padding |
| #12067 | `textAlign: 'right'`: hit box ends at 446, text at about 502 | hit box at the left, text placed with `_textX` up to `this.right` |
| (no issue) | several columns with `textAlign: 'right'`: every column draws its text at the legend's right edge, so they overlap | draw passes `this.right` as the text area's end for every column |
| #11805 | right legend with `maxHeight: 100`: 400 px tall, one column; top legend with `maxWidth: 150`: 400 px wide | wraps against the layout's box, not the option |

### Events

- `isListened()` in the legend treats both `click` and `mouseup` as clicks. `_isClickEvent()` in `helpers.core.ts` does the same for the chart's `onClick`. With `events: ['click', 'mouseup', ...]`, one press ran `onClick` twice (#11538; probe: count 2).
  - `mouseup` has been there since v2 (01b88f19). It is for charts that list `mouseup`, `touchend` or `pointerup` instead of `click`. `platform.dom.js` maps the last two to `mouseup`. The default `events` never had `mouseup`.
- When an event falls outside the chart area, `plugin.tooltip.js` (`_getActiveElements`) and `core.controller.js` (`_getActiveElements`) keep the last active elements. This came in with #9970 (v3.7.0) so that a tooltip set by a legend `onHover` through `setActiveElements` stays. As a side effect, a tooltip the pointer opened also stays when the pointer moves onto the legend (#11801; probe: 1 active before and after). The tests `plugin.tooltip.tests.js:1681` and `core.controller.tests.js:365` pin that behaviour.

### Visibility

- `_updateVisibility()` in `core.controller.js` animates `visible` and updates the dataset in `'hide'` mode (colours to transparent).
  - When the hidden dataset was active, the update replays the last event, or re-applies `_active` when the pointer is outside the chart area. Removing or re-applying the hover style starts an `'active'` colour animation. `Animation.update()` retargets the running hide animation to that colour.
  - Probe for #10882: borderColor goes `#FF000087` → transparent when not hovered, and `#F10000` → `#F00` when hovered, after which the line vanishes.
- `chart._hiddenIndices` is keyed by data index. `_updateHiddenIndices()` shifts it only for push, splice and shift. Replacing the labels array keeps the old indices (#10120; probe: after hiding `a` and replacing with `[b, c]`, `b` is hidden).
- `getMinMax()` in `core.datasetController.js` never asks whether a data item is hidden. A hidden bar collapses to its base on purpose (#7870), but it still counts towards the value axis (#11949; probe: y max stays 100). polarArea already leaves hidden data out of its own `getMinMax`.

### Types

`onClick`, `onHover` and `onLeave` are typed `(this: LegendElement<TType>, …, legend: LegendElement<TType>)` (`index.d.ts` 2464–2473). A handler whose `legend` parameter is annotated `LegendElement<ChartType>` becomes a second inference site for `TType`, so a line chart is typed as `ChartType`. `c.options.scales?.x?.title` then fails against the radialLinear options (#10442). This reproduces with TypeScript 4.9.5 and 6.0.3. #11666 did not reproduce with TypeScript 4.6 to 6.0, on master or on v4.4.1.

## Goals / Non-Goals

**Goals**

- One legend layout, computed in `fit()`, that hit-testing and drawing only read.
- Every issue the user put in scope is either completed by one piece or answered with the evidence for why no code is needed.
- The open legend pull requests that fit go first.
- Patch releases for the fixes. The new options go in 4.7.0.

**Non-Goals**

- Overflow when the items do not fit: paging, scrolling, ellipsis (#10893, #11397, #12129, #11825). This needs its own design on top of the layout.
- The v5 legend refactor (#9342): merging items and hit boxes into one state, a scriptable legend context, and replacing the styling in `generateLabels`.
- Text spacing on canvas (#12246), which would be a font option for all chart text.
- Following page scroll with a still pointer (#10384).
- Removing hidden categories from the category axis (#11949's second half; also a non-goal of isolate-category-scale-labels).
- Bold or italic text on hover (#11571 asks for it). The item's `fontColor` and the label font already allow styling, and only decoration is added.

## Decisions

1. **The layout lives in `fit()`, kept on a private `_layout`.** `fit()` is the only step that knows the font, the limits and the items together. `adjustHitBoxes()` keeps doing what only it can: placing lines in the final box and mirroring for right-to-left. It does not measure or wrap.
   - Alternative: compute in `draw()` and copy back to the hit boxes. Rejected: the hit boxes are needed before drawing, for events.
   - Alternative: merge `legendItems` and the hit boxes (#9342). Rejected: breaking, and the user chose 4.x.
2. **The shape of `_layout`:**
   - `font`: the label font resolved during fit;
   - `symbol: {width, height}` and `padding`;
   - `lines[]`: `{first, last, width, height, x, y}`;
   - `items[]`: `{line, x, y, width, height, symbol: {x, y, width, height}, text: {lines, x, y, textAlign, width, height}}`;
   - `title: {x, y, width, height, textAlign}` or null.

   Drawing takes geometry from the layout, and colours and styles from `legendItems[i]`. Because the font is the one fit measured with, a later change to the defaults cannot move items (#12196).
3. **The public fields keep their meaning.**
   - `legendHitBoxes[i]` is `{left, top, width, height, row | col}` in canvas coordinates.
   - `lineWidths[r]` is the sum of `itemWidth + padding` over row `r`.
   - `columnSizes[c]` is `{width, height}`.

   The hit box grows to cover aligned text (P4). That is the fix for #12067, not a change of meaning.
4. **The open PRs go first, before the refactor.** The user asked for that. Each is small and has a test that fails on master, so it is a releasable fix on its own. The refactor then keeps their tests green, and those tests guard it.
   - #12346 already makes draw follow the hit box's row or column in both orientations. That also fixes #12196, so #12205 (the same lines) is superseded, and its test moves into P1 with credit.
   - #12316 as it stands makes column-0 hit boxes 197 px wide in a two-column legend, so clicking an item in column 1 can return an item of column 0. Its author bounds the text area by the next column's left edge minus padding before it lands (P4).
5. **Refactor and behaviour stay apart.** P9 and P10 change no output: every legend fixture stays pixel-identical, and a spec counts `measureText` calls during `draw()` (zero after P9). The layout fixes that need the refactor (#11824, #11805) are their own pieces after it.
6. **`mouseup` counts as a click only when `click` is not listened to.** This keeps charts that list `mouseup`, `touchend` or `pointerup` instead of `click` working, and stops the double call. The rule sits in `_isClickEvent(e, events)`, which already owns "what is a click". The legend passes `this.options.events || chart.options.events`, mirroring the plugin event filter at `core.controller.js:1174`. Replay keeps the one-argument call.
   - Alternative: drop `mouseup` from the legend. Rejected: it breaks those charts.
7. **Active elements remember where they came from.** The chart and the tooltip each mark their active set as set by the pointer or by `setActiveElements`. Outside the chart area, a set made by the pointer becomes empty, and a set made by code is kept, validity-filtered as today.
   - Alternative: #11849's extra `update()` parameter. Rejected: moving back onto the same slice no longer showed the tooltip (found in its review), and it spreads the rule over the update path.
   - This restores the behaviour before 3.7.0 for the pointer and keeps what #9970 wanted for code. The two pinned tests are changed to set their active elements with `setActiveElements`.
8. **Hidden data cannot be active.** One check in `core.controller.js`: an item may be active only while its dataset is visible and its element is not hidden. `_updateHoverStyles` drops failing items from the activated set, and clears `active` on deactivated ones without animating, so the hide transition keeps its colours. The replay in `update()` moves into a helper that also filters `_active`, so `update()` does not grow (it is at the max-statements limit).
9. **Hidden state is re-keyed by label only when the labels array is replaced.** At update, when `data.labels` is a different array and something is hidden:
   - each hidden index is moved to its label's index in the new array;
   - equal labels match by occurrence, and arrays are compared by content;
   - a hidden label that is gone is dropped.

   The old labels are copied only while something is hidden. Wrappers that pass a new but equal array on every render keep their state, because the move is the identity.
   - Rejected: resetting on a new array (wrappers would lose state on every render), and keying everything by label (breaks charts without labels or with duplicate labels).
10. **Hidden bars leave the value axis.**
    - A protected controller hook says whether a data item is left out of bounds: false in the base class, `!getDataVisibility(i)` in the bar controller.
    - `getMinMax()` checks it only for the value axis, because the index axis' sorted fast path would trim only the first and last categories.
    - This matches polarArea. Line and scatter do not hide such points, so they are unchanged.
11. **The legend symbol offset is `labels.boxYOffset`.** #12242 calls it `pointStyleYOffset` and its types declare `datasetRadiusBuffer`, but it moves box symbols too. The name sits next to `boxWidth` and `boxHeight`. #11884 is answered by the option, not by moving the text: measured, the ink sits 0.4–0.8 px above the symbol's centre at 12–24 px, and moving it would change every legend image.
12. **Text decoration is a legend item property.** `LegendItem.textDecoration` (`'line-through' | 'underline' | 'none'`), with the hidden default kept, plus `labels.decorationWidth` (default 2). #4438 (transparency of hidden items) and #11885 (a border that does not follow the dataset) are answered by a docs sample that wraps the default `generateLabels`, not by new options. That keeps the option surface small until #9342.
13. **`padding` is the legend's outer space.** `labels.padding` stays the gap between items and the inner margin. A legend without `padding` lays out as before.
14. **Pieces that share a file with an open PR.** `plugin.legend.js`, `core.controller.js`, `index.d.ts`, `controller.bar.js` and `plugin.tooltip.js` are each held by several open PRs. Where those PRs are 4.6.3 candidates, the piece waits for them, so the release goes first. Where they are left out of the release plan, superseded or a feature, they rebase onto the piece instead (#11825, #12255, #12242 before it becomes P15, #12314, #12172, #11836, #12218).
15. **Tests sit with the test migration.** P1 to P5 add specs to `test/specs/plugin.legend.tests.js`. If migrate-tests-to-vitest converts that file first, they move with its recipe. Pieces written after the conversion use `plugin.legend.spec.js`. New image fixtures are made by whichever runner owns fixtures at the time.

## Risks / Trade-offs

- **`legendItems` is rebuilt in `afterUpdate`, after `fit()`.** If a filter changes the item count between the two, drawing pairs `_layout.items[i]` with `legendItems[i]` and draws only the shorter count. Today it draws at positions that do not exist. P9 adds a spec with a filter that changes its result between calls.
- **The pointer rule (P14) changes visible behaviour:** with `intersect: false`, the tooltip now hides when the pointer moves over the axes or the legend. It is released as a fix with a release-note line (Open Question 1).
- **Data visibility (P18, P19) changes defaults** for charts that replace labels or hide bars. That is why they are minor releases with a release-note line.
- **Plugins that call `_draw` internals or read `columnSizes[cursor.line]`-style state** may see different timing. Only the documented fields are kept.
- **#11825 must rebase onto P9.** It changes 666 lines of `plugin.legend.js` and re-implements two fixes this change makes. Its author is asked to build pages as ranges of layout lines.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12346: drawing follows each hit box's row or column; #12205's test moves in with credit | `src/plugins/plugin.legend.js`, `test/specs/plugin.legend.tests.js` | #12346's spec (master draws Beta at NaN); #12205's spec (master throws "reading 'height'") | ~60 | the author's changes (drop the fallback and the `1e-6`) | | #12345, #12196 |
| P2 | #12330: the title's width counts in a vertical legend | same | #12330's spec (master: legend 74 px, title 184 px) | ~70 | P1 (same file) | | #11850 |
| P3 | #12187: the title's left and right padding move it | same | new spec for start and end alignment, horizontal and vertical (master: x=0 with `padding.left: 50`) | ~40 | P2 (so the padding also widens a vertical legend), the author's test | | #12066, #11280 |
| P4 | #12316: hit boxes cover aligned text; each column's text area ends at the next column | same | #12316's 12 left/right center/right specs; a new two-column spec (clicking item 7 returns item 7) | ~110 | P1 (same lines), the author's column fix | | #12067 |
| P5 | Only arrays are multi-line labels | same | pie with labels `[2010, 2011]` on the right (master throws) | ~30 | P4 | | #11594 |
| P6 | One press runs `onClick` once (legend and chart) | `src/helpers/helpers.core.ts`, `src/plugins/plugin.legend.js` (event lines only), `src/core/core.controller.js`, `docs/configuration/interactions.md`, `docs/configuration/legend.md`, `test/specs/plugin.legend.tests.js`, `test/specs/core.controller.tests.js` | events `['click', 'mouseup']`: count 1 (master 2); `['mouseup']` only: count 1; the chart's `onClick` count 1 | ~90 | P5 (same file); #12391 (same file, 4.6.3); #12438 (other lines of helpers.core.ts, 4.6.3) | | #11538 |
| P7 | The legend callbacks do not infer the chart type | `src/types/index.d.ts`, `test/types/plugins/plugin.legend/*.ts` | `pnpm lint-types` on the #10442 snippet; a #11666 regression snippet (passes on master, kept as a guard) | ~50 | the 4.6.3 type PRs on `index.d.ts` (#12349, #12342, #12317, #12313, #12250, #12221) | | #10442, #11666 |
| P8 | Docs: the custom `onClick` per chart type, the TypeScript note for the HTML legend, a shadow-DOM-safe container in the HTML legend sample, and a note that `onLeave` does not fire while the page scrolls under a still pointer | `docs/configuration/legend.md`, `docs/samples/legend/html.md` | none (docs) | ~60 | P6 (same doc) | | #12144, #11877, #10624, #10384 |
| P9 | refactor: `_layout` for items; hit boxes and drawing read it | `src/plugins/plugin.legend.js`, `test/specs/plugin.legend.tests.js` | `measureText` count during `draw()` is 0 (master > 0); every legend fixture unchanged; a filter that changes its count between fit and draw does not throw | ~250 | P6 (same file) | #9342 | |
| P10 | refactor: the title's box in `_layout`; `drawTitle` reads it | same | no measuring during `drawTitle`; all title fixtures unchanged | ~80 | P9 | #9342 | |
| P11 | Rows as tall as their tallest item | same | three-line label in a top legend: the next row starts below line 3 (master overlaps) | ~40 | P10 | | #11824 |
| P12 | Wrap within `maxWidth` / `maxHeight` | same, plus `docs/configuration/legend.md` | right legend with `maxHeight: 100` wraps into columns (master: one column, 400 px) | ~40 | P11 | | #11805 |
| P13 | Hidden data is not active | `src/core/core.controller.js`, `test/specs/core.controller.tests.js`, `docs/samples/legend/html.md` (hide/show instead of setDatasetVisibility + update) | hovered line, `hide(0)`: border alpha at mid-animation is below its start; a slice hidden from the legend is not in `getActiveElements()` | ~130 | P6 (same file), P8 (same sample); #12391 | | #10882 |
| P14 | The pointer's active elements end outside the chart area | `src/plugins/plugin.tooltip.js`, `src/core/core.controller.js`, `test/specs/plugin.tooltip.tests.js`, `test/specs/core.controller.tests.js`, `docs/configuration/tooltip.md`, `docs/configuration/interactions.md` | pie: hover a slice, move onto a legend item: tooltip active 0 (master 1); back on the slice: 1 | ~200 | P13 (same file); #12275 (same file, 4.6.3); Open Question 1 | | #11801 |
| P15 | feat: `labels.boxYOffset` (#12242 renamed) | `src/plugins/plugin.legend.js`, `src/types/index.d.ts`, `docs/configuration/legend.md`, `docs/samples/legend/point-style.md`, fixture | #12242's spec (the symbol moves, the text does not) | ~60 | P12 (same file); the author's rename; 4.7.0 | | #11884 |
| P16 | feat: `LegendItem.textDecoration`, `labels.decorationWidth`; a legend item styling sample | `src/plugins/plugin.legend.js`, `src/helpers/helpers.canvas.ts`, `src/types/index.d.ts`, `docs/configuration/legend.md`, `docs/samples/legend/item-style.md` | underline drawn; strike width 1 with `decorationWidth: 1` (master always 2) | ~90 | P15 (same file); 4.7.0 | #11941 (legend part) | #11692, #11725, #11571, #4438, #11885 |
| P17 | feat: legend `padding` | `src/plugins/plugin.legend.js`, `src/types/index.d.ts`, `docs/configuration/legend.md` | the gap between a top legend and the chart area grows by `padding.bottom` | ~60 | P16 (same file), P12; 4.7.0 | | #11740, #11658 |
| P18 | feat: hidden state follows replaced labels | `src/core/core.controller.js`, `test/specs/core.controller.tests.js`, `docs/developers/api.md` | hide `a`, replace with `[b, c]`: `b` visible (master hidden); the equal-array spec; existing mutation specs stay green | ~140 | P14 (same file); 4.7.0 | | #10120 |
| P19 | feat: hidden bars leave the value axis | `src/core/core.datasetController.js`, `src/controllers/controller.bar.js`, `test/specs/controller.bar.tests.js`, `docs/developers/api.md` | bar `[10, 100]`, hide item 1: y max below 100 (master 100) | ~90 | P18 (same doc); #12332, #12241 and the 4.6.3 bar PRs (#12335, #12334, #12331, #12263) on the same files; 4.7.0 | #11949 | |

**In parallel:** P7 waits on nothing in this change. Within each of the two chains (P1 → P6 → P9 → … → P17 on the legend, and P6 → P13 → P14 → P18 on the controller), the order comes from a shared file. P8 needs only P6. P19 needs only P18's docs line and can be built beside P15 to P17.

**Issue completed by no piece, with the reason:** #11804 and #11263 are fixed on master. #5665 is done by `pointStyleWidth` (3.8). #11234 is fixed by #12292 (4.6.2). #11194 and #11730 are possible with `generateLabels`/`filter`. #10196 uses an HTML legend. #11380 calls `generateLabels` with the legend instead of the chart. #11949 is advanced by P19, and its category half is a non-goal. #11941 is advanced by P16 for the legend only. The overflow issues are non-goals.

## Contracts

- **P1 → P4, P9:** drawing places item `i` in `legendHitBoxes[i].row` (horizontal) or `.col` (vertical).
- **P4 → P9:** an item's text area runs from after its symbol to the next column's left edge minus `labels.padding`. For the last column, it runs to the legend's right edge. The hit box covers the symbol and the text inside that area.
- **P9 → P10, P11, P12, P15, P16, P17:** `_layout` as in Decision 2.
  - `fit()` writes everything except absolute positions.
  - `adjustHitBoxes()` writes absolute positions and `legendHitBoxes`.
  - `_draw()` reads `_layout` and the styles of `legendItems`, and nothing else.
- **P6:** `_isClickEvent(e, events?)`. With `events` given, `mouseup` counts only when `events` lacks `click`. Without `events`, it behaves as before.
- **P13 → P14:** one helper in `core.controller.js` decides whether an active item is still allowed (dataset visible, element not hidden). P14 uses it for the tooltip's code-set elements.
- **P14:** the chart and the tooltip each keep a flag saying whether their active elements were set by the pointer or by `setActiveElements`. Setting them by code sets it; a pointer event that changes them clears it.
- **P15 → P16:** `labels.boxYOffset` moves only `_layout.items[i].symbol.y`.

## Open Questions

1. **P14, release level.** The tooltip closing outside the chart area changes what users see. Two tests pin today's behaviour.
   - Options: (a) a fix in a patch with a release-note line, since it restores pre-3.7 behaviour for the pointer; (b) a fix in 4.7.0; (c) an option.
   - Recommendation: (a).
2. **P18 and P19, release level.** They change defaults that users can see.
   - Options: 4.7.0 with release notes; patch; 5.0.
   - Recommendation: 4.7.0.
3. **P15, the option's name.**
   - Options: `labels.boxYOffset`; keep `pointStyleYOffset`; `labels.symbolOffset`.
   - Recommendation: `boxYOffset`.
4. **P16, the option's shape.**
   - Options: an item property plus `labels.decorationWidth`; flat `labels.strikethrough` / `labels.hiddenOpacity`; a style callback.
   - Recommendation: the item property.
5. **#11825 (legend navigation) and overflow.** This change leaves them out.
   - Options: ask the author to rebase onto P9 and drop the duplicate fixes, with overflow designed next (4.8); fold navigation into this change.
   - Recommendation: rebase, and design overflow next.
6. **Collapsed hidden bars and hit-testing.** A hidden bar at zero height can still be found with `intersect: false`.
   - Options: P13 also checks data visibility for controllers with P19's hook; a follow-up.
   - Recommendation: a follow-up.
