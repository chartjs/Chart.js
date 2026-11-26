## 1. P1: Defaults paths cannot reach prototypes (#12268)

- [ ] 1.1 Add specs that fail on master: `Chart.defaults.set('plugins.__proto__', {p: 1})` throws and `({}).p` is undefined; the same for `set('__proto__', …)`, `get`, `describe`, `override`, `route`, a `constructor.prototype` path and a route name `__proto__`; `set('myconstructor.a', …)` still works.
- [ ] 1.2 Ask the author to add them and to check the name `route` defines; rebase onto master after #12499.
- [ ] 1.3 The pull request says `Closes #12265` and has a release-note line: the five methods throw for such paths.

## 2. P2: An options array is not a scope of its items (#12388)

- [ ] 2.1 Confirm #12388's spec fails on master and passes on its head; run the whole suite on the head merged into master.
- [ ] 2.2 The pull request says `Closes #11438`.

## 3. P3: A scriptable's second argument follows context and plain override

- [ ] 3.0 Commit type `refactor`: nothing in core reaches this before P4, so it releases nothing.
- [ ] 3.1 Add specs that fail on master: options with a second proxy, `a: (ctx, opts) => ctx.n + ':' + opts.b`, `b: ctx => ctx.n`, after `setContext({n: 2})` give `2:2`; a scriptable under `override({type: 'label'})` reads `opts.type === 'label'`.
- [ ] 3.2 `setContext` gives the second proxy the new context; `override` applies a plain object to it.
- [ ] 3.3 Run the whole suite; no fixture changes.

## 4. P4: Prefixes for nested options (#11105)

- [ ] 4.1 Add specs that fail on master: `hoverTest` resolves in a static sub-object, in an object returned by a function, in an item of an array and two levels down; `hoverColor: (ctx, opts) => opts.color + '+dark'` gives `'red+dark'` at the root and one level down; `setContext(ctx, [])` keeps the prefixes and `['']` resets them; after `['point', '']` and then `['pointHover', 'point', '']` a scriptable's second argument reads `pointColor`; `activeColor: (ctx, opts) => opts.color + '+dark'` under `['active', '']` gives `'red+dark'`; an active bar with `borderWidth: () => ({top: 1, hoverTop: 9})` has top 9.
- [ ] 4.2 Ask the author for the changes of the review on #11105: the resolver stores its prefixes and `createSubResolver` reads them; `setContext(ctx, prefixes?)` gives scriptables the options as they were before the call; no prefix argument on `override`; the types make the argument optional and `overridePrefixes(prefixes: string[]): ResolverProxy<T, R>`.
- [ ] 4.3 Rebase onto P3 and keep its contract: `setContext(ctx)` on prefixed options gives scriptables the new context.
- [ ] 4.4 A type test: `setContext(ctx)` and `override(scope)` with one argument compile.
- [ ] 4.5 The pull request says `Closes #11104` and has a release-note line: nested keys named `hover<Key>` or `<elementType><Key>` now take effect.

## 5. P5: A block of options applies with one override

- [ ] 5.1 Add specs that fail on master: a function in a block that reads its own option gives `'black+dark'` (master throws "Recursion detected"); the block's functions get a context set after the override; a block on an item of an options array; a hovered sub-element overridden with `{type: 'label'}` reads `opts.type === 'label'`.
- [ ] 5.2 Add specs that pass on master and must keep passing: a plain-object override; the tooltip's callbacks override.
- [ ] 5.3 `override` on options recognises an options object as a block: its resolver becomes the top layer and scriptables get the options without it.
- [ ] 5.4 Release-note line: a function in a block reads the un-hovered options.

## 6. P6: Bar base per bar (#12334)

- [ ] 6.1 Confirm #12334's specs fail on master (an array is ignored, a function gives NaN).
- [ ] 6.2 Ask the author to replace the read of `this.options._proxy` with `config.resolveNamedOptions(scopes, ['base'], () => this.getContext(index))`, with the scopes `configure()` uses.
- [ ] 6.3 Measure a bar chart with 10 000 bars and a numeric `base`, time and allocation, before and after, one process per variant.
- [ ] 6.4 The pull request says `Closes #11624`.

## 7. P7: The dataset binding decides the axis

