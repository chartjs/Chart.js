## 1. P1: Type syntax and stale directives

- [ ] 1.1 On master, `pnpm exec eslint "src/**/*.{js,ts}" "test/**/*.js" "docs/**/*.js" --report-unused-disable-directives --rule '@typescript-eslint/semi: [error, always]' --rule '@typescript-eslint/space-infix-ops: error'` gives 42 errors (28 semicolons, 7 unions, 7 unused directives).
- [ ] 1.2 Add the semicolons after type aliases and the spaces around `|` in `src/types/index.d.ts:2010-2016`.
- [ ] 1.3 Space the braces of the 6 type literals in `helpers.{canvas,collection,config}.ts`, `index.d.ts` and `layout.d.ts`, and of the `ts` example at `docs/general/data-structures.md:209`.
- [ ] 1.4 Delete the 6 `prefer-const` directives in `.js` files. Rename the directive at `helpers.rtl.ts:37` to `@typescript-eslint/no-unused-vars`; do not delete it, because the empty method then fails `no-empty-function`.
- [ ] 1.5 The command in 1.1 gives 0 errors; `pnpm lint` passes with 50 warnings (one fewer).

## 2. P2: Dead assignments

- [ ] 2.1 On master, `pnpm dlx eslint@10 --no-config-lookup --rule 'no-useless-assignment: error' "src/**/*.js" "test/**/*.js"` gives 10 errors.
- [ ] 2.2 Remove each dead initial value or increment: `core.controller.js:357`, `helpers.segment.js:287`, `plugin.decimation.js:57,77`, `filler.helper.js:17`, `scale.radialLinear.js:121-122`, `core.datasetController.tests.js:487`, `core.layouts.tests.js:523`, `scale.time.tests.js:37`; and `plugin.colors.ts:39` (`return ++i` → `return i + 1`).
- [ ] 2.3 The command in 2.1 gives 0 errors; `pnpm lint` and `pnpm test-ci` pass.

## 3. P3: Switch to ESLint 10

- [ ] 3.1 On master, `pnpm exec eslint --version` prints v8.37.0, and a `.d.ts` with `type P = {x: number};` passes `pnpm lint-js`.
- [ ] 3.2 Swap the dev dependencies (proposal, What Changes) with caret ranges, and raise `typescript` to ^4.8.4.
- [ ] 3.3 Add `eslint.config.js` from design Contracts, with the open questions' answers applied, and the `test/fixtures/**/*.js` block if #12444 has landed. Delete `.eslintrc.yml`, `.eslintignore`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml` and `docs/samples/.eslintrc.yml`.
- [ ] 3.4 Fix the 15 indentation lines in `helpers.curve.ts`, `helpers.dom.ts` and `index.d.ts` with `--fix`. Rename the `ban-types` directives (`no-empty-object-type` in `index.d.ts`, `no-unsafe-function-type` in `utils.d.ts`), and add a `no-unsafe-declaration-merging` directive at the `Scale` class in `index.d.ts`. Unspace the import at `test/types/autogen.js:3`.
- [ ] 3.5 Add `test/integration/react-browser/.env` with `DISABLE_ESLINT_PLUGIN=true`; `pnpm test-ci-integration` passes after `pnpm build`.
- [ ] 3.6 Add the sentence of design D12 before the Pieces table of `openspec/changes/migrate-tests-to-vitest/design.md`.
- [ ] 3.7 Prove parity. `eslint --print-config` for a library `.js`, a `.ts` file and a spec gives the rule lists of design Context. `pnpm lint` gives 0 errors and 55 warnings (50 + 5). The behaviour checks of the `code-linting` spec pass with temporary files. `.claude/` and `docs/.vitepress/` files are not read.
