## 1. P1: `_decimalPlaces` never loops (#12266)

- [ ] 1.1 Confirm #12266's spec fails (never returns) on master for `_decimalPlaces(1e-305)`.
- [ ] 1.2 Rebase #12266; keep its change as is. The pull request says `Part of #12184`.

## 2. P2: No repeated final tick (#12288)

- [ ] 2.1 Confirm #12288's spec fails on master (`bounds: 'data'`, [0, 5.4] repeats 5).
- [ ] 2.2 Rebase #12288; keep its change as is.

## 3. P3: Whole steps within machine precision (#12225)

- [ ] 3.1 Confirm #12225's spec fails on master (0/3333/500 gives 476.14 steps); add `min: 0, max: 0.3, stepSize: 0.1` gives 0, 0.1, 0.2, 0.3.
- [ ] 3.2 Rebase onto P2. The pull request says `Closes #12165`.

## 4. P4: The step-size limit is counted on the generation range

- [ ] 4.1 Add a spec: data [10, 20, 80], `grace: '10%'`, `stepSize: 10` gives ticks 0..90 and axis max 90 (master: 100); data [10, 20, 90] gives top tick and max 100.
- [ ] 4.2 Count the steps in `getTickLimit` on `this._range || this`.
- [ ] 4.3 The pull request says `Closes #11864`.

## 5. P5: Tick values are finite

- [ ] 5.1 Add specs: [0, MAX_VALUE] builds with finite ticks (master runs out of memory; run it with a timeout); [-MAX_VALUE, MAX_VALUE] gives two ticks; `bounds: 'data'` with MIN_VALUE and with 1e-306 builds.
- [ ] 5.2 Look in `src/helpers` for an existing finite check before adding one.
- [ ] 5.3 A non-finite nice bound falls back to the data bound; a non-finite range returns the two data bounds; cap decimals at the spacing's plus 15.
- [ ] 5.4 The pull request says `Closes #12184`. Close #12185 as superseded, with a link and the reason (its clamp cuts the `MAX_VALUE` point off the axis).

## 6. P6: First log tick from scaled integers (#12390)

- [ ] 6.1 Confirm #12390's specs fail on master (data [7, 10]: min 6.9; `min: 0.3`: 0.3 twice).
- [ ] 6.2 Look at the changed `large-values-small-range.png` baseline before merging.
- [ ] 6.3 The pull request says `Closes #12389`.

## 7. P7: Labels tell ticks apart (#12383)

