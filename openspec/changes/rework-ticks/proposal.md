## Why

Linear and logarithmic axes choose tick values that ignore `stepSize` (#12165, #11864), repeat a tick (#12389, and the last tick with `bounds: 'data'`), start below the data (#12389) or never finish (a `Number.MAX_VALUE` point exhausts memory, #12184). Their labels then misstate the ticks (#12382, #11954). Autoskip, which decides which of those ticks are drawn, spaces them unevenly around major ticks (#10373), packs labels too tightly when the ticks cover only part of the axis (#9614), moves offset grid lines onto the data (#12100, #11278), drops the last tick (#11816, #6154) and ignores the step the user asked for (#4048, #9973). Eleven open pull requests fix single symptoms in the same few functions; this change orders them and fills the gaps with one set of rules.

## What Changes

- Tick values on linear axes (`linear`, `radialLinear`):
  - `stepSize` gives one tick per step whenever `max - min` is not a whole number of steps; the bound still gets its own tick.
  - The tick limit for `stepSize` is counted over the range the ticks cover, so `grace` no longer leaves the axis ending above its last tick.
  - Tick values are strictly increasing and finite. Data at the edge of the number range (`Number.MAX_VALUE`, `Number.MIN_VALUE`) builds a chart instead of hanging.
- Tick values on logarithmic axes: the first tick is never below the data minimum and never repeats.
- Tick labels from the default numeric formatter:
  - a label has the digits needed to tell its tick from its neighbours and to state an off-grid bound, and no floating-point noise;
  - scientific labels count digits on the significand;
  - `ticks.precision` also caps the label's fraction digits.
- Which ticks autoskip keeps:
  - removing ticks whose label callback returns `null` takes one pass;
  - with `sampleSize`, the label callback gets the index and the list of the full tick set;
  - evenly spaced major ticks are recognised also when the first major is the first tick, and the ticks between uneven majors are evenly spaced in whole steps;
  - the number of labels that fit is counted over the part of the axis the ticks cover;
  - with `grid.offset`, grid lines stay on the boundaries between categories after skipping.
- New behaviour (minor release):
  - with `bounds: 'data'`, ticks sit on multiples of the spacing and the data bounds follow `ticks.includeBounds`, as user `min`/`max` do;
  - a new option keeps the first and last tick when skipping;
  - on a linear axis, skipping keeps ticks that are nice multiples of the step, so `0` survives and `stepSize` multiples stay round.
- **BREAKING** (5.0.0 only): the first and last ticks are kept by default when skipping.

## Capabilities

### New Capabilities

- `numeric-tick-values`: which tick values a linear or logarithmic axis generates.
- `numeric-tick-labels`: the text the default numeric and logarithmic formatters give a tick.
- `tick-skipping`: which generated ticks are drawn when not all labels fit, and where grid lines go after skipping.

### Modified Capabilities

None.

## Impact

- Code: `src/scales/scale.linearbase.js`, `src/scales/scale.logarithmic.js`, `src/core/core.ticks.js`, `src/helpers/helpers.math.ts`, `src/core/core.scale.autoskip.js`, `src/core/core.scale.js`, `src/core/core.scale.defaults.js`, `src/types/index.d.ts`.
- Docs: `docs/axes/cartesian/_common_ticks.md`, `docs/axes/cartesian/linear.md`, `docs/axes/cartesian/index.md`, `docs/axes/styling.md`, the 5.0 migration guide.
- Open pull requests taken in, with their authors credited: #12266, #12288, #12225, #12390, #12383 (with changes), #12401, #12287 (with changes). Superseded: #12185, #12237.
- Image baselines change in the pieces that say so: one logarithmic fixture, the autoskip-major time fixture, bar charts that skip labels with `grid.offset`, and one `bounds: 'data'` fixture.
- Radar and polar area charts use the linear rules through `radialLinear`.
- Out of scope, for their own designs: time-scale tick generation (#11545, #12128, #11582, #11568), tick label placement (crossAlign, padding, rotation, ellipsis, wrapping), and logarithmic tick density and minor ticks (#11215, #5199, #5589, #11774).