- [ ] 7.1 Add `test/specs/core.config.spec.js` with specs that fail on master: `yAxisID: 'ramazan'` gives axis `y` and finite point pixels, also when the dataset is pushed after the chart was created with no datasets; `xAxisID: 'yFoo'` gives `x`; a radar scale `foo` of type `radialLinear` bound by `rAxisID` is the radial axis; a scale `foo` with no `axis`, `position`, `type` or binding throws the documented message.
- [ ] 7.2 Add specs that pass on master: `axis` and `position` win; unbound `y2` and `xTop` follow the first letter; rebinding a dataset from `yAxisID` to `xAxisID` keeps the scale vertical.
- [ ] 7.3 Change the order in `determineAxis` and its one call in `mergeScaleConfig`; add `rAxisID` to the binding lookup; decide a first-letter axis again at update until a dataset names the id.
- [ ] 7.3a Add a spec for the output that changes: with `scales: {ramazan: {}, y: {}}`, a dataset on `ramazan` and one without `yAxisID`, both are on `ramazan`.
- [ ] 7.4 Update `docs/axes/cartesian/_common.md` and `docs/axes/index.md`.
- [ ] 7.5 The pull request says `Closes #11640` and has a release-note line: a scale bound by a dataset takes that axis, and a dataset without an axis id uses the first scale of its axis, which can now be that scale.

## 8. P8: Refactor the scale merge into stored and derived parts

- [ ] 8.1 Add guard specs that pass on master: the resolved scale options, min, max and one point pixel after create and after two updates, for line, bar, horizontal bar, stacked, scatter, bubble, radar, polar area, doughnut, mixed in both orders, multi-axis, an implied second axis, logarithmic, linear x, unbound extra axes, and a time scale.
- [ ] 8.2 Compute the stored entry (user values, `axis`) and the derived object (`{scales: {[id]: …}}`) separately, then merge the derived object into the stored entry as today. Record per entry object (a `WeakMap`) whether a dataset implied it, and carry P7's provisional mark there.
- [ ] 8.3 The suite and the image fixtures pass unchanged. The pull request says `Part of #11096` and `Part of #11910` in a sentence.

## 9. P9: Scale defaults are a scope

- [ ] 9.1 Add specs that fail on master: after changing `Chart.defaults.scale.grid.color`, `Chart.defaults.color` or `Chart.defaults.borderColor` and updating, grid, border, tick and title colours follow; a colour the chart set stays; a scale type's default follows; line to bar to line gives offset `false, true, false`; one options object used for a bar chart and then a line chart leaves no bar defaults on the second; the user's scale objects keep their keys; `chart.options = {scales: {y1: {}}}` on a scale a dataset implied gives the chart type's defaults; `chart.config.options.scales.y.min = 5` followed by an update works; a bar chart with `scales.y.beginAtZero: undefined` begins at zero.
- [ ] 9.2 Put the derived object into `chartOptionScopes()` after the chart's options and stop merging it into the stored entry. Reuse stored entries across updates.
- [ ] 9.3 Run P8's guard specs, the whole suite and the image fixtures; fix `core.controller.tests.js` expectations that compare a scale's whole options.
- [ ] 9.4 Measure `chart.update()` on a chart with 10 scales, time and allocation, before and after, one process per variant.
- [ ] 9.5 Update `docs/general/options.md` (where a scale option comes from) and `docs/developers/updates.md`.
- [ ] 9.6 The pull request says `Closes #11096` and `Closes #11910` and has release-note lines: scale options follow the defaults and the chart type at update; the keys of a scale's options list what the chart set; nested objects the chart did not set are absent from `chart.config.options.scales[id]` (write through `chart.options`); an `undefined` scale option counts as not set.

## 10. P10: Refactor: Defaults records its routes

- [ ] 10.1 Add a spec: the record holds the route of `plugins.tooltip.titleFont` to `font`; its local value is `{weight: 'bold'}`, and `{size: 20}` after `Chart.defaults.plugins.tooltip.titleFont = {size: 20}`.
- [ ] 10.2 `route` adds scope, name, target scope, target name and a reader of the local value to a module-level record beside `overrides` and `descriptors`.
- [ ] 10.3 The pull request says `Part of #10375` in a sentence.

