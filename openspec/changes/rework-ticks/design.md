## Context

### The tick pipeline

An axis gets its drawn ticks in four steps inside `Scale.update` (`src/core/core.scale.js`):

1. `buildTicks` (line 440) generates the values, and the documented `afterBuildTicks` hook may replace them. A linear axis generates them in `generateTicks` (`src/scales/scale.linearbase.js:25-150`), which `radialLinear` also uses. A logarithmic axis has its own `generateTicks` (`src/scales/scale.logarithmic.js:42-72`).
2. The label callback turns values into labels (line 448).
   - With `sampleSize` smaller than the tick count (the default is 100), it runs on a sample only, with the index inside the sample and the sample as the list.
   - Ticks whose label is `null` or `undefined` are removed with one `splice` per tick (lines 780-796).
3. `autoSkip` (`src/core/core.scale.autoskip.js`) picks the ticks to draw (lines 462-466). It runs whenever `ticks.display && (ticks.autoSkip || ticks.source === 'auto')`. `stepSize` plays no part.
4. When sampling was on, the callback runs again on the kept ticks, with kept indexes (lines 468-471). Grid lines are then placed from the kept ticks (`getPixelForGridLine`, lines 40-65).

The default label callback is `Ticks.formatters.numeric` (`src/core/core.ticks.js:49-83`) for linear and radial axes. Logarithmic axes use `formatters.logarithmic` (lines 94-103), which delegates to `numeric`. Users also call `numeric` from their own callbacks (`docs/axes/labelling.md`).

`numeric` counts fraction digits as `-floor(log10(delta))`. `delta` is the gap between the second and third tick of the list it is given (`calculateDelta`, lines 108-119).

```
git grep -n "generateTicks" -- src
src/scales/scale.linearbase.js:25, 274
src/scales/scale.logarithmic.js:42, 167
git grep -nE "_decimalPlaces|almostWhole|niceNum" -- src
src/helpers/helpers.math.ts:28, 71, 110 (definitions)
src/scales/scale.linearbase.js:2, 40, 52, 66, 74, 106-107
git grep -nE "formatters\.(numeric|logarithmic)" -- src
src/core/core.ticks.js:100; src/scales/scale.linear.js:15; src/scales/scale.radialLinear.js:370; src/scales/scale.logarithmic.js:83
git grep -n -w autoSkip -- src
src/core/core.scale.defaults.js:70; src/core/core.scale.js:462-463; src/scales/scale.time.js:392-394; src/types/index.d.ts:3197-3202
git grep -n maxTicksLimit -- src
src/core/core.scale.autoskip.js:20; src/core/core.scale.js:11, 594, 812, 828, 1091-1092; src/scales/scale.linearbase.js:221-236
git grep -n -E "getPixelForTick\(|_tickSize|ticks\.length" -- src
src/controllers/controller.bar.js:47-51 (bar width from the smallest gap between kept ticks)
src/core/core.scale.js:40-65, 700-701, 991, 1212-1219
src/scales/scale.linearbase.js:297-312 (configure: offset padding from the kept tick count)
src/scales/scale.time.js:406-412, 422-446 (offsetAfterAutoskip: offsets from the first and last kept gaps)
```

Other readers:
- No plugin in `src` reads the generation options.
- `Ticks` is public (`src/core/index.ts:15`, `src/types/index.d.ts:1542`), so the formatter's signature stays.
- `helpers.math._decimalPlaces` is tested directly (`test/specs/helpers.math.unit.spec.js:5`).
- `radialLinear` has no pixel positions for its ticks: `getPixelForValue` is the empty base method (`core.scale.js:893`).

The bar controller, the time scale's offsets and the linear offset padding read the kept ticks. So autoskip keeps its output shape: an array of the original tick objects, in order.

### Observed on master

Each case ran on master 5c2cbe21 with the built bundle, a stub 2D context that measures 6 px per character, and a 600 × 400 canvas unless the row says otherwise.

