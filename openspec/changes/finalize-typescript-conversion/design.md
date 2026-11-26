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

**Held files.** 80 pull requests are open, 29 JavaScript modules are in at least one of them, and 14 open pull requests hold `src/types/index.d.ts`. Open designs rework the legend (rework-legend), the options (rework-options) and the ticks (rework-ticks, #12492). rework-legend converts `plugin.legend.js` itself (its P18). A separate plan converts `controller.bar.js` and `element.bar.js`.

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
   - *A text diff of the `.d.ts` files* (rollup-plugin-dts) shows P5's comment-only change as 437 changed lines.
   - *`expect-type` assertions* are precise, but writing them for 3,940 lines is infeasible. They are kept for targeted regressions.
   - *A home-made compiler-API fingerprint* was tried. It reported union aliases whose emitted text was identical as different.
   - API Extractor bundles its own TypeScript, so it does not prove 4.7 compatibility. P2 does that.
   - The report covers the two package entries. The deep paths that consumers import (Context) are covered by P2, which imports names from each of them.
   - On v5 the report no longer proves "unchanged". It proves that every change maps to an accepted ledger row (Decision 14), which is the guard the user chose for v5 work.
   - The script is named `api-report`, not `lint-api`: `pnpm lint` runs every `lint-*` script in parallel, before CI's build step, and the report needs the build.
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
8. **The transition gate is a script, not a second tsconfig** (P3, `lint-ts-flags`). It runs the root program with `allowJs`, so JavaScript keeps its real types, plus the five flags. It fails for any diagnostic in `src/**/*.ts`. P3 fixes the 13 diagnostics that the existing TypeScript modules have today, so the gate starts clean. Every module a later piece converts, including the bar plan's and rework-legend P19's, is checked from the moment it is `.ts`.
   - *A TS-only tsconfig* cannot exclude imported held modules: tsc reports on every file in the program. It also turns JavaScript imports into `any`, and gives a false TS2305 in `plugin.colors.ts`.
   - P40 replaces the script with the flags in `tsconfig.json`.
9. **A "no `src/**/*.js`" check stays after `allowJs` goes.** With `allowJs` off and `noImplicitAny` off, a stray `.js` import becomes a silent `any`, not an error.
10. **Lint parity.** Read as TypeScript, the 57 JavaScript modules give 75 `no-use-before-define`, 11 `no-empty-function`, 11 `prefer-const` and unused-argument errors that they do not give as JavaScript; the TypeScript override in `.eslintrc.yml` is stricter. P4 gives TypeScript the JavaScript settings (`{functions: false}`, `no-empty-function` and `prefer-const` off) and ignores arguments that start with `_`, as tsc's `noUnusedParameters` does. The conversion pieces therefore reorder no functions, and turning `let` into `const` cannot break bundle identity. Every conversion piece waits on P4. The open designs that replace ESLint (#12494, #12486, #12488) carry the rule over.
11. **The hand-kept declarations become `.ts` modules at the same paths** (P5). tsc then emits `dist/types/*.d.ts` itself, and `copyDeclarations` goes away. In memory, this takes 14 `import type` fixes (TS1371 under `importsNotUsedAsValues: error`). The root still exports 222 names, and the emitted `index.d.ts` loses only non-JSDoc comments (3,940 → 3,503 lines).
    - *Keeping `.d.ts`* would need the copy step for as long as anything is hand-kept, and leaves the types on a separate path from the source.
12. **What stays hand-kept after v5**, in `src/types/*.ts`:
    - the registries and augmentation targets (`ChartTypeRegistry`, the scale type registries, `PluginOptionsByType`, `ElementOptionsByType`, `ChartDatasetProperties`) and every options, context and config interface. They have no runtime value, and plugins merge into them, which needs `interface`.
    - `const enum DecimationAlgorithm`;
    - type-only helpers (`DeepPartial`, `AnyObject`, `TRBL`, …);
    - the interface types that plugin objects are annotated with (`Plugin`, `Tooltip`).
    Augmenting `PluginOptionsByType` and `ChartTypeRegistry` through the package root was checked in memory on the per-module layout: only the intended bad line errored.
13. **The per-module layout stays; no bundled `.d.ts`.** A bundled file would break the deep imports counted in Context.
14. **The switch to generated declarations is v5 work, group by group** (P42–P52). Each piece:
    - replaces one group's `declare class`/`declare const` in `src/types/index.ts` with re-exports from the source;
    - drops those names from `src/types.ts`;
    - regenerates the report.
    Its report diff must map line by line to accepted rows of the mismatch ledger. The `export declare const X: ChartComponent & {prototype: X; new(...)}` shapes (29 of them) and the `type LineController = DatasetController` aliases disappear, because the class itself satisfies `ChartComponent` through `static id` and `defaults`.
15. **Mismatches are settled in a ledger** (below), one row per symbol. Each row gets one decision:
    - **(a)** the source matches the published type;
    - **(b)** the published type is wrong about the runtime, which becomes a `fix(types)!` piece on v5 with a migration-guide line;
    - **(c)** the type cannot be expressed on the class, which becomes a merged interface in the source module.
    On 4.x the published type is the contract, and the source annotates to match it wherever it can.
16. **`stripInternal: true` waits for v5** (P41). On 4.x it would remove members from `Element`, `ArcElement` and `PointElement`, which are published from source.
17. **`src/types.ts` stays until P53.** It is where the emitted and the hand-kept declarations meet. 46 `test/types` files and `plugin.colors.ts:2` import it.
18. **Large modules are split when the first draft exceeds 400 edited lines.** This covers core.datasetController, core.controller, core.scale and plugin.tooltip. The first piece renames the module, with `declare` fields typed from JSDoc or `any` and the minimum fixes; the second types the signatures to the public file. Both pieces are listed under the same number, as `a` and `b`.
19. **TypeScript stays at 4.9.5.** Everything the recipe uses exists there: `declare` fields, `override`, `import type` and `satisfies`.
20. **`test/types` keeps `noUnusedLocals`, `noUnusedParameters` and `noImplicitOverride` off** in its own tsconfig. The type tests stand in for consumers, and the flags are this repository's choice, not theirs.

21. **What the plan review changed.**
    - *Complexity:* the five TypeScript modules that held flag diagnostics are fixed in P3 itself. They were planned as four later one-line pieces behind a pending list. Their holders do not touch those lines, so nothing rebases, and the end of the change no longer waits on a stale pull request.
    - *Complexity:* P2 pins the two existing integration packages instead of adding a floor package. The one new package covers the newest TypeScript, which the spec requires and which nothing compiled.
    - *Rule-readers:* the report script is `api-report`, not `lint-api` (Decision 1).
    - *Architecture:* P4 is a prerequisite of every conversion piece, because 15 modules fail the TypeScript lint override as renamed, not only the four that first listed it. P4 also covers `prefer-const` and unused arguments, and its failing check uses modules that show the rules.
    - *Architecture and scope:* P2 compiles the deep paths that consumers import, and tasks now prove the field scenario, the source-map path and the 4.6.2 baseline.
    - *Scope:* what "retire" covers is asked (Open Question 8). Two findings were not taken. Breaking types on v5 is what the user chose ("likely breaks some consumers' types, so it is v5 work"). P41, P53 and P54 are what retiring the hand-written entry needs: without them, TypeDoc and the package's types entry would still point at the hand-kept file.

## Risks / Trade-offs

- **Long tail.** 33 of the conversion pieces wait on open pull requests or designs. The conversion finishes only when the legend, options and ticks reworks, the bar plan and the stale pull requests are settled. → Free modules go first, and the gate and the report keep master consistent at every step.
- **Contributors rebase onto `.ts`.** A rename forces every open pull request on that file to rebase. Git's rename detection carries most edits over, but not all. → Held files wait for their holder (the user's choice: free files first).
- **API Extractor and the `export *` ambiguity in `src/types.ts`** have not been tried; API Extractor is not installed yet. → P1's first step runs it on master. (The rule-readers review ran API Extractor 7.60.1, which bundles TypeScript 6.0.3, against today's `tsconfig.json`: the TS 6 option errors do not stop it.) If it cannot analyse the entry, P1 falls back to rollup-plugin-dts with a normalised diff, and says so in its pull request.
- **TypeScript 4.7.4 may already fail on master.** P2 is then the first proof. Its pull request reports the failures, and fixing them becomes its own piece.
- **Additions on 4.x.** The namespace types gain members, for example former JSDoc `@private` members, which become public there. Someone may start to depend on them. → `/** @internal */` marks them, and v5 strips them (P41).
- **A wrong `declare` type is invisible at runtime.** The bundle does not change, so tests cannot catch it. → The report diff in every piece, and the ledger.

