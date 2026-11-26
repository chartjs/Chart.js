## 1. P1: Record the public type API

- [ ] 1.1 Show that the check is missing: on master, change `readonly id: string` at `src/types/index.d.ts:535` to `number`; `pnpm lint-types` passes. Revert the change.
- [ ] 1.2 Add `@microsoft/api-extractor` and two configs: entry `dist/types.d.ts` and entry `dist/helpers/index.d.ts`, with `newlineKind: lf` and forgotten exports recorded in the report rather than reported as errors.
- [ ] 1.3 Run it on master. If it cannot analyse the `export *` ambiguity in `src/types.ts`, use rollup-plugin-dts with a normalised diff instead, and say so in the pull request.
- [ ] 1.4 Add `api-report` (`--local` writes the reports, plain mode fails on a difference) and call it from `lint-types` after the build. Do not name it `lint-*`: `pnpm lint` runs those in parallel before the build.
- [ ] 1.5 Commit `etc/chart.js.api.md` and `etc/chart.js-helpers.api.md`. Repeat 1.1 and show that `pnpm lint-types` now fails.
- [ ] 1.6 Generate the reports at tag `v4.6.2` as well, and show that master's differ from them only by additions.

## 2. P2: Compile the published types on TypeScript 4.7.4 and the newest TypeScript

- [ ] 2.1 Pin `typescript` to exactly `4.7.4` in `test/integration/typescript-node` and `typescript-node-next`, set `skipLibCheck: false`, and import `chart.js`, `chart.js/auto` and `chart.js/helpers` with a `PluginOptionsByType` augmentation. In the `node` package, also import a name from `chart.js/dist/types/utils`, `/basic`, `/geometric`, `dist/plugins/plugin.tooltip` and `dist/helpers/helpers.core`.
- [ ] 2.2 Add `test/integration/typescript-latest` with the same imports under `nodenext` on the newest TypeScript.
- [ ] 2.3 Show that the 4.7.4 packages fail when a published declaration contains an `accessor` field, then revert that.
- [ ] 2.4 If any package fails on master, list the errors in the pull request and stop: fixing them becomes its own piece before P5.

## 3. P3: The transition gate

- [ ] 3.1 Show that the check is missing: on master, add `override` to a static in `element.point.ts`, then remove it again; `pnpm lint` passes both ways.
- [ ] 3.2 Write `scripts/check-ts-flags.js`: the root program with the five flags, failing for any diagnostic in `src/**/*.ts`.
- [ ] 3.3 Fix the 13 diagnostics: `static override` in `element.point.ts` (2) and `element.arc.ts:377,393,466`; `_mode` ×2 in `helpers.interpolation.ts`; `_w` in `helpers.rtl.ts`; `_target` at `helpers.config.ts:179`; the `drawPoint` fallthroughs at `helpers.canvas.ts:237,257`; explicit returns at `helpers.core.ts:107` and `helpers.math.ts:112`.
- [ ] 3.4 Show bundle identity apart from the lines of 3.3; the image fixtures pass.
- [ ] 3.5 Set `useDefineForClassFields: true` in `tsconfig.json`; `tsc --noEmit` stays at 0 errors.
- [ ] 3.6 Add `lint-ts-flags` to `package.json`, so that `pnpm lint` runs it.

## 4. P4: Lint parity for TypeScript

- [ ] 4.1 Show the failure: `eslint --stdin --stdin-filename src/helpers/helpers.segment.ts < src/helpers/helpers.segment.js` reports 6 `no-use-before-define`, and the same for `platform.base` reports 3 `no-empty-function` and 11 unused arguments.
- [ ] 4.2 In the TypeScript override of `.eslintrc.yml`, set `@typescript-eslint/no-use-before-define` to `{functions: false}`, turn `@typescript-eslint/no-empty-function` and `prefer-const` off as for JavaScript, and set `@typescript-eslint/no-unused-vars` to ignore arguments that start with `_`.
- [ ] 4.3 Rebase after #12506.

## 5. P5: Hand-kept declarations as TypeScript modules