| Issue / PR | Observed on master | Cause |
|---|---|---|
| #12165 (#12225) | `min: 0, max: 3333, stepSize: 500`: ticks 0, 476.14, 952.29, …, 3333. Also `bounds: 'data'` with data [0, 3200]: 0, 500, …, 2500, 3200 (3000 missing) | Two tests compare a step count with a tolerance in value units (`spacing / 1000`). Case 1 (`almostWhole`, line 74) and case 4 (`almostEquals`, line 95) both do it, so with spacing 500 any count within 0.5 of a whole number counts as whole |
| #11864 | data [10, 20, 80], `grace: '10%'`, `stepSize: 10`: ticks 0..90, axis max 100 | `getTickLimit` counts the steps on `min`/`max`. In the first layout pass that is before grace; in the second it is the widened range. The two passes disagree |
| (#12288) | `bounds: 'data'`, data [0, 10.3]: ticks 0, 2, …, 10, 10 | once `niceMax` is rounded, the final `push(niceMax)` adds a value the loop already emitted |
| #12184 | data [0, `Number.MAX_VALUE`]: the process runs out of memory; [-MAX, MAX]: one NaN tick | `niceMax = ceil(rmax / spacing) * spacing` overflows to Infinity, the tick count becomes Infinity and the loop never ends. Separately, `_decimalPlaces` never returns for some finite inputs (#12266) |
| #12389 (#12390) | logarithmic, data [7, 10]: min 6.9, first tick 6.9 | the first significand is floored from a float just below a whole number |
| #12382 (#12383) | data [1e-5, 1.3e-5]: "1.0000000E-5", …; `bounds: 'data'` data [0.31, 0.97]: "0.3", "0.4", …, "1.0"; `stepSize: 0.25`: "0.3", "0.8" | digits come from the step's magnitude only, are counted as fixed-point digits even in scientific notation, and off-grid ticks get the step's digits |
| #11954 | `max: 12.000000001`: last label "12.000000001"; `min: 0.1234567, max: 0.8765432`: edges "0.1", "0.9", also with `precision: 2` | the bound's float noise is shown, an off-grid bound is rounded to the step's digits, and `precision` only rounds the step |
| #10066 | `bounds: 'data'`, `includeBounds: false`, data [0, 97]: a tick at 97 | with `bounds: 'data'` the data bounds are always ticks; `includeBounds` applies only to user `min`/`max` |
| (#12401) | 100,000 category ticks, callback keeps 1 in 1,000: about 4 s per update | one `splice` per removed tick |
| (no issue) | 50 categories at 300 px, `sampleSize: 5`, callback labels i % 7: "L0" and "L7", with "L7" on the wrong category | the callback runs on the sample with sample indexes, and nulls are removed after autoskip has chosen |
| (#12287) | majors at 0, 30, 60, 90 of 120 ticks, 30 fit: gaps of 4 and 5 | `getEvenSpacing` seeds the gap with `arr[0]`, the first major's index |
| #10373 | majors at 0, 31, 59, 90, … of 181 ticks: gaps 8, 8, 7, 8, 7, 7, …; the labelled days differ from month to month | between majors the step is a fraction, and `Math.round` jitters the gaps |
| #9614 | linear x 0..1000 at 600 px, ticks only over 0..500: labels 11.3 px apart for 18 px labels | the number of labels that fit is counted over the whole axis length |
| #12100, #11278 | 12 categories at 300 px with `offset` and `grid.offset`, every other label skipped: lines on categories 1, 3, …, 11; first cell 33.5 px, the others 45 px | offset lines go midway between kept ticks, not on category boundaries |
| #11816, #6154 | 20 labels, `maxTicksLimit: 7`: L0, L3, …, L18; 50 labels at 300 px: L0..L45 | ticks are kept at 0, s, 2s, …; the last is kept only when it falls on that grid |
| #4048, #9973 (#12237) | y 0..100, `stepSize: 1` at 400 px: 0, 6, …, 96; y -35..115, `stepSize: 10` at 150 px: -40, -10, 20, … (no 0) | skipping counts indexes, not values |
| (#12543) | data [1.27, 1.78], `maxTicksLimit: 8`: "1.20", "1.30", …, "1.80"; ticks 0.0022..0.0025: "0.00220", … (#12383 as it stands gives the same) | the spacing is a plain subtraction, so `1.4 - 1.3` is 0.09999999999999987 and `floor(log10)` asks for one more digit |

## Goals / Non-Goals

**Goals:**
- One rule for each decision in the pipeline: which values, which digits, which ticks survive, where offset grid lines go.
- Take the open fixes in, ordered so that they do not conflict, with their authors credited.
- Every 4.6.x piece is a fix under the patch rule (Decisions).

**Non-Goals:**
- Time-scale tick generation and units (#11545, #12128, #11582, #11568, #12406, #12489, #12490, #12491, #5490). The skipping rules here apply to time axes too, and P9 and P10 change which time ticks are drawn, but no time tick value changes. Labelling week starts or a weekday between majors is an input to the time-ticks design.
- Where a label is drawn: crossAlign (#12095), padding (#11739), rotation (#10485, #11463, and the rotation half of #9614), ellipsis and wrapping (#10466, #10202).
- Logarithmic tick density, `stepSize` on log axes, powers of ten only, given tick values and minor ticks (#11215, #5199, #5589, #10741, #11774). These need new log options and a choice between the v3 and v4 layouts.
- Zero on a logarithmic axis (#9629). Symlog (#12386) is the answer there.
- The formatter's locale default (#10982), `min` greater than `max` (#10745) and BigInt values (#11952).
- #11573 (ticks lost in a production build) did not reproduce and points at the build chain.

## Decisions

### Decided by the user

- **Patch rule.** A 4.6.x piece may change output only where master's output is wrong: a value or label that contradicts the docs, repeats or misstates its tick; labels that overlap; a grid line drawn on the data. New meanings of options or callback arguments, and changes to output that is not wrong, go to 4.7.0. Anything a 4.x user must act on goes to 5.0.0.
- **The last tick:** a new option `ticks.autoSkipKeepEnds`, off in 4.7.0 and on by default in 5.0.0. It is one boolean. The first tick is already always kept, and majors already have `ticks.major.enabled`, so an enum such as `autoSkipKeep: 'start' | 'end' | 'majors'` would repeat both.
- **`stepSize` and skipping:** from 4.7.0, linear axes keep round multiples of the step by default. #12237 is superseded.
- **Between uneven majors:** the same whole step is repeated from each major, so the same days are labelled every month. There is one longer gap before the next major.
- **Log axes change in a patch (P10)**, decided 2026-11-27. A default log axis has majors on and uneven decades, so P10 changes which log ticks are drawn: on `min: 1, max: 100000` at 400 px the kept 7·10^k move to 6·10^k in each decade after the first (70,000 is labelled 60,000). The largest proper factor of an even major gap is now tried too: `min: 2, max: 100, maxTicksLimit: 7` keeps 5, 10, 50, 100 instead of 3, 7, 10, 30, 70, 100.
- **`sampleSize`:** in 4.7.0 the label callback runs on every generated tick. The cost was measured on master with 100,000 category ticks (one update today: about 210 ms):
  - the callback alone adds 2.5 ms (string), 32 ms (`Intl.NumberFormat`) and 64 ms (`toLocaleDateString`) per update;
  - labelling and measuring every tick, the upper bound, adds about 145 ms and 52 garbage collections over the run.
  `sampleSize` then limits only label measuring, as `_getLabelSizes` already does.
- **`bounds: 'data'`:** ticks move onto the grid and the data bounds follow `includeBounds`, in 4.7.0.

### Values

- **Step counts are compared within the precision of the bounds**, in both the step-size test (#12225) and the case-4 rounding: `n = (hi - lo) / step` is whole when `|n - round(n)| <= max((|hi| + |lo|) / step * 2ε, 1e-14)`. In the step-size test `hi`, `lo` and `step` are `max`, `min` and `stepSize`; in the case-4 rounding they are `niceMax`, `niceMin` and the spacing.
  - The bounds and the step are each the double nearest a decimal, so a decimally whole count is off by about `(|hi| + |lo|) / step` epsilons, more than `|n| * ε` when the range is narrow for its distance from 0.
  - Alternative: a tolerance relative to the spacing. That is what fails today.
  - Alternative: `max(|n| * ε, 1e-14)`. It repeats the last tick of data [1.6285, 1.6287] with `stepSize: 0.003` (n is 0.99999999999996), and leaves the step grid for `min: 8089.45, max: 8089.66, stepSize: 0.03`.
- **The step-size limit is counted on the generation range** (`this._range || this`), the same range in every layout pass.
  - Alternative: dropping the limit. It guards against 1000+ ticks, so it stays.
- **No repeated final tick** (#12288 as is). In 4.6.x the last tick of [0, 10.3] stays 10. The data maximum gets its own tick in 4.7.0, with the data-bounds rule.
- **Overflow falls back to the data bound.**
  - If a nice bound is not finite, the data bound is used. If the range itself is not finite, the two data bounds are returned.
  - Both callers of `_decimalPlaces` in `generateTicks` (lines 66 and 106-107) treat `undefined` as "no rounding".
  - #12185 clamps the data to `MAX_VALUE / 2` instead, which cuts the point at `MAX_VALUE` off the axis. It is superseded.
- **Log: scaled integers before flooring** (#12390 as is). The sweep:
  - minimums 1.1 to 9.9 in nine decades from 0.001 to 1e5, explicit and from data, wide and narrow ranges: 3,204 configurations;
  - with #12390: 0 repeat a tick or start below the minimum;
  - on master: 242 do.
- **Data bounds are bounds** (4.7.0). With `bounds: 'data'` the grid is on multiples of the spacing, and the data bounds are handled like `min` and `max`.
  - The old offset grid (0.31, 0.41, …) was never documented.

### Labels

- **Grid digits come from the step's last significant digit** when the step has at most three significant digits after the float noise is removed: 0.25 gives 2 digits, 2.5 gives 1, and 5e14 gives a resolution of 1e14.
  - Other steps (from `count`, or from a whole-steps `stepSize` such as 476.14) keep today's magnitude rule.
- **An off-grid tick gets one digit more than the grid, or fewer if its own value needs fewer.** Its own digits are read without noise (`toPrecision(6)`, trailing zeros dropped). Examples with step 0.1:
  - 0.1234567 gives "0.12"
  - 0.97 gives "0.97"
  - 10.3 with step 2 gives "10.3"
  - -0.0936 with step 0.02 gives "-0.094"
- **On-grid tolerance.** A tick counts as on the grid when it is within `max(step * 1e-6, |tick| * 4ε)` of it. The second term covers the float spacing of large values: zoomed unix seconds around 1.7e9 with step 0.1 stay on the grid.
- **Trailing zeros.**
  - Steps below 1 show the same digits on every on-grid tick ("0.50", "1.00").
  - Steps of 1 and above drop trailing zeros ("5", "7.5").
  - Both are today's convention.
- **Scientific digits** = the tick's exponent minus the resolution's exponent (#12383).
- **`ticks.precision` caps label digits (4.7.0).** It is a new meaning for a documented option, so it is a piece of its own: with `precision: 2` and `max: 12.345`, the last label goes from "12.345" to "12.35". `ticks.format` fraction digits still win.
- **The labels in 4.6.x are computed against the list passed.** With sampling on, the kept ticks are relabelled against the kept list, so a skipped axis can show "0.5" where an unsampled one shows "0.50". Both are correct.
  - From P14 (4.7.0), labels are computed once against the full generated set, and the second pass goes away.
- **Fixtures checked:** the 307 linear, logarithmic and radial axes in `test/fixtures` whose configs survive a JSON copy. No fixture label changes.

### Skipping

- **Null labels are removed in one pass** (#12401 as is).
- **Even majors are detected from the first gap** (#12287), and the step is the smallest factor of the major gap that is larger than n / limit.
  - #12287's time test is replaced. Both 6 h and 8 h spacings in it are even, and the file it edits is held by other PRs.
- **Between uneven majors the same whole step repeats from each major.** A minor closer than one step to the next major is dropped.
- **The number of labels that fit is counted from tick values.** It is the span from the first to the last tick over the axis range (`_startValue`, `_valueRange`), times the axis length, divided by the label size.
  - It is never more than today's count. When the span is not finite, today's count is used.
  - Pixels are not used, because radial axes have none.
- **Offset grid lines go on the boundaries of the generated ticks.**
  - The scale keeps the generated list, after `afterBuildTicks` and before nulls are removed and ticks are skipped.
  - Each drawn tick's line goes midway to its neighbour in that list, plus one closing line after the last generated tick.
  - Keeping the list, rather than an index on each tick, stays right when a hook filters `scale.ticks`.
- **`ticks.autoSkipKeepEnds`** keeps the last tick (the first is always kept).
  - The tick before it is dropped when it is closer than one label's room, or when keeping it would exceed `maxTicksLimit`.
  - The spacing stays even, with one shorter gap at the end.
  - The gap that ends at the kept last tick does not narrow bars: `computeMinSampleSize` skips it.
- **On linear axes skipping keeps round multiples of the step.**
  - A scale method that autoskip calls when a scale has it returns the values to keep. The linear scale reads the step from its own tick values at skip time, so ticks replaced in `afterBuildTicks` are seen.
  - If no tick is on the grid, it falls back to index skipping, so the result is never empty.
- **`stepSize` does not turn autoskip off** (#12237).
  - With #12237, y 0..100 with `stepSize: 1` at 400 px draws 101 labels, about 1,450 px tall, in 370 px, where master draws 17. Its own test passes on master.
  - The docs say that `autoSkip: false` draws every step. That docs line is what #4048 asks for.
- **`autoSkip` is already scriptable per scale** (a function gets `ctx.type === 'scale'`). #9973 is completed by keeping 0 on linear axes, not by a per-tick flag.

### Changed by the review

- P3 also fixes the case-4 tolerance. Data [0, 3200] with `bounds: 'data'` lost its 3000 tick through the same cause.
- P5 dropped its `Number.MIN_VALUE` scenario and the decimal cap. On master both return two ticks at once (the `MIN_SPACING` early return), but only when neither `min` nor `max` is set. With a user bound, or a minimum whose decimals cannot be counted, master gives NaN ticks (see "Changed by building").
- The on-grid tolerance gained the float-spacing term.
- The off-grid digit rule is stated as "grid + 1, or fewer". The earlier "digits of the offset" contradicted its own scenario ("0.1234567" against "0.12").
- The kept-index refactor was dropped. Offset grid lines read the generated list, which P12 keeps; the label callback no longer needs indexes once it runs on every tick.
- The `sampleSize` piece moved to 4.7.0, because it changes the callback's arguments. The `precision` cap also moved to 4.7.0, as its own piece.
- The fit count is computed from values, not pixels. A pixel span is NaN on radar charts and would skip every tick.
- P17 no longer waits on P15's private field. It reads the step from the tick values.
- `LinearScaleBase.configure` offset padding, the time scale's `offsetAfterAutoskip` and the bar width were added as readers of the kept ticks.

### Changed after the design PR opened

- #12543 (opened 2026-11-27) fixes the noisy spacing that P7's grid rule also removes, in the same file. It becomes P19, ahead of P7, so P7 builds on it instead of superseding it. It needs one more test: a `min: 4.1` bound with `stepSize: 1` (master: "4.10"), the only case that pins its integer-part call. Its private `difference` repeats the loop of `_decimalPlaces`. You decided (2026-11-27) that reusing `_decimalPlaces` is optional, a follow-up once P1 makes it always return, so P19 does not wait on P1.
- Karma was removed (#12516). Test files are named `*.spec.js` throughout, and the time-scale line numbers follow #12489.
- The math helper spec moved to `helpers.math.unit.spec.js` (#12542).

### Changed by building

- P3: the step-count tolerance counts the bounds, `max((|hi| + |lo|) / step * 2ε, 1e-14)`, instead of `max(|n| * ε, 1e-14)`. A sweep of 56,730 `generateTicks` inputs (magnitudes 1e-9 to 1e12, both `bounds`, with and without `min`, `max` and `stepSize`):
  - near-duplicate ticks (closer than 1e-6 of a gap): 6 on master, 44 with the count-only rule, 0 with the bounds rule;
  - decimally divisible `min`/`max`/`stepSize` inputs that miss the step grid: 201 on master, 440 with the count-only rule, 144 with the bounds rule. The 144 remaining are case 1 spacing the ticks evenly when `maxTicks` cuts the step count, which master does as well.
- P4: a third spec covers the `|| this` fallback (`buildTicks` with no `_range`), because no other spec failed when the fallback was removed. On master the grace case's first pass gives 0..100 at a spacing of 20 and the second gives 0..90, but `this.max` stays 100, because `_setMinAndMaxByKey` only widens. With P4 both passes give 0..90.
- The autoskip spec is `test/specs/core.scale.autoskip.unit.spec.js`; it runs in Node.
- `calculateSpacing` never tried the largest proper factor of the major gap: `_factorize` already drops the value itself, and the loop stopped one factor short. P10 loops over all factors.
- A default log axis has majors on, and its decades are uneven: after significand 10 it emits 15, so every decade after the first has 10 ticks (1..1e5 gives 50 ticks with majors at 0, 9, 19, 29, 39, 49). P10's rule therefore changes log axes too (see "Log axes change in a patch").
- The time autoskip-major fixture does not change: its unit is year, so it has no majors. P10 adds `scale.time/autoskip-major-uneven` instead: 181 days with unit day and majors on each month.
- P5:
  - When the decimals cannot be counted, the result is two ticks at the bounds, instead of no rounding. When `_decimalPlaces` returns `undefined`, the rounding factor is NaN, and the factor guard below returns the two bounds. Data [0, 1e-310] with `min: 0` (either `bounds`) and data [1e-310, 1] with `bounds: 'data'` gave NaN ticks on master. With `precision` the factor does not depend on the decimals, so [1e-310, 1] with `precision: 2` still rounds to 0, 0.1, …, 1.
  - The two bounds are returned when the tick count or the spacing is not finite. This covers the following cases:
    - a range that is not finite: data [-MAX_VALUE, MAX_VALUE], or user bounds `min: -1e308, max: 1e308` with `count: 5`, which gave NaN ticks between the bounds on master;
    - a range between the nice bounds that is not finite, although the data range is finite: data [-1, MAX_VALUE] or [-MAX_VALUE, 1], with or without `stepSize` or `count`. This never ended, on master as well;
    - a spacing of 0 from a subnormal range with a user bound: data [0, 5e-324] with `min: 0`. On master this gave [0, NaN].
    No separate check of the data range was kept: no test could tell it apart from this guard.
  - When the larger nice bound times the rounding factor is not finite, or the factor is NaN, the two bounds are returned. This applies whether the factor comes from `precision` or from the decimals. All ticks lie between the nice bounds. The cases:
    - data [0, 1e307], [0, 1.7e306], [-1e307, 0] and [-1.7e306, 0] with `precision: 2`. [0, 1.7e306] overflows only at its nice maximum, 1.8e306;
    - data [0.5, 1e308] with `bounds: 'data'`, where 0.5 needs a factor of 10. On master this gave NaN or Infinity ticks.
  - The contract between P2, P3, P5 and P11, P17 now allows ticks off the grid when a nice bound falls back to the data bound. Data [-MAX_VALUE, 0] falls back to the data minimum, so the ticks after it are spaced from there (-1.5977e308, …). No 4.6.x reader depends on the grid: autoskip and the offsets work by index, and `_setMinAndMaxByKey` reads only the ends.
- P11: a logarithmic scale's `_startValue` and `_valueRange` are in decades, but its tick values are not. Counted from raw values, a log x axis 0.001..0.01 at 200 px kept one label where master keeps four. The log scale maps its values with a private `_valueToAxis` (log10), which autoskip calls when a scale has it.
- P11: the count from values is `floor(room · (1 + 1e-9)) + 1`. The relative tolerance keeps a span that fills the axis exactly (as 0.3 - 0.2 over 0.1 does not, in floating point) from losing a label.
- P11: the time scale has no `_startValue`, so its count stays today's. The time-scale example in #9614 (week ticks with empty space at the ends) is not fixed by P11.

## Risks / Trade-offs

- **Image baselines change:**
  - `scale.logarithmic/large-values-small-range.png` (P6)
  - a new time fixture, `scale.time/autoskip-major-uneven` (P10)
  - bar charts that skip labels with `grid.offset` (P12)
  - `controller.line/stacking/bounds-data.png` (P15)
  Each piece names its baselines, and the reviewer looks at them.
- **Label text changes in a patch (P7).** Quarter-step axes go from "0.3" to "0.25", bound labels gain digits, and scientific labels gain or lose digits. Every changed label was wrong or a duplicate.
- **Time axes change in a patch (P9, P10).** Which time ticks are drawn changes when majors are enabled. Log axes change with P10 too (decided by the user).
- **Grid lines move in a patch (P12).** It moves the lines in every bar chart that skips labels with `grid.offset`. That is the bug, but users will see it.
- **Readers of the kept tick count.** The linear offset padding (`configure`), the time offsets and the bar width read it. P11, P16 and P17 change that count on some charts. Each adds a fixture for a linear axis with `offset`, and P16 adds one for bars on a time axis.
- **Callback cost (P14).** The label callback runs once per generated tick (measured above).
- **Test files.**
  - Karma was removed in #12516; every test is a `*.spec.js` file that Vitest runs.
  - The contributor PRs taken here (#12266, #12288, #12225, #12390, #12383, #12401, #12287) still add their tests to the deleted `*.tests.js` files. Each piece moves them to the `.spec.js` file of the same name when it rebases; for #12266 that is `helpers.math.unit.spec.js`, which runs in Node (#12542).
- **Shared image.** P6 and P19 both regenerate `scale.logarithmic/large-values-small-range.png`. Whichever merges second regenerates it again.
- **Held lines.** `core.scale.js` is also held by #12203, #12244, #11188 and #12327, on other lines. P8, P12 and P14 rebase over whichever merges first.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes | Release |
|---|---|---|---|---|---|---|---|---|
| P1 | #12266 as is: `_decimalPlaces` returns `undefined` instead of looping | `src/helpers/helpers.math.ts`, `test/specs/helpers.math.unit.spec.js` | #12266's spec (never returns on master) | ~10 | | #12184 | | 4.6.x |
| P2 | #12288 as is: no repeated final tick | `src/scales/scale.linearbase.js`, `test/specs/scale.linear.spec.js` | `bounds: 'data'`, [0, 5.4]: 0..5, 5 | ~30 | | | | 4.6.x |
| P3 | #12225 with one change: both step-count tests within machine precision | same | 0/3333/500 gives 476.14 steps; `bounds: 'data'` [0, 3200] has no 3000 | ~50 | P2 (same file) | | #12165 | 4.6.x |
| P4 | The step-size tick limit is counted on the generation range | same | [10, 20, 80], `grace: '10%'`, `stepSize: 10`: max 100, last tick 90 | ~40 | P3 (same lines) | | #11864 | 4.6.x |
| P5 | Finite ticks: overflow falls back to the data bound, a non-finite range gives two ticks, both `_decimalPlaces` callers handle `undefined`; supersedes #12185 | same | [0, MAX] runs out of memory; [-MAX, MAX] gives NaN | ~50 | P1 (contract), P4 (same file) | | #12184 | 4.6.x |
| P6 | #12390 as is: first log tick from scaled integers | `src/scales/scale.logarithmic.js`, `test/specs/scale.logarithmic.spec.js`, `scale.logarithmic/large-values-small-range.png` | data [7, 10]: min 6.9; `min: 0.3`: 0.3 twice | ~50 + png | | | #12389 | 4.6.x |
| P7 | #12383 with changes: grid digits from the step's last significant digit, off-grid ticks grid + 1 or fewer, on-grid tolerance with the float-spacing term, steps ≥ 1 by the same rule | `src/core/core.ticks.js`, `test/specs/core.ticks.spec.js` | stepSize 0.25 gives "0.3"; "12.000000001"; [1e-5, 1.3e-5] gives "1.0000000E-5"; #12383 as it stands gives "0.310" | ~130 | P19 (same file); (#12386 appends to the same file; rebase) | #11954 | #12382 | 4.6.x |
| P8 | #12401 as is: null-label ticks removed in one pass | `src/core/core.scale.js`, `test/specs/core.scale.spec.js` | its specs pass on the old loop; the proof is the timing: 100k ticks 3,973 ms → 10 ms, about 6.4 MiB less allocated per update | ~85 | | | | 4.6.x |
| P9 | #12287 with changes: even majors detected from the first gap; category and log specs instead of its time test | `src/core/core.scale.autoskip.js`, `test/specs/core.scale.autoskip.unit.spec.js` (new) | majors 0/30/60/90 of 120: gaps 4 and 5 | ~45 | | #10373 | | 4.6.x |
| P10 | The same whole step from each major between uneven majors | `src/core/core.scale.autoskip.js`, same spec, new time autoskip-major-uneven fixture | majors 0/31/59/90/120/151 of 181: gaps 8, 8, 7, 8, … | ~70 | P9 (same file) | | #10373 | 4.6.x |
| P11 | The number of labels that fit is counted from tick values | same, plus a radar spec | linear 0..1000 at 600 px with ticks over 0..500: labels 11.3 px apart | ~50 | P10 (same file) | #9614 | | 4.6.x |
| P12 | Offset grid lines on the boundaries of the generated ticks | `src/core/core.scale.js`, `docs/axes/styling.md`, `test/specs/core.scale.grid.spec.js` (new), bar fixtures | 12 categories at 300 px: lines on categories, first cell 33.5 px; the same with a callback returning `null` for odd indexes | ~80 | P8 (same file); #11188 (same lines region) | | #12100, #11278 | 4.6.x |
| P13 | feat: `ticks.precision` caps label digits | `src/core/core.ticks.js`, `test/specs/core.ticks.spec.js`, `docs/axes/cartesian/linear.md` (precision) | `precision: 1` on 0.1234567..0.8765432: edges "0.12", "0.88" | ~30 | P7 (same file) | | #11954 | 4.7.0 |
| P14 | feat: the label callback runs once on every generated tick, with full-set indexes; no second pass | `src/core/core.scale.js`, `test/specs/core.scale.labels.spec.js` (new), `docs/axes/_common_ticks.md` and `docs/general/performance.md` (`sampleSize`) | 50 categories, `sampleSize: 5`, i % 7: L0 and a misplaced L7 | ~60 | P12 (same file) | | | 4.7.0 |
| P15 | feat: with `bounds: 'data'` ticks are on the grid and the data bounds follow `includeBounds` | `src/scales/scale.linearbase.js`, `test/specs/scale.linear.spec.js`, `docs/axes/cartesian/_common_ticks.md`, `docs/axes/cartesian/index.md`, `controller.line/stacking/bounds-data.png` | [0, 97] with `includeBounds: false` shows 97; [0.31, 0.97] gives 0.41 | ~120 + png | P5 (same file) | | #10066 | 4.7.0 |
| P16 | feat: `ticks.autoSkipKeepEnds` keeps the last tick when skipping | `src/core/core.scale.autoskip.js`, `src/core/core.scale.defaults.js`, `src/types/index.d.ts`, `src/controllers/controller.bar.js` (skip the end gap), `docs/axes/cartesian/_common_ticks.md`, spec, a bar-on-time fixture | 20 labels, `maxTicksLimit: 7`: L19 missing | ~130 | P11 (same file) | | #11816, #6154 | 4.7.0 |
| P17 | feat: skipping keeps round multiples of the step on linear axes; supersedes #12237 | `src/core/core.scale.autoskip.js`, `src/scales/scale.linearbase.js`, `docs/axes/cartesian/_common_ticks.md`, spec | 0..100 `stepSize: 1` at 400 px: 0, 6, …, 96 | ~150 | P16 (same file), P15 (same file) | | #4048, #9973 | 4.7.0 |
| P18 | `ticks.autoSkipKeepEnds` on by default; migration note | `src/core/core.scale.defaults.js`, `docs/axes/cartesian/_common_ticks.md`, the v5 migration guide, `test/specs/core.scale.spec.js` ("should not display the last tick if it does not fit evenly") | that spec expects the last tick missing | ~30 + baselines | P16 | | | 5.0.0 |
| P19 | #12543 plus one test: the tick spacing and the integer-part offset are read without subtraction noise | `src/core/core.ticks.js`, `test/specs/core.ticks.spec.js`, `scale.logarithmic/large-values-small-range.png` | data [1.27, 1.78], `maxTicksLimit: 8`: "1.20", …, "1.80"; ticks 0.0022..0.0025: "0.00220", …; `min: 4.1`, `stepSize: 1`: "4.10" | ~30 + png | | #12382 | | 4.6.x |

**In parallel:**
- Five chains start at once:
  - values: P1 and P2, then P3 → P4 → P5;
  - log: P6;
  - labels: P19 → P7;
  - removal and grid lines: P8 → P12;
  - majors and fit: P9 → P10 → P11.
- In 4.7.0: P13 needs P7; P14 needs P12; P15 needs P5; P16 needs P11; P17 needs P15 and P16.
- #9614 is advanced here and completed by the label-placement design (rotation).

## Contracts

- **P1 → P5:** `_decimalPlaces(x)` returns `undefined` when it cannot count the decimals, and never loops.
- **P19 → P7:** the spacing the formatter reads is the difference of two tick values without subtraction noise: `1.4 - 1.3` is read as 0.1.
- **P2, P3, P5 → P11, P17:** linear tick values are finite and strictly increasing before `reverse`. They are on multiples of the spacing, except a bound tick and, when a nice bound falls back to the data bound, the ticks counted from it. No tick repeats.
- **P5 → P15:** a non-finite range gives the two data bounds as ticks.
- **P7 → P13, P14:** the formatter's output depends only on the value and the tick list passed.
- **P12 → P14:** the scale keeps the generated tick list (after `afterBuildTicks`, before nulls are removed and ticks are skipped) in a private field. `scale.ticks` stays the kept list of original tick objects, in order.
- **P14:** the label callback is called once per generated tick, with its index in the generated list and that list. A `''` label survives skipping and takes a slot. Only `null` or `undefined` removes a tick.
- **P16 → P17, P18:** the option is `ticks.autoSkipKeepEnds`, a boolean whose default lives in `core.scale.defaults.js` only.
- **P17:** autoskip calls a scale method, when the scale has one, to pick the values to keep. It returns `null` to fall back to index skipping.

## Open Questions

None. The user's answers are recorded under Decisions ("Decided by the user").
