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
| Axis of a scale | `core.config.js:40` (`determineAxis`), called from `core.config.js:86` and from `core.controller.js:334` and `:349` | exact id, then per argument `axis`, `position`, first letter of the id; the dataset binding is the second argument of the first call only. The two calls in the controller pass the stored entry alone and agree with the first because the entry holds `axis` |
| Default position of a scale | `core.controller.js:352-354` (`buildOrUpdateScales`) | writes `chartArea`, `bottom` or `left` into the stored entry when the chart gave no `position`, or one that contradicts the axis. At the next update that value reads as the chart's own |
| Radial or cartesian | `plugin.filler/filler.target.js:50`, `filler.drawing.js:28` | the only test in core of what kind a scale is: whether it has `getPointPositionForValue`. The radar and polar area controllers call that method, `getDistanceFromCenterForValue` and `getIndexAngle` without a test |
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
| #12265 | `Chart.defaults.set('plugins.__proto__', {p: 1})`; `Chart.defaults.set('toString.x', {p: 1})` | `({}).p === 1`; `Object.prototype.toString.x` is `{p: 1}` | the path walk follows inherited properties, so it leaves the defaults through any of them, not only through `__proto__` |
| #10381 | line dataset `hoverBorderWidth: 10` | active points get border width 10 | the prefix order above; `test/specs/controller.line.tests.js:801-825` asserts it |
| #11786 | `type: 'bar'`, datasets `[line, scatter]`; add `scales: {y: {}}` | y goes from 10..13 to 0..14 and every point moves | a scale named in `options.scales` takes the chart type's defaults (bar: `beginAtZero`), an unnamed one only the defaults of the dataset types that use it |

Found while reading, not reported:

- A function that sits in a lower scope under a static object is used as a scope itself: its `name` and `length` leak into the resolved object and its result is ignored.
- After `setContext`, a scriptable's second argument still has the old context (not reachable from core today, reachable once #11105 lands).
- A scale id that nothing decides throws a `TypeError` instead of the documented message when the scale has no `type`.
- A scale type of the wrong kind for its axis does not work in either direction: a radar chart with `r: {type: 'linear'}` throws `scale.getPointPositionForValue is not a function`, a line chart with `x: {type: 'radialLinear'}` puts every point's x at `null`, and an unbound `ramazan: {type: 'linear'}` is a vertical scale laid over the plot.
- A scriptable inside an item of an options array gets the whole array as its second argument, not the item's options, when the options have a second proxy.
- A value given to `Chart.defaults.set` can replace a method of the defaults: after `Chart.defaults.set({describe: {a: 1}})`, `Chart.defaults.describe` is that object. `route` checks neither of its names: `route('rt', 'x', '', '__proto__')` makes `Chart.defaults.rt.x` return the prototype of the defaults.
- A write into a routed font is lost: after `Chart.defaults.plugins.tooltip.bodyFont.size = 20`, or `Chart.defaults.set('plugins.tooltip.bodyFont', {size: 20})`, the size reads 12, because the route's getter returns a new object on every read. Only assigning the whole object works. Nothing here changes that.
- A plugin that registers `additionalOptionScopes: ['']`, as chartjs-plugin-annotation does, reads the chart's `options.hover` under every `hover` key of its options, at any depth: `box.hover.mode` is `'nearest'`, and `box.override(box.hover).mode` is `'nearest'` where the plugin's default for `box.mode` is `'own'`.
- With `scales: {y2: {position: 'right'}}` and a dataset without `yAxisID`, the chart has the scales `y2`, `x` and `y`; both datasets use `y2` and `y` is empty.
- The constructor runs the scale merge twice. On the second pass every scale id counts as given by the user, so the chart type's defaults are offered to every scale; the copied defaults mask that today.

### Issues that need no code here

- #11176 (`Chart.defaults.datasets` is `{}`): the defaults of a chart type exist after its controller is registered. `docs/getting-started/integration.md` requires registering. P15 adds the sentence where defaults are described. The issue's code imports `Chart` from `chart.js` and sets the default before anything is registered, which the sentence answers. The reporter also suspects the `auto` package; with `chart.js/auto` loaded the assignment works, so if that was their setup the cause is two copies of the library in one bundle, which nothing here changes.
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