- [ ] 5.1 Wait for, or rebase after, the 14 pull requests on `src/types/index.d.ts` (Pieces table).
- [ ] 5.2 Rename `src/types/*.d.ts` to `.ts` and add the 14 `import type` fixes.
- [ ] 5.3 Remove `copyDeclarations` from `package.json`, and point the TypeDoc entries in `tsconfig.json`, `docs/.vitepress/typedoc.json` and `docs/.vuepress/config.ts` at `src/types/index.ts`.
- [ ] 5.4 Show that `dist/types/utils.d.ts` and the rest are still published, the report is unchanged, and P2 passes.

## 6. P6: Convert the barrel modules and the defaults modules to TypeScript

- [ ] 6.1 Rename the modules to `.ts`. Show the gate's errors for the barrel modules and the defaults modules before the fix.
- [ ] 6.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 6.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 6.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 6.5 Run the whole test suite; no fixture changes.
- [ ] 6.6 Update the source link in `docs/configuration/animations.md:130`.

## 7. P7: Convert BasePlatform to TypeScript

- [ ] 7.1 Rename the modules to `.ts`. Show the gate's errors for BasePlatform before the fix.
- [ ] 7.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 7.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 7.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 7.5 Run the whole test suite; no fixture changes.

## 8. P8: Convert the registries and the plugin service to TypeScript

- [ ] 8.1 Rename the modules to `.ts`. Show the gate's errors for the registries and the plugin service before the fix.
- [ ] 8.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 8.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 8.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 8.5 Run the whole test suite; no fixture changes.

## 9. P9: Convert Animation to TypeScript

- [ ] 9.1 Rename the modules to `.ts`. Show the gate's errors for Animation before the fix.
- [ ] 9.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 9.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 9.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 9.5 Run the whole test suite; no fixture changes.

## 10. P10: Convert the interaction modes to TypeScript

- [ ] 10.1 Rename the modules to `.ts`. Show the gate's errors for the interaction modes before the fix.
- [ ] 10.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 10.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 10.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 10.5 Run the whole test suite; no fixture changes.

## 11. P11: Convert the layout service to TypeScript

- [ ] 11.1 Rename the modules to `.ts`. Show the gate's errors for the layout service before the fix.
- [ ] 11.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 11.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 11.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 11.5 Run the whole test suite; no fixture changes.

## 12. P12: Convert the segment helpers to TypeScript

- [ ] 12.1 Rename the modules to `.ts`. Show the gate's errors for the segment helpers before the fix.
- [ ] 12.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 12.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 12.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 12.5 Run the whole test suite; no fixture changes.

## 13. P13: Convert LineElement to TypeScript

- [ ] 13.1 Rename the modules to `.ts`. Show the gate's errors for LineElement before the fix.
- [ ] 13.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 13.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 13.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 13.5 Run the whole test suite; no fixture changes.

## 14. P14: Convert the filler options, targets and entry to TypeScript

- [ ] 14.1 Rename the modules to `.ts`. Show the gate's errors for the filler options, targets and entry before the fix.
- [ ] 14.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 14.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 14.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 14.5 Run the whole test suite; no fixture changes.
- [ ] 14.6 Update the source link in `docs/charts/area.md:6`.

## 15. P15: Convert the radar and polar area controllers to TypeScript

- [ ] 15.1 Rename the modules to `.ts`. Show the gate's errors for the radar and polar area controllers before the fix.
- [ ] 15.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 15.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 15.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 15.5 Run the whole test suite; no fixture changes.

## 16. P16: Convert Animations to TypeScript

- [ ] 16.1 Rename the modules to `.ts`. Show the gate's errors for Animations before the fix.
- [ ] 16.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 16.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 16.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 16.5 Run the whole test suite; no fixture changes.

## 17. P17: Convert the animator to TypeScript

- [ ] 17.1 Rename the modules to `.ts`. Show the gate's errors for the animator before the fix.
- [ ] 17.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 17.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 17.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 17.5 Run the whole test suite; no fixture changes.

## 18. P18: Convert the basic and DOM platforms to TypeScript

- [ ] 18.1 Rename the modules to `.ts`. Show the gate's errors for the basic and DOM platforms before the fix.
- [ ] 18.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 18.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 18.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 18.5 Run the whole test suite; no fixture changes.

## 19. P19: Convert the doughnut controller to TypeScript

