## Why

The move to TypeScript stopped halfway. 57 of the 90 modules in `src/` are still JavaScript checked through JSDoc, and the published types are a hand-written 3,940-line `src/types/index.d.ts`. That file drifts from the code: `Chart.id` is declared a string but is a number, and `DatasetController.index` is declared `readonly` but is written. Part of the published API is already emitted from the JavaScript (`chart.js/helpers`, and the `controllers`, `elements`, `plugins` and `scales` namespaces), and nothing checks that converting a module leaves those types unchanged, or that they compile on the oldest TypeScript the package supports.

## What Changes

- A recorded report of the public type API of `chart.js` and `chart.js/helpers`, checked on every pull request, and a consumer compile on TypeScript 4.7.4. Both come before any module is converted.
- The hand-written declarations become TypeScript modules at the same paths, so the build emits them instead of copying them.
- Every remaining JavaScript module in `src/` is converted to TypeScript, one module or one small group per pull request. The bundles stay byte-identical, apart from explicit `return undefined` and restructured switch fallthroughs. On 4.x the published types only gain members; nothing is removed or widened.
- `allowJs` and `checkJs` go away, and the five compiler checks that `tsconfig.json` marks "uncomment after transition to TS" are turned on: noFallthroughCasesInSwitch, noImplicitOverride, noImplicitReturns, noUnusedLocals and noUnusedParameters. `strict` stays off.
- Update modes become augmentable through an `UpdateModeRegistry` interface, as chart types already are. `UpdateModeEnum`, which claims a runtime value that does not exist, is deprecated, and v5 removes it.
- On the v5 line, the published declarations of every class and object with a runtime value are generated from the source, group by group, and their hand-written copies are deleted. The package's types entry moves to the main module, and the API reference is generated from the source.
- **BREAKING** (v5 only): the published declarations of controllers, scales, elements, plugins, platforms and `Chart` become the classes themselves, so `BarController` is no longer an alias of `DatasetController`. Members the hand-written file never declared and that are marked internal are not published. `UpdateModeEnum` and the `chart.js/dist/types` path are removed. Declarations that contradict the runtime are corrected, each in its own `fix(types)!` pull request with a migration-guide entry (for example, `Chart.id` becomes `number`).
- Not in this change: `src/controllers/controller.bar.js` and `src/elements/element.bar.js`, which a separate plan converts, and `src/plugins/plugin.legend.js`, which the legend rework converts (rework-legend P19). `strict`, and upgrading TypeScript from 4.9.5, are also out of scope.

## Capabilities

### New Capabilities

- `published-types`: which names and types the package publishes, which TypeScript versions can read them, which deep type paths resolve, and how plugins extend them.
- `built-bundles`: what the ESM, CJS, UMD and helpers bundles contain, and what their source maps point at.

### Modified Capabilities

None.

## Impact

- Code: every module under `src/` except the two bar modules and the legend; `src/types/*`, `src/types.ts`, and later `src/index.ts`.
- Build and checks: `tsconfig.json`, `package.json` scripts, `.eslintrc.yml`, a new API report under `etc/`, a new integration package on TypeScript 4.7.4, and a transition gate script that is deleted again at the end.
- Docs: two source links in `docs/`. On v5, the TypeDoc entry and a migration-guide section.
- Open work: each conversion waits for the open pull requests and designs that hold its file (`design.md`, Pieces). The legend, options and ticks reworks land first in their files.
- Consumers on 4.x see no type change except added members. On v5 they see the breaking type changes listed above.