- The compiled resolver and its performance (#10073), update performance with many datasets (#11814, which is about the lookup of dataset metadata, not about options), options that return a Promise (#11266), consistent alignment names (#10110).
- Changing which hover options of a line dataset reach its points (#10381). It is documented here and stays open for 5.0.
- Root `options.color` and `options.borderColor` as per-chart defaults for scales. They have the same gap as the font, no issue asks for it, and it would change colours of charts that set `options.color`.
- The empty scale a chart gets for an axis that a scale under another id already serves (Context). No issue asks for it, and removing the scale changes charts that work.
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
- `override(block)` gives scriptables the proxy without the block (D4);
- a scriptable inside an item of an options array gets that item's options, not the array.

Without it `hoverColor: (ctx, opts) => opts.color` throws "Recursion detected" on every new path. That pattern is what `core.defaults.js` itself uses for `hoverBackgroundColor`.

The rule is "what the call adds", not a test of the prefix's name. `Config.resolveNamedOptions` keeps its own filter (prefixes that contain `hover` are left out, `bar` or `point` stay), which is the same rule for the one list core builds. A plugin that wants core's exact layering sets the element prefix first and the hover prefixes in a second call.

- *Catch the self-read only and fall through to the value beneath*: no working input changes, but a function that reads a different option would get the hovered value in a plugin and the normal one in core.
- *Filter by name everywhere*: `setContext(ctx, ['active', ''])` with `activeColor: (ctx, opts) => opts.color` would recurse.

### D3. `setContext(context, prefixes?)` replaces the prefixes

Absent or empty keeps the prefixes in effect; a list replaces them; `['']` resets. `override` gets no prefix argument: `opts.override(scope).setContext(ctx, prefixes)` gives the same result and nothing asks for more. The resolver method the contributor added, `overridePrefixes`, stays under that name and is not documented, so 5.0 need not keep it.

- *Prepend instead of replace*: a caller could then not reset.
- *Cache the prefixed resolvers*: `setContext(ctx, prefixes)` builds a new resolver on each call. No cache until a measurement with a plugin shows a cost.

### D4. A block of options is named by its key

`override` takes the key of a block: `opts.override('hover')`. The block is what the layers of that options object hold under the key, each layer's object in the order of the layers, so a block in the chart's options lies over a block in the plugin's defaults and both lie over every other option. The blocks become the top layers, their functions are called by the overriding proxy with that proxy's context, and scriptables read the options without the block. Only the layers of the options object itself are read: not the root scopes and not a fallback. A key under which no layer holds an object, `null` and `undefined` give the options unchanged. A function under the key is not a block. An object given to `override` behaves as on master, so chartjs-plugin-annotation's `resolver[scope].override(definition)` and the tooltip's callbacks are unchanged.

The first form of this decision took the block by value, `opts.override(opts.hover)`, and recognised it by being an options object. That reads the block as an option, and an option named `hover` falls through to the root scopes of a plugin that has them (Context): the chart's interaction options became layers of the block, also for a block inside the plugin's own option objects. Run on master with a plugin that has `additionalOptionScopes: ['']`, defaults `box: {mode: 'own', hover: {…}}`: by value `mode` is `'nearest'`; with the two blocks put in front as plain objects, which is what the key form does, `mode` is `'own'` and the user's block lies over the defaults' block.

- *Keep the value form and leave the name `hover` out of the root scopes for a block*: a rule about one name inside the resolver, and the same collision for any other block name a root option shares.
- *Both forms*: two ways to do one thing, one of them wrong for the plugin the feature is for.

Simulated with master's API: static blocks, functions at three levels, array-form options, the self-read (`'black+dark'`, master throws), a context change after the override (`'c7'`, master `'c5'`), and annotation's sub-element shape hovered and not.

One output changes for input that works today: a function inside a block that reads *another* option the block also defines saw the block's value and now sees the un-hovered one (`hover.label.font.size: 30`, `hover.label.color: (ctx, opts) => 'size' + opts.font.size`: `size30` becomes `size20`). No caller can pass a key to `override` today: a string is taken as a scope and changes nothing.

- *Every override hands scriptables the options without the override*: breaks annotation, whose sub-element scriptables read `opts.type` from the plain override (`'label'` would become `'line'`).

### D5. Object options merge key by key, and a function layer contributes its result

A function among the layers of an object option is called and its result is the layer. `needContext` treats such a layer as needing a context. This closes the last gap of the block shape (a static `hover.label` over a function-valued `label` kept only the block's keys) and removes the `name`/`length` leak.

A function layer is called only where functions are called today: by the options object that has a context, and only for a key its descriptors mark scriptable. A plugin's options are scriptable only where its descriptors say so. Title, subtitle, legend and tooltip declare it and leave out their callbacks (`generateLabels`, `filter`, `sort`, `itemSort`, `external`, the `on…` handlers, the tooltip's `callbacks`); every other plugin's options are not scriptable. So a function under one of those keys stays a value, and resolvers shared between contexts never hold a function's result.

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
- *Mark the derived object `_allKeys`, so the keys of a scale's options stay complete* (item 5): prototyped on the built bundle over nine configurations. The keys of `chart.options.scales[id]` and of `scale.options` equal master's, and every resolved value, min, max and point pixel is the same. But the switch is inherited by nested objects, whose layers include `defaults.scale` itself through the `scales` to `scale` fallback: the keys of `scale.options.ticks` grow from 19 to 29 (`grid`, `ticks`, `title` and the other scale-level names appear in it), `scale.options.ticks.ticks` lists keys, and `JSON.stringify(scale.options)` throws a `RangeError` where master returns 849 characters. Not taken.

Item 5 holds for the entry itself. A nested object the chart did not set (`scale.options.ticks` when the chart gave no `ticks`) lists the defaults' keys as on master, because its first layer is the derived one; one the chart set lists the chart's keys only (1 instead of 19 in the prototype).
- *Wait for 5.0*: the fix is the top request of both issues, and no documented use reads the stored copies.

The refactor that separates "what the chart gave" from "what is derived" is a piece of its own (P8) with specs that pin today's resolved options, so the behaviour piece (P9) only moves the derived part into a scope.

### D8. The dataset binding decides the axis before the id's first letter

Order: exact id, `axis`, a `position` the chart gave, the first dataset that names the id (`xAxisID`, `yAxisID` or `rAxisID`), the first letter when the scale's type allows it, `r` when the scale's type is radial. An id that nothing decides throws the documented message also without a `type`.

The scale's type limits the first letter, because a scale of the wrong kind does not work on the axis (Context): a first letter `r` counts only when the chart gave the scale no `type` or a radial one, and a first letter `x` or `y` only when it gave none or one that is not radial. An unbound `ramazan: {type: 'linear'}` is then decided by nothing and throws the documented message, where today it is a scale laid over the plot; `xFoo: {type: 'radialLinear'}` is the radial axis. The type never overrules `axis`, `position`, a binding or an exact id.

One helper answers whether a scale is radial, `_isRadialScale(scale)` in `src/helpers/helpers.core.ts`, not documented: true when the object has a `getPointPositionForValue` method. It takes a scale or the prototype of a scale class, so a radial scale written from scratch counts and nothing has to extend `RadialLinearScale`. It is the test the filler plugin makes inline in two places today; those use the helper too. The axis decision looks the class up in the registry by the type's name. A type that is not registered when the axis is decided limits nothing, and the first letter decides as today: the axis is decided when the chart is constructed, the class is first needed at the first update, and a chart on a canvas outside the document is not updated until it is attached, so a scale type may be registered in between.

- *Test for `RadialLinearScale` in the class's ancestors*: a radial scale that does not extend it would count as cartesian.
- *Test all three methods the controllers call*: stricter, but a custom scale made for the radar chart alone would count as cartesian, and a missing method already fails with a clear error in the controller that calls it.
- *Let the type's defaults declare an axis* (the first draft's last step): no built-in type declares one and nothing asked for it.

An axis that came from the id's first letter is provisional: it is decided again at every update until a dataset names the id. Otherwise the usual order of work, create the chart with its scales, load the data, update, would still give `ramazan` the axis `r`, because no dataset names it when the axis is first decided. Every other axis stays as decided, as today: rebinding a dataset on an existing scale does not turn the scale, and a scale whose dataset is removed stays where it was.

Deciding again is a piece of its own (P16) after the scale defaults are a scope (P9), because two things in the stored entry would otherwise survive the first decision:

- The position core wrote. With `scales: {xFoo: {}}` created first, the stored `position: 'bottom'` reads as the chart's own at the next update and decides `x` before a later `yAxisID: 'xFoo'` is looked at. With `ramazan`, `position: 'chartArea'` survives the turn to `y`, because the controller replaces a position only when it is horizontal and the axis is not, or the reverse; simulated on master, the chart area starts at 6 px where the same chart bound at creation gives 38 px. So a position the chart did not give does not decide the axis, and is dropped when a provisional axis is decided again. `Config` knows which it is from its per-entry record: whether the chart gave a position when the entry was first read, and the default of the axis decided then.
- The defaults of the first axis. Until P9 the entry also holds the copied defaults of the axis first decided (`type: 'category'`, `offset` for an id that starts with `x` on a line chart), and `mergeIf` never replaces them. After P9 they are not stored.

Until P16, a scale that is bound after the chart was created keeps its first-letter axis, as today.

The dataset that binds such a scale draws nothing today (`ramazan` as `yAxisID`: axis `r`; `yFoo` as `xAxisID`: axis `y`; points at `null`). The docs promise the first character for ids that start with `x` or `y`; they promise nothing for `r`.

One working output changes. A dataset without `yAxisID` takes the first scale of its axis in the order of `options.scales`. With `scales: {ramazan: {}, y: {}}`, a dataset bound to `ramazan` and a second dataset without `yAxisID`, the second is on `y` today and moves to `ramazan` once that is a y axis. The chart was already wrong (the first dataset was not drawn); the release note says to give the second dataset `yAxisID: 'y'`.

- *Binding first only for `r`*: leaves `yFoo` bound as `xAxisID` broken.

### D9. Readers pass the chart's font as the fallback; routed fonts get it through the derived scope

The chart font is one complete font per chart per update: `chart.options.font` as it resolves when the chart is updated (the chart's `options.font` over the chart type's over `Chart.defaults.font`), kept on the chart as a plain object. `chart.options.font` is already complete, for an object and for a function alike; what the copy adds is that it does not move between updates, so a text is drawn with the font it was laid out with. Every reader without a routed default passes it as the fallback, `toFont(theirOption, chartFont)`; that includes the three places that read `chart.options.font` today for an axis title's height, and `getTickBackdropHeight` in the radial scale, which reads `defaults.font.size` directly for the tick limit and padding. `toFont` does not change.

The tooltip's three fonts are routed to `Chart.defaults.font` by a getter that returns a complete object, so a fallback never applies, and the getter has to stay (callbacks, `boxWidth`, the external tooltip sample read it). `Defaults` records the routes it creates, each with a way to read the route's local value (what the plugin's defaults or the user set for it, such as `{weight: 'bold'}` for the tooltip title or a global `Chart.defaults.plugins.tooltip.bodyFont = {size: 20}`), which today is only reachable under a private name. When the chart sets a root `font`, `Config` builds a second derived object: for every route that targets the root `font`, the route's local value over the chart font. It is a scope of plugin options only, after the chart type's overrides and before the defaults, so a font set for that text in the chart, in the chart type's overrides or globally still wins, and datasets and elements never see it. `plugin.tooltip.js` is not edited.

- *Read the registered plugins' `defaultRoutes` instead of a record in `Defaults`*: it gives the three tooltip routes without a new record, but not the value a user set globally for a routed option, and not a route made by calling `defaults.route` directly.

- *`additionalOptionScopes: ['']` on the plugins* (suggested in #10375): every plugin option would fall through to the root, so `tooltip.animation` would inherit the chart's `onComplete`.

One piece carries all of it, so no release has the tooltip on the chart's font and the ticks off it.

Follow-on effects, accepted: the tooltip's colour boxes follow the body size; an axis title is drawn at the size its space was reserved for; radial point labels keep size 10, also in the polar area and radar charts of #11285. After `Chart.defaults.font` changes, title and legend no longer change size on a redraw or a resize without an update; today a resize fits them again with the new font while the ticks keep the old one. A function as root `options.font` (the types do not allow one) is called once per update with the chart's context and its result is the chart font for every reader; today it is called for the axis title's height only. Texts drawn by third-party plugins follow the chart font only when the plugin passes it, so the same line is documented for them: `toFont(opts.font, chart.options.font)`. That reads the live options, not the copy, so such a text can follow a changed `Chart.defaults.font` one resize earlier than core's texts.

With rework-legend: its P19 renames the legend plugin's file and its P9 resolves the legend's fonts once, in `fit`. Whichever lands first, the contract is that the legend resolves its fonts with the chart font as the fallback; P11 edits the five calls of today or the one place after P9.

### D10. Defaults paths throw

#12268 checks every segment of a path against three names and throws `Invalid defaults scope: <path>`. The names are symptoms: the walk leaves the defaults through any property a node inherits (`toString`, `valueOf`, and at the root the methods of `Defaults` itself, such as `set`). So the rule is about the walk: a segment has to name an own property of the node it is read from, or a new one, and a segment that names an inherited property throws the same error. The three names stay rejected everywhere, also on nodes without a prototype, for one rule. No registered id and no documented path names an inherited property. The check is extended to the name `route` defines (`route('', '__proto__', '', 'color')` creates a permanent own `__proto__` accessor on the defaults), and gets the specs it waits on. Ignoring silently, as `merge()` does for keys, would make `get()` return a detached object. `route` checks the target name the same way: a target that names an inherited property would hand it out on every read (Context). The values given to `set`, `describe` and `override` follow the rule of the walk: a key that the object being written to inherits and does not own is skipped, as `merge()` already skips the three names, so `Chart.defaults.set({describe: {…}})` cannot replace a method of the defaults. Skipped and not thrown, because one call often sets many keys and `merge()` is silent for the three names today. `override('__proto__', …)` and `describe('constructor.x', …)` do no harm today, because those objects have no prototype; they throw too, for one rule.

### D11. Contributors' pull requests are pieces

#12268, #12388, #11105 and #12334 are built by rebasing and changing the author's branch, not by a second pull request. When an author does not answer, the piece is rebuilt with `Co-authored-by`.

### D12. Releases

- Patch: P1, P2, P6, P14.
- Minor, each with a release-note line: P4, P5, P7, P9, P11, P12, P16.
- No release effect: P3 (nothing in core reaches it before P4), P8, P10 (refactors), P13, P15 (docs).

### D13. What the design review changed

- The second-argument rule is "the options as they were before the call", not a filter by the prefix's name (D2): the two wordings of the first draft disagreed for a prefix list such as `['pointHover', 'point', '']`.
- A first-letter axis is provisional (D8): a chart created before its data would have kept the axis `r`. `rAxisID` counts as a binding. The moved unbound dataset is named.
- The raw stored scale options losing their nested objects is named as a regression (D7, item 6), and what a stored entry is (a clone, kept across updates) is stated. The implied record is per entry object.
- The explicit `undefined` case became an open question of its own.
- The route record carries the route's local value, and routed fonts get a derived scope of their own, for plugin options only (D9): the four-field record could not give "the route's own default", and one shared position would have let the chart font beat a font set for the tooltip in the chart type's overrides or globally.
- One chart font per update, used by every reader (D9). The radial scale's direct read of `defaults.font.size` and the resize path are named.
- A function layer is called only with a context and only for scriptable keys (D5).
- P3 releases nothing. P7, P9 and P11 list the open pull requests that hold their files. P15 also completes #11176.

### D14. The maintainer's decisions (25 November 2026)

1. **Stored scale options (P9):** in a minor release with a release note. The keys of a scale's options list what the chart set, and nested objects the chart did not set are absent from the raw stored config.
2. **Type defaults of a scale (P9):** decided again at every update.
3. **An `undefined` scale option (P9):** counts as not set.
4. **Axis order (P7):** the dataset binding comes before the first letter for every id, in a minor release, with the release note about a dataset without an axis id.
5. **Root font (P11):** applies in a minor release with a release note.
6. **#10381 (P14):** the docs piece is built; the issue stays open for 5.0, where only `point*` options would reach points.
7. **#11786 (P15):** the current rule is documented and the issue closed; a single rule is an idea for 5.0.
8. **Block rule (P5):** a function in a block reads the un-hovered options, also for options other than its own.
9. **Merge rule (P12):** the full rule, in a minor release with a release note.

Before the design: one design for the option fixes that need no major version, and both hover shapes supported in core.

### D15. What the second review changed (26 November 2026)

The design was reviewed again from the same five angles after it was approved, before any piece was built. Each point was checked on master at 3164f57a.

- **A position core wrote defeated the provisional axis (D8).** Deciding a first-letter axis again moved out of P7 into a new piece, P16, after P9, with the rule that a position the chart did not give neither decides the axis nor survives a new decision. P7 keeps the order, `rAxisID`, the type rule and the error message, and still completes #11640, whose chart binds the scale when it is created.
- **The scale's type limits the first letter (D8)**, decided by the maintainer on 26 November: a cartesian type does not work on the radial axis, nor the reverse. One helper tests for a radial scale by the method the filler plugin already tests for, so nothing has to extend the built-in radial scale. The last step of the order, an `axis` declared by the type's defaults, is replaced by "`r` when the type is radial".
- **Defaults paths (D10):** the three rejected names left the cause, a walk that follows inherited properties. The walk now stays on own properties.
- **Chart font (D9):** the reason given for a font computed apart from `chart.options.font`, that a function would reach readers incomplete, was false. The copy stays for the reason that holds, one font between updates, and is taken from `chart.options.font`, so a function as root font is honoured and not ignored.
- **Function layers (D5):** "plugin options are not scriptable" was wrong for title, subtitle, legend and tooltip. The rule did not change, the sentence did.
- **Smaller:** `determineAxis` has three calls, not one; #11814 is described as what it asks; #11176's two possible causes are named; P11's specs include a radar scale under another id; P14's sentence also covers a set `pointBorderWidth`.
- **Checked and unchanged:** a line `segment` function that reads a sibling through its second argument gets the segment's context on master, so P3 stays unreachable from core and releases nothing. P12 stays as decided (D14, 9), though it closes no issue and is still not prototyped. P8 and P9 stay two pieces.

### D16. What an independent second design changed (26 November 2026)

The work was designed a second time from the same ask and the same decisions, by designers who had not seen this design, and the two were compared. Each difference was checked on master at 44a24308. The causes and the shape agreed; these points changed here, the first by the maintainer's decision:

- **A block is applied by its key (D4, P5)**, `opts.override('hover')`. By value it took in the chart's `options.hover` for a plugin with the root scope, also inside the plugin's own option objects, which the risk listed before did not cover.
- **Defaults (D10, P1):** the values given to `set`, `describe` and `override` skip keys the target inherits, and `route` checks its target name.
- **An item of an options array (D2, P3)** gets its own options as a scriptable's second argument. No element option is an array of objects, so P3 still releases nothing.
- **Chart font (P11):** the spec for a font set globally for the tooltip sets the whole object. A write into a routed font is lost on master and stays lost.
- **Scale option keys (D7):** keeping them complete with `_allKeys` was prototyped and not taken.
- **Not taken, by the maintainer's decision:** a piece that removes the empty scale of an axis another scale serves (Non-Goals).
- **Not taken, decided before (D14):** one rule for the type defaults of a scale (#11786 stays documented); #12334 as it is.
- **Checked and unchanged:** the second design held that a stale second argument after `setContext` is reachable through a line's `segment` options. On master a `segment` function reading a sibling gets the segment's context (border widths 1 and 2 for the first two segments), as the second review found. Its font design, a `font` default on every text resolved through the option layers with the tooltip's routes replaced by a fallback, needs no route record and no `toFont` edits, but `Chart.defaults.plugins.tooltip.bodyFont.size` would read `undefined` instead of 12, a function as the root font would be ignored, and every tick would resolve its font through the options (24 ms to 30 ms for 3000 ticks on a stub canvas). D9 stays.

### D17. What building P10 changed

- **No module-level record of routes (D9, P10):** `route` tags its getter with the route, and `getRoutes(scope)` finds the tagged getters on the live scope object. A record kept beside `overrides` would keep the routes of a plugin that was unregistered, and hold them twice after it is registered again; a scope that was removed or replaced has no routes here.

## Risks / Trade-offs

- [P9 changes what `Object.keys()` and `JSON.stringify` of a scale's options return] → release note; reads by name and writes are unchanged. `test/specs/core.controller.tests.js:458-499` compares scale options with `toEqual` and may need edits (not run).
- [P9 and P11 were prototyped by patching the bundle in memory; the suites and the image fixtures were not run on them] → P8's guard specs pin the resolved options first; the builder runs the fixtures before P9 turns ready.
- [P12 is not prototyped] → it is the last behaviour piece and can be dropped without touching the others; the hover block then keeps one documented limit.
- [P11 makes one-line edits in files many open pull requests and two open designs hold] → it is small where it overlaps; whoever lands later rebases one line.
- [The fall-through of unset scale options costs two or three more scopes per option, once per update, while a deep clone per scale per update goes away] → measured in P9 with time and allocation, before and after.
- [A plugin that has the root scope and reads `opts.hover` itself still gets the chart's interaction options mixed in, as on master] → the docs piece tells plugin authors to apply a block by its key and not to read it.
- [`test/specs/helpers.config.tests.js` is converted to Vitest by migrate-tests-to-vitest 9.3] → that task runs after P2 to P5, or those pieces rebase onto the converted file.

## Pieces

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | #12268 with changes: defaults paths stay on own properties and reject `__proto__`, `prototype`, `constructor`; `route` also checks the name it defines and its target name; values skip keys the target inherits | `src/core/core.defaults.js`, `test/specs/core.defaults.spec.js` | `set('plugins.__proto__', {p: 1})` throws and `({}).p` is undefined (master: 1); the same for `get`, `describe`, `override`, `route` and a route name; `set('toString.x', {p: 1})` and `set('set.x', {p: 1})` throw and `Object.prototype.toString.x` is undefined (master: `{p: 1}`); `route('rt', 'x', '', '__proto__')` throws (master: `rt.x` is the prototype of the defaults); after `set({describe: {a: 1}, color: 'red'})` `describe` is a function and `color` is `'red'` (master: `describe` is the object); `set('myconstructor.a', …)` works | ~110 | the author's changes; #12499 (holds the spec file) | | #12265 |
| P2 | #12388 as is: an options array is not a scope of its items | `src/helpers/helpers.config.ts`, `test/specs/helpers.config.tests.js` | its own spec (fails on master: `opts.array[0][1]` is `{a: 2}`) | ~20 | | | #11438 |
| P3 | refactor (not reachable from core until P4): a scriptable's second argument follows a new context and a plain override, and is the item's options inside an options array | `src/helpers/helpers.config.ts`, `test/specs/helpers.config.tests.js` | `a: (ctx, opts) => ctx.n + ':' + opts.b` after `setContext({n: 2})` gives `2:2` (master `2:1`); a scriptable under `override({type: 'label'})` on options with a second proxy reads `'label'`; `b: (ctx, opts) => Array.isArray(opts)` in an item of an options array gives `false` (master `true`) | ~55 | P2 (same file) | | |
| P4 | #11105 with changes: stored prefixes inherited at all three sites; `setContext(ctx, prefixes?)`; no prefix argument on `override` | `src/helpers/helpers.config.ts`, `src/helpers/helpers.config.types.ts`, `test/specs/helpers.config.tests.js` | static, function-returned and array sub-objects resolve `hoverTest` (master: 1); `hoverColor: (ctx, opts) => opts.color + '+dark'` gives `'red+dark'` at the root and one level down (the PR head throws); after `setContext(ctx, ['point', ''])` and then `['pointHover', 'point', '']`, a scriptable's second argument still reads `pointColor`; `setContext(ctx)` with one argument compiles; an active bar with `borderWidth: () => ({top: 1, hoverTop: 9})` has top 9 | ~110 | P3; the author's changes | | #11104 |
| P5 | a block of options applies by its key with one override | `src/helpers/helpers.config.ts`, `src/helpers/helpers.config.types.ts`, `test/specs/helpers.config.tests.js`, `test/specs/core.plugin.tests.js` (one spec on a chart) | a function in the block that reads its own option gives `'black+dark'` (master throws); the block's functions get a later context (`c7`, master `c5`); annotation's sub-element shape reads `opts.type === 'label'` when hovered; on a chart, a plugin with `additionalOptionScopes: ['']` and `box: {mode: 'own', hover: {…}}` reads `mode === 'own'` from `box.override('hover')`; a block in the chart's options lies over one in the plugin's defaults; a key without a block, `null` and `undefined` give the same options and their keys can be listed (master: `Object.keys(opts.override(undefined))` throws); an object override is unchanged | ~120 | P4 (same lines); #12499 (converts the plugin spec file) | | |
| P6 | #12334 with changes: bar `base` per bar, through `resolveNamedOptions` | `src/controllers/controller.bar.js`, `test/specs/controller.bar.tests.js` | its own specs (master: an array is ignored, a function gives NaN); its spec that a number creates no per-bar context | ~160 | the author's changes; merge order with #12335, #12331, #12263, #12222, #11898 (same two files) | | #11624 |
| P7 | axis order: the binding dataset (`x`, `y` or `r`) before the first letter; the scale's type limits the first letter, through a helper that tests for a radial scale; the documented error without a `type` (no issue asks for that last part; it is three lines in the same function) | `src/core/core.config.js`, `src/helpers/helpers.core.ts`, `src/plugins/plugin.filler/filler.target.js`, `src/plugins/plugin.filler/filler.drawing.js` (one line each), `test/specs/core.config.spec.js` (new), `docs/axes/cartesian/_common.md`, `docs/axes/index.md` | `yAxisID: 'ramazan'` gives axis `y` and finite point pixels (master: `r`, null); `xAxisID: 'yFoo'` gives `x`; a radar scale `foo` bound by `rAxisID` works (master throws); unbound `ramazan: {type: 'linear'}` throws the documented message (master: axis `r`, laid over the plot); unbound `xFoo: {type: 'radialLinear'}` is axis `r` (master: `x`); a scale class written from scratch with `getPointPositionForValue` counts as radial; `foo` unbound throws the documented message (master: TypeError) | ~150 | merge order with #12381 (holds `filler.drawing.js`; one line) | | #11640 |
| P8 | refactor: the scale merge is computed as the stored entry plus a derived object, then merged as today; `Config` records, per stored entry, whether a dataset implied it | `src/core/core.config.js`, `test/specs/core.config.spec.js` | nothing (no behaviour change). Adds guard specs that pin the resolved scale options of the prototype's configurations after create and after update | ~170 | P7 (same function) | #11096, #11910 | |
| P9 | the derived object is a scope of the chart's options and is no longer merged into the stored entry | `src/core/core.config.js`, `test/specs/core.config.spec.js`, `docs/general/options.md`, `docs/developers/updates.md` | grid, border, tick and title colours follow `Chart.defaults.scale.grid.color`, `color`, `borderColor` after `update()` (master: unchanged); a colour the chart set stays; line to bar to line gives offset `false, true, false` (master `false` throughout); the user's scale objects keep their keys | ~190; wide if `test/specs/core.controller.tests.js` needs edits (held by #12218) | P8; #12400 (holds `docs/developers/updates.md`) | | #11096, #11910 |
| P10 | refactor: `Defaults` records the routes it creates, each with its local value | `src/core/core.defaults.js`, `test/specs/core.defaults.spec.js` | nothing (no behaviour change); a spec reads the record for `plugins.tooltip.titleFont` and gets `{weight: 'bold'}` as its local value, and `{size: 20}` after that is set globally | ~50 | P1 (same file) | #10375 | |
| P11 | the chart's font: `chart.options.font` as resolved at the update, one per chart per update; readers pass it as the fallback; routed fonts enter a derived scope of plugin options | `src/core/core.config.js`, `src/core/core.scale.js`, `src/scales/scale.radialLinear.js`, `src/plugins/plugin.title.js`, `src/plugins/plugin.legend.js`, `src/types/index.d.ts` (comment), `docs/general/fonts.md`, `docs/general/options.md`, `test/specs/options.font.spec.js` (new) | with `options.font.size: 30` the font set on the canvas for ticks, scale title, legend, title, subtitle and tooltip is 30 px (master: 12); `tooltip.options.bodyFont.size` is 30, and 20 when `Chart.defaults.plugins.tooltip.bodyFont` is set to `{size: 20}`; a radar's tick limit is that of 30 px labels (master: of 12 px); point labels 10, also on a radar whose scale has another id than `r`; a second chart without `options.font` stays 12 | ~260, wide: one-line edits in files held by rework-ticks (#12492), #12401, #12244, #12237, #12203, #11188 (`core.scale.js`), #12336 (`scale.radialLinear.js`), rework-legend P19 and P9 and the open legend pull requests (`plugin.legend.js`), and 14 pull requests on `index.d.ts` (a comment only) | P9 (the derived scope), P10 (the route record); merge order with the holders named under Size | | #10375, #11285 |
| P12 | object options merge across function layers; a function is never a scope | `src/helpers/helpers.config.ts`, `src/core/core.config.js` (`needContext`), `test/specs/helpers.config.tests.js` | a static `label: {color}` over `label: ctx => ({color, padding: 5})` gives padding 5 (master: the next static layer's); `name` and `length` of an object from `function foo` are undefined (master `'foo'`, 1); a static `hover.label` block over a function-valued `label` keeps the function's other keys; a function under a plugin option that is not scriptable (`generateLabels` beside a static object in a higher layer) is not called | ~130, wide in effect: any scriptable object option given as a function in a lower layer | P5 (same file), P16 (`core.config.js`) | | |
| P13 | docs: hover options for plugin authors (both shapes, the second-argument rule, layer merging) | `docs/developers/plugins.md`, `docs/general/options.md` | nothing (docs) | ~90 | P4, P5, P12 | | |
| P14 | docs: a line or radar dataset's `hover*` options reach its points unless `pointHover*` is set | `docs/charts/line.md`, `docs/charts/radar.md` | nothing (docs) | ~12 | | #10381 | |
| P15 | docs: which type defaults a scale receives; a chart type's defaults exist after its controller is registered | `docs/charts/mixed.md`, `docs/general/options.md` | nothing (docs) | ~30 | P9, P13 (same doc file) | | #11786, #11176 |
| P16 | a first-letter axis is decided again at update until a dataset binds the scale; a position the chart did not give does not decide the axis and does not survive a new decision | `src/core/core.config.js`, `test/specs/core.config.spec.js` | a chart created with `scales: {ramazan: {}}` and no datasets, then a dataset with `yAxisID: 'ramazan'` and an update: axis `y`, position `left`, and the same `chartArea.left` as the chart bound at creation (master: axis `r`, points null); the same for `xFoo` bound later as `yAxisID`, which is then a linear y axis (master: axis `x`); a position the chart gave still decides; rebinding an axis a dataset decided does not turn it | ~80 | P9 (stored entries hold no copied defaults), P11 (same file) | | |

In parallel: P1 → P10; P2 → P3 → P4 → P5; P6; P7 → P8 → P9; P14. Then P11 after P9 and P10, P16 after P11, P12 after P5 and P16, P13 after P12, P15 after P13.

Shared files order the rest: `helpers.config.ts` (P2, P3, P4, P5, P12), `core.config.js` (P7, P8, P9, P11, P16, P12), `core.defaults.js` (P1, P10), `docs/general/options.md` (P9, P11, P13, P15).

## Contracts

- **P3 → P4, P5:** `setContext(ctx)` gives the second proxy the new context; `override(plainObject)` applies the object to the second proxy. P4's rebase must keep both.
- **P4 → P5, P13:** after `setContext(ctx, prefixes)` a scriptable's second argument resolves with the prefixes that were in effect before the call.
- **P4 → P5, P12:** a resolver has `_prefixes: string[]`; every sub-resolver is created with its parent's. `setContext(ctx, prefixes?)` is the only public way to change them.
- **P5 → P13:** a string passed to `override` names a block, read from the layers of that options object only; an object is a plain override.
- **P7 → P8, P9, P16:** `determineAxis` gives the order of D8; the binding lookup reads `xAxisID`, `yAxisID` and `rAxisID`; `_isRadialScale(scaleOrPrototype)` says whether a scale is radial.
- **P8, P9 → P16:** `Config` has a record per stored entry, and a stored entry holds no defaults. P16 adds to the record how the axis was decided, whether the chart gave a position when the entry was first read, and the default position of the axis decided then.
- **P8 → P9:** `Config` holds, per chart, the stored scale entries (user values plus `axis`, `id`, `position`), the per-entry record of which entries are implied (P16 extends it), and a derived object `{scales: {[id]: …}}` rebuilt on every `Config.update()`. It is always a clone: a write through an options proxy never reaches the global defaults.
- **P9 → P11:** `Config` rebuilds its derived objects at every `Config.update()`. The scales one is a scope of the chart's options, after the chart's options and before the chart type's overrides. P11 adds a second one for routed fonts, a scope of plugin options only, after the chart type's overrides and before the defaults.
- **P10 → P11:** `getRoutes(scope)` in `core.defaults.js` reads the live defaults and gives each route of that scope as scope, name, target scope, target name and `local()`. The route is the tagged getter itself; there is no separate record. `local()` returns the stored value, not a copy: build `Object.assign({}, chartFont, local())` and do not write into it. Only whole-object assignment is seen; `Chart.defaults.set('plugins.tooltip', {titleFont: …})` is lost, as on master.
- **P11 ↔ rework-legend:** the legend resolves its fonts with the chart font as the fallback, in whichever file and place it resolves them.
- **What P9 and P11 need from the resolver, true today and kept by P2 to P5 and P12:** a root scope list may contain per-chart synthetic scopes; `set` and `delete` through any sub-resolver land on the first root scope; the `scales` to `scale` fallback stays; `Object.keys()` of a resolver lists the first scope's keys.
- **What 5.0's resolver has to keep:** prefix lists that apply inside nested objects and can be replaced per call; a layer over resolved options, as a plain object or as a block named by its key; the second-argument rule (D2); the merge rule (D5). Not `overridePrefixes`, `_prefixes` or the second proxy.

## Open Questions

None.
