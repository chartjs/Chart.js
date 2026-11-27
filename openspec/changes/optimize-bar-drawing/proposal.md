## Why

Drawing bars is slower than it needs to be:
- A bar with a border sets a clip of its own, and that clip doubles the time of a whole frame.
- Every bar wraps its drawing in `save()` and `restore()`.
- Every draw allocates the bar's geometry anew. That is 600 to 1000 bytes per bar per frame, about one minor garbage collection per frame at 5000 bars.

## What Changes

- **Plain bars.** A bar without a border or radius is drawn as one `fillRect`, without `save()` and `restore()`, and without allocating.
  - With 5000 bars a frame takes 3.7 ms instead of 8.1 ms in Chromium, and 4 ms instead of 9 ms in Firefox.
  - The image is unchanged.
- **Bordered bars.** A bar with a border is drawn without a clip.
  - The ring is the outer and inner paths, filled with the even-odd rule.
  - The background covers the inner rectangle, grown by the inflate amount on its bordered sides only. That is the area the clip used to cut it to.
  - With 5000 bars a frame takes 29 to 33 ms instead of 55 to 65 ms, and 31 to 38 ms instead of 77 to 101 ms with a radius.
- **Visible change.** The outer edge of a bordered bar is antialiased once, as the edge of a bar without a border is. Before, the clip applied the edge coverage twice, so the edge came out lighter. Seven bar reference images are regenerated for this.
- **Context state.**
  - A bar no longer saves and restores the canvas context. The bar controller saves it once before drawing its bars and restores it once after, so a chart's context is left as it was, with or without the dataset clip.
  - Code that calls a bar's `draw(ctx)` directly, or a `BarElement` subclass that draws after `super.draw(ctx)`, finds `fillStyle` set to the bar's last fill colour.
  - A plain bar no longer leaves its rectangle as the current path.
- **Compatibility.** No option or type changes. The edge antialiasing and the context state above are the behaviour users can notice; each is named in its piece's release line.

## Capabilities

### New Capabilities

- `bar-drawing`: which areas a bar's border and background cover, how the outer edge of a bordered bar is antialiased, and what the canvas context holds after bars are drawn.

### Modified Capabilities

None.

## Impact

- Code: `src/elements/element.bar.ts`, and `draw` in the bar controller (`src/controllers/controller.bar.ts` after rework-bar-chart P4).
- Tests:
  - `test/specs/element.bar.unit.spec.js` and `test/specs/controller.bar.spec.js`;
  - seven `test/fixtures/controller.bar` images;
  - one fixture tolerance.
- Docs: a short bar section in `docs/general/performance.md`.
- No public API change; `etc/chart.js.api.md` is unchanged.
