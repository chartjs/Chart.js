## Context

All references are to `upstream/master` after #12572, which converted the bar element to `src/elements/element.bar.ts`. The bar controller is still `src/controllers/controller.bar.js`; rework-bar-chart P4 renames it to `.ts`.

**How a bar is drawn today.**

1. `BarElement.draw(ctx)` calls `boundingRects(this)`.
   - It builds the outer and inner rectangles through `getBarBounds`, `parseBorderWidth` (`toTRBL`) and `parseBorderRadius` (`toTRBLCorners`).
   - Each of these returns a new object.
2. `draw` calls `save()`.
3. For a bar with a border:
   - add the outer rectangle, grown by `inflateAmount` on its bordered sides;
   - call `clip()`;
   - add the inner rectangle, shrunk on the bordered sides;
   - fill the two with `'evenodd'` in the border colour.
4. For every bar: fill the inner rectangle, grown on all four sides, in the background colour.
5. `draw` calls `restore()`.

On a side with no border, the clip is what cuts the background's growth back.

**Readers.**

- **Callers of `draw`:**
  - `BarController.draw` (`src/controllers/controller.bar.js:676-688`) is the only caller of a bar's `draw` in `src`.
  - Nothing in `src` or `test` extends `BarElement`. It is a public export, so subclasses outside the repository may exist.
- **Hit testing:**
  - `inRange`, `inXRange` and `inYRange` use `getBarBounds(bar, useFinalPosition)`.
  - rework-bar-chart P16, not yet started, adds `_getAreaCenter` beside them and changes `tooltipPosition`.
- **Context state:**
  - `_drawDataset` (`src/core/core.controller.js:856-877`) wraps `controller.draw()` in `clipArea` (save + clip) and `unclipArea` (restore), but only when the dataset clip is on.
  - `PointElement.draw` sets `strokeStyle`, `lineWidth` and `fillStyle` without saving them. With `clip: false`, those styles already reach `afterDatasetDraw` and the next dataset.
  - In the sibling chart and plugin repositories, every fill or stroke that was read starts with `beginPath()` and sets its own styles. None reads a style or path left by a bar.
- **`addRoundedRectPath`** (`src/helpers/helpers.canvas.ts:500`) is shared with the legend, the tooltip and the radial scale. It is not changed.
- **Tests:**
  - `test/specs/element.bar.unit.spec.js` has no draw test.
  - `controller.bar.spec.js:1679-1703` counts `clip` calls for bars without a border.
- **Fixture tolerances:**
  - They are set per file (`threshold` and `tolerance`; the defaults are 0.1 and 0.001), and one value applies to both browsers.
  - `docs/developers/contributing.md:127` asks for the lowest value that passes on both browsers, on macOS and on Linux.

**Measured.** Setup: 5000 bars on a 1600×800 canvas at `devicePixelRatio` 1. Each figure is the median frame of the bar controllers' `draw()`, with one browser process per variant. The scripts are in `bench/`.

| Bars | Engine | master | no clip, no save | `fillRect` |
|---|---|---|---|---|
| plain | Chromium headless | 8.1 ms | 5.9 ms | 3.7 ms |
| plain | Firefox | 9.0 ms | 7.0 ms | 4.0 ms |
| border 2 | Chromium headless | 59.2 ms | 29.8 ms | |
| border 2 | Firefox | 65 ms | 33 ms | |
| border 2, radius 6 | Chromium headless | 77.7 ms | 31.6 ms | |
| border 2, radius 6 | Firefox | 101 ms | 38 ms | |

- **Engines:** headed Chromium with GPU rasterisation gives the same ratios.
- **The clip is the cost of bordered bars.** For bordered bars, removing only the save left 56.5 ms; removing only the clip left 30.7 ms.
- **Plain bars after `fillRect`:**

  | Plain-bar variant | Time |
  |---|---|
  | `fillRect`, geometry in locals, no save | 3.7 ms |
  | `fillRect`, with save/restore kept | 5.1 ms |
  | `fillRect`, today's allocating geometry | 4.9 ms |

