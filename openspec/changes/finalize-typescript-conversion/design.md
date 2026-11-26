## Context

The conversion to TypeScript began with #10595 in 2022 and stopped after the helpers and three elements. On master (f92cce77), `src/` holds 33 TypeScript modules and 57 JavaScript modules (16,282 lines) that are checked with `allowJs`/`checkJs` against their JSDoc. `tsc --noEmit` reports no errors.

**How the published types are assembled.** `pnpm build` runs rollup, then `tsc --emitDeclarationOnly`, which emits a `.d.ts` for every module (JavaScript ones too), then copies the seven hand-written `src/types/*.d.ts` files into `dist/types/`, because tsc does not emit a `.d.ts` that already sits in `src`. The package's `types` is `dist/types.d.ts`, emitted from `src/types.ts`. That file `export *`s the emitted `./index.js`, then re-exports 44 names explicitly from the hand-written `./types/index.js` and `export *`s that too, so the hand-written declaration wins wherever both exist. Measured with the compiler API:

- the root exports 222 names, 173 of them only from the hand-written file;
- `Element`, `ArcElement`, `PointElement`, `Colors`, `_adapters`, `DateAdapter`, `TimeUnit`, `animator`, `_detectPlatform` and the namespaces `controllers`, `elements`, `plugins` and `scales` come from the emitted source;
- `chart.js/helpers` (`helpers/helpers.d.ts` → `dist/helpers/index.js`) is all emitted, including the JavaScript `helpers.segment.js`;
- the hand-written file itself imports `Element`, `ArcElement`, `PointElement`, `TimeUnit`, `EasingFunction` and `ColorsPluginOptions` from the emitted source.

So converting a JavaScript module already changes published 4.x types: for example, `controllers.LineController` is typed from `controller.line.js`'s JSDoc.

**What checks the types today.** `lint-types` builds, runs `test/types/autogen.js` (one declaration per runtime helper), and compiles `test/types/**`. Those 49 files import `src/types.ts`, the source, not the package. They hold 16 `@ts-expect-error`/`expectType` lines, so they mostly check that code compiles. A member that widens to `any` passes them. `test/integration/typescript-node` and `typescript-node-next` compile the package with `typescript: ^4.7.4`, which the lockfile resolves to 4.9.5 (`pnpm-lock.yaml:476-478`). No check compiles the published types on 4.7.

**What a rename does.** Renaming every `.js` to `.ts` gives 1,521 errors. 1,325 of them are TS2339, a property that does not exist, almost all from class fields assigned in the constructor and never declared. Per file: core.scale 254, core.controller 183, core.datasetController 129, plugin.legend 124, plugin.tooltip 116, scale.time 61 and scale.radialLinear 60; the rest have fewer. Imports inside `src` already use `.js` specifiers, which NodeNext, rollup and Vite resolve to `.ts`. rollup passes every file through swc with `syntax: 'typescript'` and `target: 'es2022'` (`rollup.config.js:23-28`). Chunk names and `dist/**/*.d.ts` names do not depend on the extension. Nothing outside `src` imports a JavaScript module by a path that breaks, apart from `test/specs/vitest.setup.spec.js:3-6`, which imports the barrels by their `.js` specifier and keeps working.

**Fields.** swc at es2022 emits a class field declared without an initialiser as an own property set to `undefined`. A plain field on a subclass therefore wipes out a value that the base constructor set through a hook. This was checked with swc on `class A { constructor() { this.init(); } }` and `class B extends A { x: number; declare y: number; init() { this.x = 5; this.y = 6; } }`, where `new B()` prints `{"y":6}`. `DatasetController` calls `initialize()` from its constructor, and the line, bubble and bar controllers set `enableOptionSharing`/`supportsDecimation` there. `vitest.config.js:20-26` already compiles with `useDefineForClassFields` to match this.

**The five flags** on today's tree: noImplicitOverride 129, noUnusedParameters 49, noImplicitReturns 19, noUnusedLocals 6 and noFallthroughCasesInSwitch 2. On the existing TypeScript modules alone they give 15 errors. `test/types` under the flags gives 80 more: 79 deliberately unused `const chart = …` and one missing `override` in `test/types/extensions/scale.ts:11`, which #12327 holds.

**Compilers.** The repository uses TypeScript 4.9.5. TS 6.0.3, installed for the docs, rejects today's `tsconfig.json` with TS5110, TS5102 and TS5101. Consumers are supported on `^4.7.4`. Declarations that TS 4.9 emits drop `override`, so 4.7 can read them.

**Deep imports exist.** Out of 100 code-search results for `"chart.js/dist/types"`: 45 import `chart.js/dist/types`, 18 import `dist/types/utils` (`DeepPartial` is not exported from the root), 4 import `dist/types/basic`, 3 `dist/plugins/plugin.tooltip`, 3 `dist/helpers/helpers.core` and 1 `dist/types/index`. Issue #11947 imports `TRBL` from `dist/types/geometric`. These resolve only under `moduleResolution: node`, because `exports` has no `./dist/*`.

