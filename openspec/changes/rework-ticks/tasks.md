## 1. P1: `_decimalPlaces` never loops (#12266)

- [ ] 1.1 Confirm #12266's spec never returns on master.
- [ ] 1.2 Rebase #12266, keeping its change as is. The pull request says `Part of #12184`.

## 2. P2: No repeated final tick (#12288)

- [ ] 2.1 Confirm #12288's spec fails on master: with `bounds: 'data'`, [0, 5.4] repeats 5.
- [ ] 2.2 Rebase #12288, keeping its change as is.

## 3. P3: Step counts within machine precision (#12225)

- [ ] 3.1 Confirm #12225's spec fails on master (0/3333/500 gives 476.14 steps).
- [ ] 3.2 Add two specs:
  - `bounds: 'data'` with [0, 3200] includes 3000 (on master it is missing);
  - `min: 0, max: 0.3, stepSize: 0.1` gives 0, 0.1, 0.2, 0.3.
- [ ] 3.3 Apply the same count tolerance to the case-4 rounding. Ask the author first, or add the change with `Co-authored-by`.
- [ ] 3.4 Rebase onto P2. The pull request says `Closes #12165`.

## 4. P4: The step-size limit is counted on the generation range

- [ ] 4.1 Add two specs:
  - data [10, 20, 80], `grace: '10%'`, `stepSize: 10` gives ticks 0..90 and axis max 90 (master: 100);
  - data [10, 20, 90] gives a top tick and max of 100.
- [ ] 4.2 Count the steps in `getTickLimit` on `this._range || this`.
- [ ] 4.3 The pull request says `Closes #11864`. Quote the issue comment that shows `grace` with `stepSize`, because the issue's title is about spacing below the chart title.

## 5. P5: Tick values are finite

- [ ] 5.1 Add two specs:
  - [0, MAX_VALUE] builds with finite ticks (on master it runs out of memory, so run it with a timeout);
  - [-MAX_VALUE, MAX_VALUE] gives two ticks.
- [ ] 5.2 Look in `src/helpers` for an existing finite check before adding one.
- [ ] 5.3 Make three changes:
  - a non-finite nice bound falls back to the data bound;
  - a non-finite range returns the two data bounds;
  - both `_decimalPlaces` callers in `generateTicks` treat `undefined` as "no rounding".
- [ ] 5.4 The pull request says `Closes #12184`. Close #12185 as superseded, with a link and the reason: its clamp cuts the `MAX_VALUE` point off the axis.

## 6. P6: First log tick from scaled integers (#12390)

- [ ] 6.1 Confirm #12390's specs fail on master:
  - data [7, 10] gives min 6.9;
  - `min: 0.3` gives 0.3 twice.
- [ ] 6.2 Look at the changed `large-values-small-range.png` baseline before merging.
- [ ] 6.3 The pull request says `Closes #12389`.

## 7. P7: Labels tell ticks apart (#12383)

- [ ] 7.1 Add the label scenarios of the `numeric-tick-labels` spec, except the `precision` one, to `core.ticks.spec.js`, after P19's spacing specs. Confirm on master:
  - stepSize 0.25 gives "0.3";
  - `max: 12.000000001` gives "12.000000001";
  - [1e-5, 1.3e-5] gives "1.0000000E-5".
- [ ] 7.2 Confirm that #12383 as it stands gives "0.310" for `bounds: 'data'` [0.31, 0.97], and that the 1.7e9 case keeps one fraction digit.
- [ ] 7.3 Ask the author for the changes listed in the design:
  - digits from the step's last significant digit;
  - an off-grid tick gets one digit more than the grid, or fewer;
  - the on-grid tolerance `max(step * 1e-6, |tick| * 4ε)`;
  - steps of 1 and above follow the same rule.
  If the author does not answer, make them with `Co-authored-by`.
- [ ] 7.4 Check that the labels of every linear, logarithmic and radial fixture are unchanged.
- [ ] 7.5 The pull request says `Closes #12382` and `Part of #11954`.

## 8. P8: Null labels removed in one pass (#12401)

- [ ] 8.1 Measure time and allocation for 100,000 category ticks with a callback that keeps 1 in 1,000, one Node process per variant. Put the numbers in the pull request.
- [ ] 8.2 Rebase #12401. Add a spec that `0`, `''` and `[]` labels keep their ticks.

## 9. P9: Even majors from the first gap (#12287)

- [ ] 9.1 Add `test/specs/core.scale.autoskip.spec.js` with two specs:
  - majors 0/30/60/90 of 120 with 30 fitting gives a gap of 5 everywhere (master: 4 and 5);
  - a log axis 1..1e5 at 400 px keeps the same significands in each decade.
- [ ] 9.2 Rebase #12287 with these specs in place of its time test, crediting the author. The pull request says `Part of #10373`.

## 10. P10: The same whole step from each major

- [ ] 10.1 Spec: majors 0/31/59/90/120/151 of 181 with 30 fitting gives 0, 7, 14, 21, 31, 38, …. The gaps are 7, except just before a major.
- [ ] 10.2 Repeat a whole step from each major, and drop a minor that is closer than one step to the next major.
- [ ] 10.3 Update the time autoskip-major baseline and say in the pull request that time axes with majors change. It says `Closes #10373`.

## 11. P11: Fit counted from tick values

- [ ] 11.1 Add specs:
  - linear x 0..1000 at 600 px with ticks only over 0..500: no two drawn labels are closer than the widest label plus `autoSkipPadding` (master: 11.3 px apart for 18 px labels);
  - a radar chart with a visible axis keeps its ticks and rings;
  - a fixture of a linear axis with `offset`.
