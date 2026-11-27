## Context

All references are to `upstream/master` at 5b8b60b5, and to `src/elements/element.bar.ts` as PR #12572 (0618a267) converts it.

**How a bar is drawn today.** `BarElement.draw(ctx)` calls `boundingRects(this)`, which builds the outer and inner rectangles through `getBarBounds`, `parseBorderWidth` (`toTRBL`) and `parseBorderRadius` (`toTRBLCorners`). Each one returns a new object. `draw` then does `save()`. For a bar with a border it adds the outer rectangle (grown by `inflateAmount` on its bordered sides), calls `clip()`, adds the inner rectangle (shrunk on the bordered sides) and fills the two with `'evenodd'` in the border colour. For every bar it then fills the inner rectangle, grown on all four sides, in the background colour, and calls `restore()`. On a side with no border, the clip is what cuts the background's growth back.

**Readers.**

- `BarController.draw` (`src/controllers/controller.bar.js:676-688`) is the only caller of a bar's `draw` in `src`. Nothing in `src` or `test` extends `BarElement`.
- `inRange`, `inXRange` and `inYRange` use `getBarBounds(bar, useFinalPosition)`. rework-bar-chart P16, not yet started, adds `_getAreaCenter` beside them and changes `tooltipPosition`.
- `_drawDataset` (`src/core/core.controller.js:856-877`) wraps `controller.draw()` in `clipArea` (save + clip) and `unclipArea` (restore) only when the dataset clip is on.
- `addRoundedRectPath` (`src/helpers/helpers.canvas.ts:500`) is shared with the legend, the tooltip and the radial scale. It is not changed.
- `test/specs/element.bar.unit.spec.js` has no draw test. `controller.bar.spec.js:1679-1703` counts `clip` calls for bars without a border.
- Fixture tolerances are set per file (`threshold`, `tolerance`; defaults 0.1 and 0.001). One value applies to both browsers. `docs/developers/contributing.md:127` asks for the lowest value that passes on both browsers, on macOS and on Linux.

