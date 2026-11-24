## Why

The legend works out its layout three times: once when it is fitted, once when its hit boxes are placed, and once more while it is drawn, each time with its own measuring and wrapping. When the three disagree, items go missing, overlap, crash the chart or cannot be clicked (#12345, #12196, #11824, #12067, #11805, #11850). Around the legend, clicking, hovering and hiding datasets also misbehave (#11538, #11801, #10882, #10120), and two legend callbacks break type inference (#10442).

## What Changes

- The legend measures and wraps its items once, when it is fitted. Placing the hit boxes and drawing only read that layout. The output stays the same wherever the three agreed: every existing legend image is unchanged.
- Fixes on the layout:
  - every item is drawn in the row or column its hit box is in, whatever the rounding or a font change after the update;
  - multi-line labels take their full height in a horizontal legend;
  - numeric labels work in a vertical legend;
  - the title's width and its left and right padding count;
  - the hit box covers the text wherever `textAlign` puts it, and text stays inside its column;
  - `maxWidth` limits a top/bottom legend and `maxHeight` a left/right one.
- One press runs `onClick` once, also when the chart listens to both `click` and `mouseup`. This applies to the legend's and the chart's `onClick`.
- The tooltip and the hover style the pointer started end when the pointer leaves the chart area. Active elements set by code still stay.
- A dataset or data item that is hidden is no longer active, so hiding a hovered dataset fades it out.
- The legend callbacks no longer decide the chart type in TypeScript.
- New options (minor release):
  - `labels.boxYOffset` moves the legend symbol vertically;
  - a legend item's `textDecoration` and `labels.decorationWidth` style the text (strike-through, underline or none);
  - `padding` sets the space around the legend.
- Data visibility changes (minor release):
  - when `data.labels` is replaced by a new array, the hidden state follows the labels instead of the indices;
  - a hidden bar data item no longer counts towards the value axis.
- No change is **BREAKING**. The behaviour changes that users can notice are listed in the release notes of their pieces: the tooltip closing outside the chart area, hidden state following labels, and the value axis shrinking for hidden bars.

## Capabilities

### New Capabilities

- `legend-layout`: where legend items, their symbols, text and the title are placed, and how the legend wraps within its limits.
- `legend-item-style`: how a legend item's symbol and text are styled.
- `legend-events`: which pointer events run the legend's (and the chart's) click, hover and leave callbacks.
- `active-elements`: which elements are active, and when the pointer's active elements end.
- `data-visibility`: how hidden datasets and data items behave when they are hidden, replaced or measured by an axis.
- `legend-typings`: what the TypeScript types infer from legend options.

### Modified Capabilities

None. `openspec/specs/` holds no specs yet.

## Impact

- Code:
  - `src/plugins/plugin.legend.js`;
  - `src/plugins/plugin.tooltip.js`;
  - `src/core/core.controller.js`;
  - `src/core/core.datasetController.js`;
  - `src/controllers/controller.bar.js`;
  - `src/helpers/helpers.core.ts`, `src/helpers/helpers.canvas.ts`;
  - `src/types/index.d.ts`.
- Docs:
  - `docs/configuration/legend.md`, `interactions.md`, `tooltip.md`;
  - `docs/developers/api.md`;
  - `docs/samples/legend/html.md`, and a new legend item styling sample.
- Public fields `legendHitBoxes`, `lineWidths` and `columnSizes` keep their meaning. The new layout is private.
- Releases: P1 to P14 are fixes and refactors for patch releases (4.6.x). P15 to P19 add options or change visible defaults, so they go in 4.7.0.
- Open pull requests:
  - #12346, #12330, #12187 and #12316 are the first pieces, in that order. #12187 and #12316 need changes by their authors.
  - #12205 is superseded by #12346; its test moves into P1 with credit.
  - #12242 becomes P15 after a rename.
  - #11849 is superseded by P14.
  - #11825 (legend navigation) is not part of this change. It is asked to rebase onto the shared layout (P9) and drop its copies of the #11280 and #11824 fixes.
- Issues with no code in this change, and why:
  - fixed on master: #11804 (#11858), #11263, #5665 (`pointStyleWidth`), #11234 (#12292, in 4.6.2);
  - by design or possible today: #11194 and #11730 (`generateLabels`), #10196 (HTML legend), #11380 (call with the chart, not the legend);
  - not reproducible: #11666 (a regression test is added in P7).
- Left for later designs: overflow when the items do not fit (#10893, #11397, #12129, #11825), text spacing on canvas (#12246), the v5 legend refactor (#9342), and following page scroll (#10384, documented in P8).
