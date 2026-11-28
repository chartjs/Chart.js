## 1. P1: Code that both ESLint and Biome accept

- [ ] 1.0 Start only after finalize-typescript-conversion P40 has merged (design D16); confirm `git ls-files 'src/**/*.js'` is empty
- [ ] 1.1 Run Biome (the pinned version) with the configuration in design.md Contracts on the base and save the findings; 188 errors were measured on b6dd5a58
- [ ] 1.2 Apply the `useConst` safe fixes and rename the `noShadow` bindings
- [ ] 1.2a Adopted rules of design D6: alias the 10 `isFinite` imports; turn the 9 `else` after `return` into `if`; split the 33 return-assignments; add a comment to each empty block saying why it is empty (103 on b6dd5a58); write `self.onmessage =` in `test/umd/worker.js`
- [ ] 1.3 Remove the unused import in `element.arc.ts`; collapse the `else { if` in `core.scale.js` and drop its `eslint-disable no-lonely-if`
- [ ] 1.4 Merge the string literals in `docs/scripts/analyzer.js`; fix `Array.isArray`, redundant `'use strict'`, the approximate constant, the duplicate test title and the infos
- [ ] 1.5 Restructure the `@ts-ignore` / `@ts-expect-error` sites that the reformat moves (design D13): first show that `biome format --write` on a scratch copy makes `tsc -p test/types` fail at the sites design D13 names (or where the conversion moved them), then fix them and show it passes. Check every directive in `src` and `test/types` the same way
- [ ] 1.6 Confirm Biome reports errors only at the suppression sites of design D7, and `pnpm lint` (ESLint) still gives 0 errors

## 2. P2: Switch to Biome

- [ ] 2.0 Re-run Biome with the Contracts configuration on P2's base. If it reports anything outside the suppression sites of design D7, fix it here first, in a separate commit that ESLint also accepts
- [ ] 2.1 Show the failing checks first: `pnpm why eslint` lists eslint, and `a?.b` added to a file in `src` passes `pnpm lint`
- [ ] 2.2 Add `@biomejs/biome` at the exact version; remove `eslint`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html`, `eslint-plugin-markdown`, `@typescript-eslint/eslint-plugin` and `@typescript-eslint/parser`
- [ ] 2.3 Add `biome.json` (with `formatter.enabled: false`) and `es2018.grit` from design.md Contracts; carry over everything `test/.eslintrc.yml` holds at that time, as complete globals lists per design D10
- [ ] 2.4 `lint-js` becomes `biome lint`; remove `lint-md`
- [ ] 2.5 Convert the 10 suppressions and add the 5 new ones listed in design D7, each with a reason
- [ ] 2.6 Delete `.eslintrc.yml`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml`, `docs/samples/.eslintrc.yml`, `.eslintignore`; remove the `.eslintcache` lines from `.gitignore`
- [ ] 2.6a Remove the dead `eslint-disable-next-line` from `docs/samples/legend/html.md`
- [ ] 2.7 Contributing guide: Biome instead of ESLint; Markdown examples are not linted; do not format whole files until the reformat has landed
- [ ] 2.8 Add the D18 answer to `openspec/changes/migrate-docs-to-vitepress/design.md`
- [ ] 2.9 On a scratch copy, run `biome format --write` and then `biome lint`. Confirm every `biome-ignore` still suppresses its finding and none is reported as unused
- [ ] 2.10 Confirm: `pnpm lint` passes with warnings only (complexity, statement count, `any`); `debugger` in `src` fails it; `a?.[b]` in `src` fails it and `a ?? b` in `docs/.vitepress` does not; `jasmine` in a spec fails it; `triggerMouseEvent` in a fixture passes it; `it.only` in a spec fails it; `a?.b` in `test/types` passes it; a `biome-ignore` without a reason fails it; `pnpm why eslint` is empty for the library package; no new file in `git status` after a run
- [ ] 2.11 CI is green on Ubuntu and Windows

## 3. P3: Guard self-test and dead suppressions

- [ ] 3.1 Show the failing check first: with one pattern of `es2018.grit` broken, `pnpm lint` still passes
- [ ] 3.2 Add the self-test script and its positive and negative samples (outside the lint scope); run it as `lint-es2018`, piping each sample through `biome lint --stdin-file-path=src/…`
- [ ] 3.3 Add the ES2021+ patterns of design D15 (numeric separators, private members, static blocks, `Object.hasOwn`, regexp `d` flag, logical assignment), each with a positive and a negative sample; first find a logical-assignment pattern that matches
- [ ] 3.4 Delete the 32 dead `eslint-disable` comments
- [ ] 3.5 Confirm `pnpm lint` fails with a broken pattern and passes with the real one, on Ubuntu and Windows

## 4. P4: Reformat

- [ ] 4.1 Rebase on master right after a release, announced in advance; set `formatter.enabled: true` in `biome.json`, run `biome format --write`, and commit only these
- [ ] 4.2 Confirm `biome format` reports nothing; `pnpm lint` (including `lint-types` and its API reports under `etc/`), the build and the test suite pass; and on the parent commit, the `enabled` switch plus `biome format --write` reproduce the commit's tree exactly
- [ ] 4.3 Squash-merge as one commit

## 5. P5: Sort imports

- [ ] 5.1 Directly after P4 has merged: set `assist.enabled: true` with only `organizeImports` on in `biome.json`; run `biome check --write --linter-enabled=false`; commit only these
- [ ] 5.2 Confirm the build, `pnpm lint` (including `lint-types` and its API reports) and the test suite pass; confirm the bundles' code is unchanged once comments and whitespace are normalised, as finalize-typescript-conversion Decision 31 compares it, since Rollup emits modules in import order and D3's import graph was read before the conversion; check that the `/** @namespace Chart */` comment in `src/index.umd.ts` still sits on its declaration; and confirm that on the parent commit the switch plus the command reproduce the commit's tree exactly
- [ ] 5.3 Squash-merge as one commit

## 6. P6: Enforce the format

- [ ] 6.1 Show the failing check first: an unformatted file passes `pnpm lint`
- [ ] 6.2 `lint-js` becomes `biome check`; add `format` (`biome format --write`); add `.gitattributes` with `* text=auto eol=lf` (design D14) and confirm `git add --renormalize .` changes nothing
- [ ] 6.3 Add `.git-blame-ignore-revs` with the merge SHAs of P4 and P5 (and a formatter-only catch-up commit's, if one is needed first)
- [ ] 6.4 Contributing guide: `pnpm format`, the Biome editor extension, `git config blame.ignoreRevsFile .git-blame-ignore-revs`, and the rebase recipe of design D9, after testing it on one open pull request's branch
- [ ] 6.5 `MAINTAINING.md`: the patch-branch section of design D12, after testing it by cherry-picking a post-reformat fix onto a branch cut from the last tag
- [ ] 6.6 Confirm `pnpm lint` fails on an unformatted file, the Windows CI job passes, and GitHub's blame for a re-indented line shows the earlier commit