**Held files.** 80 pull requests are open, 29 JavaScript modules are in at least one of them, and 14 open pull requests hold `src/types/index.d.ts`. Open designs rework the legend (rework-legend), the options (rework-options) and the ticks (rework-ticks, #12492). rework-legend converts `plugin.legend.js` itself (its P19). A separate plan converts `controller.bar.js` and `element.bar.js`.

## Goals / Non-Goals

**Goals**

- No JavaScript left in `src/`, and `allowJs`/`checkJs` removed.
- The five "uncomment after transition" flags turned on.
- A recorded public type API and a TypeScript 4.7.4 consumer compile, both before the first conversion, so that every later piece shows its effect on the published types.
- On v5, declarations generated from the source for everything with a runtime value, and the hand-written copies deleted.
- Bundles that are byte-identical through the conversion.

**Non-Goals**

- `strict`, `noImplicitAny` and `strictNullChecks` (1,888 errors).
- Upgrading TypeScript. That is a separate config change, which also changes how declarations are emitted.
- Converting `controller.bar.js` and `element.bar.js` (the bar plan) or `plugin.legend.js` (rework-legend P19). This change waits on them where it needs them.
- Converting `test/` or `docs/` to TypeScript.
- Deciding the TypeScript floor for v5. That is decided when v5 opens.
- Changing published 4.x types beyond added members.

## Decisions

1. **The guard comes first.** Converting a module changes what is published under the namespaces and the helpers, and today's checks pass when a member widens to `any`. Measured: the emitted `Chart` has 59 of its 90 members typed with `any`, while the hand-written one has 0 of 48. P1 records API Extractor reports for `chart.js` and `chart.js/helpers` under `etc/` and fails `lint-types` when the build differs from them. P2 compiles the packed package on TypeScript 4.7.4 with `skipLibCheck: false`.
   - *A compile of `test/types` alone* is blind to widening.
   - *A text diff of the `.d.ts` files* (rollup-plugin-dts) shows P6's comment-only change as 437 changed lines.
   - *`expect-type` assertions* are precise, but writing them for 3,940 lines is infeasible. They are kept for targeted regressions.
   - *A home-made compiler-API fingerprint* was tried. It reported union aliases whose emitted text was identical as different.
   - API Extractor bundles its own TypeScript, so it does not prove 4.7 compatibility. P2 does that.
2. **Every converted instance field is `declare`.** The field is declared with the type `index.d.ts` gives it, or the JSDoc type, or `any`. The constructor's assignments stay exactly as they are. No initialisers and no plain fields, because of the swc finding in Context. Statics stay as they are, adding `override` where they redeclare a base static.
   - *Plain fields with `useDefineForClassFields: false`* would drop the emitted fields, but swc and Vitest's oxc follow their own target, not tsconfig, so tsc would model something other than what ships.
3. **`useDefineForClassFields: true` in `tsconfig.json`** (P3), so that tsc models fields the way swc emits them, and TS2612 reports a redeclared base field that lacks `declare`. It adds 0 errors today.
4. **The conversion recipe** is the same in every conversion piece, and the bar plan follows it too:
   - `X.js` is renamed to `X.ts`, and import specifiers keep `.js`.
   - Public types are imported with `import type` from `../types/index.js`, never from `../types.js` (a cycle with the entry). Another library class is referenced as the source class (`import type Chart from './core.controller.js'`).
   - Every JSDoc `{type}` becomes an annotation. A `@typedef` that a JavaScript module still imports becomes `export type`. Without this, a `.ts` module treats JSDoc types as `any`, and the namespace and helper types widen.
   - Method signatures follow `index.d.ts`. A parameter that callers omit becomes optional.
   - No TypeScript-only runtime syntax: no enums, parameter properties, namespaces, decorators, `accessor` or `#private`.
   - `override` goes on every overriding method and static, and never on a `declare` field (TS1243).
   - Unused parameters get a `_` prefix. The hand-written declarations keep the documented names.
   - An implicit return becomes `return undefined;` or `return;`. These, and restructured fallthroughs, are the only changes the bundle sees.
   - `@ts-ignore` becomes `@ts-expect-error <reason>`, or goes away.
   - A converted base must leave its JavaScript importers and subclasses compiling. The fix goes in the converted module. If it cannot be done without editing a held file, the piece waits for the holder.
5. **The source classes take the public generic parameters, with the same defaults.** These are `Chart<TType, TData, TLabel>`, `DatasetController<TType, TElement, TDatasetElement, TParsedData>` and `Scale<O extends CoreScaleOptions>`, so that a generated declaration can later stand in for the hand-written one. A declaration a class cannot express (`interface Scale<O> extends Element<unknown, O>, LayoutItem`, the `Defaults` interface, the `Defaults.set` overload) becomes a merged interface or overload signatures next to the class.
6. **No visibility keywords during the conversion**, matching the existing TypeScript modules. Several members that `index.d.ts` marks `protected` or `readonly` are called or written from outside the class (ledger rows L1, L2, L4). A keyword there would not compile. Members that `index.d.ts` does not declare are marked `/** @internal */` rather than `private`, because `private` makes classes nominal, so that two copies of chart.js stop being assignable to each other. JSDoc `@private` emits `private` today in the namespace types, so on 4.x those members become public there: an added member (see Open Questions).
7. **On 4.x, a conversion piece's API-report diff may only add.** Added members, and `any` narrowed to a type, are accepted. A removed or widened member is not. The diff is part of the pull request, and its reviewer reads it.
8. **The transition gate is a script, not a second tsconfig** (P3, `lint-ts-flags`). It runs the root program with `allowJs`, so JavaScript keeps its real types, plus the five flags. It reports diagnostics in `src/**/*.ts` only, against a pending list of held TypeScript modules that may still fail. A pending module that passes fails the gate, so the list only shrinks.
   - *A TS-only tsconfig* cannot exclude imported held modules: tsc reports on every file in the program. It also turns JavaScript imports into `any`, and gives a false TS2305 in `plugin.colors.ts`.
   - P44 replaces the script with the flags in `tsconfig.json`.
9. **A "no `src/**/*.js`" check stays after `allowJs` goes.** With `allowJs` off and `noImplicitAny` off, a stray `.js` import becomes a silent `any`, not an error.
10. **Lint parity.** The TypeScript override in `.eslintrc.yml` turns `no-use-before-define` and `no-empty-function` stricter than for JavaScript, which causes 86 errors across the files. P4 gives TypeScript the JavaScript settings (`{functions: false}`, `no-empty-function: off`), rather than reordering 75 functions in the conversion pieces. The open designs that replace ESLint (#12494, #12486, #12488) carry the rule over.
11. **The hand-kept declarations become `.ts` modules at the same paths** (P6). tsc then emits `dist/types/*.d.ts` itself, and `copyDeclarations` goes away. In memory, this takes 14 `import type` fixes (TS1371 under `importsNotUsedAsValues: error`). The root still exports 222 names, and the emitted `index.d.ts` loses only non-JSDoc comments (3,940 → 3,503 lines).
    - *Keeping `.d.ts`* would need the copy step for as long as anything is hand-kept, and leaves the types on a separate path from the source.
12. **What stays hand-kept after v5**, in `src/types/*.ts`:
    - the registries and augmentation targets (`ChartTypeRegistry`, the scale type registries, `PluginOptionsByType`, `ElementOptionsByType`, `ChartDatasetProperties`) and every options, context and config interface. They have no runtime value, and plugins merge into them, which needs `interface`.
    - `const enum DecimationAlgorithm`;
    - type-only helpers (`DeepPartial`, `AnyObject`, `TRBL`, …);
    - the interface types that plugin objects are annotated with (`Plugin`, `Tooltip`).
    Augmenting `PluginOptionsByType` and `ChartTypeRegistry` through the package root was checked in memory on the per-module layout: only the intended bad line errored.
13. **The per-module layout stays; no bundled `.d.ts`.** A bundled file would break the deep imports counted in Context.
14. **The switch to generated declarations is v5 work, group by group** (P46–P56). Each piece:
    - replaces one group's `declare class`/`declare const` in `src/types/index.ts` with re-exports from the source;
    - drops those names from `src/types.ts`;
    - regenerates the report.
    Its report diff must map line by line to accepted rows of the mismatch ledger. The `export declare const X: ChartComponent & {prototype: X; new(...)}` shapes (29 of them) and the `type LineController = DatasetController` aliases disappear, because the class itself satisfies `ChartComponent` through `static id` and `defaults`.
15. **Mismatches are settled in a ledger** (below), one row per symbol. Each row gets one decision:
    - **(a)** the source matches the published type;
    - **(b)** the published type is wrong about the runtime, which becomes a `fix(types)!` piece on v5 with a migration-guide line;
    - **(c)** the type cannot be expressed on the class, which becomes a merged interface in the source module.
    On 4.x the published type is the contract, and the source annotates to match it wherever it can.
16. **`stripInternal: true` waits for v5** (P45). On 4.x it would remove members from `Element`, `ArcElement` and `PointElement`, which are published from source.
17. **`src/types.ts` stays until P57.** It is where the emitted and the hand-kept declarations meet. 46 `test/types` files and `plugin.colors.ts:2` import it.
18. **Large modules are split when the first draft exceeds 400 edited lines.** This covers core.datasetController, core.controller, core.scale and plugin.tooltip. The first piece renames the module, with `declare` fields typed from JSDoc or `any` and the minimum fixes; the second types the signatures to the public file. Both pieces are listed under the same number, as `a` and `b`.
19. **TypeScript stays at 4.9.5.** Everything the recipe uses exists there: `declare` fields, `override`, `import type` and `satisfies`.
20. **`test/types` keeps `noUnusedLocals`, `noUnusedParameters` and `noImplicitOverride` off** in its own tsconfig. The type tests stand in for consumers, and the flags are this repository's choice, not theirs.

## Risks / Trade-offs

- **Long tail.** 33 of the conversion pieces wait on open pull requests or designs. The conversion finishes only when the legend, options and ticks reworks, the bar plan and the stale pull requests are settled. → Free modules go first, and the gate and the report keep master consistent at every step.
- **Contributors rebase onto `.ts`.** A rename forces every open pull request on that file to rebase. Git's rename detection carries most edits over, but not all. → Held files wait for their holder (the user's choice: free files first).
- **API Extractor and the `export *` ambiguity in `src/types.ts`** have not been tried; API Extractor is not installed yet. → P1's first step runs it on master. If it cannot analyse the entry, P1 falls back to rollup-plugin-dts with a normalised diff, and says so in its pull request.
- **TypeScript 4.7.4 may already fail on master.** P2 is then the first proof. Its pull request reports the failures, and fixing them becomes its own piece.
- **Additions on 4.x.** The namespace types gain members, for example former JSDoc `@private` members, which become public there. Someone may start to depend on them. → `/** @internal */` marks them, and v5 strips them (P45).
- **A wrong `declare` type is invisible at runtime.** The bundle does not change, so tests cannot catch it. → The report diff in every piece, and the ledger.

## Pieces

Build order. "Gate" means `pnpm lint-ts-flags` and `pnpm build`. "Report" means `pnpm lint-api` (P1). "Bundle identity" means that `dist/*.js`, `dist/chunks/*`, `helpers/*.js` and the UMD bundles are byte-identical to master's build, apart from recipe rule 9 (explicit returns and fallthroughs); source maps may differ. Every conversion piece (P7–P42) waits on P1 and P3, and its check is the gate, bundle identity and a report diff that only adds. No issue is open for this work, so the Advances and Completes columns are empty. Commit types: `test:`/`build:`/`refactor:` release nothing; `refactor(types)!:` and `fix(types)!:` are v5.

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | `test: record the public type API of chart.js and chart.js/helpers` | `package.json` (devDependency, `lint-api`, called by `lint-types`), `api-extractor.json`, `api-extractor.helpers.json`, `etc/*.api.md` (generated), `pnpm-lock.yaml` | changing `readonly id: string` to `number` at `index.d.ts:535`, or a helper's return to `any`, passes `pnpm lint-types` on master and fails with P1 | ~70 | | | |
| P2 | `test: compile the published types with TypeScript 4.7.4` | `test/integration/typescript-floor/{package.json,tsconfig.json,src/index.ts}` (imports of root, auto and helpers, and a `PluginOptionsByType` augmentation), `pnpm-lock.yaml` | no compile runs on 4.7 today; an `accessor` field (TypeScript 4.9 syntax) in a published declaration passes master and fails P2 | ~60 | | | |
| P3 | `build: check the TypeScript sources with the transition flags` | `scripts/check-ts-flags.js` (new), `package.json` (`lint-ts-flags`), `tsconfig.json` (`useDefineForClassFields`), `element.point.ts` (2 `static override`), `helpers.interpolation.ts` (`_mode` ×2), `helpers.rtl.ts` (`_w`); pending list: `element.arc.ts`, `helpers.math.ts`, `helpers.config.ts`, `helpers.canvas.ts`, `helpers.core.ts` | removing `override` from `element.point.ts` passes `pnpm lint` on master and fails with P3 | ~80 | | | |
| P4 | `build: lint TypeScript sources with the JavaScript rules for function order and empty functions` | `.eslintrc.yml` | `eslint --stdin --stdin-filename src/core/core.interaction.ts < src/core/core.interaction.js` reports `no-use-before-define` (86 such errors over the 55 files) | ~4 | #12506 (`.eslintrc.yml`) | | |
| P5 | `refactor: no switch fallthrough or implicit return in the canvas and core helpers` | `helpers.canvas.ts` (drawPoint), `helpers.core.ts:107`; both leave the pending list | the gate fails for a pending module that has become clean | ~30 | P3; rework-legend P6 (other lines of `helpers.core.ts`, merge order only) | | |
| P6 | `refactor(types): make the hand-kept declarations TypeScript modules` | `src/types/*.d.ts` → `.ts` (14 `import type` fixes), `package.json` (drop `copyDeclarations`), `tsconfig.json` and `docs/.vitepress/typedoc.json`, `docs/.vuepress/config.ts` (entry `src/types/index.ts`) | the build without the copy step publishes no `dist/types/utils.d.ts` until the modules are `.ts`; the report is unchanged and P2 passes | ~45 | P1, P2; the 14 PRs on `index.d.ts`: #12386, #12342, #12327, #12317, #12313, #12311, #12255, #12250, #12243, #12242, #12221, #11898, #11825, #11188; #12386 and #11825 hold `docs/.vuepress/config.ts` | | |
| P7 | `refactor: convert the barrel modules and the defaults modules to TypeScript` | `controllers/index`, `elements/index`, `plugins/index`, `platform/index`, `core.layouts.defaults`, `core.animations.defaults`, `plugin.subtitle`; the source link in `docs/configuration/animations.md:130` | gate, bundle identity, report; `vitest.setup.spec.js` still loads the barrels | ~20 | P1, P3 | | |
| P8 | `refactor: convert BasePlatform to TypeScript` | `platform.base` (`export type Chart`, which `plugin.tooltip.js:11` uses) | gate (TS2694 in `plugin.tooltip.js` without the type export), bundle identity, report | ~50 | P1, P3 | | |
| P9 | `refactor: convert the registries and the plugin service to TypeScript` | `core.typedRegistry`, `core.registry`, `core.plugins` (export `filterCallback`) | gate (59 errors on a plain rename), bundle identity, report | ~150 | P1, P3, P4 | | |
| P10 | `refactor: convert Animation to TypeScript` | `core.animation` | gate (45 errors on a plain rename), bundle identity, report | ~45 | P1, P3 | | |
| P11 | `refactor: convert the interaction modes to TypeScript` | `core.interaction` (export `InteractionItem`, `InteractionOptions`) | gate (TS2554 ×3, TS2694 in tooltip), bundle identity, report | ~170 | P1, P3, P4 | | |
| P12 | `refactor: convert the layout service to TypeScript` | `core.layouts` | gate, bundle identity, report | ~50 | P1, P3, P4 | | |
| P13 | `refactor: convert the segment helpers to TypeScript` | `helpers.segment` | gate, bundle identity; the report for `chart.js/helpers` only adds | ~80 | P1, P3 | | |
| P14 | `refactor: convert LineElement to TypeScript` | `element.line`, fixups in `helpers.segment.ts` | gate (32 own errors, 4 in the segment helpers), bundle identity, report | ~130 | P13 | | |
| P15 | `refactor: convert the filler options, targets and entry to TypeScript` | `filler.options`, `filler.target`, `plugin.filler/index`, `simpleArc`; the link in `docs/charts/area.md:6` | gate (9 errors in `simpleArc`), bundle identity, report | ~60 | P1, P3 | | |
| P16 | `refactor: convert the radar and polar area controllers to TypeScript` | `controller.radar`, `controller.polarArea` | gate (`override` ×11, 5 errors), bundle identity, report | ~45 | P1, P3 | | |
| P17 | `refactor: convert Animations to TypeScript` | `core.animations` | gate, bundle identity, report | ~25 | P1, P3; #11173 | | |
| P18 | `refactor: convert the animator to TypeScript` | `core.animator` (published as `animator`) | gate, bundle identity; report for `animator` only adds | ~45 | P1, P3; #12503, #12158 | | |
| P19 | `refactor: convert the basic and DOM platforms to TypeScript` | `platform.basic`, `platform.dom` | gate, bundle identity, report | ~50 | P8; #12158, #12337 | | |
| P20 | `refactor: convert the doughnut controller to TypeScript` | `controller.doughnut` | gate (15 errors), bundle identity, report | ~70 | P1, P3; #12508, #12243 | | |
| P21 | `refactor: ArcElement statics declare override` | `element.arc.ts`; it leaves the pending list | the gate fails for a pending module that has become clean | ~3 | P3; #12508 | | |
| P22 | `refactor: convert the pie controller to TypeScript` | `controller.pie` (statics typed so that TS2417 does not arise) | gate, bundle identity, report | ~5 | P20 | | |
| P23 | `refactor: convert DatasetController to TypeScript` (a and b by Decision 18) | `core.datasetController` (generics, 20 fields, signatures from the public file) | gate (128 own errors, plus spill into the JavaScript controllers), bundle identity, report | wide (250–450) | P1, P3, P4; rework-legend P18; #12332, #12284, #12241, #12176, #12172; it must leave `controller.bar.js` compiling, and if that needs an edit to bar it waits on the bar plan | | |
| P24 | `refactor: convert the bubble controller to TypeScript` | `controller.bubble` | gate (TS2554 ×4), bundle identity, report | ~35 | P23 | | |
| P25 | `refactor: convert the line and scatter controllers to TypeScript` | `controller.line`, `controller.scatter` | gate, bundle identity, report | ~40 | P23; #12347, #12284, #12176, #12086 | | |
| P26 | `refactor: convert Chart to TypeScript` (a and b by Decision 18) | `core.controller` (31 fields, getters) | gate (184 errors, plus 16 in `helpers.dom.ts` that the fields fix), bundle identity, report | wide (~300) | P9; rework-legend P6, P12, P13, P17; #12218, #12172, #11836 | | |
| P27 | `refactor: convert Defaults to TypeScript` | `core.defaults` (the `Defaults` interface merge and the `set` overloads) | gate (26 errors, plus 8 files), bundle identity, report | ~60 | P1, P3; rework-options P1, P10; #12268 | | |
| P28 | `refactor: convert Config to TypeScript` | `core.config` | gate (18 errors), bundle identity, report | ~70 | P1, P3; rework-options P7–P12 | | |
| P29 | `refactor: no unused parameter in the option resolver` | `helpers.config.ts:179`; it leaves the pending list | the gate fails for a pending module that has become clean | ~2 | P3; rework-options P12; #12388, #11105 | | |
| P30 | `refactor: explicit return in _decimalPlaces` | `helpers.math.ts:112`; it leaves the pending list | the gate fails for a pending module that has become clean | ~2 | P3; #12266 | | |
| P31 | `refactor: convert the ticks, scale defaults and autoskip to TypeScript` | `core.ticks`, `core.scale.defaults`, `core.scale.autoskip` | gate, bundle identity, report | ~50 | P1, P3; rework-ticks; #12386, #12383, #12287, #11188 | | |
| P32 | `refactor: convert Scale to TypeScript` (a and b by Decision 18) | `core.scale` (43 fields, the `Scale`/`LayoutItem` interface merge, 17 indent fixes) | gate (254 errors), bundle identity, report | wide (300–450) | P31; rework-ticks; rework-options P11; #12401, #12244, #12237, #12203, #11188 | | |
| P33 | `refactor: convert the linear scales to TypeScript` | `scale.linearbase`, `scale.linear` | gate, bundle identity, report | ~70 | P32; rework-ticks; #12288, #12225, #12185 | | |
| P34 | `refactor: convert the logarithmic scale to TypeScript` | `scale.logarithmic` | gate (17 errors), bundle identity, report | ~50 | P32; #12390 | | |
| P35 | `refactor: convert the category scale to TypeScript` | `scale.category` | gate, bundle identity, report | ~35 | P32; #12222 | | |
| P36 | `refactor: convert the time scales to TypeScript` | `scale.time`, `scale.timeseries` | gate, bundle identity, report | ~150 | P32; rework-ticks; #12406 | | |
| P37 | `refactor: convert the radial linear scale to TypeScript` | `scale.radialLinear` | gate (30 errors), bundle identity, report | ~90 | P33; rework-ticks; rework-options P11; #12336 | | |
| P38 | `refactor: convert the scales barrel to TypeScript` | `scales/index` | gate, bundle identity, report | ~1 | P1, P3; #12386 | | |
| P39 | `refactor: convert the filler drawing, helper, segment and stack modules to TypeScript` | `filler.drawing`, `filler.helper`, `filler.segment`, `filler.target.stack` | gate, bundle identity, report | ~45 | P15; #12381, #12326 | | |
| P40 | `refactor: convert the decimation plugin to TypeScript` | `plugin.decimation` (8 indent fixes) | gate, bundle identity, report | ~25 | P1, P3; #12341, #12284 | | |
| P41 | `refactor: convert the title plugin to TypeScript` | `plugin.title` | gate (34 errors), bundle identity, report | ~50 | P1, P3; rework-options P11 | | |
| P42 | `refactor: convert the tooltip plugin to TypeScript` (a and b by Decision 18) | `plugin.tooltip` | gate (116 errors), bundle identity, report | wide (~250) | P8, P11; rework-legend P13; #12284, #12275, #12255, #11849 | | |
| P43 | `build: drop allowJs and checkJs` | `tsconfig.json`; the "no `src/**/*.js`" check in the gate script; the `lint-js` glob becomes `src/**/*.ts` | the check fails while any `src/**/*.js` remains | ~15 | P7–P42; rework-legend P19; the bar plan | | |
| P44 | `build: turn on the five transition flags` | `tsconfig.json` (uncomment the flags), the gate script reduced to the `.js` check, `test/types/tsconfig.json` (Decision 20) | `tsc` reports the flags' errors when a module regresses; without P44, only the gate does | ~20 | P43, P5, P21, P29, P30 | | |
| P45 | `build(types)!: strip members marked internal from the declarations` | `tsconfig.json` (`stripInternal`), `/** @internal */` on the members that ledger rows of kind (c) and Decision 6 name | a member tagged `@internal` is in `dist/` without it | ~60 | P44; v5 | | |
| P46 | `refactor(types)!: the platforms' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | the report diff equals the accepted ledger rows L5; `lint-types` and P2 pass | ~80 | P6, P45, P19; #12386; v5 | | |
| P47 | `refactor(types)!: the animation declarations come from the source` | `src/types/animation.ts`, `src/types.ts`, reports | as P46, rows L8 | ~70 | P46, P10, P17, P18; v5 | | |
| P48 | `refactor(types)!: defaults, interaction, layouts, registry and ticks come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46, rows L6, L7 | ~250 | P47, P9, P11, P12, P27, P31; v5 | | |
| P49 | `refactor(types)!: the plugins' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46 | ~200 | P48, P15, P39, P40, P41, P42; rework-legend P19; v5 | | |
| P50 | `refactor(types)!: LineElement comes from the source` | `src/types/index.ts`, reports | as P46, rows L9 | ~80 | P49, P14; v5 | | |
| P51 | `refactor(types)!: BarElement comes from the source` | `src/types/index.ts`, reports | as P46 | ~60 | P50; the bar plan; v5 | | |
| P52 | `refactor(types)!: the scales' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46 | ~250 | P51, P33–P38; v5 | | |
| P53 | `refactor(types)!: Scale comes from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46, rows L10 | ~200 | P52, P32; v5 | | |
| P54 | `refactor(types)!: DatasetController and the controllers come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46, rows L1, L2, L3, L12 | ~250 | P53, P16, P20, P22, P23, P24, P25; v5 | | |
| P55 | `refactor(types)!: BarController comes from the source` | `src/types/index.ts`, reports | as P46 | ~60 | P54; the bar plan; v5 | | |
| P56 | `refactor(types)!: Chart comes from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P46, rows L4, L11 | ~200 | P55, P26; v5 | | |
| P57 | `refactor(types)!: the package's types come from the main module` | `src/index.ts` (`export * from './types/index.js'`, never `export type *`), delete `src/types.ts`, `package.json` (`types`, `exports["."].types` → `dist/index.d.ts`), `auto/auto.d.ts`, the 46 `test/types` imports, `plugin.colors.ts:2`, reports | P2 and `lint-types` pass with the old entry deleted; the report is unchanged apart from accepted rows | ~70 (plus 46 one-line imports) | P56; #12386; migrate-tests-to-vitest pieces that hold `src/index*.ts`; v5 | | |
| P58 | `docs: generate the API reference from the source` | `tsconfig.json`, `docs/.vitepress/typedoc.json`, `docs/.vuepress/config.ts` (entry `src/index.ts`, `excludeInternal`) | the `Chart` page lists `update`, and no member marked internal appears | ~10 | P57; #12386, #11825; v5 | | |
| P59 | `fix(types)!: <symbol> …`, one pull request per ledger row of kind (b) | `src/<module>.ts`, the migration guide, reports | an `expect-type` assertion on the runtime type, for example `chart.id` is `number` | <50 each | its switch piece (P46–P56); v5 | | |

**In parallel.**
- P1–P5 can all start at once. P6 waits only on its holders.
- After P1 and P3, these are free and independent: P7, P8, P9, P10, P11, P12, P13, P15, P16, P38 (after #12386) and P40 (after its PRs).
- Chains:
  - P13 → P14;
  - P8 → P19;
  - P20 → P22;
  - P23 → P24, P25;
  - P31 → P32 → P33–P36 → P37;
  - P15 → P39.
- P46–P56 run in sequence, because they all edit `src/types/index.ts` and `src/types.ts` by hand.

**Ordering from shared files.**
- `tsconfig.json`: P3, P6, P43, P44, P45, P58.
- `package.json`: P1, P3, P6.
- The pending list in the gate script: P3, P5, P21, P29, P30, P43, P44.
- `helpers.segment`: P13, P14.

## Contracts

- **The recipe (Decision 4) and the field rule (Decision 2).** Every conversion piece, and the bar plan, follows them. A reviewer rejects a plain instance field.
- **The report (P1).** `pnpm lint-api` regenerates `etc/chart.js.api.md` and `etc/chart.js-helpers.api.md`, and fails when they differ from the committed ones. A piece that changes the published types commits the regenerated reports. On 4.x the diff may only add (Decision 7). On v5 the diff maps to ledger rows.
- **The gate (P3).** `pnpm lint-ts-flags` exits non-zero for a flag diagnostic in a `src/**/*.ts` module that is not on the pending list, and for a pending module that has no diagnostic. A conversion piece adds no module to the pending list.
- **The floor (P2).** `test/integration/typescript-floor` pins `typescript` to exactly `4.7.4` and sets `skipLibCheck: false`. It runs in `test-ci-integration`.
- **Generics (Decision 5).** Every source class declares the same type parameters and defaults as its public declaration.
- **`src/types/index.ts` (after P6)** is where the hand-kept declarations live. Pieces of rework-legend, rework-options and rework-ticks that edit `index.d.ts` after P6 edit `index.ts` instead.

### Mismatch ledger

The published type is the 4.x contract. The decision column uses Decision 15's kinds. A row marked "(b)?" asks the user (Open Questions).

| Row | Symbol | Published | Runtime | Decision |
|---|---|---|---|---|
| L1 | `DatasetController.getLabelAndValue`, `getMaxOverflow`, `getMinMax`, `getParsed` | `protected` | called from the tooltip, the chart and the scale (`plugin.tooltip.js:130,135,1196`, `core.controller.js:511`, `core.scale.js:313`); `getMaxOverflow` returns `number \| false` in bubble and bar | (a) on 4.x: stay `protected` in the hand-kept file; the source has no keyword. On v5 (b)?: public, which breaks subclasses that override them as `protected` (TS2415) |
| L2 | `DatasetController.index` | `readonly` | written by `updateIndex` (`core.datasetController.js:302`) | (b): drop `readonly` on v5 |
| L3 | `DatasetController` | lacks `getDataElement`, `getContext`, the instance `datasetElementType`/`dataElementType`, 12 underscore fields; `applyStack` has no third `mode` parameter; `resolveDataElementOptions` requires `mode` | as listed; bubble calls `resolveDataElementOptions(i)` | (c): `@internal` on the underscore fields; `getContext` public; `mode` optional |
| L4 | `Chart` | `readonly width`, `height`, `canvas`, `ctx`, `attached`; `id: string`; `data`/`options`/`aspectRatio` as fields; `notifyPlugins` with two parameters | written in `resize`, `destroy`, `bindResponsiveEvents`; `id` is `uid()`, a number (`core.controller.js:144`); accessors; a third parameter `filter` | `id`: (b). `readonly`: (a), kept as `readonly` for consumers via a merged interface. `filter`: (c), `@internal`. Accessors: (a) |
| L5 | `BasePlatform.acquireContext` | `(canvas, options?: CanvasRenderingContext2DSettings)` | second parameter `aspectRatio` (`platform.base.js:16`, `platform.dom.js:267`) | (b)? |
| L6 | `Registry`, `TypedRegistry` | lack `removeControllers` and the other removers, `_each`/`_exec`/`_get`; `isForType` and fields | present | removers: (c), public; underscore: `@internal` |
| L7 | `layouts.configure` / `update` | `fullSize: number`; `update` has three parameters | `fullSize` is a boolean; a fourth `minPadding` parameter (`core.layouts.js:345`) | `fullSize`: (b)?; `minPadding`: `@internal` |
| L8 | `Animation._to`, `Animator` | `readonly _to`; `Animator` declared in `animation.d.ts` | written in `update`; `wait()`, `_notify`; the published `animator` is typed from source | (c) |
| L9 | `LineElement` | an interface plus a const; `path(ctx)` | a class; `path(ctx, start, count)`, `draw(ctx, chartArea, start, count)`; `points`/`segments` are accessors; 10 underscore fields | (c); the optional parameters become public; underscore fields `@internal` |
| L10 | `Scale` | an interface plus a `declare class` with a constructor; about 20 fields | 43 fields; `getPadding`, `_layers`, `_tickSize` used across modules | (c), merged interface; underscore fields `@internal` |
| L11 | `ChartMeta` | `stack: number`; no `_dataset`; `hidden: boolean` | `stack` copies `dataset.stack`, a string; `_dataset` set at `core.controller.js:849`; `hidden` starts as `null` | `stack`: (b)?; `_dataset`: `@internal`; `hidden`: (b)? |
| L12 | Controllers and scales | `type X = DatasetController` (or `Scale<O>`) plus a `ChartComponent` const | classes with different static sides (`PieController.defaults` is not assignable to `DoughnutController.defaults`) | removed by P54/P52 (Decision 14) |

## Open Questions

To be asked in one round before the design is marked ready:

1. **The guard tool** (P1): API Extractor reports plus the 4.7.4 compile (recommended), a normalised dts diff, or the compile suite only.
2. **Additions on 4.x** (Decision 7): may a conversion piece add members to the namespace and helper types on 4.x, including former JSDoc `@private` members (recommended), or must the report stay identical, which needs a `/** @internal */` plus a 4.x strip step that does not exist?
3. **When v5 opens** (P45–P59): master moves to 5.0 after the last 4.x minor (recommended, after 4.7.0, which rework-legend targets), or a long-lived `v5` branch.
4. **Stale holders.** #11188, #11825, #11898, #11173, #11836 and #11849 hold files that P6, P17, P26, P31, P32 and P42 need, and some date from 2023. Triage them first with `/flow:triage` and wait for the rest (recommended), wait for all, or convert and let them rebase.
5. **Ledger rows marked (b)?** L1, L5, L7, L11: correct each on v5 (recommended), or keep the published type for compatibility.
6. **`UpdateModeEnum`** is declared as a runtime enum, but nothing exports it at runtime (`git grep UpdateModeEnum -- src ':!src/types'` finds only the re-export in `src/types.ts`). Export a runtime object on 4.x (additive, recommended), or make it a `const enum` or a union on v5.
7. **`chart.js/dist/types` on v5.** After P57, `dist/types.d.ts` is gone, and under `moduleResolution: node` the path falls through to `dist/types/index.d.ts`, which lacks the source-emitted names. Drop it and say so in the migration guide (recommended), or keep a one-line shim.
