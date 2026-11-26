## Why

The bar controller works out where each bar goes on the index axis once per dataset, and each bar walks every other dataset again to find its slot. The datasets disagree when they differ: bars overlap, shrink or leave holes (#12262, #10193, #11101), and charts with many points and `skipNull` slow down by the square of their size. On the value axis, which end of a stack a bar is on is guessed from dataset 0 and is not updated when a dataset is hidden. So rounded stacks lose their corners (#11721, #10245), `minBarLength` leaves gaps in stacks (#11515), floating bars are moved by the stack (#12197), and bars cut off by the axis cannot be hovered (#11733).

## What Changes

- The bar element and the bar controller are converted to TypeScript first, with no behaviour change.
- The index-axis layout (sorted values, slots, stack groups, the smallest gap) is computed once per index scale and bar type, and cached until the next layout. `_getStacks`, `_getStackCount`, `_getStackIndex`, `_getRuler` and `_calculateBarIndexPixels` keep their results and read it. `_getAxis` and `_getAxisCount` (private, added in 4.5) go away.
- Fixes on the index axis:
  - only bar datasets on index scales that share the bars' pixel range count towards the slots (#12262, and the rule for stacked and overlaid index axes);
  - `barThickness: 'flex'` takes its neighbours from all bars on the scale, not the dataset's own data (#10193, #11101);
  - with `skipNull` on any dataset of the band, a null frees its dataset's slot, and every dataset at that index sees the same slots.
- The ends of each stack (innermost and outermost segment on each side) are computed once per layout from the visible datasets. They replace the stack's `_top`, `_bottom` and `_visualValues`, which are removed from the stack objects.
- Fixes on the value axis:
  - a zero-length bar draws nothing, whatever `barThickness` or `inflateAmount` (#11714);
  - `borderSkipped: 'middle'` and the rounded corners of stacked bars follow the visible segments (#11721, #10245);
  - short stacked segments lengthened by `minBarLength` chain without gaps (#11515).
- Behaviour changes, released as minors with a release-note line:
  - **BREAKING (visual)** floating bars in a stacked chart are drawn at their own start and end and take no room in the stack (#12197, #11730);
  - `minBarLength` is the length of the visible part of a bar. A bar entirely outside the value range is no longer drawn at the edge (#10487, #7174). Lines and the axis keep using data values (#11254 is answered, not changed);
  - a zero-length unstacked bar lengthened by `minBarLength` is centred on its value (#11667);
  - `index` interaction mode without `axis` follows `indexAxis` (#10312);
  - with `intersect: true`, the bar drawn on top wins when several bars contain the pointer (#11646).
- Bars whose base or head is outside the chart area can be found by the interaction modes through their visible part (#11733).
- New options (minor releases): `minBarThickness` (PR #11898, adopted), and `barAlign: 'center' | 'start' | 'end'` to place bars on their value rather than around it (#9748).
- Docs: bar borders are fills, so `borderDash` does not apply to bars (#11341).

## Capabilities

### New Capabilities

- `bar-index-layout`: where bars of one or more datasets sit and how wide they are on the index axis.
- `bar-stacking`: where stacked and floating bars sit on the value axis, and which edges and corners of stacked bars are drawn.
- `bar-min-length`: how `minBarLength` lengthens and places short bars, and how zero-length bars are drawn.
- `bar-interaction`: which bars the interaction modes find, which one wins, and where the tooltip points.

### Modified Capabilities

None.

## Impact

- `src/elements/element.bar.js` and `src/controllers/controller.bar.js` become `.ts`; new modules `src/controllers/controller.bar.layout.ts` and `src/controllers/controller.bar.stacks.ts`.
- `src/core/core.datasetController.js` (a private hook for the value a dataset puts in a stack; the stack fields go), `src/core/core.interaction.js`, `src/types/index.d.ts`, `docs/charts/bar.md`, `docs/configuration/interactions.md`.
- Plugins that call `_getRuler` and `_calculateBarIndexPixels` (chartjs-chart-financial) keep working. Plugins that read `_top`, `_bottom` or `_visualValues` from stack objects or override `_getAxis` stop working; the release note says so.
- Open pull requests: #12263 is adopted; #12222, #12335 and #11898 are superseded or adopted (see design.md). #12334 and #12331 land before the conversion. Every open PR on `controller.bar.js` must land before the conversion or be rebased onto `.ts`.