- [ ] 19.1 Rename the modules to `.ts`. Show the gate's errors for the doughnut controller before the fix.
- [ ] 19.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 19.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 19.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 19.5 Run the whole test suite; no fixture changes.


## 20. P20: Convert the pie controller to TypeScript

- [ ] 20.1 Rename the modules to `.ts`. Show the gate's errors for the pie controller before the fix.
- [ ] 20.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 20.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 20.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 20.5 Run the whole test suite; no fixture changes.

## 21. P21: Convert DatasetController to TypeScript

- [ ] 21.1 If the first draft exceeds 400 edited lines, split it as Decision 18 says: Pa renames with `declare` fields and the minimum fixes, and Pb types the signatures.
- [ ] 21.2 Rename the modules to `.ts`. Show the gate's errors for DatasetController before the fix.
- [ ] 21.3 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 21.4 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 21.5 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 21.6 Run the whole test suite; no fixture changes.
- [ ] 21.7 Show that `controller.bar.js` still compiles under `checkJs`; if that needs an edit to bar, stop and wait on the bar plan.

## 22. P22: Convert the bubble controller to TypeScript

- [ ] 22.1 Rename the modules to `.ts`. Show the gate's errors for the bubble controller before the fix.
- [ ] 22.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 22.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 22.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 22.5 Run the whole test suite; no fixture changes.

## 23. P23: Convert the line and scatter controllers to TypeScript

- [ ] 23.1 Rename the modules to `.ts`. Show the gate's errors for the line and scatter controllers before the fix.
- [ ] 23.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 23.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 23.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 23.5 Run the whole test suite; no fixture changes.

## 24. P24: Convert Chart to TypeScript

- [ ] 24.1 If the first draft exceeds 400 edited lines, split it as Decision 18 says: Pa renames with `declare` fields and the minimum fixes, and Pb types the signatures.
- [ ] 24.2 Rename the modules to `.ts`. Show the gate's errors for Chart before the fix.
- [ ] 24.3 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 24.4 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 24.5 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 24.6 Run the whole test suite; no fixture changes.

## 25. P25: Convert Defaults to TypeScript

- [ ] 25.1 Rename the modules to `.ts`. Show the gate's errors for Defaults before the fix.
- [ ] 25.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 25.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 25.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 25.5 Run the whole test suite; no fixture changes.

## 26. P26: Convert Config to TypeScript

- [ ] 26.1 Rename the modules to `.ts`. Show the gate's errors for Config before the fix.
- [ ] 26.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 26.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 26.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 26.5 Run the whole test suite; no fixture changes.



## 27. P27: Convert the ticks, scale defaults and autoskip to TypeScript

- [ ] 27.1 Rename the modules to `.ts`. Show the gate's errors for the ticks, scale defaults and autoskip before the fix.
- [ ] 27.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 27.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 27.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 27.5 Run the whole test suite; no fixture changes.

## 28. P28: Convert Scale to TypeScript

- [ ] 28.1 If the first draft exceeds 400 edited lines, split it as Decision 18 says: Pa renames with `declare` fields and the minimum fixes, and Pb types the signatures.
- [ ] 28.2 Rename the modules to `.ts`. Show the gate's errors for Scale before the fix.
- [ ] 28.3 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 28.4 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 28.5 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 28.6 Run the whole test suite; no fixture changes.

## 29. P29: Convert the linear scales to TypeScript

- [ ] 29.1 Rename the modules to `.ts`. Show the gate's errors for the linear scales before the fix.
- [ ] 29.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 29.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 29.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 29.5 Run the whole test suite; no fixture changes.

## 30. P30: Convert the logarithmic scale to TypeScript

- [ ] 30.1 Rename the modules to `.ts`. Show the gate's errors for the logarithmic scale before the fix.
- [ ] 30.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 30.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 30.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 30.5 Run the whole test suite; no fixture changes.

## 31. P31: Convert the category scale to TypeScript

- [ ] 31.1 Rename the modules to `.ts`. Show the gate's errors for the category scale before the fix.
- [ ] 31.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 31.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 31.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 31.5 Run the whole test suite; no fixture changes.

## 32. P32: Convert the time scales to TypeScript

