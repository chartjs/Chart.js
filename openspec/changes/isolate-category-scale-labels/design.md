## Context

Line numbers are from master 887518c1.

**Where the labels come from.** `Scale.getLabels()` (`src/core/core.scale.js:358`) returns one of the user's arrays: `options.labels`, else `data.xLabels`/`data.yLabels` by orientation, else `data.labels`. `core.config.js:125` sets `data.labels = []` when none is given. So with no labels at all, every category axis of a chart gets the same empty array.

**How the category scale adds labels.** `CategoryScale.parse()` (`src/scales/scale.category.js`) looks a value up with `indexOf`. When the value is an unknown string, it pushes it onto that same array and records it in `_addedLabels`. On the next update, `init()` splices the recorded entries back out. So the user's array carries the inferred labels between updates, and every axis that reads it sees them (#11495, #11893). The stacked case is one #12222 works around with `options.labels = []`.

**Only strings are labels.** An array value fails both `indexOf` (which compares references) and `isNaN`, so it parses to `null` (#12065).

**When bounds are resolved.** `Scale.init()` (`core.scale.js:256-266`) parses `min`, `max`, `suggestedMin` and `suggestedMax` before the controllers parse the data. #12414 made `CategoryScale.beforeLayout()` parse `min` and `max` again, which fixed index bounds (#12412). A string bound is still added as one of the first labels during `init()` (#12430). `suggestedMin` and `suggestedMax` are not parsed again: a `suggestedMax: 'L4'` that only a hidden dataset reaches gives labels `[L4, L0, L1, L2, L3]` and stops the axis at `L2`.

**The order of an update.** `core.controller.js` runs `_updateScales()` (each scale's `init`), then `buildOrUpdateElements` (dataset parsing), then `_updateLayout`. `layouts.update` calls every box's `beforeLayout` before any `determineDataLimits`. `_resyncElements` re-parses all data on every update.

**When data is changed in place.** The array listeners (`core.datasetController.js:1051-1076`) queue `_insertElements` and `_removeElements` calls while parsing is on. `_resyncElements` (`:962-989`) replays them first, and each queued `_insertElements` (`:994-1020`) parses its new range at once and resets it. Only then does `parse(0, count)` (`:981`) parse the whole dataset. So a pushed point is parsed ahead of the existing ones, and the category scale gives its new label index 0. Measured: with data `a, b`, pushing a point at `'n'` gives labels `['n', 'a', 'b']` and parsed indices `[1, 2, 0]`, and pushing a duplicate `b` gives `['b', 'a']`. The queued insert also reads data that already holds every later change, so with several queued changes it parses the wrong item and resets it at an index a later change shifts. Separately, `_onDataPop` (`:1056-1058`) takes the removed index from the elements, which are not synced yet when earlier changes are queued: after `push()` and then `pop()`, the old last element is removed and the new one kept.

**Readers that go through the scale.** These read whatever the scale holds:

- `core.datasetController.js:506` and `controller.bar.js:156` (primitive data);
- `plugin.filler/filler.target.js:76`;
- the default tick callback;
- `getLabelForValue` and `getPixelForValue`;
- `getLabelAndValue` in the dataset and bar controllers.

**Readers that bypass the scale.**

- `controller.scatter.js:44` and `controller.bubble.js:98` read `chart.data.labels[index]` for the tooltip label. On master that array holds the inferred labels of whichever category axis the chart has. With a per-axis copy alone, the label would become `''`. Measured with the prototype, the label of point 1:
  - category x axis: master `"b"`, prototype `""`;
  - linear x axis with a category y axis: master `"b"`, prototype `""`.
- `plugin.tooltip.js:367` reads `data.labels` only when the item's label is empty. Every controller with a category index axis, other than scatter and bubble, returns `getLabelForValue`, which is never empty, so it needs no change.
- Radar, time and radial-linear scales have their own `getLabels` use and are not affected.

**When the copy would be taken.** With `min` or `max` set, `Scale.init()` asks for the labels while parsing the bounds. This happens before the `beforeUpdate` plugin hook (`core.controller.js:486` and `:494`). A copy taken there would miss a label that a `beforeUpdate` hook adds to `data.labels`. Measured: master `["a","late"]`; a copy taken in `init()` `["a"]`; a copy dropped again at the end of `init()` `["a","late"]`.

**What has been measured.** A prototype of this design's end state was applied to master 887518c1, in `scale.category.js` only (44 lines added, 29 removed). Run in Karma on Chrome, it:

- fixes every issue's repro;
- passes the category specs on master and those of #12344 and #12431;
- passes 13 other suites, ESLint and `lint-types`.

It fails exactly one spec of #12405, "should keep inferring labels into data.labels", which Decision 1 removes. It still has the scatter and bubble regression above, which P2 removes.

## Goals / Non-Goals

**Goals**

- No category axis ever writes to a user array, and no axis shows labels inferred from another axis' data.
- Bounds and suggested bounds given as labels resolve against the complete labels and never reorder them.
- Multi-line labels work as category values.
- Master stays releasable after every piece, and the contributors whose work this builds on are credited.

**Non-Goals**

- Limiting `data.labels` to the index axis (Decision 3).
- Changes to `core.scale.js`, the time scale or the radial scale. The only core file that changes is `core.datasetController.js`, in P5, for the order in which data changed in place is parsed (Decision 12).
- Hiding the categories of hidden data (#11949) and tick skipping (#11816).

## Decisions

1. **Labels found in the data are kept by the axis, not written into `chart.data.labels`** (user's decision).
   - Not breaking: the write was never documented or typed.
   - The release notes say it in one line: "Labels inferred from data are no longer added to `chart.data.labels`; read them with `scale.getLabels()`."
   - Alternative: hold the change for v5 as **BREAKING**. Not chosen, because #11893 reports the write itself as the bug.

2. **A bound that is not among the labels is added after the data labels** (user's decision).
   - The data keeps its order. This is what #12431 does.
   - Alternative: before the data, as on master. Not chosen, because that reorders the data.
   - Alternative: ignore an unknown bound. Not chosen, because a bound that names a category the data has not reached yet is a reasonable way to extend the axis.

3. **`data.labels` keeps applying to every category axis** (user's decision).
   - The category docs point to `yLabels`/`xLabels` or the axis' `labels` option for a second category axis.
   - Alternative: `data.labels` for the index axis only. Not chosen: it contradicts the docs, and it breaks the core.scale spec "should get the correct pixels for gridLine(s) for the vertical scale when offsetGridLines is true and offset is true".

4. **The axis' copy lives in the category scale.**
   - `getLabels()` returns a shallow copy of `super.getLabels()`, made the first time it is asked for and dropped in `init()`.
   - Only the category scale adds labels, so base `Scale.getLabels()` keeps returning the user's array for every other scale.
   - This replaces `_addedLabels` and the splice loop, so no splice bookkeeping remains.
   - Alternative: #12405's switch between shared and isolated arrays. Not chosen: it keeps writing into the user's array when there is one category axis, and it needs a rule for when another axis exists.

5. **The bounds become final in one `CategoryScale.beforeLayout()`, which parses all four again.** `beforeLayout` is the first hook after dataset parsing and before any `determineDataLimits`.
   - **Until P3:** labels are still written into the user's array. So P1's `_lookupOnly` flag keeps `init()` from adding a string bound as a first label.
   - **From P3 on:** `init()` drops the axis' copy both before and after `super.init()`. Whatever the bound parsing in `init()` added goes away with the copy. The flag, the `addedLabels = null` sentinel and the extra parameter of `findOrAddLabel` are removed. The next `getLabels()` call comes from dataset parsing, after the `beforeUpdate` hook, so a label a plugin adds there is kept.
   - Measured on the prototype, the dropped-copy variant:
     - passes the category specs on master (29/29) and #12431's (33/33);
     - gives every issue repro the same result as the flag variant;
     - keeps the `beforeUpdate` label.
   - Readers of the bounds between `init()` and `beforeLayout()` see the same as with the flag. The only one, `plugin.decimation.js:183`, returns early for a category index axis.
   - Alternative: keep the flag after P3. Not chosen: it is more state, and the copy it protects is the one taken too early.
   - Alternative: move the bound parsing out of `Scale.init()` for every scale. Not chosen: `core.scale.js` is held by five open pull requests, and only the category scale's parse depends on the data.

6. **Label equality:** the same value, or arrays of equal length whose items are `===`.
   - Any array counts as a label (user's decision). So a one-item numeric array such as `[5]` becomes a label instead of being coerced to the index 5. Master's coercion was accidental, and P4's pull request says so. Alternative: arrays of strings only. Not chosen: it adds a type check for no case anyone reported.

7. **The tooltip label fallback in scatter and bubble goes through the category axis.**
   - The label is `data.labels[index]` when present.
   - Otherwise it comes from the index axis when that is a category axis, else from the value axis when that is a category axis.
   - Otherwise it is `''`.
   - Looking at the value axis is needed because a scatter chart's index axis is x. With a linear x and a category y, master's label came from y's inferred labels in the shared `data.labels`.
   - With two category axes, master mixed both axes' labels into one array. The design takes the index axis' label, so that case changes, for the better.
   - The label is the one of the point's own category, the axis' label for the point's parsed value (user's decision). This is the same as master when every point has its own category in data order, and also right when categories repeat or are out of order. On master, a scatter point at `'a'` that is the third point got the third label as its title. Alternative: the axis label at the point's index, as master. Not chosen: it names the wrong category in those cases.
   - P2 changes `getLabelAndValue()` in `controller.scatter.js` without waiting for #12284 and #12347, which hold the file (user's decision). Their hunks are in `update()` and `updateElements()` and do not overlap.

8. **Pieces and credit.**
   - #12431 is P1 as it stands. Its author builds it; it is not reimplemented.
   - The label copy (P3) is a maintainer pull request built now on #12344's code (user's decision). It takes #12405's isolation specs and its "share user labels" spec, which pins Decision 3. Its commit carries `Co-authored-by` for both authors:
     - Saad Abdullah `<saadkhantareen@users.noreply.github.com>`;
     - Bennett Payoyo `<75754746+Yahiro025@users.noreply.github.com>`.
   - #12344 and #12405 are closed with thanks when P3 merges.
   - #12222 is asked to drop its category-scale hunk on its next rebase; its bar changes stay its own pull request.

9. **Types stay as they are.** `Scale.getLabels(): string[]` (`src/types/index.d.ts:1394`) is already narrower than master's runtime, because `data.labels` may hold multi-line arrays. Widening it would break TypeScript users who index it as strings. P4 does not change it.

10. **Labels are a snapshot between updates** (user's decision). `getLabels()` reflects the label source as it was at the last update, and the category docs say to call `update()` after changing labels. Alternative: copy-on-write, returning the user's array until the first label has to be added. Not chosen: it adds a branch in `parse()`, and ticks are stale until `update()` anyway.

11. **The release note goes in P3's pull request body**, which release-drafter lists under its bug label. The repository has no changelog file. The lasting statement is in the category docs.

12. **Data changed in place is parsed once, in index order, inside this design** (user's decision, 2026-11-24).
    - `_resyncElements` applies the queued changes structurally first: the queued `_insertElements` moves `meta.data` and `meta._parsed` and creates the elements, but neither parses nor resets them. It then parses the whole dataset once, and then resets the elements created during the sync that are still in the dataset, in contiguous runs found by identity. Queued inserts keep resetting whatever `buildOrUpdateElements` is passed; the direct `_insertElements` call for data replaced without listeners is unchanged, and so is the path with `parsing: false`, which queues nothing.
    - `clearStacks` skips an empty entry, because a slot inserted and removed again before the update was never parsed or stacked.
    - Inserted points are parsed once instead of twice.
    - Alternative: an issue only, outside this design. Not chosen: the requirement "Labels found in the data follow the data" is not true on master or with P3 while a push reorders the labels.
    - Alternative: fix it in the category scale. Not chosen: the scale cannot know the data order when the controller parses out of order.
    - Alternative: parse the old range before applying the queued changes. Not chosen: after `unshift` or `splice`, the old indices no longer match the data.

13. **The `_onDataPop` index is fixed in P5** (user's decision, 2026-11-24). The queued remove takes its index from the data array after the pop, as `_onDataPush` does, instead of from the elements, which are not synced while earlier changes are queued. In the path with `parsing: false` both give the same index.
    - Alternative: a separate pull request. Not chosen: it is the same queued-change replay, and P5's push-then-pop specs reach it.
    - Alternative: an issue only. Not chosen: the fix is one line with a spec that fails on master.

## Risks / Trade-offs

- **Labels are a snapshot between updates.** `getLabels()` reflects the label source as it was at the last update. Code that pushes to `data.labels` and calls `getLabelForValue` without `update()` sees the old labels; on master it would see the new one. The docs already say to call `update()` after changing data, and ticks are stale until then anyway (Decision 10).
- **Plugins reading `chart.data.labels`.** A third-party plugin that read inferred labels from `chart.data.labels` now finds only the user's labels. The release note names `scale.getLabels()` as the replacement.
- **The order of P1 and P3.** Both change `scale.category.js` by hand.
  - P1 goes first: its author is active, and its change does not depend on who owns the labels.
  - P3 then removes P1's `_lookupOnly` flag and its `addedLabels = null` sentinel, together with `_addedLabels` (Decision 5). P1's `beforeLayout()` and its specs stay as they are.
  - If P1 stalls, P3 can go first. P1 then shrinks to the one `beforeLayout()` and its specs.
- **Held file.** `controller.scatter.js` is held by #12284 and #12347. Their hunks are in `update()` and `updateElements()`, not in `getLabelAndValue()`, so P2 does not wait for them (Decision 7). Whichever merges later may need a trivial rebase.
- **Held file.** `core.datasetController.js` is held by #12332, #12284, #12241, #12176 and #12172. Only #12172 touches `_resyncElements`, in its final `numData > numMeta` branch, which P5 leaves as it is; that pull request has been idle since 2026-01-07. P5 does not wait for it, and whichever merges later needs a small rebase.
- **Element resets move after the full parse.** Under animation, an inserted point starts from its reset state computed with the final parsed values at its final index, where master used the values parsed at its queued index. P5's specs pin the start state of a pushed point and of points shifted by a later queued change.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12431, rebased: lookup-only bounds during `init()`, one `beforeLayout()` that parses all four bounds, the bound-not-in-labels sentence in the docs | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/axes/cartesian/category.md` | "should apply string bounds to inferred labels without reordering them" (x and y); the `suggestedMax` hidden-dataset spec and its `suggestedMin` mirror | ~145 | the author's rebase | | #12430 |
| P2 | Scatter and bubble take their tooltip label from their category axis (index axis first, then value axis) when `data.labels` has no entry | `src/controllers/controller.scatter.js`, `src/controllers/controller.bubble.js`, `test/specs/controller.scatter.tests.js`, `test/specs/controller.bubble.tests.js` | none on master (the label comes through the polluted `data.labels`); the specs for a category x and for a category y axis fail once P3 is applied without P2, and the PR says so | ~70 | nothing (#12284 and #12347 hold the file but not the function; Decision 7) | #11495, #11893 | |
| P3 | Each category axis owns a copy of its labels, dropped before and after `super.init()`; `_addedLabels`, the splice loop and P1's lookup-only flag go away; #12405's specs and the stacked case; docs on where labels come from; the release note | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/axes/cartesian/category.md` | #12344's `data.labels` not-modified spec; "`chart.data.labels` stays `[]`"; the pushed-labels spec; the unknown-bound spec; #12405's two-x-axes and x/y isolation specs; the stacked-axes spec; the Decision 3 spec (a second category axis starts from `data.labels`). "A removed dataset drops its label", #12344's `options.labels` spec (the config clones that option) and the `beforeUpdate` spec pass on master and pin behaviour P3 keeps | ~210 | P1 (same file), P2 (it would otherwise ship the tooltip regression) | | #11495, #11893 |
| P4 | Multi-line labels compared by value and added like strings | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/general/data-structures.md` | inferred array labels (master: `[]`, parsed `[null, null]`); arrays matched against `data.labels` by content; equal arrays share a tick; `getPixelForValue` of an array | ~95 | P3 (same file; builds on the copy and the three-argument `findOrAddLabel`) | | #12065 |
| P5 | Data changed in place is applied structurally, then parsed once in index order, then the new elements are reset; `clearStacks` skips unparsed slots; `_onDataPop` takes its index from the data | `src/core/core.datasetController.js`, `test/specs/core.datasetController.tests.js`, `test/specs/scale.category.tests.js` | push, splice and several queued changes keep the labels in data order; a pushed duplicate does not move to the front; points shifted by a later queued change start from their reset state at their final index; a push and a pop in a stacked chart leave no stale stack entry; a push and a pop keep the old last element | ~380 | nothing (a different file from P3 and P4) | | |

P2 can be built in parallel with P1. P3 waits for both. P4 waits for P3. P5 waits on nothing; whichever of P4 and P5 lands last archives the change.

## Contracts

- **P1 → P3:** `beforeLayout()` is the only place the category bounds become final. An unknown string bound is added after the data labels. `_lookupOnly` exists only to keep `init()` from adding; P3 removes it.
- **P2 → P3:** no code in the library reads category labels inferred from the data out of `chart.data.labels`.
- **P3 → P4:** `getLabels()` returns the axis' own copy. It is created on the first call after `init()` and stays valid until the next `init()`. `findOrAddLabel(labels, raw, index)` always adds. `_addedLabels` and `_lookupOnly` no longer exist.
- **P5 → the category scale:** on every update, the changes queued by the array listeners are applied structurally first, then the dataset is parsed once in index order, then the elements they created are reset. So the scale sees every value in data order, whatever was pushed, spliced or unshifted.

## Open Questions

None. The user answered every question the design and its review raised; the answers are under Decisions.

## Review

The design was reviewed from the angles architecture, complexity, root-cause and rule-readers. What the review changed:

- **P2 also takes the label from a category value axis.** Three reviewers found the same regression. A scatter or bubble chart with a linear x axis and a category y axis showed the y label on master through the shared `data.labels`, and would have lost it with a fallback to the index axis only. Measured: master `"b"`, prototype `""`. Decision 7 and the P2 specs now cover it.
- **P3 drops the label copy at the end of `init()` instead of keeping a lookup-only flag.** Suggested as a simplification. It also fixes a second finding: a copy taken during `init()` (when `min` or `max` is set) missed labels a `beforeUpdate` plugin adds to `data.labels`. Measured: master `["a","late"]`, flag `["a"]`, dropped copy `["a","late"]`. See Decision 5.
- **Types are left as they are**, recorded as Decision 9 (from a note).
- **P5's plan review** found that once the queued insert stops parsing, `clearStacks` throws on the empty slot of a point inserted and removed again before the update, so it now skips empty slots. It also had the reset skip the elements that a later queued change removed (Decision 12).
