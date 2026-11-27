## 1. P1: Draw geometry without allocation

- [ ] 1.1 Add the "draw calls" spec on the mock context. It covers six cases: plain, rounded, bordered with `borderSkipped: {bottom: true}`, bordered and rounded, partial `borderWidth: {top: 2}`, and object radius. It passes on master.
- [ ] 1.2 Keep the outer, inner and temporary rectangles in locals or module objects.
  - Keep the `!==` side comparisons of `inflateRect`.
  - Give numeric borders and radii a fast path. Keep `toTRBL` and `toTRBLCorners` for objects.
  - Make the props arrays module constants.
- [ ] 1.3 Add `writeBarBounds(bar, final, out)`; `getBarBounds` returns `writeBarBounds(bar, final, {})`.
- [ ] 1.4 Check the result:
  - The spec and every fixture are unchanged.
  - Run `bench/gc.cjs` and `bench/run.cjs` on master and on the branch, and put the numbers in the pull request.

## 2. P2: The bar controller saves the context once

- [ ] 2.1 Wait until rework-bar-chart P4 has merged (`src/controllers/controller.bar.ts` exists).
- [ ] 2.2 Add the spec: a bar dataset with `clip: false` on a real canvas. Wrap `BarElement.prototype.draw` so that it sets `ctx.fillStyle = '#ff0000'` after the original draw. A plugin's `afterDatasetDraw` reads `chart.ctx.fillStyle`: `'#ff0000'` on master; expect `'#000000'`.
- [ ] 2.3 Call `ctx.save()` before the loop in `BarController.draw` and `ctx.restore()` after it. Change nothing else in the file.
- [ ] 2.4 Every bar spec and fixture is unchanged.

## 3. P3: Bars without a border are one fill

- [ ] 3.1 Change the spec's plain case to expect `setFillStyle, fillRect(4.5, -0.5, 11, 21)`, and the rounded case to expect no `save` and `restore`. Both fail on master.
- [ ] 3.2 Draw a bar without a border or radius with `fillRect`.
  - Remove the per-bar `save` and `restore` from the unbordered paths; P2's controller save covers them.
  - Bordered bars keep them until P4.
- [ ] 3.3 No fixture changes in Chromium or Firefox. Put the bench numbers before and after in the pull request.
- [ ] 3.4 P2's spec still passes. The release line names the `fillStyle` and the current path that direct `draw(ctx)` callers and `BarElement` subclasses now see.

## 4. P4: Bordered bars without a clip

- [ ] 4.1 Change the failing tests first:
  - Change the spec's bordered cases to expect the ring without `save`, `clip` and `restore`, and the background grown on the bordered sides only.
  - In `controller.bar.spec.js`, add `borderWidth: 2` to the `clip: false` spec and expect 0 `clip` calls (master makes 3).
- [ ] 4.2 Fill the ring with `'evenodd'` without a clip. Draw the background as the inner path grown on the bordered sides only.
- [ ] 4.3 Regenerate the 7 images with `pnpm fixtures:update`. Check that each diff is edge antialiasing only, with no channel over 128.
- [ ] 4.4 Give `border-radius-stacked-number-with-order.js` the lowest `tolerance` that passes in Firefox and Chromium, on macOS and Linux.
- [ ] 4.5 Add a short bar section to `docs/general/performance.md`: borders and radii cost the most; a plain bar is one rectangle.
- [ ] 4.6 The release line names the slightly darker outer edge. Put the bench numbers before and after in the pull request.