- [ ] 7.1 Add the label scenarios of the `numeric-tick-labels` spec to `core.ticks.tests.js` (or its `.spec.js` if converted); confirm stepSize 0.25 gives "0.3" and `max: 12.000000001` gives "12.000000001" on master, and the `bounds: 'data'` [0.31, 0.97] case gives "0.310" on #12383 as it stands.
- [ ] 7.2 Ask the author for the changes listed in the design (step's last significant digit, noise-free offsets, `step * 1e-6` tolerance, steps ≥ 1 by the same rule, `precision` caps digits), or make them with `Co-authored-by` if the author does not answer.
- [ ] 7.3 Check the labels of every linear, logarithmic and radial fixture are unchanged.
- [ ] 7.4 Update the `precision` row in `docs/axes/cartesian/linear.md`. The pull request says `Closes #12382` and `Closes #11954`.

## 8. P8: Null labels removed in one pass (#12401)

- [ ] 8.1 Measure 100,000 category ticks with a callback keeping 1 in 1,000, time and allocation, one Node process per variant; put the numbers in the pull request.
- [ ] 8.2 Rebase #12401; add a spec that `0`, `''` and `[]` labels keep their ticks.

## 9. P9: refactor: autoskip records kept indexes

- [ ] 9.1 Record each kept tick's index in the full set on the scale (private field); no behaviour change.
- [ ] 9.2 Every autoskip spec and scale fixture is unchanged.

## 10. P10: The callback sees the full tick set

- [ ] 10.1 Add `test/specs/core.scale.labels.spec.js`: 50 categories at 300 px, `sampleSize: 5`, callback labels i % 7: L0, L7, …, L49 on their categories (master: L0 and a misplaced L7).
- [ ] 10.2 Call the callback on the full set with full-set indexes; sample only the measuring.

## 11. P11: Even majors from the first gap (#12287)

- [ ] 11.1 Add `test/specs/core.scale.autoskip.spec.js`: majors 0/30/60/90 of 120 with 30 fitting gives every gap 5 (master 4 and 5); a log axis 1..1e5 at 400 px keeps the same significands in each decade.
- [ ] 11.2 Rebase #12287 with these specs instead of its time test, crediting the author. The pull request says `Part of #10373`.

## 12. P12: Whole steps between uneven majors

- [ ] 12.1 Spec: majors 0/31/59/90/120/151 of 181 with 30 fitting gives 0, 7, 14, 21, 31, 38, …; gaps 7 except before a major.
- [ ] 12.2 Use a whole step repeated from each major; drop a minor closer than one step to the next major. Update the time autoskip-major baseline. The pull request says `Closes #10373`.

## 13. P13: Fit counted over the ticks' span

- [ ] 13.1 Spec: linear x 0..1000 at 600 px with ticks only over 0..500: no two drawn labels closer than the widest label plus `autoSkipPadding` (master 11.3 px for 18 px labels).
- [ ] 13.2 Take the smaller of today's count and the count over the span. The pull request says `Part of #9614`.

## 14. P14: Offset grid lines on boundaries

- [ ] 14.1 Spec: 12 categories at 300 px with `offset` and `grid.offset`, every other skipped: equal cells, no line on a category (master: first cell 33.5 px, lines on 1, 3, …).
- [ ] 14.2 Place each kept tick's line midway to its full-set neighbour before it, and one closing line; unchanged when nothing is skipped.
- [ ] 14.3 Update `docs/axes/styling.md` (`offset`) and the bar baselines that change. The pull request says `Closes #12100` and `Closes #11278`.

## 15. P15: Data bounds are bounds (4.7.0)

- [ ] 15.1 Specs: `bounds: 'data'`, `includeBounds: false`, [0, 97]: no 97 tick, axis 0..97 (master: 97); [0.31, 0.97]: 0.31, 0.4, …, 0.9, 0.97; [1, 99] with `count: 3`: 1, 50, 99.
- [ ] 15.2 Treat the data bounds like user `min`/`max`; drop the offset-grid branch; record the grid step and off-grid flags for P17.
- [ ] 15.3 Update `_common_ticks.md` (includeBounds), `index.md` (Scale Bounds) and the `bounds-data.png` baseline. The pull request says `Closes #10066`.

## 16. P16: Keep the bounds when skipping (4.7.0)

- [ ] 16.1 Specs: on with 20 labels and `maxTicksLimit: 7`: L0, L3, …, L15, L19; on with 50 labels at 300 px: L0 … L40, L49; off: unchanged.
- [ ] 16.2 Add the option to the defaults, the types and `_common_ticks.md`. The pull request says `Closes #11816` and `Closes #6154`.

## 17. P17: Round multiples of the step (4.7.0)

- [ ] 17.1 Specs: y 0..100 `stepSize: 1` at 400 px: 0, 10, …, 100 (master 0, 6, …, 96); bar y -40..120 `stepSize: 10` at 150 px: -40, 0, 50, 100; `autoSkip: false`: every step.
- [ ] 17.2 Add a spacing hook to autoskip that the linear scale implements from P15's grid step.
- [ ] 17.3 Note in `_common_ticks.md` that `autoSkip: false` draws every step. The pull request says `Closes #4048` and `Closes #9973`. Close #12237 as superseded, with a link and the measurement (101 labels in 370 px).

## 18. P18: Keep the bounds by default (5.0.0)

- [ ] 18.1 Flip "should not display the last tick if it does not fit evenly" to expect the last tick.
- [ ] 18.2 Turn the option on in the defaults; add a migration note; update the baselines that change.
