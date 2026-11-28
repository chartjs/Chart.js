## Why

The category scale collects labels it finds in the data by pushing them into the label array it reads from. That array is the user's `data.labels`, and every category axis shares it. Bounds given as labels are also resolved before the data is parsed, and only plain strings count as labels. As a result:

- user arrays are modified (#11893);
- an axis shows labels from data plotted on another axis (#11495, and the stacked case worked around in #12222);
- string `min`/`max` reorder the labels, and string `suggestedMin`/`suggestedMax` are ignored (#12430);
- multi-line labels in object data are dropped (#12065).

## What Changes

- Each category axis keeps its own copy of its labels. The copy is rebuilt on every update from the label source (`options.labels`, `xLabels`/`yLabels`, `data.labels`) plus the labels found in the data that axis plots. Labels found in the data are no longer written into `chart.data.labels` or into the axis' `labels` option. This is not a breaking change: the write was never documented or typed. The release notes say so in one line.
- Scatter and bubble charts keep showing the category label in their tooltip. They take it from the axis when `data.labels` has no entry at that index.
- `min`, `max`, `suggestedMin` and `suggestedMax` given as labels are resolved after the data is parsed. A bound that is not among the labels is added after the data labels.
- A multi-line label (an array of strings) in object data is a label. It matches an equal array in the labels.
- `data.labels` keeps applying to every category axis. The category docs explain how to give a second category axis labels of its own.

## Capabilities

### New Capabilities

- `category-scale-labels`: where a category axis takes its labels from, which labels it adds from the data, and what it leaves untouched.
- `category-scale-bounds`: how `min`, `max`, `suggestedMin` and `suggestedMax` given as labels or indices limit a category axis.
- `category-scale-multiline-labels`: multi-line labels as category values.

### Modified Capabilities

None.

## Impact

- Code: `src/scales/scale.category.js`; the tooltip label fallback in `src/controllers/controller.scatter.js` and `src/controllers/controller.bubble.js`; `src/core/core.datasetController.js`, where data changed in place is parsed once, in index order, and `pop()` takes its index from the data.
- Docs: `docs/axes/cartesian/category.md` and `docs/general/data-structures.md`.
- Users: code that read labels inferred from the data back out of `chart.data.labels` gets only its own labels. `scale.getLabels()` returns the axis' labels. Between updates, `getLabels()` reflects the label source as it was at the last update.
- Open pull requests:
  - #12431 is the first piece.
  - #12344's code is the base of the label-copy piece, which credits its author and closes it.
  - #12405 is superseded; its isolation specs move into the label-copy piece with credit.
  - #12222 keeps its bar changes, but its category-scale hunk becomes unnecessary.
  - The parsing order of data changed in place (P5) is added to this change by its own pull request, #12452.
