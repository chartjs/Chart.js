## Why

Options are resolved in layers (the chart's options, the chart type's overrides, the defaults), and several rules of that layering are wrong or missing. Scale options are copied from the defaults when a chart is created and never follow them again (#11096, #11910). The chart's `options.font` is documented as its base font but reaches no text (#10375, #11285). A scale whose id starts with `r` becomes a radial axis even when a dataset binds it as `y` (#11640). Hover options do not reach nested option objects, so a plugin such as chartjs-plugin-annotation cannot offer them (#11104). Four open pull requests fix further defects in the same code (#12388, #12268, #12334, #11105).

## What Changes

- Hover and other option prefixes apply inside nested option objects, however the object is given: as an object, as the result of a function, or as an item of an array (minor release).
- A plugin can resolve the options it was handed under another prefix list, `options.setContext(context, ['hover', ''])`, and can apply a block of its own options as one override, `options.override('hover')`. Every sub-option follows in both forms.
- The second argument of a scriptable option always reads the options without the hover layer being applied, so a hover option can be computed from its normal value without recursion.
- An object-valued option is merged key by key across layers also when a lower layer gives it as a function. A function's own `name` and `length` no longer leak into the resolved object.
- Items of an options array no longer see the array as one of their scopes (#12388).
- A bar dataset's `base` can be an array or a function, as its documentation says (#12334).
- Scale options that a chart does not set follow `Chart.defaults` at every update, and follow a changed chart or dataset type (minor release).
- The chart's `options.font` is the base font of every text in that chart (minor release).
- The dataset that binds a scale decides its axis before the first letter of the scale's id, also when the dataset arrives after the chart was created, and the first letter counts only when the scale's type is of that kind (minor release).
- `Chart.defaults.set`, `get`, `describe`, `override` and `route` throw for a path that has a segment `__proto__`, `prototype` or `constructor`, or one that names an inherited property, and values given to them cannot replace a method of the defaults (#12268).
- Documentation: hover options for plugin authors, which hover options of a line dataset reach its points (#10381), and which type defaults a scale receives (#11786).
- No change is **BREAKING**. The behaviour changes a user can notice are listed in the release notes of their pieces: scale options following defaults and type changes, the stored scale options listing only what the chart set, the root font applying, the axis of a bound scale, and nested `hover…` keys taking effect.

## Capabilities

### New Capabilities

- `option-prefixes`: how prefixed option names (`hoverColor`, `pointRadius`) are found, also inside nested option objects, and how a plugin resolves its options under other prefixes.
- `option-overrides`: what a plugin gets when it layers an object or a block of options over the options it was handed, and what a scriptable option's second argument reads.
- `option-layers`: how an object-valued option is merged across the layers that define it.
- `bar-base`: which forms a bar dataset's `base` takes.
- `scale-defaults`: where a scale option comes from when the chart does not set it, and when it is read.
- `scale-axis`: how the axis of a scale is decided.
- `chart-font`: which font each text of a chart uses.
- `defaults-paths`: which paths the `Chart.defaults` methods accept.

### Modified Capabilities

None. The existing specs (`category-scale-*`) are not touched.

## Impact

- Code:
  - `src/helpers/helpers.config.ts`, `src/helpers/helpers.config.types.ts`;
  - `src/core/core.config.js`, `src/core/core.defaults.js`;
  - `src/helpers/helpers.core.ts` (a helper that tests for a radial scale), used by `src/plugins/plugin.filler`;
  - `src/controllers/controller.bar.js`;
  - one-line edits where fonts are read: `src/core/core.scale.js`, `src/scales/scale.radialLinear.js`, `src/plugins/plugin.title.js`, `src/plugins/plugin.legend.js`.
- API: `setContext` on an options object takes an optional second argument, and `override` takes the key of a block beside an object. No option is added, renamed or removed.
- Types: the helper types gain the optional argument; the comment on `options.font` is corrected.
- Plugins: chartjs-plugin-annotation and chartjs-chart-treemap can resolve hover options of nested objects without code of their own. Plugins that read `Object.keys()` of a scale's options see only what the chart set.
- Open pull requests taken in as pieces: #12268, #12388, #11105, #12334. Their authors keep the credit.
- Not part of this change: the resolver rewrite planned for 5.0 (#10073), options that return a Promise (#11266), consistent alignment names (#10110).