- **Bordered bars:** the allocating geometry is noise (30.1 against 29.4 ms).
- **Garbage:**
  - Master allocates about 630 B per bar per draw for a plain bar, and about 1010 B for a bordered, rounded one.
  - Over 300 frames of 5000 bordered bars, master runs 348 scavenges and 10 mark-compacts; geometry kept in locals runs none.

**Pixels.** A working experiment used `fillRect` for plain bars, and for bordered bars no clip, a ring with `'evenodd'` and a background grown on the bordered sides only.
- **`fillRect`** changes no Chromium fixture.
- **Without the clip, 7 Chromium fixtures change.**
  - Each changes by 0.13 to 0.87 % of its pixels, and no channel differs by more than 128.
  - The difference is the outer edge, which the clip antialiased twice.
- **Firefox:** after those 7 are regenerated from Chromium, one more fixture is just over its tolerance: `borderRadius/border-radius-stacked-number-with-order`, 136 px, 0.1 %.

## Goals / Non-Goals

**Goals**

- Bordered bars without a clip per bar.
- Plain bars as one `fillRect`.
- No per-bar save/restore; one per bar dataset, in the controller.
- No allocation in `draw` for numeric borders and radii.

**Non-Goals**

- **Batching bars into one path.** One path per dataset took 245 ms against 8.1 ms.
- **Caching `fillStyle`.** Skipping a write of an unchanged colour gained nothing (3.6 against 3.7 ms).
- **`fillRect` for the background of bordered square bars.** It gained 3 to 6 % (31.9 against 29.9 ms in Chromium, 35 against 34 ms in Firefox), which is within noise. The bordered paths for square and rounded bars stay the same code.
- **Hit testing without allocation.** `getBarBounds` keeps returning a new object (D4).
- **Changing context state for other chart types** (review, D3). Only the bar controller changes.
- **#12094, #9906, #10477.** These are gaps and seams between border and fill, or between bars without borders, and a Safari-only line. The change is not shown to fix them, and no piece closes them.
- **Stroked or dashed borders, and a radius for the whole stack.** These stay non-goals, as rework-bar-chart says.

## Decisions

### D1. The ring is filled with the even-odd rule, without a clip

The outer path is grown by `inflateAmount` on the bordered sides. The inner path is shrunk on the bordered sides. The two are filled with `'evenodd'` in the border colour.

The background path is the inner rectangle grown on the bordered sides only. That is the intersection the clip produced:
- On a skipped side, the outer and inner edges are the same, and corner radii next to a skipped side are 0.
- So the rounded intersection and the rounded rectangle of the intersection coincide.

Alternatives:
- Keep the clip: it is half of a bordered frame.
- Fill the outer shape in the border colour, then the inner shape in the background colour: a semi-transparent background would show the border colour through it.

### D2. Plain bars use `fillRect`

A bar without a border and without a radius is one `fillRect` of the inner rectangle grown on all sides. No path is built. This changed none of the 670 fixtures in Chromium.

### D3. The bar controller saves and restores the context once per dataset

The per-bar `save()` and `restore()` go: they are 1.4 ms of a 3.7 ms plain frame. `BarController.draw` calls `save()` before its loop over the bars and `restore()` after it. That is the user's choice (2026-11-28, Q1).

- **Inside a chart.** Nothing a bar sets leaks out of the dataset draw, with or without the dataset clip. That holds as long as the controller wraps the bars' draws.
- **Outside a chart.** Code that calls a bar's `draw(ctx)` directly, or a subclass that draws after `super.draw(ctx)`, finds `fillStyle` set to the bar's last fill colour.
- **The current path.** A plain bar builds no path, so after P3 the current path is whatever was current before the bar; today it is the last bar's rectangle. The path is not part of the saved state, so the controller's restore does not change this.