## 11. P11: options.font is the chart's base font

- [ ] 11.1 Add `test/specs/options.font.spec.js` with specs that fail on master: with `options.font.size: 30` the font set on the canvas for tick labels, scale title, legend labels and title, chart title, subtitle and the tooltip's title, body and footer is 30 px; `tooltip.options.bodyFont.size` is 30 and the title is bold; radial point labels are 10 px in the chart's family; a text's own font wins; `Chart.defaults.plugins.tooltip.bodyFont.size = 20` gives a 20 px body beside a 30 px title; a radar's `getTickLimit()` is that of 30 px labels; a second chart without `options.font` stays 12 px; a function as `options.font` changes no text.
- [ ] 11.2 `Config` computes the chart font once per update (the chart's `options.font` when it is an object, over the chart type's, over `Chart.defaults.font`). Pass it as the fallback of `toFont` in `core.scale.js` (also where `chart.options.font` is read today), `scale.radialLinear.js` (also `getTickBackdropHeight`, which reads `defaults.font.size`), `plugin.title.js` and the legend plugin (five calls today; one place after rework-legend P9).
- [ ] 11.3 When the chart sets a root `font`, build a second derived object: for every route that targets the root `font`, the route's local value over the chart font. Add it to the scopes of plugin options only, after the chart type's overrides and before the defaults.
- [ ] 11.4 Run the whole suite and the image fixtures: no fixture without `options.font` changes.
- [ ] 11.5 Update `docs/general/fonts.md` (the order, and `toFont(opts.font, chart.options.font)` for plugin authors), `docs/general/options.md` and the comment on `font` in `src/types/index.d.ts`.
- [ ] 11.6 The pull request says `Closes #10375` and `Closes #11285`, says that radial point labels keep their own size of 10, and has release-note lines: `options.font` applies to every text; after `Chart.defaults.font` changes, a chart follows at its next update, not at a resize.

## 12. P12: Object options merge across function layers

- [ ] 12.1 Add specs that fail on master: a static `label: {color}` over `label: ctx => ({color, padding: 5})` gives padding 5; `name` and `length` of an object resolved from `function foo` are undefined; a static `hover.label` block over a function-valued `label` keeps the function's other keys; a bar dataset `borderWidth: {top: 5}` over `options.elements.bar.borderWidth: () => ({bottom: 2})` gives bottom 2.
- [ ] 12.1a Add a spec that passes on master: a function under a plugin option that is not scriptable, beside a static object in a higher layer, is not called.
- [ ] 12.2 A function among a scriptable object option's layers is called by the options object that has the context, never while scopes are built, and its result is the layer; `needContext` treats such a layer as needing a context.
- [ ] 12.3 Run the whole suite and the image fixtures. Measure `update()` on a chart with 10 000 elements and no function options, time and allocation, before and after.
- [ ] 12.4 Release-note line: keys returned by a function in a lower layer now resolve under a static object.

## 13. P13: Docs: hover options for plugin authors

- [ ] 13.1 Add a section to `docs/developers/plugins.md`: `options.setContext(ctx, ['hover', ''])` for `hoverColor` keys; `options.override(options.hover)` for a block; what the second argument of a scriptable reads; how object options merge; keep a block inside the plugin's own options; set the element prefix and the hover prefixes in two calls to get core's layering; texts a plugin draws follow the chart font when it calls `toFont(opts.font, chart.options.font)`.
- [ ] 13.2 Link it from `docs/general/options.md`.

## 14. P14: Docs: hover options of line and radar datasets

- [ ] 14.1 In `docs/charts/line.md` and `docs/charts/radar.md`, say that the dataset's `hover*` options apply to its points unless the matching `pointHover*` option is set.
- [ ] 14.2 The pull request says `Part of #10381` in a sentence; the issue stays open for 5.0.

## 15. P15: Docs: type defaults of a scale

- [ ] 15.1 In `docs/charts/mixed.md` and `docs/general/options.md`, say which type defaults a scale receives: a scale given in `options.scales` takes the chart type's, a scale only a dataset implies takes the dataset types'.
- [ ] 15.2 In `docs/general/options.md`, say that a chart type's defaults exist after its controller is registered.
- [ ] 15.3 The pull request says `Closes #11176` and `Closes #11786`.