**Measured** (5000 bars, 1600×800, `devicePixelRatio` 1, median frame of the bar controllers' `draw()`, one browser process per variant):

| Bars | Engine | master | no clip, no save | `fillRect` |
|---|---|---|---|---|
| plain | Chromium headless | 8.1 ms | 5.9 ms | 3.7 ms |
| plain | Firefox | 9.0 ms | 7.0 ms | 4.0 ms |
| border 2 | Chromium headless | 59.2 ms | 29.8 ms | |
| border 2 | Firefox | 65 ms | 33 ms | |
| border 2, radius 6 | Chromium headless | 77.7 ms | 31.6 ms | |
| border 2, radius 6 | Firefox | 101 ms | 38 ms | |

Headed Chromium with GPU rasterisation gives the same ratios. With the clip kept and the save removed, a bordered frame takes 56.5 ms; with the save kept and the clip removed, 30.7 ms. So the clip is the cost. Save/restore costs about 0.8 ms per 5000 plain bars. Master allocates about 630 B per bar per draw for a plain bar and about 1010 B for a bordered and rounded one. Over 300 frames of 5000 bordered bars, master runs 348 scavenges and 10 mark-compacts; geometry kept in locals runs none.

**Pixels.** A working experiment (`fillRect` for plain bars; no clip, ring with `'evenodd'`, background grown on the bordered sides only) changes no Chromium fixture through `fillRect`. Without the clip, 7 Chromium fixtures change by 0.13 to 0.87 % of their pixels, and no channel differs by more than 128. The difference is the outer edge, which the clip antialiased twice. In Firefox, after those 7 are regenerated from Chromium, one more fixture is just over its tolerance: `borderRadius/border-radius-stacked-number-with-order`, 136 px, 0.1 %.

## Goals / Non-Goals

**Goals**

- Bordered bars without a clip per bar.
- Plain bars as one `fillRect`.
- No per-bar save/restore; the context restored once per dataset.
- No allocation in `draw` for numeric borders and radii.

**Non-Goals**

- **Batching bars into one path.** One path per dataset took 245 ms against 8.1 ms. It is not pursued.
- **Caching `fillStyle`.** Skipping a write of an unchanged colour gained nothing (3.6 ms against 3.7 ms).
- **Hit testing without allocation.** `getBarBounds` keeps returning a new object (D4).
- **#12094, #9906, #10477** (gaps and seams between border and fill, or between bars without borders, and a Safari-only line). The change is not shown to fix them, and no piece closes them.
- **Stroked or dashed borders, and a radius for the whole stack.** These stay as rework-bar-chart's non-goals say.

## Decisions

### D1. The ring is filled with the even-odd rule, without a clip

The outer path (grown by `inflateAmount` on the bordered sides) and the inner path (shrunk on the bordered sides) are filled with `'evenodd'` in the border colour. The background path is the inner rectangle grown on the bordered sides only. That is the intersection the clip produced, so the covered areas are the same.

Alternatives:
- Keep the clip: it is half of a bordered frame.
- Fill the outer shape in the border colour, then the inner shape in the background colour: a semi-transparent background would show the border colour through it.

### D2. Plain bars use `fillRect`

A bar without a border and without a radius is one `fillRect` of the inner rectangle grown on all sides. No path is built. This changed none of the 670 fixtures in Chromium.

For the background of a bordered square bar, `fillRect` gained 3 to 6 % (31.9 against 29.9 ms in Chromium, 35 against 34 ms in Firefox), which is within noise. That background stays a path, so the bordered paths for square and rounded bars are the same code.

### D3. Context state is restored once per dataset, in the chart

The bar stops calling `save()` and `restore()`. `_drawDataset` calls `ctx.save()` when the dataset clip is off, and always ends with `restore()`. Inside a chart, nothing a controller sets on the context then leaks under either clip setting.

The current path is not part of the saved state, so the last bar's path already outlives `restore()` today; that does not change. Code that calls a bar's `draw(ctx)` directly now finds `fillStyle` set to the bar's last fill colour; the release line says so.

Alternatives (open question Q1):
- One save/restore in `BarController.draw`: that file is held by rework-bar-chart P4 and five open pull requests.
- Let `fillStyle` leak under `clip: false`.
- Keep the per-bar save: about 20 % of a plain frame after D2.

### D4. Geometry is written into module storage

`draw` writes the outer, inner and temporary rectangles into module-level objects of the same shape. `draw` is synchronous and never re-entered, so sharing them is safe. Each temporary rectangle is consumed by `rect`, `fillRect` or `addRoundedRectPath` before it is written again.

- The "inflate into" step keeps today's `!==` side comparisons, so the coordinates are the same bit for bit.
- A numeric border or radius takes a fast path. An object still goes through `toTRBL` or `toTRBLCorners`, so the x/y shorthands and the "missing side is 0" rule hold.
- The props arrays become module constants.
- A private `writeBarBounds(bar, final, out)` does the orientation math. `getBarBounds(bar, final)` keeps its signature and returns `writeBarBounds(bar, final, {})`, so `inRange` and rework-bar-chart P16 build on today's contract.

Alternative: hit testing in scratch storage too. That changes what P16 builds on, for a path that runs once per pointer event, not once per frame.

### D5. The Firefox fixture gets its own tolerance

`border-radius-stacked-number-with-order.js` gets the lowest `tolerance` that passes in Firefox, Chromium, macOS and Linux (about 0.0015) and keeps `threshold: 0.01`. Reference images are made in Chromium, so this fixture is not regenerated from Firefox.

Alternatives:
- Raise its threshold: that loosens every pixel, not the count.
- Add a per-browser tolerance to chartjs-test-utils: a feature in another package.

### D6. The capability is specified

`bar-drawing` records the covered areas, the single antialiasing of the outer edge and the context state, because users can see the last two.

## Risks / Trade-offs

- **Visible edge change.** The outer edge of bordered bars is darker than before, by an antialiasing step. P4's release line says so, and names the seam that goes away on `borderSkipped: 'middle'` stacks.
- **Direct callers of `bar.draw(ctx)`** see `fillStyle` changed (D3). Nothing in the repository does this.
- **Third-party controllers with `clip: false`** that relied on their context changes outliving the dataset draw lose them. P1's release line says so.
- **rework-bar-chart P16** edits `element.bar.ts` in another region. Whichever lands second rebases. `getBarBounds` keeps its contract (D4) and `tooltipPosition` is not touched here.
- **Measurements come from headless and headed Chromium and from Firefox on macOS.** Safari was not measured. The builder repeats the bench (`openspec/changes/optimize-bar-drawing/bench/`) on its own machine before and after each perf piece, and puts the numbers in the pull request.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | fix: a dataset drawn with `clip: false` leaves the context as it found it (D3) | `src/core/core.controller.js`, `test/specs/core.controller.spec.js` | a bar controller subclass sets `ctx.fillStyle = '#ff0000'` after `super.draw()`; dataset `clip: false`; a plugin's `afterDatasetDraw` reads `chart.ctx.fillStyle` on a real canvas: `'#ff0000'` on master, expect `'#000000'`; the same with the default clip passes on master and after | ~40 | Q1 | | |
| P2 | refactor: bar draw geometry in module storage; `writeBarBounds` shared with `getBarBounds` (D4) | `src/elements/element.bar.ts`, `test/specs/element.bar.unit.spec.js` | none (refactor): a new "draw calls" spec on the mock context asserts exact call names and arguments for plain, rounded, bordered with `borderSkipped: {bottom: true}`, bordered and rounded, partial `borderWidth: {top: 2}` and object radius; the same on master and after; every fixture unchanged; the pull request carries the GC counts before and after | ~200 | #12572 | | |
| P3 | perf: bars without a border are one fill, without save/restore (D2, D3) | `element.bar.ts`, unit spec | plain bar (x 10, y 0, base 20, width 10, `inflateAmount` 0.5): master records `save, beginPath, rect(4.5, -0.5, 11, 21), setFillStyle, fill, restore`, expect `setFillStyle, fillRect(4.5, -0.5, 11, 21)`; rounded without a border: master's calls without `save` and `restore`; no fixture changes | ~40 | P1, P2 | | |
| P4 | perf: bordered bars without a clip per bar (D1, D5) | `element.bar.ts`, unit spec, `test/specs/controller.bar.spec.js`, 7 `test/fixtures/controller.bar` images, `border-radius-stacked-number-with-order.js`, `docs/general/performance.md` | the bordered bar of P2's spec: master records `save, beginPath, rect, clip, rect, setFillStyle, fill('evenodd'), beginPath, rect, setFillStyle, fill, restore`, expect the ring calls without `save`, `clip` and `restore`, then the background on the bordered sides only; the clip spec with `borderWidth: 2`, `clip: false` and 3 bars: 3 `clip` calls on master, expect 0 | ~80 | P3 | | |

The 7 images P4 regenerates with `pnpm fixtures:update`: `borderRadius/border-radius`, `borderSkipped/middle`, `horizontal-borders`, `minBarLength/horizontal-neg`, `minBarLength/horizontal-pos`, `minBarLength/vertical-neg`, `minBarLength/vertical-pos`.

**Parallel:** P1 can be built now, beside #12572. P2 starts when #12572 has merged. P3 and P4 follow in order, because each edits `element.bar.ts`.

**Release lines.** All are patch lines. P1: the context is restored after every dataset draw, also with `clip: false`. P3 and P4: bar drawing is faster. P4 also names the single-antialiased outer edge and the seam that goes away on bordered stacks. P3 or P4, whichever merges first, names the fill style that direct `bar.draw(ctx)` callers now see.

## Contracts

- **P1 → P3, P4:** `_drawDataset` restores the context after `controller.draw()` whatever the dataset clip, so a bar need not.
- **P2 → P3, P4:** the module storage and `writeBarBounds(bar, final, out)`. `getBarBounds(bar, final)` returns a new `{left, top, right, bottom}` as before. The "draw calls" spec lists every case P3 and P4 change.
- **This change → rework-bar-chart P16:** `getBarBounds` keeps its signature and result, and `tooltipPosition` is not changed.

## Open Questions

- **Q1 (P1, P3).** Where is the context restored once the bar stops saving it? Options: A, `_drawDataset` once per dataset (recommended, D3); B, `BarController.draw`; C, nowhere, so `fillStyle` leaks under `clip: false`; D, keep the per-bar save. With C or D, P1 is dropped, and with D, P3 and P4 keep `save` and `restore`.
