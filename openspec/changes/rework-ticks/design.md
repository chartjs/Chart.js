## Context

### The tick pipeline

An axis gets its drawn ticks in four steps inside `Scale.update` (`src/core/core.scale.js`):

1. `buildTicks` (line 440) generates the values. A linear axis does this in `generateTicks` (`src/scales/scale.linearbase.js:25-150`), also used by `radialLinear`. A logarithmic axis does it in its own `generateTicks` (`src/scales/scale.logarithmic.js:42-72`).
2. The label callback turns values into labels (line 448). With `sampleSize` smaller than the tick count it runs on a sample only, with the index inside the sample and the sample as the list. Ticks whose label is `null` or `undefined` are removed with one `splice` per tick (lines 780-796).
3. `autoSkip` (`src/core/core.scale.autoskip.js`) picks the ticks to draw (line 462-466). It runs whenever `ticks.display && (ticks.autoSkip || ticks.source === 'auto')`; `stepSize` plays no part.
4. The callback runs again on the kept ticks (line 470), and grid lines are placed from the kept ticks (`getPixelForGridLine`, lines 40-65).

The default label callback is `Ticks.formatters.numeric` (`src/core/core.ticks.js:49-83`) for linear and radial axes, and `formatters.logarithmic` (lines 94-103) for logarithmic axes, which delegates to `numeric`. Users also call `numeric` from their own callbacks (`docs/axes/labelling.md`). It counts fraction digits as `-floor(log10(delta))`, where `delta` is the gap between the second and third tick (`calculateDelta`, lines 108-119).

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
src/core/core.scale.defaults.js:70; src/core/core.scale.js:462-463; src/scales/scale.time.js:386-389; src/types/index.d.ts:3197-3202
git grep -n maxTicksLimit -- src
src/core/core.scale.autoskip.js:20; src/core/core.scale.js:11, 594, 812, 828, 1091-1092; src/scales/scale.linearbase.js:221-236
git grep -n -E "getPixelForTick\(|_tickSize" -- src
src/controllers/controller.bar.js:47-48 (bar width from the gap between kept ticks); src/core/core.scale.js:40-65, 700-701, 991, 1212-1219
```

No plugin in `src` reads the generation options. `Ticks` is public (`src/core/index.ts:15`, `src/types/index.d.ts:1542`), so the formatter's signature stays. `helpers.math._decimalPlaces` is tested directly (`test/specs/helpers.math.tests.js:5`). The time scale re-initialises its offsets from the kept ticks (`scale.time.js:401`), and the bar controller sizes bars from them, so autoskip keeps its output shape: an array of the original tick objects, in order.

### Observed on master

Each case was run on master 5c2cbe21 with the built bundle, a stub 2D context that measures 6 px per character, and a 600 × 400 canvas unless the row says otherwise.

| Issue / PR | Observed on master | Cause |
|---|---|---|
| #12165 (#12225) | `min: 0, max: 3333, stepSize: 500`: ticks 0, 476.14, 952.29, …, 3333 | the whole-steps test `almostWhole((max - min) / step, spacing / 1000)` has a tolerance of 0.5 when the spacing is 500, so 6.67 steps count as whole |
| #11864 | data [10, 20, 80], `grace: '10%'`, `stepSize: 10`: ticks 0..90, axis max 100 | `getTickLimit` counts the steps on `min`/`max` before grace in the first pass and on the widened range in the second, so the passes disagree |
| (#12288) | `bounds: 'data'`, data [0, 10.3]: ticks 0, 2, …, 10, 10 | the final `push(niceMax)` adds a value the loop already emitted once `niceMax` is rounded |
| #12184 | data [0, `Number.MAX_VALUE`]: the process runs out of memory | `niceMax = ceil(rmax / spacing) * spacing` overflows to Infinity, the tick count becomes Infinity and the loop never ends; `_decimalPlaces` also never returns for 1e-305 (#12266) |
| #12389 (#12390) | logarithmic, data [7, 10]: min 6.9, first tick 6.9 | the first significand is floored from a float just below a whole number |
| #12382 (#12383) | data [1e-5, 1.3e-5]: "1.0000000E-5", …; `bounds: 'data'` data [0.31, 0.97]: "0.3", "0.4", …, "1.0" | the digits come from the step's magnitude only, counted as fixed-point digits even in scientific notation, and off-grid ticks get the step's digits |
| #11954 | `max: 12.000000001`: last label "12.000000001"; `min: 0.1234567, max: 0.8765432`: edges "0.1", "0.9" | the bound's own float noise is shown, and an off-grid bound is rounded to the step's digits |
| #10066 | `bounds: 'data'`, `includeBounds: false`, data [0, 97]: a tick at 97 | with `bounds: 'data'` the data bounds are always ticks; `includeBounds` only applies to user `min`/`max` |
| (#12401) | 100,000 category ticks, callback keeps 1 in 1,000: about 4 s per update | one `splice` per removed tick |
| (no issue) | 50 categories at 300 px, `sampleSize: 5`, callback labels i % 7: labels "L0" and "L7", with "L7" on the wrong category | the callback runs on the sample with sample indexes; nulls are removed after autoskip has chosen |
| (#12287) | majors at 0, 30, 60, 90 of 120 ticks, 30 fit: gaps of 4 and 5 | `getEvenSpacing` seeds the gap with `arr[0]`, the first major's index |
| #10373 | majors at 0, 31, 59, 90, … of 181 ticks: gaps of 7 and 8 | between uneven majors the step is a fraction and `Math.round` makes the gaps uneven |
| #9614 | linear x 0..1000 at 600 px, ticks only over 0..500: labels 11.3 px apart for 18 px labels | the number that fits is counted over the whole axis length |
| #12100, #11278 | 12 categories at 300 px with `offset` and `grid.offset`, every other skipped: lines on categories 1, 3, …, 11; first cell 33.5 px, others 45 px | offset lines go midway between kept ticks, not on category boundaries |
| #11816, #6154 | 20 labels, `maxTicksLimit: 7`: L0, L3, …, L18; 50 labels at 300 px: L0..L45 | ticks are kept at 0, s, 2s, …; the last only when it falls on that grid |
| #4048, #9973 (#12237) | y 0..100, `stepSize: 1` at 400 px: 0, 6, …, 96; y -35..115 `stepSize: 10` at 150 px: -40, -10, 20, … (no 0) | skipping counts indexes, not values |

## Goals / Non-Goals

**Goals:**
- One rule for each decision in the pipeline: which values, which digits, which ticks survive, where offset grid lines go.
- Take the open fixes in, ordered so they do not conflict, with their authors credited.
- Every 4.6.x piece is a fix: it brings the output to what the docs say or removes a wrong or repeated value or label.

**Non-Goals:**
- Time-scale tick generation and units (#11545, #12128, #11582, #11568). The skipping rules here apply to time axes too, but their values are not changed.
- Where a label is drawn: crossAlign (#12095), padding (#11739), rotation (#10485, #11463, and the rotation half of #9614), ellipsis and wrapping (#10466, #10202).
- Logarithmic tick density, `stepSize` on log axes, powers of ten only and minor ticks (#11215, #5199, #5589, #11774). These need new log options and a choice between the v3 and v4 layouts.
- Zero on a logarithmic axis (#9629). Symlog (#12386) is the answer there.
- #11573 (ticks lost in a production build) did not reproduce and points at the build chain.

## Decisions

### Values

- **Whole steps within machine precision** (#12225): `|n - round(n)| <= max(|n| * ε, 1e-14)`. The alternative, a tolerance relative to the spacing, is what fails today.
- **The step-size limit is counted on the generation range** (`this._range || this`), the same in every layout pass. The alternative was dropping the limit, but it guards against 1000+ ticks.
- **No repeated final tick** (#12288 as is). In 4.6.x the last tick of [0, 10.3] stays 10, and the data maximum gets its own tick only in 4.7.0 with the data-bounds rule.
- **Overflow falls back to the data bound.** If a nice bound is not finite, use the data bound. If the range itself is not finite, return the two data bounds. Cap decimals at the spacing's plus 15. #12185 clamps the data to `MAX_VALUE / 2` instead, which cuts the point at `MAX_VALUE` off the axis; it is superseded.
- **Log: scaled integers before flooring** (#12390 as is). Over minimums 1.1-9.9 in every decade from 0.001 to 1000, explicit and from data, 0 of 1246 cases repeat or start below the minimum (master: 176).
- **Data bounds are bounds** (4.7.0). With `bounds: 'data'` the grid is on multiples of the spacing and the data bounds are handled like `min`/`max`. The old offset grid (0.31, 0.41, …) was never documented. The alternative of keeping it and fixing only #10066's `includeBounds` would leave labels like 0.41 that no user asked for.

### Labels

- **Digits from the step's last significant digit** when the step has at most three significant digits after removing float noise (0.25 → 2 digits, 2.5 → 1, 5e14 → 1e14). Other steps (from `count` or a whole-steps `stepSize` grid such as 476.14) keep today's magnitude rule.
- **Off-grid ticks get the digits of their offset**, read with `toPrecision(6)`. A tick within `step * 1e-6` of the grid is on the grid.
- **Steps below 1 show the same digits on every tick** ("0.50", "1.00"). Steps of 1 and above drop trailing zeros ("5", "7.5"). Both are today's convention.
- **Scientific digits** = tick exponent - resolution exponent (#12383).
- **`ticks.precision` caps label digits.** #11954 asks for it, and grid labels already obey it. `ticks.format` fraction digits still win.
- The rule depends only on the value and the tick list passed, so relabelling the kept ticks after skipping gives them their own digits.
- Checked on the 307 linear, logarithmic and radial axes in `test/fixtures` whose configs survive a JSON copy: no fixture label changes.

### Skipping

- **Null labels are removed in one pass** (#12401 as is).
- **The callback always sees the full tick set**, also with `sampleSize`. Only measuring is sampled; `_getLabelSizes` already samples on its own.
- **Even majors are detected from the first gap** (#12287), and the step is the smallest factor of the major gap that is larger than n / limit. #12287's time test is replaced: both 6 h and 8 h spacings in it are even, and the file it edits is held by other PRs.
- **Between uneven majors the step is a whole number**, repeated from each major. A minor closer than one step to the next major is dropped. The alternative, spreading with ±1 jitter, is what #10373 reports.
- **The number that fits is the smaller of today's count and the count over the ticks' span.** It never gives more labels than today.
- **Offset grid lines go on the boundary before each kept tick**, midway to its neighbour in the full set, plus one closing line after the last tick of the full set. Autoskip records each kept tick's index in the full set for this.
- **Keeping the bounds is an option**, off in 4.x and on in 5.0. The tick next to a kept bound is dropped when closer than one label's room, or when keeping it would exceed `maxTicksLimit`. Spacing stays even, with one longer gap at the end.
- **On linear axes skipping keeps nice multiples of the step.** It does not turn autoskip off when `stepSize` is set (#12237): with #12237, y 0..100 with `stepSize: 1` at 400 px draws 101 labels about 1,450 px tall in 370 px, where master draws 17, and its own test passes on master. The docs say `autoSkip: false` draws every step. #12237 is superseded.
- **`autoSkip` is already scriptable per scale** (a function gets `ctx.type === 'scale'`), so #9973 is completed by keeping 0 on linear axes, not by a per-tick flag.

## Risks / Trade-offs

- Image baselines change: `scale.logarithmic/large-values-small-range.png` (P6), the time autoskip-major fixture (P12), bar charts that skip labels with `grid.offset` (P14), `controller.line/stacking/bounds-data.png` (P15). Each piece says which and the reviewer looks at them.
- Label text changes in a patch (P7): quarter-step axes go from "0.3" to "0.25", bound labels gain digits, scientific labels gain or lose digits. Every changed label was wrong or a duplicate.
- P14 moves grid lines in every bar chart that skips labels with `grid.offset`; that is the bug, but users will see it.
- P17 changes which ticks are drawn on many linear charts, so it waits for 4.7.0.
- The Vitest migration converts `core.scale.tests.js`, `core.ticks.tests.js`, `helpers.math.tests.js`, `scale.linear.tests.js` and `scale.logarithmic.tests.js` in its pieces P8, P9 and P11. Pieces that take a contributor's PR keep its test in the Karma file and should merge before that file is converted; new tests go to new `*.spec.js` files, which only Vitest runs.
- `core.scale.js` is also held by #12203, #12244, #11188 and #12327 (other lines). P8, P10 and P14 rebase over whichever merges first.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes | Release |
|---|---|---|---|---|---|---|---|---|
| P1 | #12266 as is: `_decimalPlaces` returns `undefined` instead of looping | `src/helpers/helpers.math.ts`, `test/specs/helpers.math.tests.js` | `_decimalPlaces(1e-305)` never returns | ~10 | | #12184 | | 4.6.x |
| P2 | #12288 as is: no repeated final tick | `src/scales/scale.linearbase.js`, `test/specs/scale.linear.tests.js` | `bounds: 'data'`, [0, 5.4]: 0..5, 5 | ~30 | | | | 4.6.x |
| P3 | #12225 as is: whole steps within machine precision | same | 0/3333/500 gives 476.14 steps | ~45 | P2 (same file) | | #12165 | 4.6.x |
| P4 | The step-size tick limit is counted on the generation range | same | [10, 20, 80], `grace: '10%'`, `stepSize: 10`: max 100, last tick 90 | ~40 | P3 (same lines) | | #11864 | 4.6.x |
| P5 | Finite ticks: overflow falls back to the data bound, a non-finite range gives two ticks, decimals capped; supersedes #12185 | same | [0, MAX] runs out of memory; [-MAX, MAX] gives NaN; `bounds: 'data'` with MIN_VALUE hangs | ~60 | P1 (contract), P4 (same file) | | #12184 | 4.6.x |
| P6 | #12390 as is: first log tick from scaled integers | `src/scales/scale.logarithmic.js`, `test/specs/scale.logarithmic.tests.js`, `scale.logarithmic/large-values-small-range.png` | data [7, 10]: min 6.9; `min: 0.3`: 0.3 twice | ~50 + png | | | #12389 | 4.6.x |
| P7 | #12383 with changes: digits from the step's last significant digit, noise-free offsets, on-grid tolerance, steps ≥ 1 by the same rule, `precision` caps digits | `src/core/core.ticks.js`, `test/specs/core.ticks.tests.js`, `docs/axes/cartesian/linear.md` (precision) | stepSize 0.25 gives "0.3"; "12.000000001"; #12383 as it stands gives "0.310" | ~150 | (#12386 appends to the same file; rebase) | | #12382, #11954 | 4.6.x |
| P8 | #12401 as is: null-label ticks removed in one pass | `src/core/core.scale.js`, `test/specs/core.scale.tests.js` | its specs pass on the old loop; the proof is the timing: 100k ticks 3,973 ms → 10 ms, about 6.4 MiB less allocated per update | ~85 | | | | 4.6.x |
| P9 | refactor: autoskip records each kept tick's index in the full set | `src/core/core.scale.autoskip.js`, `src/core/core.scale.js` | none (no behaviour change); autoskip specs and fixtures unchanged | ~40 | P8 (same file) | | | 4.6.x |
| P10 | The label callback sees the full tick set with `sampleSize` | `src/core/core.scale.js`, `test/specs/core.scale.labels.spec.js` (new) | 50 categories, `sampleSize: 5`, i % 7: master shows L0 and a misplaced L7 | ~60 | P9 | | | 4.6.x |
| P11 | #12287 with changes: even majors detected from the first gap; category and log specs instead of its time test | `src/core/core.scale.autoskip.js`, `test/specs/core.scale.autoskip.spec.js` (new) | majors 0/30/60/90 of 120: gaps 4 and 5 | ~45 | P9 (same file) | #10373 | | 4.6.x |
| P12 | Whole-step spacing between uneven majors | `src/core/core.scale.autoskip.js`, same spec, time autoskip-major fixture | majors 0/31/59/90/120/151 of 181: gaps 7 and 8 | ~70 | P11 | | #10373 | 4.6.x |
| P13 | The number that fits is counted over the ticks' span | same | linear 0..1000 at 600 px with ticks over 0..500: labels 11.3 px apart | ~50 | P12 | #9614 | | 4.6.x |
| P14 | Offset grid lines on category boundaries after skipping | `src/core/core.scale.js`, `src/core/core.scale.autoskip.js`, `docs/axes/styling.md`, new spec, bar fixtures | 12 categories at 300 px: lines on categories, first cell 33.5 px | ~80 | P9 (indexes), P10 and P13 (same files); #11188 (same lines region) | | #12100, #11278 | 4.6.x |
| P15 | feat: with `bounds: 'data'` ticks are on the grid and the data bounds follow `includeBounds` | `src/scales/scale.linearbase.js`, `test/specs/scale.linear.spec.js` or its Karma file, `docs/axes/cartesian/_common_ticks.md`, `docs/axes/cartesian/index.md`, `controller.line/stacking/bounds-data.png` | [0, 97] with `includeBounds: false` shows 97; [0.31, 0.97] gives 0.41 | ~120 + png | P5 (same file) | | #10066 | 4.7.0 |
| P16 | feat: an option keeps the first and last tick when skipping | `src/core/core.scale.autoskip.js`, `src/core/core.scale.defaults.js`, `src/types/index.d.ts`, `docs/axes/cartesian/_common_ticks.md`, spec | 20 labels, `maxTicksLimit: 7`: L19 missing | ~120 | P14 (same file) | | #11816, #6154 | 4.7.0 |
| P17 | feat: skipping keeps nice multiples of the step on linear axes; supersedes #12237 | `src/core/core.scale.autoskip.js`, `src/scales/scale.linearbase.js`, `docs/axes/cartesian/_common_ticks.md`, spec | 0..100 `stepSize: 1` at 400 px: 0, 6, …, 96 | ~150 | P16 (same file), P15 (same file) | | #4048, #9973 | 4.7.0 |
| P18 | Keep the bounds by default; migration note | `src/core/core.scale.defaults.js`, `docs/axes/cartesian/_common_ticks.md`, the v5 migration guide, `test/specs/core.scale.tests.js` ("should not display the last tick if it does not fit evenly") | that spec expects the last tick missing | ~30 + baselines | P16 | | | 5.0.0 |

**In parallel:**
- Four chains start at once: values (P1, P2 → P3 → P4 → P5), log (P6), labels (P7), and skipping (P8 → P9 → P10, P11 → P12 → P13 → P14). P1 and P2 can go together; P10 and P11 both need only P9.
- P15 needs only P5; P16 needs only P14; P17 needs both P15 and P16.
- #9614 is advanced here and completed by the label-placement design (rotation).

## Contracts

- **P1 → P5:** `_decimalPlaces(x)` returns `undefined` when it cannot count the decimals, and never loops.
- **P2, P3, P5 → P13, P17:** linear tick values are finite, strictly increasing before `reverse`, and on multiples of the spacing except a bound tick; no tick repeats.
- **P5 → P15:** a non-finite range gives the two data bounds as ticks.
- **P7 → P10, P14:** the formatter's output depends only on the value and the tick list passed, so the kept ticks relabelled after skipping get their own digits.
- **P9 → P10, P14, P16, P17:** after skipping, the scale has each kept tick's index in the full tick set (a private field); the kept list is still the original tick objects, in order.
- **P10:** from P10 on, the label callback is called with the full-set index and the full set; a `''` label survives skipping and takes a slot; only `null`/`undefined` removes a tick.
- **P15 → P17:** after `buildTicks`, a linear scale records its grid step (the honoured `stepSize` or the computed spacing) and whether its first and last ticks are off the grid (a private field).
- **P16 → P18:** the option's default is in `core.scale.defaults.js` only.

## Open Questions

- **P16:** the option's name. Proposed `ticks.autoSkipBounds`.
- **P16, P18:** keeping the last tick with an option in 4.7.0 and by default in 5.0, or only in 5.0, or by reusing `includeBounds`.
- **P17:** `stepSize` and skipping: nice multiples in 4.7.0 (superseding #12237), #12237 in 5.0, or a docs note only.
- **P7:** whether the label changes ship in a 4.6.x patch or wait for 4.7.0.
- **P15:** on-grid ticks for `bounds: 'data'` in 4.7.0, in 5.0, or not at all (close #10066 as by design).
- **P14:** whether the grid-line move ships in 4.6.x as a fix or in 4.7.0.