## Pieces

Build order. "Gate" means `pnpm lint-ts-flags` and `pnpm build`. "Report" means `pnpm api-report` (P1). "Bundle identity" means that `dist/*.js`, `dist/chunks/*`, `helpers/*.js` and the UMD bundles are byte-identical to master's build, apart from recipe rule 9 (explicit returns and fallthroughs); source maps may differ. Every conversion piece (P6–P38) waits on P1, P3 and P4, and its check is the gate, bundle identity and a report diff that only adds. No issue is open for this work, so the Advances and Completes columns are empty. Commit types: `test:`/`build:`/`refactor:` release nothing; `refactor(types)!:` and `fix(types)!:` are v5.

| Piece | Builds | Files | Fails without it | Size | Waits on | Advances | Completes |
|---|---|---|---|---|---|---|---|
| P1 | `test: record the public type API of chart.js and chart.js/helpers` | `package.json` (devDependency, `api-report`, which `lint-types` calls after the build), `api-extractor.json`, `api-extractor.helpers.json`, `etc/*.api.md` (generated), `pnpm-lock.yaml` | changing `readonly id: string` to `number` at `index.d.ts:535`, or a helper's return to `any`, passes `pnpm lint-types` on master and fails with P1 | ~70 | | | |
| P2 | `test: compile the published types with TypeScript 4.7.4 and the newest TypeScript` | `test/integration/typescript-node` and `typescript-node-next` (`typescript` pinned to `4.7.4`, `skipLibCheck: false`, imports of root, auto and helpers, a `PluginOptionsByType` augmentation; the `node` one also imports `chart.js/dist/types/utils`, `/basic`, `/geometric`, `dist/plugins/plugin.tooltip` and `dist/helpers/helpers.core`), `test/integration/typescript-latest` (new: the same imports under `nodenext` on the newest TypeScript), `pnpm-lock.yaml` | no compile runs on 4.7 today; an `accessor` field (TypeScript 4.9 syntax) in a published declaration passes master and fails P2 | ~60 | | | |
| P3 | `build: check the TypeScript sources with the transition flags` | `scripts/check-ts-flags.js` (new), `package.json` (`lint-ts-flags`), `tsconfig.json` (`useDefineForClassFields`), `element.point.ts` (2 `static override`), `helpers.interpolation.ts` (`_mode` ×2), `helpers.rtl.ts` (`_w`), `element.arc.ts` (3 `static override`), `helpers.canvas.ts` (the `drawPoint` fallthroughs), `helpers.core.ts:107` and `helpers.math.ts:112` (explicit returns), `helpers.config.ts:179` (`_target`) | removing `override` from `element.point.ts` passes `pnpm lint` on master and fails with P3 | ~110 | merge order only: #12508 (`element.arc.ts`), #12388 and #11105 (`helpers.config.ts`), #12266 (`helpers.math.ts`) and rework-legend P6 (`helpers.core.ts`) hold these files but not these lines | | |
| P4 | `build: lint TypeScript sources with the JavaScript rules` | `.eslintrc.yml` | `eslint --stdin --stdin-filename src/helpers/helpers.segment.ts < src/helpers/helpers.segment.js` reports 6 `no-use-before-define`; the same for `platform.base` reports 3 `no-empty-function` and 11 unused arguments | ~4 | #12506 (`.eslintrc.yml`) | | |
| P5 | `refactor(types): make the hand-kept declarations TypeScript modules` | `src/types/*.d.ts` → `.ts` (14 `import type` fixes), `package.json` (drop `copyDeclarations`), `tsconfig.json` and `docs/.vitepress/typedoc.json`, `docs/.vuepress/config.ts` (entry `src/types/index.ts`) | the build without the copy step publishes no `dist/types/utils.d.ts` until the modules are `.ts`; the report is unchanged and P2 passes | ~45 | P1, P2; the 14 PRs on `index.d.ts`: #12386, #12342, #12327, #12317, #12313, #12311, #12255, #12250, #12243, #12242, #12221, #11898, #11825, #11188; #12386 and #11825 hold `docs/.vuepress/config.ts` | | |
| P6 | `refactor: convert the barrel modules and the defaults modules to TypeScript` | `controllers/index`, `elements/index`, `plugins/index`, `platform/index`, `core.layouts.defaults`, `core.animations.defaults`, `plugin.subtitle`; the source link in `docs/configuration/animations.md:130` | gate, bundle identity, report; `vitest.setup.spec.js` still loads the barrels | ~20 | P1, P3, P4 | | |
| P7 | `refactor: convert BasePlatform to TypeScript` | `platform.base` (`export type Chart`, which `plugin.tooltip.js:11` uses) | gate (TS2694 in `plugin.tooltip.js` without the type export), bundle identity, report | ~50 | P1, P3, P4 | | |
| P8 | `refactor: convert the registries and the plugin service to TypeScript` | `core.typedRegistry`, `core.registry`, `core.plugins` (export `filterCallback`) | gate (59 errors on a plain rename), bundle identity, report | ~150 | P1, P3, P4 | | |
| P9 | `refactor: convert Animation to TypeScript` | `core.animation` | gate (45 errors on a plain rename), bundle identity, report | ~45 | P1, P3, P4 | | |
| P10 | `refactor: convert the interaction modes to TypeScript` | `core.interaction` (export `InteractionItem`, `InteractionOptions`) | gate (TS2554 ×3, TS2694 in tooltip), bundle identity, report | ~170 | P1, P3, P4 | | |
| P11 | `refactor: convert the layout service to TypeScript` | `core.layouts` | gate, bundle identity, report | ~50 | P1, P3, P4 | | |
| P12 | `refactor: convert the segment helpers to TypeScript` | `helpers.segment` | gate, bundle identity; the report for `chart.js/helpers` only adds | ~80 | P1, P3, P4 | | |
| P13 | `refactor: convert LineElement to TypeScript` | `element.line`, fixups in `helpers.segment.ts` | gate (32 own errors, 4 in the segment helpers), bundle identity, report | ~130 | P12 | | |
| P14 | `refactor: convert the filler options, targets and entry to TypeScript` | `filler.options`, `filler.target`, `plugin.filler/index`, `simpleArc`; the link in `docs/charts/area.md:6` | gate (9 errors in `simpleArc`), bundle identity, report | ~60 | P1, P3, P4 | | |
| P15 | `refactor: convert the radar and polar area controllers to TypeScript` | `controller.radar`, `controller.polarArea` | gate (`override` ×11, 5 errors), bundle identity, report | ~45 | P1, P3, P4 | | |
| P16 | `refactor: convert Animations to TypeScript` | `core.animations` | gate, bundle identity, report | ~25 | P1, P3, P4; #11173 | | |
| P17 | `refactor: convert the animator to TypeScript` | `core.animator` (published as `animator`) | gate, bundle identity; report for `animator` only adds | ~45 | P1, P3, P4; #12503, #12158 | | |
| P18 | `refactor: convert the basic and DOM platforms to TypeScript` | `platform.basic`, `platform.dom` | gate, bundle identity, report | ~50 | P7; #12158, #12337 | | |
| P19 | `refactor: convert the doughnut controller to TypeScript` | `controller.doughnut` | gate (15 errors), bundle identity, report | ~70 | P1, P3, P4; #12508, #12243 | | |
| P20 | `refactor: convert the pie controller to TypeScript` | `controller.pie` (statics typed so that TS2417 does not arise) | gate, bundle identity, report | ~5 | P19 | | |
| P21 | `refactor: convert DatasetController to TypeScript` (a and b by Decision 18) | `core.datasetController` (generics, 20 fields, signatures from the public file) | gate (128 own errors, plus spill into the JavaScript controllers), bundle identity, report | wide (250–450) | P1, P3, P4; rework-legend P18; #12332, #12284, #12241, #12176, #12172; it must leave `controller.bar.js` compiling, and if that needs an edit to bar it waits on the bar plan | | |
| P22 | `refactor: convert the bubble controller to TypeScript` | `controller.bubble` | gate (TS2554 ×4), bundle identity, report | ~35 | P21 | | |
| P23 | `refactor: convert the line and scatter controllers to TypeScript` | `controller.line`, `controller.scatter` | gate, bundle identity, report | ~40 | P21; #12347, #12284, #12176, #12086 | | |
| P24 | `refactor: convert Chart to TypeScript` (a and b by Decision 18) | `core.controller` (31 fields, getters) | gate (184 errors, plus 16 in `helpers.dom.ts` that the fields fix), bundle identity, report | wide (~300) | P8; rework-legend P6, P12, P13, P17; #12218, #12172, #11836 | | |
| P25 | `refactor: convert Defaults to TypeScript` | `core.defaults` (the `Defaults` interface merge and the `set` overloads) | gate (26 errors, plus 8 files), bundle identity, report | ~60 | P1, P3, P4; rework-options P1, P10; #12268 | | |
| P26 | `refactor: convert Config to TypeScript` | `core.config` | gate (18 errors), bundle identity, report | ~70 | P1, P3, P4; rework-options P7–P12 | | |
| P27 | `refactor: convert the ticks, scale defaults and autoskip to TypeScript` | `core.ticks`, `core.scale.defaults`, `core.scale.autoskip` | gate, bundle identity, report | ~50 | P1, P3, P4; rework-ticks; #12386, #12383, #12287, #11188 | | |
| P28 | `refactor: convert Scale to TypeScript` (a and b by Decision 18) | `core.scale` (43 fields, the `Scale`/`LayoutItem` interface merge, 17 indent fixes) | gate (254 errors), bundle identity, report | wide (300–450) | P27; rework-ticks; rework-options P11; #12401, #12244, #12237, #12203, #11188 | | |
| P29 | `refactor: convert the linear scales to TypeScript` | `scale.linearbase`, `scale.linear` | gate, bundle identity, report | ~70 | P28; rework-ticks; #12288, #12225, #12185 | | |
| P30 | `refactor: convert the logarithmic scale to TypeScript` | `scale.logarithmic` | gate (17 errors), bundle identity, report | ~50 | P28; #12390 | | |
| P31 | `refactor: convert the category scale to TypeScript` | `scale.category` | gate, bundle identity, report | ~35 | P28; #12222 | | |
| P32 | `refactor: convert the time scales to TypeScript` | `scale.time`, `scale.timeseries` | gate, bundle identity, report | ~150 | P28; rework-ticks; #12406 | | |
| P33 | `refactor: convert the radial linear scale to TypeScript` | `scale.radialLinear` | gate (30 errors), bundle identity, report | ~90 | P29; rework-ticks; rework-options P11; #12336 | | |
| P34 | `refactor: convert the scales barrel to TypeScript` | `scales/index` | gate, bundle identity, report | ~1 | P1, P3, P4; #12386 | | |
| P35 | `refactor: convert the filler drawing, helper, segment and stack modules to TypeScript` | `filler.drawing`, `filler.helper`, `filler.segment`, `filler.target.stack` | gate, bundle identity, report | ~45 | P14; #12381, #12326 | | |
| P36 | `refactor: convert the decimation plugin to TypeScript` | `plugin.decimation` (8 indent fixes) | gate, bundle identity, report | ~25 | P1, P3, P4; #12341, #12284 | | |
| P37 | `refactor: convert the title plugin to TypeScript` | `plugin.title` | gate (34 errors), bundle identity, report | ~50 | P1, P3, P4; rework-options P11 | | |
| P38 | `refactor: convert the tooltip plugin to TypeScript` (a and b by Decision 18) | `plugin.tooltip` | gate (116 errors), bundle identity, report | wide (~250) | P7, P10; rework-legend P13; #12284, #12275, #12255, #11849 | | |
| P39 | `build: drop allowJs and checkJs` | `tsconfig.json`; the "no `src/**/*.js`" check in the gate script; the `lint-js` glob becomes `src/**/*.ts` | the check fails while any `src/**/*.js` remains | ~15 | P6–P38; rework-legend P19; the bar plan | | |
| P40 | `build: turn on the five transition flags` | `tsconfig.json` (uncomment the flags), the gate script reduced to the `.js` check, `test/types/tsconfig.json` (Decision 20) | `tsc` reports the flags' errors when a module regresses; without P40, only the gate does | ~20 | P39 | | |
| P41 | `build(types)!: strip members marked internal from the declarations` | `tsconfig.json` (`stripInternal`), `/** @internal */` on the members that ledger rows of kind (c) and Decision 6 name | a member tagged `@internal` is in `dist/` without it | ~60 | P40; v5 | | |
| P42 | `refactor(types)!: the platforms' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | the report diff equals the accepted ledger rows L5; `lint-types` and P2 pass | ~80 | P5, P41, P18; #12386; v5 | | |
| P43 | `refactor(types)!: the animation declarations come from the source` | `src/types/animation.ts`, `src/types.ts`, reports | as P42, rows L8 | ~70 | P42, P9, P16, P17; v5 | | |
| P44 | `refactor(types)!: defaults, interaction, layouts, registry and ticks come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42, rows L6, L7 | ~250 | P43, P8, P10, P11, P25, P27; v5 | | |
| P45 | `refactor(types)!: the plugins' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42 | ~200 | P44, P14, P35, P36, P37, P38; rework-legend P19; v5 | | |
| P46 | `refactor(types)!: LineElement comes from the source` | `src/types/index.ts`, reports | as P42, rows L9 | ~80 | P45, P13; v5 | | |
| P47 | `refactor(types)!: BarElement comes from the source` | `src/types/index.ts`, reports | as P42 | ~60 | P46; the bar plan; v5 | | |
| P48 | `refactor(types)!: the scales' declarations come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42 | ~250 | P47, P29–P34; v5 | | |
| P49 | `refactor(types)!: Scale comes from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42, rows L10 | ~200 | P48, P28; v5 | | |
| P50 | `refactor(types)!: DatasetController and the controllers come from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42, rows L1, L2, L3, L12 | ~250 | P49, P15, P19, P20, P21, P22, P23; v5 | | |
| P51 | `refactor(types)!: BarController comes from the source` | `src/types/index.ts`, reports | as P42 | ~60 | P50; the bar plan; v5 | | |
| P52 | `refactor(types)!: Chart comes from the source` | `src/types/index.ts`, `src/types.ts`, reports | as P42, rows L4, L11 | ~200 | P51, P24; v5 | | |
| P53 | `refactor(types)!: the package's types come from the main module` | `src/index.ts` (`export * from './types/index.js'`, never `export type *`), delete `src/types.ts`, `package.json` (`types`, `exports["."].types` → `dist/index.d.ts`), `auto/auto.d.ts`, the 46 `test/types` imports, `plugin.colors.ts:2`, reports | P2 and `lint-types` pass with the old entry deleted; the report is unchanged apart from accepted rows | ~70 (plus 46 one-line imports) | P52; #12386; migrate-tests-to-vitest pieces that hold `src/index*.ts`; v5 | | |
| P54 | `docs: generate the API reference from the source` | `tsconfig.json`, `docs/.vitepress/typedoc.json`, `docs/.vuepress/config.ts` (entry `src/index.ts`, `excludeInternal`) | the `Chart` page lists `update`, and no member marked internal appears | ~10 | P53; #12386, #11825; v5 | | |
| P55 | `fix(types)!: <symbol> …`, one pull request per ledger row of kind (b) | `src/<module>.ts`, the migration guide, reports | an `expect-type` assertion on the runtime type, for example `chart.id` is `number` | <50 each | its switch piece (P42–P52); v5 | | |

