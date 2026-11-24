## 1. P1: Bounds resolved after the data (#12431)

- [ ] 1.1 The specs from #12431 run against master and fail there: "should apply string bounds to inferred labels without reordering them" on the x and the y axis, and "should add a string bound that is not in the data after the inferred labels".
- [ ] 1.2 Add a spec for `suggestedMax: 'L4'` with `bounds: 'data'`, where only a hidden dataset contains `L4`. Expect the axis to reach index 4. Add the `suggestedMin` mirror. Both fail when the suggested bounds are not parsed again.
- [ ] 1.3 Rebase onto master, so that a single `beforeLayout()` parses `min`, `max`, `suggestedMin` and `suggestedMax`. ESLint reports no duplicate class member.
- [ ] 1.4 Resolve the conflict in `test/specs/scale.category.tests.js`, keeping #12414's specs from master.
- [ ] 1.5 In `docs/axes/cartesian/category.md` (Min Max Configuration): a string bound that is not among the labels is added after them.
- [ ] 1.6 The pull request says `Closes #12430`.

## 2. P2: Point chart tooltip labels through the axis

- [x] 2.1 Add specs for scatter and bubble charts, with no `data.labels` and object data at `'a'` and `'b'`. Cover a category x axis, and a linear x axis with a category y axis. Each expects `getLabelAndValue(1).label` to be `'b'`. They pass on master. Verify that they fail with P3's label copy applied and this piece left out, and say so in the pull request.
- [x] 2.2 Add a spec where `data.labels` has an entry at the index; that entry is the label.
- [x] 2.3 In `getLabelAndValue()` of the scatter and bubble controllers, use `data.labels[index]`. Otherwise use the label from the index axis if it is a category axis, else from the value axis if it is a category axis (the axis' label for the point's own parsed value). Otherwise use `''`.
- [x] 2.4 The pull request says that this is part of #11495 and #11893.

## 3. P3: Each category axis owns its labels

- [x] 3.1 Take #12344's specs: neither `options.labels` nor `data.labels` is modified.
- [x] 3.2 Add specs:
  - `chart.data.labels` stays `[]` when every label comes from the data;
  - labels pushed to `data.labels` before an `update()` are shown;
  - a removed dataset drops its label;
  - an unknown string bound does not reach `data.labels`;
  - a label a `beforeUpdate` plugin pushes to `data.labels` is shown on an axis with `min` set.
- [x] 3.3 Take #12405's specs for two category x axes (each value at its axis' first tick) and for a category x and y that infer labels, plus "should still share user provided labels across category scales". Do not take "should keep inferring labels into data.labels".
- [x] 3.4 Add a spec for two stacked category axes that each show only their own category.
- [x] 3.5 Implement:
  - `getLabels()` returns a copy of `super.getLabels()`, made on first use;
  - `init()` drops the copy, runs `super.init()`, and drops the copy again;
  - remove `_addedLabels`, its bookkeeping, the splice loop, P1's `_lookupOnly` flag and the `addedLabels = null` sentinel.
- [x] 3.6 In `docs/axes/cartesian/category.md`, say:
  - labels found in the data are kept per axis and never written to `data.labels`;
  - `data.labels` applies to every category axis;
  - a second category axis uses `yLabels`/`xLabels` or its `labels` option;
  - call `update()` after changing labels.
- [x] 3.7 Credit the earlier work:
  - `Co-authored-by` for the authors of #12344 and #12405;
  - the release note line in the pull request body;
  - `Closes #11495` and `Closes #11893`.
- [x] 3.8 After the merge, close #12344 and #12405 with thanks, and ask #12222 to drop its category-scale hunk.

## 4. P4: Multi-line labels

- [x] 4.1 Add specs that fail on master:
  - array labels inferred from object data;
  - arrays matched by content against `data.labels`;
  - equal arrays share a tick;
  - `getPixelForValue(['Line', 'two'])`.
- [x] 4.2 Implement label equality for arrays (same length, items `===`) in the lookup and in the fast path of `parse()`, and add arrays like strings. The search from the end is a plain loop, because the TypeScript target is `es2018`.
- [x] 4.3 In `docs/general/data-structures.md`, say that the index value in object data may be an array for a multi-line category label.
- [x] 4.4 The pull request says `Closes #12065`.

## 5. P5: Labels found in the data follow the data after a push

- [x] 5.1 Add specs that fail on master: a push, a splice and several queued changes keep the labels found in the data in data order, and a pushed duplicate does not move to the front. Add the unshift case as a guard.
- [x] 5.2 Add specs for the reset start state under animation: a pushed point, and points that a later queued change shifts, start at the old scale's pixel for their final index and at the base pixel. Every point of a multi-point push and splice is reset, and two runs split by old points reset only the new ones.
- [x] 5.3 Add stacked bar and stacked line specs: push, unshift and splice keep the stack values; a push and a pop, a push and a splice that removes it, an unshift and a shift, and a splice that removes an inserted value leave no stale stack entry and do not throw.
- [x] 5.4 Add specs with parsing on and off: after a push and a pop the old last element survives, and after a pop and a push it is removed.
- [x] 5.5 Implement: queued inserts only move and create elements and record them; `_resyncElements` parses the whole dataset once and then resets the recorded elements still in the dataset, in contiguous runs; `clearStacks` skips empty entries; `_onDataPop` takes its index from the data.
- [x] 5.6 Add the push scenario to `specs/category-scale-labels/spec.md`.
