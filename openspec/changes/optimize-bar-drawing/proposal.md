## Why

Drawing bars is slow where it does not need to be. A bar with a border sets a clip of its own, and that clip doubles the time of a whole frame. Every bar wraps its drawing in `save()` and `restore()`. Every draw allocates the bar's geometry anew: about 600 to 1000 bytes per bar per frame, which is about one minor garbage collection per frame at 5000 bars.

## What Changes

- A bar without a border or radius is drawn as one filled rectangle (`fillRect`). With 5000 bars a frame takes about 3.7 ms instead of 8.1 ms (Chromium) and 4 ms instead of 9 ms (Firefox). The image is unchanged.
- A bar with a border is drawn without a clip. The ring is the outer and inner paths filled with the even-odd rule. The background covers the inner rectangle grown by the inflate amount on its bordered sides only, which is the area the clip used to cut it to. With 5000 bars a frame takes 29 to 33 ms instead of 55 to 65 ms, and 31 to 38 ms instead of 77 to 101 ms with a radius.
- The outer edge of a bordered bar is antialiased once, as it is on a bar without a border. Before, the clip applied the edge coverage twice and the edge came out lighter. The light seam between stacked bordered segments that meet on a skipped border goes away. Seven bar images are regenerated for this.
- A bar no longer saves and restores the context. The chart restores it once per dataset instead, also when the dataset clip is off.
- The draw geometry is written into storage the element module reuses, so drawing a bar allocates nothing for numeric borders and radii.
- No change is **BREAKING**. No option or type changes.

## Capabilities

### New Capabilities

- `bar-drawing`: which areas a bar's border and background cover, how their edges are antialiased, and what the canvas context holds after bars are drawn.

### Modified Capabilities

None.

## Impact

- Code:
  - `src/elements/element.bar.ts` (after #12572 converts it);
  - `src/core/core.controller.js` (`_drawDataset`).
- Tests: `test/specs/element.bar.unit.spec.js`, `test/specs/controller.bar.spec.js`, `test/specs/core.controller.spec.js`, seven `test/fixtures/controller.bar` images, and one fixture tolerance.
- Docs: a short bar section in `docs/general/performance.md`.
- No public API change; `etc/chart.js.api.md` is unchanged.
