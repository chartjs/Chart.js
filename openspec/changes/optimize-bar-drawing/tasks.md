## 1. P1: The context is restored after a dataset drawn with clip off

- [ ] 1.1 Add the spec: a bar controller subclass sets `ctx.fillStyle = '#ff0000'` after `super.draw()`, the dataset has `clip: false`, and a plugin's `afterDatasetDraw` reads `chart.ctx.fillStyle` on a real canvas. It fails on master (`'#ff0000'`). Add the same case with the default clip, which passes.
- [ ] 1.2 In `_drawDataset`, call `ctx.save()` when there is no clip area, and always restore after `controller.draw()`.
- [ ] 1.3 The release line names third-party controllers that relied on their context changes outliving the draw.

## 2. P2: Draw geometry in module storage

- [ ] 2.1 Add the "draw calls" spec on the mock context: plain, rounded, bordered with `borderSkipped: {bottom: true}`, bordered and rounded, partial `borderWidth: {top: 2}`, object radius. It passes on master.
- [ ] 2.2 Write the outer, inner and temporary rectangles into module objects. Keep the `!==` side comparisons of `inflateRect`. Give numeric borders and radii a fast path; keep `toTRBL` and `toTRBLCorners` for objects. Make the props arrays module constants.
- [ ] 2.3 Add `writeBarBounds(bar, final, out)`; `getBarBounds` returns `writeBarBounds(bar, final, {})`.
- [ ] 2.4 The spec and every fixture are unchanged. Run `bench/gc.js` before and after, and put the scavenge counts in the pull request.

## 3. P3: Bars without a border are one fill

- [ ] 3.1 Change the spec's plain case to expect `setFillStyle, fillRect(4.5, -0.5, 11, 21)`, and the rounded case to expect no `save` and `restore`. Both fail on master.
- [ ] 3.2 Draw a bar without a border or radius with `fillRect`. Remove the per-bar `save` and `restore` from the unbordered paths; bordered bars keep them until P4.
- [ ] 3.3 No fixture changes in Chromium or Firefox. Put the bench numbers before and after in the pull request.

## 4. P4: Bordered bars without a clip

- [ ] 4.1 Change the spec's bordered cases to expect the ring without `save`, `clip` and `restore`, and the background grown on the bordered sides only. Add `borderWidth: 2` to the `clip: false` spec in `controller.bar.spec.js` and expect 0 `clip` calls (3 on master).
- [ ] 4.2 Fill the ring with `'evenodd'` without a clip, and draw the background as the inner path grown on the bordered sides only.
- [ ] 4.3 Regenerate the 7 images with `pnpm fixtures:update`. Check each diff is edge antialiasing only, with no channel over 128.
- [ ] 4.4 Give `border-radius-stacked-number-with-order.js` the lowest `tolerance` that passes in Firefox and Chromium, on macOS and Linux.
- [ ] 4.5 Add a short bar section to `docs/general/performance.md`: borders and radii cost the most; a plain bar is one rectangle.
- [ ] 4.6 The release line names the darker outer edge, the seam that goes away on bordered stacks, and the fill style that direct `bar.draw(ctx)` callers now see. Put the bench numbers before and after in the pull request.