- [ ] 11.2 Count the span from `_startValue` and `_valueRange`. Take the smaller of this count and today's, and use today's count when the span is not finite.
- [ ] 11.3 The pull request says `Part of #9614`.

## 12. P12: Offset grid lines on boundaries

- [ ] 12.1 Add `test/specs/core.scale.grid.spec.js` for 12 categories at 300 px with `offset` and `grid.offset`:
  - with every other label skipped, the cells are equal and no line falls on a category (master: first cell 33.5 px, lines on 1, 3, …);
  - the same holds with a callback that returns `null` for odd indexes.
- [ ] 12.2 Keep the generated tick list on the scale: after `afterBuildTicks`, before null removal and before skipping.
- [ ] 12.3 Place each kept tick's line midway to its neighbour in that list, plus one closing line. The lines stay where they are when nothing is skipped or removed.
- [ ] 12.4 Update `docs/axes/styling.md` (`offset`) and the bar baselines that change. The pull request says `Closes #12100` and `Closes #11278`.

## 13. P13: `precision` caps label digits (4.7.0)

- [ ] 13.1 Spec: `precision: 1` with min 0.1234567 and max 0.8765432 gives edges "0.1" and "0.9" (after P7: "0.12", "0.88"). `ticks.format` fraction digits still win.
- [ ] 13.2 Update the `precision` row in `docs/axes/cartesian/linear.md`. The pull request says `Closes #11954`.

## 14. P14: The callback runs on every generated tick (4.7.0)

- [ ] 14.1 Add `test/specs/core.scale.labels.spec.js`: 50 categories at 300 px, `sampleSize: 5`, a callback that labels i % 7. It gives L0, L7, …, L49 on their categories (master: L0 and a misplaced L7).
- [ ] 14.2 Call the callback once per generated tick, with indexes in the generated list, before skipping. Remove the second pass. Sample only the measuring.
- [ ] 14.3 Measure as in the design (100,000 ticks, string, `Intl.NumberFormat` and date callbacks, time and garbage collections, one process per variant). Put the numbers in the pull request.
- [ ] 14.4 Update the `sampleSize` rows in `docs/axes/_common_ticks.md` and `docs/general/performance.md`.

## 15. P15: Data bounds are bounds (4.7.0)

- [ ] 15.1 Add specs for `bounds: 'data'`:
  - with `includeBounds: false`, [0, 97] has no 97 tick and the axis runs 0..97 (master: a 97 tick);
  - [0.31, 0.97] gives 0.31, 0.4, …, 0.9, 0.97;
  - [1, 99] with `count: 3` gives 1, 50, 99.
- [ ] 15.2 Treat the data bounds like user `min` and `max`, and drop the offset-grid branch.
- [ ] 15.3 Update `_common_ticks.md` (`includeBounds`), `index.md` (Scale Bounds) and the `bounds-data.png` baseline. The pull request says `Closes #10066`.

## 16. P16: `ticks.autoSkipKeepEnds` (4.7.0)

- [ ] 16.1 Add specs:
  - on, 20 labels, `maxTicksLimit: 7`: L0, L3, …, L15, L19;
  - on, 50 labels at 300 px: L0 … L40, L49;
  - off: unchanged;
  - a bar chart on a time axis has the same bar width on and off (a fixture).
- [ ] 16.2 Add the option to the defaults, the types and `_common_ticks.md`. Make `computeMinSampleSize` skip the gap that ends at the kept last tick.
- [ ] 16.3 The pull request says `Closes #11816` and `Closes #6154`.

## 17. P17: Round multiples of the step (4.7.0)

- [ ] 17.1 Add specs:
  - y 0..100, `stepSize: 1` at 400 px: 0, 10, …, 100 (master: 0, 6, …, 96);
  - bar y -40..120, `stepSize: 10` at 150 px: -40, 0, 50, 100;
  - `autoSkip: false`: every step;
  - `afterBuildTicks` replacing the ticks with 0.5, 7, 40: at least one tick drawn.
- [ ] 17.2 Autoskip calls a scale method when the scale has one. The linear scale implements it, reading the step from its tick values at skip time, and returns `null` to fall back to index skipping.
- [ ] 17.3 Note in `_common_ticks.md` that `autoSkip: false` draws every step. The pull request says `Closes #4048` and `Closes #9973`.
- [ ] 17.4 Close #12237 as superseded, with a link and the measurement (101 labels in 370 px).

## 18. P18: `autoSkipKeepEnds` on by default (5.0.0)

- [ ] 18.1 Flip "should not display the last tick if it does not fit evenly" to expect the last tick.
- [ ] 18.2 Turn the option on in the defaults, add a migration note, and update the baselines that change.

## 19. P19: Tick spacing without subtraction noise (#12543)

- [ ] 19.1 Confirm #12543's specs fail on master: data [1.27, 1.78] with `maxTicksLimit: 8` gives "1.20", …, "1.80", and ticks 0.0022..0.0025 give "0.00220", ….
- [ ] 19.2 The author adds the spec asked for in the review: `min: 4.1`, `max: 9`, `stepSize: 1` gives "4.1", "5", …, "9" (master and the PR with its second `difference` call reverted: "4.10"). If the author does not answer, add it with `Co-authored-by`.
- [ ] 19.3 Regenerate `scale.logarithmic/large-values-small-range.png` if P6 merged first.
- [ ] 19.4 The pull request says `Part of #12382`.
- [ ] 19.5 Follow-up, optional, after P1: `difference` counts places with `_decimalPlaces` instead of its own loop.