- [ ] 32.1 Rename the modules to `.ts`. Show the gate's errors for the time scales before the fix.
- [ ] 32.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 32.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 32.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 32.5 Run the whole test suite; no fixture changes.

## 33. P33: Convert the radial linear scale to TypeScript

- [ ] 33.1 Rename the modules to `.ts`. Show the gate's errors for the radial linear scale before the fix.
- [ ] 33.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 33.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 33.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 33.5 Run the whole test suite; no fixture changes.

## 34. P34: Convert the scales barrel to TypeScript

- [ ] 34.1 Rename the modules to `.ts`. Show the gate's errors for the scales barrel before the fix.
- [ ] 34.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 34.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 34.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 34.5 Run the whole test suite; no fixture changes.

## 35. P35: Convert the filler drawing, helper, segment and stack modules to TypeScript

- [ ] 35.1 Rename the modules to `.ts`. Show the gate's errors for the filler drawing, helper, segment and stack modules before the fix.
- [ ] 35.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 35.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 35.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 35.5 Run the whole test suite; no fixture changes.

## 36. P36: Convert the decimation plugin to TypeScript

- [ ] 36.1 Rename the modules to `.ts`. Show the gate's errors for the decimation plugin before the fix.
- [ ] 36.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 36.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 36.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 36.5 Run the whole test suite; no fixture changes.

## 37. P37: Convert the title plugin to TypeScript

- [ ] 37.1 Rename the modules to `.ts`. Show the gate's errors for the title plugin before the fix.
- [ ] 37.2 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 37.3 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 37.4 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 37.5 Run the whole test suite; no fixture changes.

## 38. P38: Convert the tooltip plugin to TypeScript

- [ ] 38.1 If the first draft exceeds 400 edited lines, split it as Decision 18 says: Pa renames with `declare` fields and the minimum fixes, and Pb types the signatures.
- [ ] 38.2 Rename the modules to `.ts`. Show the gate's errors for the tooltip plugin before the fix.
- [ ] 38.3 Apply the recipe (design.md, Decision 4): `declare` fields, annotations from JSDoc and the public declarations, `override`, `_` unused parameters, explicit returns.
- [ ] 38.4 Run the gate and `pnpm build`. Show bundle identity against master's build (`dist/*.js`, `dist/chunks/*`, `helpers/*.js`, UMD).
- [ ] 38.5 Regenerate the reports with `pnpm api-report --local`. The diff may only add (Decision 7); list any runtime-versus-type mismatch in the pull request for the ledger.
- [ ] 38.6 Run the whole test suite; no fixture changes.

## 39. P39: Drop allowJs and checkJs

- [ ] 39.1 Add the "no `src/**/*.js`" check to the gate; it fails while the bar modules or the legend are JavaScript.
- [ ] 39.2 After the bar plan and rework-legend P19, remove `allowJs` and `checkJs` from `tsconfig.json` and change the `lint-js` glob to `src/**/*.ts`.
- [ ] 39.3 Show that the gate, `pnpm build`, bundle identity and the report all pass.

## 40. P40: Turn on the five flags

- [ ] 40.1 Uncomment the five flags in `tsconfig.json`; `tsc --noEmit` passes.
- [ ] 40.2 Reduce the gate script to the `.js` check, and keep `lint-ts-flags` for it.
- [ ] 40.3 Turn `noUnusedLocals`, `noUnusedParameters` and `noImplicitOverride` off in `test/types/tsconfig.json`; `lint-types` passes.

## 41. P41: Strip internal members (v5)

- [ ] 41.1 Write an `expect-type` assertion that a member tagged `@internal` is absent from `dist/`; it fails.
- [ ] 41.2 Set `stripInternal: true` and tag the members that the ledger rows of kind (c) and Decision 6 name.
- [ ] 41.3 Regenerate the reports; every removed line maps to a ledger row.

## 42. P42: The platforms' declarations come from the source (v5)

- [ ] 42.1 Replace the hand-kept `declare class`/`declare const` of the platforms' declarations in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 42.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L5).
- [ ] 42.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 42.4 Add each consumer-visible change to the v5 migration guide.

## 43. P43: The animation declarations come from the source (v5)

- [ ] 43.1 Replace the hand-kept `declare class`/`declare const` of the animation declarations in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 43.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L8).
- [ ] 43.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 43.4 Add each consumer-visible change to the v5 migration guide.