The controller file is held by open pull requests (#12334, #12566, #12335) and is renamed by rework-bar-chart P4, which waits for them. The controller change is therefore its own small piece (P2), placed after rework-bar-chart P4.

Alternatives:
- **Nothing beyond the dataset clip, as points do.** This was the recommendation. With `clip: false`, `fillStyle` would leak to `afterDatasetDraw`.
- **`_drawDataset` saves and restores also with `clip: false`.** This changes what `afterDatasetDraw` and the next dataset see for every chart type with `clip: false`. Today they see the last point's styles; after it, the defaults (review).
- **Keep the per-bar save:** 27 % of a plain frame.

### D4. Geometry is not allocated in `draw`

`draw` keeps the outer, inner and temporary rectangles in locals or in module-level objects of the same shape.
- `draw` is synchronous, and scriptable options are resolved before it runs. So shared module objects are safe from re-entry.
- The "inflate into" step keeps today's `!==` side comparisons, so the coordinates are the same bit for bit.
- A numeric border or radius takes a fast path. An object still goes through `toTRBL` or `toTRBLCorners`, so the x/y shorthands and the "missing side is 0" rule hold.
- The props arrays become module constants.
- A private `writeBarBounds(bar, final, out)` does the orientation math. `getBarBounds(bar, final)` keeps its signature and returns `writeBarBounds(bar, final, {})`, so `inRange` and rework-bar-chart P16 build on today's contract.

The gain is 1.2 ms of a 4.9 ms plain frame, plus about one minor collection per frame at 5000 bars; for bordered bars it is the collections only (review).

Alternative: hit testing in scratch storage too. That changes what P16 builds on, for a path that runs once per pointer event, not once per frame.

### D5. The Firefox fixture gets its own tolerance

`border-radius-stacked-number-with-order.js` gets the lowest `tolerance` that passes in Firefox and Chromium, on macOS and Linux (about 0.0015). It keeps `threshold: 0.01`. Reference images are made in Chromium, so this fixture is not regenerated from Firefox.

Alternatives:
- Raise its threshold: that loosens every pixel, not the count.
- Add a per-browser tolerance to chartjs-test-utils: a feature in another package.

### D6. The capability is specified

`bar-drawing` records the covered areas and the single antialiasing of the outer edge, because users can see the edge.

The spec does not promise anything about seams between stacked segments. The `borderSkipped/middle` image looks better without the clip, but no test pins it (review).

### D7. What the plan review changed

- The core `_drawDataset` change was dropped (D3). It would have changed context state for every chart type with `clip: false`. The user chose the bar controller instead.
- The spec's context-state requirement now covers bar datasets only. The spec no longer writes the leftover `fillStyle` of direct callers into a SHALL, and no longer promises the seam.
- D3 now says the current path changes for plain bars.
- The release lines name `BarElement` subclasses.
- Keeping the per-bar save, and keeping the allocating geometry, were both measured (D3, D4) before deciding.
- The controller's save/restore is its own piece (P2), so that the element pieces do not wait on the controller file longer than they must.
- The bench was cut to one runner and one collection counter.

## Risks / Trade-offs

- **Visible edge change.** The outer edge of a bordered bar is darker than before, by an antialiasing step. P3's release line says so.
- **Leftover context state.** Direct `draw(ctx)` callers and `BarElement` subclasses find `fillStyle` set (P3, P4), and a plain bar leaves the previous path current (P3). P3's release line says so. No reader in this repository or in the sibling repositories depends on either.
- **The controller file is contended.** P2 waits on rework-bar-chart P4. After that, rework-bar-chart P5 and later pieces keep editing `controller.bar.ts`; P2 is a few lines in `draw`, which none of them changes, so whichever lands second rebases.
- **rework-bar-chart P16** edits `element.bar.ts` in another region. Whichever lands second rebases. `getBarBounds` keeps its contract (D4), and `tooltipPosition` is not touched here.
- **Measurement coverage.** The numbers come from headless and headed Chromium and from Firefox on macOS. Safari was not measured. The builder repeats `bench/` before and after each piece on its own machine and puts the numbers in the pull request.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | refactor: bar draw geometry without allocation; `writeBarBounds` shared with `getBarBounds` (D4) | `src/elements/element.bar.ts`, `test/specs/element.bar.unit.spec.js` | None, since this is a refactor. A new "draw calls" spec on the mock context asserts exact call names and arguments for six cases: plain, rounded, bordered with `borderSkipped: {bottom: true}`, bordered and rounded, partial `borderWidth: {top: 2}`, object radius. It gives the same result on master and after, and every fixture is unchanged. `bench/gc.cjs` gives 0 collections over 300 frames of 5000 bordered bars (master: about 340). | ~200 | | | |
| P2 | refactor: the bar controller saves and restores the context once around its bars (D3) | `src/controllers/controller.bar.ts`, `test/specs/controller.bar.spec.js` | A bar dataset with `clip: false` on a real canvas. The spec wraps `BarElement.prototype.draw` so that it sets `ctx.fillStyle = '#ff0000'` after the original draw, as a bar without its own save does. A plugin's `afterDatasetDraw` reads `chart.ctx.fillStyle`: `'#ff0000'` on master; expect `'#000000'`. No fixture changes. | ~40 | rework-bar-chart P4 | | |
| P3 | perf: bars without a border are one fill, without save/restore (D2, D3) | `element.bar.ts`, unit spec | Plain bar (x 10, y 0, base 20, width 10, `inflateAmount` 0.5): master records `save, beginPath, rect(4.5, -0.5, 11, 21), setFillStyle, fill, restore`; expect `setFillStyle, fillRect(4.5, -0.5, 11, 21)`. Rounded bar without a border: master's calls without `save` and `restore`. P2's spec still passes. No fixture changes. | ~40 | P1, P2 | | |
| P4 | perf: bordered bars without a clip per bar (D1, D5) | `element.bar.ts`, unit spec, `test/specs/controller.bar.spec.js`, 7 `test/fixtures/controller.bar` images, `border-radius-stacked-number-with-order.js`, `docs/general/performance.md` | (1) The bordered bar of P1's spec: master records `save, beginPath, rect, clip, rect, setFillStyle, fill('evenodd'), beginPath, rect, setFillStyle, fill, restore`; expect the ring calls without `save`, `clip` and `restore`, then the background on the bordered sides only. (2) The clip spec with `borderWidth: 2`, `clip: false` and 3 bars: 3 `clip` calls on master; expect 0. | ~80 | P3 | | |

P4 regenerates 7 images with `pnpm fixtures:update`, all under `controller.bar/`:
- `borderRadius/border-radius`
- `borderSkipped/middle`
- `horizontal-borders`
- `minBarLength/horizontal-neg`
- `minBarLength/horizontal-pos`
- `minBarLength/vertical-neg`
- `minBarLength/vertical-pos`

**Parallel.** P1 (element) and P2 (controller) can be built in parallel; P1 can start now, and P2 once rework-bar-chart P4 has merged. P3 waits on both, and P4 on P3.

**Release lines.** All are patch lines.
- **P1 and P2:** none; they are refactors.
- **P3:** bars without a border draw about twice as fast. Direct `draw(ctx)` callers and `BarElement` subclasses find `fillStyle` set to the bar's last fill colour, and a plain bar no longer leaves its rectangle as the current path.
- **P4:** bordered bars draw about twice as fast. Their outer edge is antialiased once, so it is slightly darker than before.

## Contracts

- **P1 → P3, P4:**
  - the geometry storage and `writeBarBounds(bar, final, out)`;
  - `getBarBounds(bar, final)` returns a new `{left, top, right, bottom}`, as before;
  - the "draw calls" spec lists every case P3 and P4 change.
- **P2 → P3, P4:** `BarController.draw` saves the context before drawing its bars and restores it after, so a bar need not.
- **rework-bar-chart P4 → P2:** `src/controllers/controller.bar.ts` exists.
- **This change → rework-bar-chart P16:** `getBarBounds` keeps its signature and result, and `tooltipPosition` is not changed.

## Open Questions

None. Q1 (where the context is restored) was answered: the bar controller (D3).