**In parallel.**
- P1–P4 can all start at once. P5 waits only on its holders.
- After P1, P3 and P4, these are free and independent: P6, P7, P8, P9, P10, P11, P12, P14, P15, P34 (after #12386) and P36 (after its PRs).
- Chains:
  - P12 → P13;
  - P7 → P18;
  - P19 → P20;
  - P21 → P22, P23;
  - P27 → P28 → P29–P32 → P33;
  - P14 → P35.
- P42–P52 run in sequence, because they all edit `src/types/index.ts` and `src/types.ts` by hand.

**Ordering from shared files.**
- `tsconfig.json`: P3, P5, P39, P40, P41, P54.
- `package.json`: P1, P3, P5.
- The gate script: P3, P39, P40.
- `helpers.segment`: P12, P13.

## Contracts

- **The recipe (Decision 4) and the field rule (Decision 2).** Every conversion piece, and the bar plan, follows them. A reviewer rejects a plain instance field.
- **The report (P1).** `pnpm api-report` checks, and `pnpm api-report --local` regenerates, `etc/chart.js.api.md` and `etc/chart.js-helpers.api.md`, and fails when they differ from the committed ones. A piece that changes the published types commits the regenerated reports. On 4.x the diff may only add (Decision 7). On v5 the diff maps to ledger rows.
- **The gate (P3).** `pnpm lint-ts-flags` exits non-zero for any flag diagnostic in a `src/**/*.ts` module. The bar plan's and rework-legend P19's pull requests run it like every other, so their modules meet the five flags before P40.
- **The floor (P2).** `test/integration/typescript-node` and `typescript-node-next` pin `typescript` to exactly `4.7.4` and set `skipLibCheck: false`; `typescript-latest` follows the newest release. All run in `test-ci-integration`.
- **Generics (Decision 5).** Every source class declares the same type parameters and defaults as its public declaration.
- **`src/types/index.ts` (after P5)** is where the hand-kept declarations live. Pieces of rework-legend, rework-options and rework-ticks that edit `index.d.ts` after P5 edit `index.ts` instead.

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
| L12 | Controllers and scales | `type X = DatasetController` (or `Scale<O>`) plus a `ChartComponent` const | classes with different static sides (`PieController.defaults` is not assignable to `DoughnutController.defaults`) | removed by P50/P48 (Decision 14) |

## Open Questions

To be asked in one round before the design is marked ready:

1. **The guard tool** (P1): API Extractor reports plus the 4.7.4 compile (recommended), a normalised dts diff, or the compile suite only.
2. **Additions on 4.x** (Decision 7): may a conversion piece add members to the namespace and helper types on 4.x, including former JSDoc `@private` members (recommended), or must the report stay identical, which needs a `/** @internal */` plus a 4.x strip step that does not exist?
3. **When v5 opens** (P41–P55): master moves to 5.0 after the last 4.x minor (recommended, after 4.7.0, which rework-legend targets), or a long-lived `v5` branch.
4. **Stale holders.** #11188, #11825, #11898, #11173, #11836 and #11849 hold files that P5, P16, P24, P27, P28 and P38 need, and some date from 2023. Triage them first with `/flow:triage` and wait for the rest (recommended), wait for all, or convert and let them rebase.
5. **Ledger rows marked (b)?** L1, L5, L7, L11: correct each on v5 (recommended), or keep the published type for compatibility.
6. **`UpdateModeEnum`** is declared as a runtime enum, but nothing exports it at runtime (`git grep UpdateModeEnum -- src ':!src/types'` finds only the re-export in `src/types.ts`). Export a runtime object on 4.x (additive, recommended), or make it a `const enum` or a union on v5.
7. **`chart.js/dist/types` on v5.** After P53, `dist/types.d.ts` is gone, and under `moduleResolution: node` the path falls through to `dist/types/index.d.ts`, which lacks the source-emitted names. Drop it and say so in the migration guide (recommended), or keep a one-line shim.
8. **What "retire" covers.** After v5, `src/types/index.ts` still holds the registries, the options, context and config interfaces and the type-only helpers (Decision 12), because they have no runtime value and plugins merge into them. "Retired" then means: no declaration of anything with a runtime value is hand-kept. Confirm this (recommended), or also move each options interface next to the module that reads it, which is about 2,000 more lines over 15–20 more pieces.
