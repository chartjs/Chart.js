## Context

Everything below was run on master at 3164f57a unless it says otherwise.

### How options are resolved today

An option is found by walking scopes in order: the dataset or plugin options, the chart's options, the chart type's overrides, the defaults. `_createResolver` (`src/helpers/helpers.config.ts`) wraps a scope list in a Proxy; `_attachContext` wraps that in a second Proxy that calls scriptable options. An object-valued option gets a sub-resolver whose scopes are that key in every parent scope.

| Reader or decider | Where | What it does |
|---|---|---|
| Prefix list | `core.datasetController.js:821` | the only place that passes prefixes other than `['']`: `[<type>Hover, 'hover', <type>, '']` for an active element |
| Sub-resolver | `helpers.config.ts:356` (`createSubResolver`), called from `:270` (object returned by a scriptable), `:291` (items of an object array), `:401` (static object) | always created with `['']`: nested objects never see prefixes |
| What a scriptable reads | `core.config.js:359` (`subPrefixes`) | the only place that gives scriptables a second proxy, one without hover prefixes. Everywhere else the scriptable gets the proxy that called it |
| `setContext`, `override` | `helpers.config.ts:136-137` | carry the second proxy on unchanged, with its old context |
| `needContext` | `core.config.js:405` | attaches a context only when a named option is a function or array in the resolver's own keys |
| Scale options | `core.config.js:71-113` (`mergeScaleConfig`) | builds `options.scales[id]` from the user's config, the type overrides, `defaults.scales[type]` and `defaults.scale`, by cloning (`mergeIf`) |
| `Config.update()` | `core.config.js:197-201` | clears the caches and runs the same merge over the already merged `options.scales` |
| Axis of a scale | `core.config.js:40` (`determineAxis`) | exact id, then per argument `axis`, `position`, first letter of the id; the dataset binding is the second argument |
| Fonts | 21 `toFont(` calls in `core.scale.js`, `scale.radialLinear.js`, `plugin.legend.js`, `plugin.title.js`, `plugin.tooltip.js` | `toFont(options, fallback)` falls back to `Chart.defaults.font` unless the caller passes a fallback; only `core.scale.js:100` does |
| Defaults paths | `core.defaults.js:15-32` (`getScope`) | walks `node[k] || (node[k] = Object.create(null))` for `set`, `get`, `describe`, `override`, `route` |

### What goes wrong

| Issue | Input | Master | Cause |
|---|---|---|---|
| #11104 | `_createResolver([{node: {test: 1, hoverTest: 2}}], ['hover', '']).node.test` | 1 | the sub-resolver drops the prefixes |
| #11438 | plugin options `ranges: [{prop: 1}, {prop: 2}]` | each item also has keys `0` and `1` | the array is a scope of its items |
| #11624 | bar `base: [1, 2]`; `base: ctx => …` | ignored; NaN | `base` is read once per dataset |
| #11096, #11910 | change `Chart.defaults.scale.grid.color`, `defaults.color` or `defaults.borderColor`, then `update()` | grid and tick colours stay; the legend follows | the merge copied the defaults into `options.scales[id]` as own values, and at update the copies count as the user's |
| #10375, #11285 | `options.font: {size: 30}` | every text is drawn at 12 px; only the space reserved for an axis title grows | every reader but one falls back to `Chart.defaults.font`; the tooltip's fonts are routed to it |
| #11640 | scale `ramazan`, dataset `yAxisID: 'ramazan'` | axis `r`, points at `null` | the first letter is tried before the binding |
| #12265 | `Chart.defaults.set('plugins.__proto__', {p: 1})` | `({}).p === 1` | no segment of a path is checked |
| #10381 | line dataset `hoverBorderWidth: 10` | active points get border width 10 | the prefix order above; `test/specs/controller.line.tests.js:801-825` asserts it |
| #11786 | `type: 'bar'`, datasets `[line, scatter]`; add `scales: {y: {}}` | y goes from 10..13 to 0..14 and every point moves | a scale named in `options.scales` takes the chart type's defaults (bar: `beginAtZero`), an unnamed one only the defaults of the dataset types that use it |

Found while reading, not reported:

- A function that sits in a lower scope under a static object is used as a scope itself: its `name` and `length` leak into the resolved object and its result is ignored.
- After `setContext`, a scriptable's second argument still has the old context (not reachable from core today, reachable once #11105 lands).
- A scale id that nothing decides throws a `TypeError` instead of the documented message when the scale has no `type`.
- The constructor runs the scale merge twice. On the second pass every scale id counts as given by the user, so the chart type's defaults are offered to every scale; the copied defaults mask that today.

### Issues that need no code here

- #11176 (`Chart.defaults.datasets` is `{}`): the defaults of a chart type exist after its controller is registered. `docs/getting-started/integration.md` requires registering. P15 adds the sentence where defaults are described.
- #11259: the title asks for `pointRadius`, which `PointPrefixedOptions` has; the body asks for `lineTension`, renamed to `tension` in v3. The reporter wrote that it can be closed. No piece; the maintainer closes it with that answer.
- #12196 (changing `Chart.defaults.font` after render throws in the legend): completed by rework-legend P1. P11 here makes every reader use the font of the last update, which agrees with it.

## Goals / Non-Goals

**Goals:**

- One set of rules for layered options: prefixes, overrides and object merging behave the same at every depth and for every form an option can take.
- A plugin can offer hover options in either shape, `hoverColor` keys or a `hover: {}` block, with one call and no resolver code of its own.
- Options a chart does not set follow the defaults at every update.
- The chart's `options.font` is the base font of the chart.
- The four open pull requests land as their authors' work.
- Nothing here has to be undone by the resolver planned for 5.0: every addition is a rule about which layers are read, not a new per-read mechanism.

**Non-Goals:**