## 44. P44: Defaults, interaction, layouts, registry and ticks come from the source (v5)

- [ ] 44.1 Replace the hand-kept `declare class`/`declare const` of defaults, interaction, layouts, registry and ticks in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 44.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L6, L7).
- [ ] 44.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 44.4 Add each consumer-visible change to the v5 migration guide.

## 45. P45: The plugins' declarations come from the source (v5)

- [ ] 45.1 Replace the hand-kept `declare class`/`declare const` of the plugins' declarations in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 45.2 Regenerate the reports. Every diff line maps to an accepted ledger row (none).
- [ ] 45.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 45.4 Add each consumer-visible change to the v5 migration guide.

## 46. P46: LineElement come from the source (v5)

- [ ] 46.1 Replace the hand-kept `declare class`/`declare const` of LineElement in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 46.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L9).
- [ ] 46.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 46.4 Add each consumer-visible change to the v5 migration guide.

## 47. P47: BarElement come from the source (v5)

- [ ] 47.1 Replace the hand-kept `declare class`/`declare const` of BarElement in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 47.2 Regenerate the reports. Every diff line maps to an accepted ledger row (none, after the bar plan).
- [ ] 47.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 47.4 Add each consumer-visible change to the v5 migration guide.

## 48. P48: The scales' declarations come from the source (v5)

- [ ] 48.1 Replace the hand-kept `declare class`/`declare const` of the scales' declarations in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 48.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L12).
- [ ] 48.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 48.4 Add each consumer-visible change to the v5 migration guide.

## 49. P49: Scale come from the source (v5)

- [ ] 49.1 Replace the hand-kept `declare class`/`declare const` of Scale in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 49.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L10).
- [ ] 49.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 49.4 Add each consumer-visible change to the v5 migration guide.

## 50. P50: DatasetController and the controllers come from the source (v5)

- [ ] 50.1 Replace the hand-kept `declare class`/`declare const` of DatasetController and the controllers in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 50.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L1, L2, L3, L12).
- [ ] 50.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 50.4 Add each consumer-visible change to the v5 migration guide.

## 51. P51: BarController come from the source (v5)

- [ ] 51.1 Replace the hand-kept `declare class`/`declare const` of BarController in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 51.2 Regenerate the reports. Every diff line maps to an accepted ledger row (none, after the bar plan).
- [ ] 51.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 51.4 Add each consumer-visible change to the v5 migration guide.

## 52. P52: Chart come from the source (v5)

- [ ] 52.1 Replace the hand-kept `declare class`/`declare const` of Chart in `src/types/` with re-exports from the source, and drop those names from `src/types.ts`.
- [ ] 52.2 Regenerate the reports. Every diff line maps to an accepted ledger row (L4, L11).
- [ ] 52.3 Run `lint-types`, the 4.7.4 floor (P2) and the integration packages.
- [ ] 52.4 Add each consumer-visible change to the v5 migration guide.

## 53. P53: The package's types come from the main module (v5)

- [ ] 53.1 Delete `src/types.ts`; `pnpm build` no longer emits `dist/types.d.ts`, and the floor compile fails.
- [ ] 53.2 Add `export * from './types/index.js'` to `src/index.ts` (never `export type *`), point `types` and `exports["."].types` at `./dist/index.d.ts` and `auto/auto.d.ts` at `../dist/index.js`, and change the 46 `test/types` imports and `plugin.colors.ts:2`.
- [ ] 53.3 Show that the floor, `lint-types` and the report pass, apart from accepted rows.

## 54. P54: API reference from the source (v5)

- [ ] 54.1 Point TypeDoc at `src/index.ts` with `excludeInternal`, in `tsconfig.json`, `docs/.vitepress/typedoc.json` and `docs/.vuepress/config.ts`.
- [ ] 54.2 Show that the `Chart` page lists `update` and no internal member.

## 55. P55: Type corrections (v5), one pull request per ledger row of kind (b)

- [ ] 55.1 Write an `expect-type` assertion on the runtime type, for example that `chart.id` is `number`; it fails.
- [ ] 55.2 Correct the declaration in the source module, regenerate the reports, and add a migration-guide line.
