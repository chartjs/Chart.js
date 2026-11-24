## 1. P1: Fix TypeScript type syntax for the new style checks

- [ ] 1.1 Run oxlint with the configuration in design.md Contracts on master and save the findings in the P1 files: 43 errors and 4 warnings are expected
- [ ] 1.2 Add the missing semicolons after type aliases in `src/types/*.d.ts`, `src/helpers/*.ts` and `src/elements/element.point.ts`
- [ ] 1.3 Space the unspaced type literals and the `|` in the unions of `src/types/index.d.ts`
- [ ] 1.4 Fix the 4 lines in `test/types/extensions/scale.ts`, `interaction.ts`, `date_adapter.ts` and `options.ts`
- [ ] 1.5 Confirm oxlint reports nothing in the P1 files except the indentation lines left for P3, and that `pnpm lint` (ESLint) still gives 0 errors

## 2. P2: Restyle the documentation site's code

- [ ] 2.1 Rebase on #12484 once it has merged; run oxlint with the Contracts configuration on `docs/.vitepress` and save the findings (52 expected)
- [ ] 2.2 Fix them, with `--fix` where it applies
- [ ] 2.3 Confirm oxlint reports nothing under `docs/.vitepress` and that the docs build still passes

## 3. P3: Switch to oxlint

- [ ] 3.1 Show the failing checks first: `pnpm why eslint` lists eslint, and `type P = {x: number};` added to a `.d.ts` passes `pnpm lint`
- [ ] 3.2 Add `.oxlintrc.json` from design.md Contracts with the pins and peer handling of design D11, and carry over everything `test/.eslintrc.yml` holds at that time (including #12444's additions)
- [ ] 3.3 Swap the dev dependencies: add `oxlint`, `@stylistic/eslint-plugin` and `eslint-plugin-es-x` with the agreed pins; remove `eslint`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html`, `eslint-plugin-markdown`, `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- [ ] 3.4 Handle the `eslint` peer of `eslint-plugin-es-x` with `packageExtensions` in `pnpm-workspace.yaml` (design D11), and confirm `pnpm why eslint` is empty for the library package
- [ ] 3.5 `lint-js` becomes `oxlint src test docs`; remove `lint-md`
- [ ] 3.6 Re-indent the 15 TypeScript lines in `helpers.curve.ts`, `helpers.dom.ts` and `index.d.ts`
- [ ] 3.6a Run the configuration on this piece's base and fix every finding that is new since 53849f16; list them in the pull request
- [ ] 3.7 Delete `.eslintrc.yml`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml` and `docs/samples/.eslintrc.yml`; remove the `# Eslint` and `.eslintcache` lines from `.gitignore`; if #12484 has merged, also delete `.eslintignore` and drop P4
- [ ] 3.8 Contributing guide: oxlint instead of ESLint, Markdown examples are not linted, the Node version the plugins need
- [ ] 3.9 Edit `openspec/changes/migrate-tests-to-vitest/design.md` as design D9 says
- [ ] 3.10 Confirm: `pnpm lint` passes with exactly the warnings ESLint gave (21 complexity, 18 max-statements, 10 no-explicit-any, 1 unused variable); a `debugger` in `src` fails it; `a?.b`, `Object.fromEntries([])`, `new RegExp('(?<=a)b')` and `globalThis` in `src` each fail it, and `a?.b` in `docs/.vitepress` does not; removing the `eslint-disable-line` comments in `src/platform/platform.base.js` brings up the unused-parameter findings; no new file in `git status` after a run
- [ ] 3.11 CI is green on Ubuntu and Windows

## 4. P4: Delete `.eslintignore`

- [ ] 4.1 Show `git ls-files '*eslint*'` lists `.eslintignore`
- [ ] 4.2 Rebase on #12484 once it has merged, then delete it
- [ ] 4.3 Confirm `pnpm lint` gives the same output as before the deletion
