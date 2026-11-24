## 1. P1: Code that both ESLint and Biome accept

- [ ] 1.1 Run Biome (the pinned version) with the configuration in design.md Contracts on the base and save the findings; 27 errors were measured on 53849f16
- [ ] 1.2 Apply the `useConst` safe fixes and rename the `noShadow` bindings
- [ ] 1.3 Remove the unused import in `element.arc.ts`; collapse the `else { if` in `core.scale.js` and drop its `eslint-disable no-lonely-if`
- [ ] 1.4 Merge the string literals in `docs/scripts/analyzer.js`; fix `Array.isArray`, redundant `'use strict'`, the approximate constant, the duplicate test title and the infos
- [ ] 1.5 Confirm Biome reports errors only at the suppression sites of design D7, and `pnpm lint` (ESLint) still gives 0 errors

## 2. P2: Switch to Biome

- [ ] 2.1 Show the failing checks first: `pnpm why eslint` lists eslint, and `a?.b` added to a file in `src` passes `pnpm lint`
- [ ] 2.2 Add `@biomejs/biome` at the exact version; remove `eslint`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html`, `eslint-plugin-markdown`, `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- [ ] 2.3 Add `biome.json` and `es2018.grit` from design.md Contracts with the answers to the open questions applied; carry over everything `test/.eslintrc.yml` holds at that time (including #12444's `triggerMouseEvent` in the Karma-side globals list)
- [ ] 2.4 `lint-js` becomes `biome lint`; add `format` (`biome format --write`); remove `lint-md`
- [ ] 2.5 Convert the 10 suppressions and add the 5 new ones listed in design D7, each with a reason
- [ ] 2.6 Delete `.eslintrc.yml`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml`, `docs/samples/.eslintrc.yml`, `.eslintignore`; remove the `.eslintcache` lines from `.gitignore`
- [ ] 2.7 Contributing guide: Biome instead of ESLint, `pnpm format`, the editor extension, Markdown examples are not linted
- [ ] 2.8 Add the sentence of design D10 to `openspec/changes/migrate-tests-to-vitest/design.md`
- [ ] 2.9 Confirm: `pnpm lint` passes with warnings only (complexity, statement count, `any`); `debugger` in `src` fails it; `a?.[b]` in `src` fails it and `a ?? b` in `docs/.vitepress` does not; `jasmine` in a Vitest spec fails it; `fit` in a spec fails it; a `biome-ignore` without a reason fails it; `pnpm why eslint` is empty for the library package; no new file in `git status` after a run
- [ ] 2.10 CI is green on Ubuntu and Windows

## 3. P3: Guard self-test and dead suppressions

- [ ] 3.1 Show the failing check first: with one pattern of `es2018.grit` broken, `pnpm lint` still passes
- [ ] 3.2 Add the self-test script and its positive and negative samples (outside the lint scope); run it as `lint-es2018`, piping each sample through `biome lint --stdin-file-path=src/…`
- [ ] 3.3 Add the ES2021+ patterns if open question 9 says so, with samples
- [ ] 3.4 Delete the 32 dead `eslint-disable` comments
- [ ] 3.5 Confirm `pnpm lint` fails with a broken pattern and passes with the real one, on Ubuntu and Windows

## 4. P4: Reformat

- [ ] 4.1 Rebase on master after #12444 and at the agreed time; run `biome format --write` and commit only its output
- [ ] 4.2 Confirm `biome format` reports nothing, `pnpm lint`, the build and the test suite pass, and running `biome format --write` on the parent commit reproduces the commit's tree exactly
- [ ] 4.3 Squash-merge as one commit

## 5. P5: Enforce the format

- [ ] 5.1 Show the failing check first: an unformatted file passes `pnpm lint`
- [ ] 5.2 `lint-js` becomes `biome check`
- [ ] 5.3 Add `.git-blame-ignore-revs` with P4's merge SHA (and a formatter-only catch-up commit's, if one is needed first)
- [ ] 5.4 Contributing guide: `git config blame.ignoreRevsFile .git-blame-ignore-revs` and the rebase recipe of design D9
- [ ] 5.5 Confirm `pnpm lint` fails on an unformatted file and GitHub's blame for a re-indented line shows the earlier commit