- The compiled resolver and its performance (#10073, #11814), options that return a Promise (#11266), consistent alignment names (#10110).
- Changing which hover options of a line dataset reach its points (#10381); see Open Questions.
- Root `options.color` and `options.borderColor` as per-chart defaults for scales. They have the same gap as the font, no issue asks for it, and it would change colours of charts that set `options.color`.
- A public type for the options object a plugin receives.
- The hover state itself: a plugin still tracks which of its elements is hovered and resolves its options again when that changes.

## Decisions

### D1. A resolver keeps its prefixes, and every sub-resolver takes them

The prefixes are stored on the resolver (`_prefixes`, private). `createSubResolver` reads them, so all three call sites inherit and need no extra parameter.

- *Passing prefixes as a parameter from `_resolveWithPrefixes`* (#11105 as opened): reaches one of the three sites. `borderWidth: () => ({top: 1, hoverTop: 9})` stays 1 where the static object gives 9.
- *A switch per resolver*: the hard-coded `['']` was a workaround for the recursion that D2 removes, not a feature.

Measured on #11105 merged into master: the Karma suite passes (926 of 926), and core output changes only when a nested object has a key `hover<Key>` or `<elementType><Key>` beside `<key>`. No documented core option has such keys.

### D2. A scriptable's second argument never includes the hover layer being applied

The rule core already follows for dataset elements (`subPrefixes`) becomes the rule everywhere:

- `setContext(ctx, prefixes)` gives scriptables the options as they were before the call: the prefixes that were in effect, not the ones the call sets;
- `setContext(ctx)` gives the second proxy the new context too;
- `override(plainObject)` applies the same object to the second proxy;
- `override(block)` gives scriptables the proxy without the block (D4).

Without it `hoverColor: (ctx, opts) => opts.color` throws "Recursion detected" on every new path. That pattern is what `core.defaults.js` itself uses for `hoverBackgroundColor`.

The rule is "what the call adds", not a test of the prefix's name. `Config.resolveNamedOptions` keeps its own filter (prefixes that contain `hover` are left out, `bar` or `point` stay), which is the same rule for the one list core builds. A plugin that wants core's exact layering sets the element prefix first and the hover prefixes in a second call.

- *Catch the self-read only and fall through to the value beneath*: no working input changes, but a function that reads a different option would get the hovered value in a plugin and the normal one in core.
- *Filter by name everywhere*: `setContext(ctx, ['active', ''])` with `activeColor: (ctx, opts) => opts.color` would recurse.

### D3. `setContext(context, prefixes?)` replaces the prefixes

Absent or empty keeps the prefixes in effect; a list replaces them; `['']` resets. `override` gets no prefix argument: `opts.override(scope).setContext(ctx, prefixes)` gives the same result and nothing asks for more. The resolver method the contributor added, `overridePrefixes`, stays under that name and is not documented, so 5.0 need not keep it.

- *Prepend instead of replace*: a caller could then not reset.
- *Cache the prefixed resolvers*: `setContext(ctx, prefixes)` builds a new resolver on each call. No cache until a measurement with a plugin shows a cost.

### D4. A block of options is recognised by being read from the options

When the object given to `override` is itself an options object (what a plugin gets from `opts.hover`), it is a block: its underlying resolver is the new top layer, its functions are called by the overriding proxy with that proxy's context, and scriptables read the options without the block. A plain object behaves as on master, so chartjs-plugin-annotation's `resolver[scope].override(definition)` and the tooltip's callbacks are unchanged.

Simulated with master's API: static blocks, functions at three levels, array-form options, the self-read (`'black+dark'`, master throws), a context change after the override (`'c7'`, master `'c5'`), and annotation's sub-element shape hovered and not.

One output changes for input that works today: a function inside a block that reads *another* option the block also defines saw the block's value and now sees the un-hovered one (`hover.label.font.size: 30`, `hover.label.color: (ctx, opts) => 'size' + opts.font.size`: `size30` becomes `size20`). No known caller passes an options object to `override` today.

- *Every override hands scriptables the options without the override*: breaks annotation, whose sub-element scriptables read `opts.type` from the plain override (`'label'` would become `'line'`).

### D5. Object options merge key by key, and a function layer contributes its result

A function among the layers of an object option is called and its result is the layer. `needContext` treats such a layer as needing a context. This closes the last gap of the block shape (a static `hover.label` over a function-valued `label` kept only the block's keys) and removes the `name`/`length` leak.

A function layer is called only where functions are called today: by the options object that has a context, and only for a key its descriptors mark scriptable. Plugin options are resolved as not scriptable, so a function under a plugin key (`generateLabels`, `filter`, `sort`, callbacks) stays a value, and resolvers shared between contexts never hold a function's result.

This is a change of output for input that works today, with no doc that promised the old result: where a static object sits over a function in a lower layer, keys only the function returns now resolve, and the function is now called. Not prototyped; its piece is the last behaviour piece so it can be measured, or left out, on its own.

- *Only stop the leak*: the block shape stays incomplete.
- *Evaluate function layers only under a block*: two merge rules for one kind of option.

### D6. Bar `base` asks the config whether it needs a context

#12334 reads `this.options._proxy` to find out whether `base` is an array or function. `config.resolveNamedOptions(scopes, ['base'], () => this.getContext(index))` already answers that: it gives 1, 2, 1 for `[1, 2]`, calls a function with each bar's context, reads `options.datasets.bar.base`, and creates no context for a number. The PR uses it and drops the resolver internals.

### D7. Scale defaults are a scope, not a copy

`options.scales[id]` holds what the chart was given plus `axis`, `id` and `position`. As today, the `scales` property of the user's options object is replaced by these stored entries, which are clones of what the user passed, made once and kept across updates; the scale objects the user passed are not written. So `config.options.scales.y.min = 5` followed by an update still works. `Config` builds one object per chart at every update, `{scales: {[id]: …}}`, with what a scale takes from the chart type and from the types of its datasets, and from `defaults.scales[type]`. It goes into the chart's scope list after the chart's options and before the chart type's overrides, where it has to be: the chart type's scale overrides must not reach a scale only a dataset implies. `defaults.scale` is not copied anywhere; the resolver already reaches it through the `scales` to `scale` fallback.

`Config` remembers, per stored entry object (a `WeakMap`, so the record goes when `chart.options` or a scale's object is replaced), whether it created the entry for an id only a dataset implies. Those take the dataset types' defaults only, as the first merge does today; an entry the user gave takes the chart type's first. This keeps a new chart's output identical now that no copy masks the second pass.

Prototyped in memory over 24 configurations (cartesian, radial, mixed in both orders, multi-axis, time, scriptable): every resolved scale option, min, max and point pixel equals master's after create and after two updates, except the intended differences:

1. defaults follow at `update()`;
2. type defaults follow a changed chart or dataset type;
3. an explicit `undefined` under a key the type defines resolves to the type's default instead of blocking it, as every other option family treats `undefined`;
4. two charts sharing one options object no longer leak the first chart's scale defaults into the second;
5. the keys of `chart.options.scales.x` and of `scale.options` list `axis`, `id`, `position` and the user's keys, not every default;
6. the raw stored options, `chart.config.options.scales.x` or the user's own `config.options.scales.x`, no longer hold the nested objects the defaults brought: `config.options.scales.x.grid.color = 'red'` works on master and throws after this change unless the chart set `grid`. The same write through `chart.options.scales.x.grid.color` works as before. No doc shows the raw form, but it is a regression for code that uses it and goes into the release note.

Proxy writes, replacing a scale's object, `delete`, `in`, a removed dataset's scale staying, and the time scale's format merge behave as on master. The suites were not run on the prototype.

- *Keep the copies and refresh the ones that came from defaults*: needs a record per leaf of where it came from, with array equality.
- *Wait for 5.0*: the fix is the top request of both issues, and no documented use reads the stored copies.

The refactor that separates "what the chart gave" from "what is derived" is a piece of its own (P8) with specs that pin today's resolved options, so the behaviour piece (P9) only moves the derived part into a scope.

### D8. The dataset binding decides the axis before the id's first letter

Order: exact id, `axis`, `position`, the first dataset that names the id (`xAxisID`, `yAxisID` or `rAxisID`), first letter, an `axis` the scale type's defaults declare (no built-in type does). An id that nothing decides throws the documented message also without a `type`.

An axis that came from the id's first letter is provisional: it is decided again at every update until a dataset names the id. Otherwise the usual order of work, create the chart with its scales, load the data, update, would still give `ramazan` the axis `r`, because no dataset names it when the axis is first decided. Every other axis stays as decided, as today: rebinding a dataset on an existing scale does not turn the scale.

The dataset that binds such a scale draws nothing today (`ramazan` as `yAxisID`: axis `r`; `yFoo` as `xAxisID`: axis `y`; points at `null`). The docs promise the first character for ids that start with `x` or `y`; they promise nothing for `r`.

One working output changes. A dataset without `yAxisID` takes the first scale of its axis in the order of `options.scales`. With `scales: {ramazan: {}, y: {}}`, a dataset bound to `ramazan` and a second dataset without `yAxisID`, the second is on `y` today and moves to `ramazan` once that is a y axis. The chart was already wrong (the first dataset was not drawn); the release note says to give the second dataset `yAxisID: 'y'`.

- *Binding first only for `r`*: leaves `yFoo` bound as `xAxisID` broken.

### D9. Readers pass the chart's font as the fallback; routed fonts get it through the derived scope

The chart font is one complete font per chart per update: the chart's `options.font` over the chart type's over `Chart.defaults.font`, computed by `Config` and kept on the chart. Every reader without a routed default passes it as the fallback, `toFont(theirOption, chartFont)`; that includes the three places that read `chart.options.font` today for an axis title's height, and `getTickBackdropHeight` in the radial scale, which reads `defaults.font.size` directly for the tick limit and padding. `toFont` does not change.

The tooltip's three fonts are routed to `Chart.defaults.font` by a getter that returns a complete object, so a fallback never applies, and the getter has to stay (callbacks, `boxWidth`, the external tooltip sample read it). `Defaults` records the routes it creates, each with a way to read the route's local value (what the plugin's defaults or the user set for it, such as `{weight: 'bold'}` for the tooltip title or a global `Chart.defaults.plugins.tooltip.bodyFont = {size: 20}`), which today is only reachable under a private name. When the chart sets a root `font`, `Config` builds a second derived object: for every route that targets the root `font`, the route's local value over the chart font. It is a scope of plugin options only, after the chart type's overrides and before the defaults, so a font set for that text in the chart, in the chart type's overrides or globally still wins, and datasets and elements never see it. `plugin.tooltip.js` is not edited.

- *Read the registered plugins' `defaultRoutes` instead of a record in `Defaults`*: it gives the three tooltip routes without a new record, but not the value a user set globally for a routed option, and not a route made by calling `defaults.route` directly.

- *`additionalOptionScopes: ['']` on the plugins* (suggested in #10375): every plugin option would fall through to the root, so `tooltip.animation` would inherit the chart's `onComplete`.

One piece carries all of it, so no release has the tooltip on the chart's font and the ticks off it.

Follow-on effects, accepted: the tooltip's colour boxes follow the body size; an axis title is drawn at the size its space was reserved for; radial point labels keep size 10, also in the polar area and radar charts of #11285. After `Chart.defaults.font` changes, title and legend no longer change size on a redraw or a resize without an update; today a resize fits them again with the new font while the ticks keep the old one. A function as root `options.font` (the types do not allow one) is ignored by every reader alike; today it is called for the axis title's height only. Texts drawn by third-party plugins follow the chart font only when the plugin passes it, so the same line is documented for them: `toFont(opts.font, chart.options.font)`.

With rework-legend: its P19 renames the legend plugin's file and its P9 resolves the legend's fonts once, in `fit`. Whichever lands first, the contract is that the legend resolves its fonts with the chart font as the fallback; P11 edits the five calls of today or the one place after P9.

### D10. Defaults paths throw

#12268 checks every segment of a path and throws `Invalid defaults scope: <path>`. It is kept, extended to the name `route` defines (`route('', '__proto__', '', 'color')` creates a permanent own `__proto__` accessor on the defaults), and gets the specs it waits on. Ignoring silently, as `merge()` does for keys, would make `get()` return a detached object. `override('__proto__', …)` and `describe('constructor.x', …)` do no harm today, because those objects have no prototype; they throw too, for one rule.

### D11. Contributors' pull requests are pieces

#12268, #12388, #11105 and #12334 are built by rebasing and changing the author's branch, not by a second pull request. When an author does not answer, the piece is rebuilt with `Co-authored-by`.

### D12. Releases

- Patch: P1, P2, P6, P14.
- Minor, each with a release-note line: P4, P5, P7, P9, P11, P12.
- No release effect: P3 (nothing in core reaches it before P4), P8, P10 (refactors), P13, P15 (docs).

### D13. What the design review changed

- The second-argument rule is "the options as they were before the call", not a filter by the prefix's name (D2): the two wordings of the first draft disagreed for a prefix list such as `['pointHover', 'point', '']`.
- A first-letter axis is provisional (D8): a chart created before its data would have kept the axis `r`. `rAxisID` counts as a binding. The moved unbound dataset is named.
- The raw stored scale options losing their nested objects is named as a regression (D7, item 6), and what a stored entry is (a clone, kept across updates) is stated. The implied record is per entry object.
- The explicit `undefined` case became an open question of its own.
- The route record carries the route's local value, and routed fonts get a derived scope of their own, for plugin options only (D9): the four-field record could not give "the route's own default", and one shared position would have let the chart font beat a font set for the tooltip in the chart type's overrides or globally.
- One chart font per update, used by every reader (D9): a function as root font would otherwise have reached ticks and legend as an incomplete font. The radial scale's direct read of `defaults.font.size` and the resize path are named.
- A function layer is called only with a context and only for scriptable keys (D5).
- P3 releases nothing. P7, P9 and P11 list the open pull requests that hold their files. P15 also completes #11176.

## Risks / Trade-offs

- [P9 changes what `Object.keys()` and `JSON.stringify` of a scale's options return] → release note; reads by name and writes are unchanged. `test/specs/core.controller.tests.js:458-499` compares scale options with `toEqual` and may need edits (not run).
- [P9 and P11 were prototyped by patching the bundle in memory; the suites and the image fixtures were not run on them] → P8's guard specs pin the resolved options first; the builder runs the fixtures before P9 turns ready.
- [P12 is not prototyped] → it is the last behaviour piece and can be dropped without touching the others; the hover block then keeps one documented limit.
- [P11 makes one-line edits in files many open pull requests and two open designs hold] → it is small where it overlaps; whoever lands later rebases one line.
- [The fall-through of unset scale options costs two or three more scopes per option, once per update, while a deep clone per scale per update goes away] → measured in P9 with time and allocation, before and after.
- [A plugin that names its block `hover` and also reads the root scope may pick up the chart's `options.hover` interaction options as lower layers of the block] → the docs piece tells plugin authors to keep the block inside their own option objects.
- [`test/specs/helpers.config.tests.js` is converted to Vitest by migrate-tests-to-vitest 9.3] → that task runs after P2 to P5, or those pieces rebase onto the converted file.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12268 with changes: defaults paths reject `__proto__`, `prototype`, `constructor`; `route` also checks the name it defines | `src/core/core.defaults.js`, `test/specs/core.defaults.spec.js` | `set('plugins.__proto__', {p: 1})` throws and `({}).p` is undefined (master: 1); the same for `get`, `describe`, `override`, `route` and a route name; `set('myconstructor.a', …)` works | ~70 | the author's changes; #12499 (holds the spec file) | | #12265 |
| P2 | #12388 as is: an options array is not a scope of its items | `src/helpers/helpers.config.ts`, `test/specs/helpers.config.tests.js` | its own spec (fails on master: `opts.array[0][1]` is `{a: 2}`) | ~20 | | | #11438 |
| P3 | refactor (not reachable from core until P4): a scriptable's second argument follows a new context and a plain override | `src/helpers/helpers.config.ts`, `test/specs/helpers.config.tests.js` | `a: (ctx, opts) => ctx.n + ':' + opts.b` after `setContext({n: 2})` gives `2:2` (master `2:1`); a scriptable under `override({type: 'label'})` on options with a second proxy reads `'label'` | ~40 | P2 (same file) | | |
| P4 | #11105 with changes: stored prefixes inherited at all three sites; `setContext(ctx, prefixes?)`; no prefix argument on `override` | `src/helpers/helpers.config.ts`, `src/helpers/helpers.config.types.ts`, `test/specs/helpers.config.tests.js` | static, function-returned and array sub-objects resolve `hoverTest` (master: 1); `hoverColor: (ctx, opts) => opts.color + '+dark'` gives `'red+dark'` at the root and one level down (the PR head throws); after `setContext(ctx, ['point', ''])` and then `['pointHover', 'point', '']`, a scriptable's second argument still reads `pointColor`; `setContext(ctx)` with one argument compiles; an active bar with `borderWidth: () => ({top: 1, hoverTop: 9})` has top 9 | ~110 | P3; the author's changes | | #11104 |
| P5 | a block of options applies with one override | `src/helpers/helpers.config.ts`, `test/specs/helpers.config.tests.js` | a function in the block that reads its own option gives `'black+dark'` (master throws); the block's functions get a later context (`c7`, master `c5`); annotation's sub-element shape reads `opts.type === 'label'` when hovered; a plain-object override is unchanged | ~90 | P4 (same lines) | | |
| P6 | #12334 with changes: bar `base` per bar, through `resolveNamedOptions` | `src/controllers/controller.bar.js`, `test/specs/controller.bar.tests.js` | its own specs (master: an array is ignored, a function gives NaN); its spec that a number creates no per-bar context | ~160 | the author's changes; merge order with #12335, #12331, #12263, #12222, #11898 (same two files) | | #11624 |
| P7 | axis order: the binding dataset (`x`, `y` or `r`) before the first letter; a first-letter axis is decided again at update until a dataset binds the scale; the documented error without a `type` (no issue asks for that last part; it is three lines in the same function) | `src/core/core.config.js`, `test/specs/core.config.spec.js` (new), `docs/axes/cartesian/_common.md`, `docs/axes/index.md` | `yAxisID: 'ramazan'` gives axis `y` and finite point pixels (master: `r`, null), also when the dataset is pushed after the chart was created; `xAxisID: 'yFoo'` gives `x`; a radar scale `foo` bound by `rAxisID` works (master throws); `foo` unbound throws the documented message (master: TypeError) | ~140 | | | #11640 |
| P8 | refactor: the scale merge is computed as the stored entry plus a derived object, then merged as today; `Config` records given and implied entries | `src/core/core.config.js`, `test/specs/core.config.spec.js` | nothing (no behaviour change). Adds guard specs that pin the resolved scale options of the prototype's configurations after create and after update | ~170 | P7 (same function) | #11096, #11910 | |
| P9 | the derived object is a scope of the chart's options and is no longer merged into the stored entry | `src/core/core.config.js`, `test/specs/core.config.spec.js`, `docs/general/options.md`, `docs/developers/updates.md` | grid, border, tick and title colours follow `Chart.defaults.scale.grid.color`, `color`, `borderColor` after `update()` (master: unchanged); a colour the chart set stays; line to bar to line gives offset `false, true, false` (master `false` throughout); the user's scale objects keep their keys | ~190; wide if `test/specs/core.controller.tests.js` needs edits (held by #12218) | P8; #12400 (holds `docs/developers/updates.md`) | | #11096, #11910 |
| P10 | refactor: `Defaults` records the routes it creates, each with its local value | `src/core/core.defaults.js`, `test/specs/core.defaults.spec.js` | nothing (no behaviour change); a spec reads the record for `plugins.tooltip.titleFont` and gets `{weight: 'bold'}` as its local value, and `{size: 20}` after that is set globally | ~50 | P1 (same file) | #10375 | |
| P11 | the chart's font: one complete font per chart per update; readers pass it as the fallback; routed fonts enter a derived scope of plugin options | `src/core/core.config.js`, `src/core/core.scale.js`, `src/scales/scale.radialLinear.js`, `src/plugins/plugin.title.js`, `src/plugins/plugin.legend.js`, `src/types/index.d.ts` (comment), `docs/general/fonts.md`, `docs/general/options.md`, `test/specs/options.font.spec.js` (new) | with `options.font.size: 30` the font set on the canvas for ticks, scale title, legend, title, subtitle and tooltip is 30 px (master: 12); `tooltip.options.bodyFont.size` is 30, and 20 when `Chart.defaults.plugins.tooltip.bodyFont.size` is 20; a radar's tick limit is that of 30 px labels (master: of 12 px); point labels 10; a second chart without `options.font` stays 12 | ~260, wide: one-line edits in files held by rework-ticks (#12492), #12401, #12244, #12237, #12203, #11188 (`core.scale.js`), #12336 (`scale.radialLinear.js`), rework-legend P19 and P9 and the open legend pull requests (`plugin.legend.js`), and 14 pull requests on `index.d.ts` (a comment only) | P9 (the derived scope), P10 (the route record); merge order with the holders named under Size | | #10375, #11285 |
| P12 | object options merge across function layers; a function is never a scope | `src/helpers/helpers.config.ts`, `src/core/core.config.js` (`needContext`), `test/specs/helpers.config.tests.js` | a static `label: {color}` over `label: ctx => ({color, padding: 5})` gives padding 5 (master: the next static layer's); `name` and `length` of an object from `function foo` are undefined (master `'foo'`, 1); a static `hover.label` block over a function-valued `label` keeps the function's other keys; a function under a plugin option that is not scriptable (`generateLabels` beside a static object in a higher layer) is not called | ~130, wide in effect: any scriptable object option given as a function in a lower layer | P5 (same file), P11 (`core.config.js`) | | |
| P13 | docs: hover options for plugin authors (both shapes, the second-argument rule, layer merging) | `docs/developers/plugins.md`, `docs/general/options.md` | nothing (docs) | ~90 | P4, P5, P12 | | |
| P14 | docs: a line or radar dataset's `hover*` options reach its points unless `pointHover*` is set | `docs/charts/line.md`, `docs/charts/radar.md` | nothing (docs) | ~12 | | | #10381 (see Open Questions) |
| P15 | docs: which type defaults a scale receives; a chart type's defaults exist after its controller is registered | `docs/charts/mixed.md`, `docs/general/options.md` | nothing (docs) | ~30 | P9, P13 (same doc file) | | #11786 (see Open Questions), #11176 |

In parallel: P1 → P10; P2 → P3 → P4 → P5; P6; P7 → P8 → P9; P14. Then P11 after P9 and P10, P12 after P5 and P11, P13 after P12, P15 after P13.

Shared files order the rest: `helpers.config.ts` (P2, P3, P4, P5, P12), `core.config.js` (P7, P8, P9, P11, P12), `core.defaults.js` (P1, P10), `docs/general/options.md` (P9, P11, P13, P15).

## Contracts

- **P3 → P4, P5:** `setContext(ctx)` gives the second proxy the new context; `override(plainObject)` applies the object to the second proxy. P4's rebase must keep both.
- **P4 → P5, P13:** after `setContext(ctx, prefixes)` a scriptable's second argument resolves with the prefixes that were in effect before the call.
- **P4 → P5, P12:** a resolver has `_prefixes: string[]`; every sub-resolver is created with its parent's. `setContext(ctx, prefixes?)` is the only public way to change them.
- **P5 → P13:** an options object passed to `override` is a block; a plain object is not.
- **P7 → P8, P9:** an axis taken from the id's first letter is marked provisional in the same per-entry record and decided again at update.
- **P8 → P9:** `Config` holds, per chart, the stored scale entries (user values plus `axis`, `id`, `position`), the per-entry record of which entries are implied, and a derived object `{scales: {[id]: …}}` rebuilt on every `Config.update()`. It is always a clone: a write through an options proxy never reaches the global defaults.
- **P9 → P11:** `Config` rebuilds its derived objects at every `Config.update()`. The scales one is a scope of the chart's options, after the chart's options and before the chart type's overrides. P11 adds a second one for routed fonts, a scope of plugin options only, after the chart type's overrides and before the defaults.
- **P10 → P11:** `Defaults` exposes each route as scope, name, target scope, target name and a way to read its local value.
- **P11 ↔ rework-legend:** the legend resolves its fonts with the chart font as the fallback, in whichever file and place it resolves them.
- **What P9 and P11 need from the resolver, true today and kept by P2 to P5 and P12:** a root scope list may contain per-chart synthetic scopes; `set` and `delete` through any sub-resolver land on the first root scope; the `scales` to `scale` fallback stays; `Object.keys()` of a resolver lists the first scope's keys.
- **What 5.0's resolver has to keep:** prefix lists that apply inside nested objects and can be replaced per call; a layer over resolved options, as a plain object or as a block; the second-argument rule (D2); the merge rule (D5). Not `overridePrefixes`, `_prefixes` or the second proxy.

## Open Questions

1. **P14, #10381.** A line dataset's `hoverBorderWidth` reaches its points, and a spec pins that. Document it in 4.x and close the issue, with "only `point*` options reach points" noted for 5.0 (recommended), or keep the issue open for 5.0?
2. **P9.** The stored scale options stop holding copies of the defaults. `Object.keys()` and `JSON.stringify` of a scale's options list only what the chart set, and a write through the raw config to a nested object the chart did not set (`config.options.scales.x.grid.color = 'red'`) throws; the same through `chart.options` works. A minor release with a release note (recommended), or 5.0?
3. **P9.** Type defaults of a scale are decided again at every update, so changing `config.type` changes offset, `beginAtZero` and the scale type where the chart does not set them. Recompute (recommended), or freeze per scale as today?
4. **P9.** An explicit `undefined` scale option stops blocking the type's default: a bar chart with `scales.y.beginAtZero: undefined` starts at 10 today and at 0 after. Count `undefined` as not set, as every other option does (recommended), or keep it as a value for scales?
5. **P7.** The dataset binding before the first letter for every id (recommended, a minor release with a note that a dataset without an axis id can move to the scale that became a y axis), only for ids that start with `r`, or 5.0?
6. **P11.** The root `options.font` starts to apply to every text of charts that set it today. A minor release with a release note (recommended), or 5.0?
7. **P15, #11786.** Either single rule for a scale's type defaults breaks a chart that works today. Document the current rule and close, with a new rule noted for 5.0 (recommended), or change it now? Documenting leaves what the reporter saw as it is, and the reporter's own chart could not be read (the reproduction here is a bar chart with a line and a scatter dataset).
8. **P5.** A function in a block reads the un-hovered options, also for options other than its own (D4). Accept (recommended), or fall through only for a self-read?
9. **P12.** The merge rule changes output for a static object over a function in a lower layer, completes no issue and is not prototyped; without it the block shape keeps one limit (a static `hover.label` over a function-valued `label` hides the function's other keys). The full rule in a minor release with a release note (recommended, since both hover shapes are to work), only the `name`/`length` fix, or leave it for 5.0 and document the limit?
