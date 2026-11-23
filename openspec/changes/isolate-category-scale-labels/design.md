## Context

Line numbers are from master 887518c1.

**Where the labels come from.** `Scale.getLabels()` (`src/core/core.scale.js:358`) returns one of the user's arrays: `options.labels`, else `data.xLabels`/`data.yLabels` by orientation, else `data.labels`. `core.config.js:125` sets `data.labels = []` when none is given. So with no labels at all, every category axis of a chart gets the same empty array.

**How the category scale adds labels.** `CategoryScale.parse()` (`src/scales/scale.category.js`) looks a value up with `indexOf`. When the value is an unknown string, it pushes it onto that same array and records it in `_addedLabels`. On the next update, `init()` splices the recorded entries back out. So the user's array carries the inferred labels between updates, and every axis that reads it sees them (#11495, #11893). The stacked case is one #12222 works around with `options.labels = []`.

**Only strings are labels.** An array value fails both `indexOf` (which compares references) and `isNaN`, so it parses to `null` (#12065).

**When bounds are resolved.** `Scale.init()` (`core.scale.js:256-266`) parses `min`, `max`, `suggestedMin` and `suggestedMax` before the controllers parse the data. #12414 made `CategoryScale.beforeLayout()` parse `min` and `max` again, which fixed index bounds (#12412). A string bound is still added as one of the first labels during `init()` (#12430). `suggestedMin` and `suggestedMax` are not parsed again: a `suggestedMax: 'L4'` that only a hidden dataset reaches gives labels `[L4, L0, L1, L2, L3]` and stops the axis at `L2`.

**The order of an update.** `core.controller.js` runs `_updateScales()` (each scale's `init`), then `buildOrUpdateElements` (dataset parsing), then `_updateLayout`. `layouts.update` calls every box's `beforeLayout` before any `determineDataLimits`. `_resyncElements` re-parses all data on every update.

**Readers that go through the scale.** These read whatever the scale holds:

- `core.datasetController.js:506` and `controller.bar.js:156` (primitive data);
- `plugin.filler/filler.target.js:76`;
- the default tick callback;
- `getLabelForValue` and `getPixelForValue`;
- `getLabelAndValue` in the dataset and bar controllers.

**Readers that bypass the scale.**

- `controller.scatter.js:44` and `controller.bubble.js:98` read `chart.data.labels[index]` for the tooltip label. On master that array holds the inferred labels. With a per-axis copy alone, the label would become `''`. Measured with the prototype: master `{"label":"b"}`, prototype `{"label":""}`.
- `plugin.tooltip.js:367` reads `data.labels` only when the item's label is empty. Every controller with a category index axis, other than scatter and bubble, returns `getLabelForValue`, which is never empty, so it needs no change.
- Radar, time and radial-linear scales have their own `getLabels` use and are not affected.

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
- Changes to `core.scale.js`, the time scale or the radial scale.
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

5. **Bounds are only looked up during `init()`, and all four are parsed again in one `CategoryScale.beforeLayout()`.**
   - Lookup-only is still needed with the copy: without it, a string bound would become the first label of the fresh copy.
   - `beforeLayout` is the first hook after dataset parsing and before any `determineDataLimits`.
   - The flag keeps #12431's name `_lookupOnly`, so later pieces do not rename the contributor's code.
   - Alternative: move the bound parsing out of `Scale.init()` for every scale. Not chosen: `core.scale.js` is held by five open pull requests, and only the category scale's parse depends on the data.

6. **Label equality:** the same value, or arrays of equal length whose items are `===`.
   - Any array counts as a label. So a one-item numeric array such as `[5]` becomes a label instead of being coerced to the index 5. Master's coercion was accidental. See Open Questions.

7. **The tooltip label fallback in scatter and bubble goes through the axis.**
   - The label is `data.labels[index]` when present, else the index axis' `getLabels()[index]`, else `''`.
   - This gives master's result in every case. With a single category axis, master's `data.labels` held exactly what the axis' copy now holds. With a linear index axis, `getLabels()` falls through to `data.labels`, as before.

8. **Pieces and credit.**
   - #12431 is P1 as it stands. Its author builds it; it is not reimplemented.
   - The label copy (P3) is a maintainer pull request built now on #12344's code (user's decision). It takes #12405's isolation specs and its "share user labels" spec, which pins Decision 3. Its commit carries `Co-authored-by` for both authors:
     - Saad Abdullah `<saadkhantareen@users.noreply.github.com>`;
     - Bennett Payoyo `<75754746+Yahiro025@users.noreply.github.com>`.
   - #12344 and #12405 are closed with thanks when P3 merges.
   - #12222 is asked to drop its category-scale hunk on its next rebase; its bar changes stay its own pull request.

9. **The release note goes in P3's pull request body**, which release-drafter lists under its bug label. The repository has no changelog file. The lasting statement is in the category docs.

## Risks / Trade-offs

- **Labels are a snapshot between updates.** `getLabels()` reflects the label source as it was at the last update. Code that pushes to `data.labels` and calls `getLabelForValue` without `update()` sees the old labels; on master it would see the new one. The docs already say to call `update()` after changing data, and ticks are stale until then anyway. See Open Questions.
- **Plugins reading `chart.data.labels`.** A third-party plugin that read inferred labels from `chart.data.labels` now finds only the user's labels. The release note names `scale.getLabels()` as the replacement.
- **The order of P1 and P3.** Both change `scale.category.js` by hand. P1 goes first because its author is active and its change does not depend on who owns the labels. P3 then turns P1's `addedLabels = null` sentinel into a boolean parameter and removes `_addedLabels`, leaving P1's flag and `beforeLayout()` as they are. If P1 stalls, P3 can go first: P1's author then rebases onto the boolean `findOrAddLabel` signature.
- **Held file.** `controller.scatter.js` is held by #12284 and #12347. Their hunks are in `update()` and `updateElements()`, not in `getLabelAndValue()`. See Open Questions.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12431, rebased: lookup-only bounds during `init()`, one `beforeLayout()` that parses all four bounds, the bound-not-in-labels sentence in the docs | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/axes/cartesian/category.md` | "should apply string bounds to inferred labels without reordering them" (x and y); the `suggestedMax` hidden-dataset spec and its `suggestedMin` mirror | ~145 | the author's rebase | | #12430 |
| P2 | Scatter and bubble take their tooltip label from the index axis when `data.labels` has no entry | `src/controllers/controller.scatter.js`, `src/controllers/controller.bubble.js`, `test/specs/controller.scatter.tests.js`, `test/specs/controller.bubble.tests.js` | none on master (the label comes through the polluted `data.labels`); the spec fails once P3 is applied without P2, and the PR says so | ~56 | #12284, #12347 (held file, see Open Questions) | #11495, #11893 | |
| P3 | Each category axis owns a copy of its labels; `_addedLabels` and the splice loop go away; #12405's specs and the stacked case; docs on where labels come from; the release note | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/axes/cartesian/category.md` | #12344's not-modified specs; #12405's isolation specs; the stacked-axes spec; "`chart.data.labels` stays `[]`"; "a removed dataset drops its label" | ~210 | P1 (same file), P2 (it would otherwise ship the tooltip regression) | | #11495, #11893 |
| P4 | Multi-line labels compared by value and added like strings | `src/scales/scale.category.js`, `test/specs/scale.category.tests.js`, `docs/general/data-structures.md` | inferred array labels (master: `[]`, parsed `[null, null]`); arrays matched against `data.labels` by content; equal arrays share a tick; `getPixelForValue` of an array | ~95 | P3 (same file, boolean `canAdd` signature) | | #12065 |

P2 can be built in parallel with P1. P3 waits for both. P4 waits for P3.

## Contracts

- **P1 → P3:** `_lookupOnly` is `true` exactly while `super.init()` runs. `beforeLayout()` is the only place the category bounds become final. An unknown string bound is added after the data labels.
- **P2 → P3:** no code in the library reads category labels inferred from the data out of `chart.data.labels`.
- **P3 → P4:** `getLabels()` returns the axis' own copy, valid until the next `init()`. `findOrAddLabel(labels, raw, index, canAdd)` takes a boolean. `_addedLabels` no longer exists.

## Open Questions

- **Q1 (P2): the held file.** May P2 change `getLabelAndValue()` in `controller.scatter.js` while #12284 and #12347 hold the file? Their hunks do not overlap it. Recommendation: yes.
- **Q2 (P3): snapshot between updates.** Should `getLabels()` keep returning the last update's copy (recommended, document "call `update()` after changing labels")? The alternative is copy-on-write, which returns the user's array until the first label has to be added. That keeps master's live behaviour for charts with no inferred labels, at the cost of a branch in `parse`.
- **Q3 (P4): which arrays are labels.** Any array (recommended, noted in the pull request because `[5]` stops meaning the index 5), or arrays of strings only?
- **Q4 (P2): the fallback.** `data.labels[index]`, then the axis' label (recommended; same as master in every case), or the axis' label only (simpler, but a linear index axis with `data.xLabels` would change)?
