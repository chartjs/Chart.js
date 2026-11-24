## Context

Measured on master at 53849f16 with Biome 2.6.9 and Node 26. The installed ESLint stack is eslint 8.37, `@typescript-eslint` 5.57, `eslint-config-chartjs` 0.3.0 and `eslint-plugin-es` 4.1. Builders re-measure on their own base.

This is one of three competing designs for leaving ESLint 8: `replace-eslint-with-oxlint` keeps today's style through `@stylistic` running inside oxlint, and an ESLint upgrade keeps ESLint. This design replaces both the linter and the hand-kept style with Biome.

What reads or decides lint behaviour today:

| Where | What |
| --- | --- |
| `package.json` | `lint-js`: `eslint "src/**/*.{js,ts}" "test/**/*.js" "docs/**/*.js" --cache`; `lint-md`: `eslint "**/*.md" --cache`; `lint`: `concurrently "pnpm:lint-*"` (also runs `lint-types`, which stays); `test`: `pnpm lint && pnpm test-ci`; 7 ESLint dev dependencies |
| `.eslintrc.yml` | extends `chartjs`, `plugin:es/restrict-to-es2018`, `plugin:markdown/recommended`; `es.aggressive`; complexity 10 and max-statements 30 (warn); `no-use-before-define` `functions: false`; the TypeScript override |
| `test/.eslintrc.yml` | `env: jasmine`, 5 helper globals, max-statements 50, the Vitest override (12 globals); #12444 adds a `fixtures/**/*.js` override with `triggerMouseEvent` |
| `test/types/.eslintrc.yml` | relaxations; ESLint reaches only `test/types/autogen.js` |
| `docs/samples/.eslintrc.yml` | `no-console` off; affects only Markdown examples |
| `.eslintignore` | `dist/*`, `docs/api/*`, `test/integration/react-browser/*` |
| `.gitignore:43-44` | `.eslintcache` |
| `.github/workflows/ci.yml:64-65` | `pnpm run lint` on Ubuntu and Windows |
| `docs/developers/contributing.md:7,35` | names ESLint |
| `.editorconfig` | 2 spaces, lf, final newline; agrees with the formatter settings below |
| 27 files | 45 `eslint-disable*` comments (`git grep -o eslint-disable \| wc -l`) |
| `openspec/changes/migrate-tests-to-vitest/design.md` | P1, P3 and P12 edit `test/.eslintrc.yml` |
| `openspec/changes/migrate-docs-to-vitepress/design.md` D18 | leaves linting of `.ts` and `.vue` in `docs/.vitepress` to the ESLint migration |

`lint-js` lints 687 files today (src 90, test fixtures 527, specs 55, integration 3, type tests 1, docs scripts 7). Through the `ESLint.lintFiles` API master gives 0 errors and 51 warnings: complexity 21, max-statements 18, `no-explicit-any` 10, unused variables 2. The CLI takes 4.72 s for `lint-js` and 1.47 s for `lint-md` without the cache.

What Biome does, tested:

- It cannot load ESLint plugins. Style is enforced only by its formatter.
- It does not honour `eslint-disable*` comments. Its suppressions are `// biome-ignore <rule>: <reason>`, directly above the node; a missing reason is an error and an unused suppression is a warning.
- It reports nothing for code blocks in Markdown.
- It has no ES-version rules. A GritQL plugin (`plugins` in `biome.json`) can express them; see D5.
- `biome migrate eslint` accepts only JSON configs. On the flattened `--print-config` output it maps most core rules and lists the rest as formatter-covered, nursery, not implemented or unknown (`es/*`).
- The formatter cannot write `function()` without a space (1715 lines change), and always indents `case` labels inside `switch`.
- Override `globals` replace each other instead of merging; rule settings merge. Tested by adding a `test/fixtures/**` override, which made `Chart`, `moment` and `jasmine` undeclared.
- Inside class methods Biome reports `arguments` as undeclared (4 hits), so `arguments` is listed in `globals`.
- With the configuration in Contracts, master gives 27 errors, 106 warnings and 9 infos over 746 files. `biome check` (lint, format check and plugin) takes 0.76–0.85 s.
- ESLint on Biome-formatted source gives 164 errors in 74 files (indentation, function-paren spacing, moved inline disables), so the reformat cannot land while ESLint runs.

## Goals / Non-Goals

**Goals**

- `pnpm lint` runs on Biome, with an equivalent rule set and the same warning classes ESLint gives today.
- One formatter decides the style; `pnpm format` produces it; the reformat stays out of blame.
- The ES2018 guard stays for shipped and test code, and fails loudly if it stops working.
- ESLint and its plugins leave the library package's dependencies.

**Non-Goals**

- Keeping today's style rule by rule (the user chose formatter output).
- Linting Markdown examples.
- Formatting JSON, YAML, CSS or `.vue` (116 more files of churn; partial `.vue` support).
- A config shared with other repositories; `biome.json` is self-contained.
- Type-aware rules.

## Decisions

**D1. Biome lints and formats; today's style is replaced by formatter output** (user decision). *Alternatives:* lint-only with no style checks, rejected because style would drift unchecked; lint now and format later, rejected because the switch and the reformat are already separate pieces (P2, P4) and can be timed apart without a second design.

**D2. Formatter settings are those closest to today's code:** 2 spaces, lf, single quotes, semicolons always, trailing commas none, no spaces inside object braces, arrow parentheses as needed, properties quoted as needed, line width 120. Churn over the files in scope, from `biome format --write` then `git diff --shortstat`:

| Choice | Files | +lines | −lines |
| --- | --- | --- | --- |
| the above, JS/TS scope of Contracts | 629 | 17547 | 13883 |
| the above, scope with JSON and `.vue` | 747 | 22702 | 18619 |
| line width 100 / 140 / 160 | 750 / 750 / 750 | 24524 / 21977 / 21682 | 18866 / 18755 / 18826 |
| trailing commas es5 | 845 | 29636 | 25546 |
| semicolons as needed | 863 | 40752 | 36687 |
| spaces inside object braces | 811 | 24487 | 20380 |

At width 120 the source churn is nearly line-neutral (+2398/−2305 in `src`), and lines over the width in `src` drop from 139 to 67. Some settings follow the maintainer's shared Biome config as hints: indentation, line ending, quotes, the recommended preset, unused imports and variables as errors, and VCS ignore files. Its semicolons as needed, es5 trailing commas and width 100 were not taken, because of the churn above.

**D3. Biome's assist actions stay off.** `useSortedKeys` changes behaviour. It reorders `INTERVALS` in `src/scales/scale.time.js`, and the time scale derives its unit order from `Object.keys(INTERVALS)` (line 31), which `determineUnitForAutoTicks` walks from the smallest unit. It also moves JSDoc comments onto other keys. `organizeImports` was shown safe by reading the import graph: one cycle (`index.ts`, `plugins/index.js`, `plugin.colors.ts`), whose imports are read only inside functions, and one cross-module side-effect site, the UMD entry. Even so, it is not formatter output, so it stays off (open question 10).

**D4. Rule mapping.**
- *Covered by the formatter:* all ESLint layout rules, including `no-unexpected-multiline`, since semicolons are always written. `spaced-comment` and `wrap-regex` are lost.
- *Mapped:* every remaining core and TypeScript rule with a Biome counterpart, through the recommended preset plus the rules listed in Contracts.
- *Turned on although not in the preset:* `noUndeclaredVariables`, `noInvalidUseBeforeDeclaration`, `useBlockStatements`, `useDefaultSwitchClause`, `useCollapsedElseIf`, `useLiteralKeys`, `noDoubleEquals` with `ignoreNull: false`, `noShadow` and others.
- *Stricter rule:* `noShadow` also reports outer bindings declared later, which ESLint skips; this gives 20 renames, done in P1.
- *Complexity:* Biome measures cognitive complexity, a different metric. A threshold of 15 gives 25 warnings, against ESLint's 21 at 10.
- *Nursery rules:* `max-statements`, `accessor-pairs`, `no-caller`, `no-extend-native`, `no-implied-eval`, `no-extra-bind`, `no-useless-call`, `global-require`, `no-process-exit`, `no-path-concat` and `triple-slash-reference` map to nursery rules. They give 0 findings except statement counts (20 warnings against ESLint's 18). They are kept for parity: the ESLint rules they replace also have no findings today, and they guard against regressions. They are reviewed on each Biome upgrade (D8).
- *Added:* `noFocusedTests`, so a stray `fit` cannot skip the suite.

**D5. The ES2018 guard is a GritQL plugin, `es2018.grit`, scoped to `src`, `test` and `docs/scripts`.**
- *Coverage:* all 16 rules of `restrict-to-es2018` are covered; Contracts has the pattern. Positive and negative samples were tested with `biome search`.
- *Limits:* there is no scope analysis, so a local binding named `globalThis` is a false positive and `const {fromEntries} = Object` a false negative. `RegExp` arguments are checked only when they are literals. Regular-expression features are matched as text, so `/\(?<=a\)/` is a false positive.
- *Self-test:* the guard runs inside Biome's plugin API, which can change between versions, so P3 adds a self-test to `pnpm lint`. It pipes a positive and a negative sample through `biome lint --stdin-file-path`.
- *Alternatives:*
  - Lower the syntax with SWC (`target` es2018 in `rollup.config.js`). This changes the shipped bundle, which is a different decision from linting.
  - Drop the guard. Optional chaining would then ship unnoticed: SWC targets ES2022.

**D6. Lost rules**, with no Biome rule, or with a broader one that is left off because it would change about 300 lines of working code:
- *No equivalent:* `no-cond-assign` (Biome's `noAssignInExpressions` also flags `a = o[k] = v`: 83 hits), `no-else-return` (its rule flags `else if`: 9), `no-return-assign` except-parens (33), `no-new-wrappers`, `no-prototype-builtins` (Biome's fix is ES2022 `Object.hasOwn`).
- *Broader rule left off:* `no-shadow-restricted-names` (Biome's flags the public helper `isFinite`: 10), `no-empty` (Biome's also flags empty functions: 46), `one-var` (Biome's forbids `let i, ilen`: 106), `camelcase` (372), `func-names`, `no-iterator`, `no-invalid-regexp` for constructor strings, `no-labels` partly, `callback-return` and `handle-callback-err`.
- *Recommended rules turned off:* `useArrowFunction` (1574 rewrites), `useOptionalChain` (contradicts D5), `noGlobalIsNan` and `noGlobalIsFinite` (`Number.isNaN` coerces differently), `noConfusingVoidType` (public types), `noImplicitAnyLet`, `useIterableCallbackReturn`, `noUnusedFunctionParameters` (base-class stubs keep documented parameters), and `noTsIgnore` in JS (`@ts-ignore` serves checkJs).

**D7. Suppressions are rewritten in the switch.**
- *Converted:* 10 ESLint comments become `biome-ignore` with a reason, and 5 new ones cover findings ESLint did not have (intended fall-through, the ES2019-free `catch (e)`).
- *Fixed in code:* 1 is removed by collapsing `else { if` in `core.scale.js` (P1).
- *Dead:* 32 are dead under Biome (unused parameters, hoisted functions, `prefer-const` in JS, a complexity disable under the limit). P3 deletes them.
- *Timing:* a `biome-ignore` must sit directly above its node, and an `eslint-disable-next-line` must too, so the two cannot be stacked. The conversions therefore land in the switch, not before it.

**D8. Version pin: `@biomejs/biome` at an exact version.** Formatter output, nursery rules and the Grit node names can change between versions, so an upgrade is its own pull request, which carries any formatting delta.

**D9. The reformat is its own piece, squash-merged as one commit.** The commit holds the one-line switch of `formatter.enabled` to `true` and the `biome format --write` output, nothing else. The next piece lists it in `.git-blame-ignore-revs`, because the SHA exists only after the merge. The formatter settings are committed in P2 with `formatter.enabled: false`. Before the reformat, neither `pnpm format` nor an editor's format-on-save can rewrite whole files into a pull request. Formatting is enforced (`biome check`) and `pnpm format` is added only after the reformat, so the switch does not break the open pull requests. (Changed by review: P2 had enabled the formatter and the `format` script, so a contributor formatting between P2 and P4 would have pulled whole-file rewrites into a pull request that the recipe cannot untangle.) Contributors rebase with a recipe in the contributing guide, where R is the reformat commit:

```
git merge R^                      # master just before the reformat; resolve real conflicts
git checkout R -- biome.json      # the formatter enabled, exactly as R has it
pnpm install && pnpm exec biome format --write
git commit -am "style: format with Biome"
git merge -X ours R               # R holds only formatter output and that biome.json
git merge upstream/master && pnpm lint
```

P5 tests the recipe on one open pull request before documenting it.

**D13. Line-anchored directives are made layout-proof before the reformat** (added by review). `@ts-ignore` and `@ts-expect-error` cover only the next line. With the Contracts formatter settings, the reformat moves the guarded expression off that line in two places: `tsc -p test/types` (inside `pnpm lint`) then fails at `src/scales/scale.time.js:489` (TS2345) and at `test/types/extensions/plugin.ts:25` (TS2578, an unused `@ts-expect-error`). Tested by `biome format --write` and then `tsc -p test/types` on 53849f16. P4 may hold only formatter output, so P1 restructures these sites (for example, the sorted keys are assigned to a variable first) so the directive stays on the line the error is reported on. P1 proves it on a scratch copy: format, then `tsc -p test/types` passes. The same holds for `biome-ignore`, which must stay directly above its node, so P2 checks its suppressions on a formatted scratch copy.

**D14. Line endings are pinned to LF in the repository** (added by review). Every tracked file is LF (`git ls-files --eol`), but the Windows CI job checks out with Git's default `core.autocrlf=true`. With `lineEnding: lf`, `biome check` fails on a CRLF checkout (tested with a CRLF file: exit 1). ESLint passes today because `eslint-config-chartjs` turns `linebreak-style` off. P5, which enforces the format, adds `.gitattributes` with `* text=auto eol=lf`. This needs no renormalization, since the index is already LF. *Alternatives:* `lineEnding: auto`, rejected because a CRLF file could then be committed; `core.autocrlf false` in CI only, rejected because it leaves Windows contributors' local `pnpm lint` failing.

**D12. Patch branches for older releases keep ESLint** (added by review). `MAINTAINING.md` cuts a patch branch from an old tag and cherry-picks fixes from master. Such a branch always predates the reformat, and CI does not run on it. A fix cherry-picked across the reformat conflicts on layout. The patch branch's ESLint config also rejects Biome-formatted code (164 errors measured on formatted source). P5 adds a section to `MAINTAINING.md`: cherry-pick, resolve conflicts by keeping the patch branch's layout, and run that branch's own `pnpm lint`. The builder tests this procedure on a branch cut from the last tag before P5 is opened. *Alternative:* backport with `git diff -w`. It is rejected because it does not handle quote or parenthesis changes.

**D10. The approved designs.**
- *migrate-tests-to-vitest:* P2 adds one sentence before its Pieces table: after this change, `test/.eslintrc.yml` means the `test/**` overrides of `biome.json`. It also notes that globals overrides replace each other, so each list is complete. It names the file patterns: Vitest specs are `test/**/*.spec.js`, setup files `test/setup*.js`, and the shared config `test/vitest.shared.js`; every other file under `test/` gets the Karma-side list. A new test file must match exactly one of the two, and the piece that removes Karma removes the Karma-side override with it. (Sharpened by review: a Vitest file named outside these patterns would silently get the Karma globals.) P2 also takes #12444's `triggerMouseEvent` into the Karma-side globals list if #12444 has landed.
- *migrate-docs-to-vitepress:* D18 is answered by open question 5.

**D11. Scope and tooling.**
- *Files:* `src/**/*.{js,ts}`, `test/**/*.{js,cjs,ts}` without `test/integration/react-browser`, `docs/scripts/**/*.js` and `docs/.vitepress/**/*.ts`. Some of these files ESLint never read, so they are now linted and reformatted: the 46 type tests in `test/types`, which ESLint reached only through `autogen.js`; 3 integration `.ts` files; 2 `.cjs` files; and the documentation site.
- *Ignores:* build output and `docs/api` are left out through `.gitignore` (`vcs.useIgnoreFile`).
- *Scripts:* `lint-js` becomes `biome lint` in P2 and `biome check` in P5. `format` is `biome format --write`. `lint-md` goes, and so do `--cache` and the `.eslintcache` line.
- *CI:* no change. Biome's native binaries come as per-platform optional dependencies, so the Windows job is the test.
- *Editor:* no editor folder is added; the contributing guide names the Biome extension.

## Risks / Trade-offs

- **The reformat conflicts with open work.** It touches files in 69 of 76 open pull requests and in the in-flight design branches. Patch cherry-picks across it need the recipe. Mitigation: it lands right after a release and after #12444, announced in advance; the recipe is in the contributing guide.
- **The guard is approximate.** It matches text, not semantics (D5). The self-test catches a broken guard, not a missed alias.
- **Nursery rules are unstable.** They are pinned with the version (D8) and reviewed on upgrade.
- **Weaker checks** than ESLint: the rules in D6 and Markdown examples.
- **Blame is noisier for local `git blame`** unless `blame.ignoreRevsFile` is configured; GitHub honours the file automatically.
- **Patch branches** keep ESLint, and cherry-picks across the reformat are resolved by hand (D12).
- **Against the competing designs:**
  - Speed: Biome is the fastest of the three, at 0.8 s for lint and format against oxlint's 1.5 s (per that design) and ESLint's 6.2 s.
  - API stability: Biome has no alpha plugin API for style.
  - Cost: it loses more rules, rewrites the suppression comments and reformats the tree once.

## Pieces

Sizes are hand-edited changed lines; the lockfile and the mechanical reformat are excluded.

| Piece | Builds | Files | Fails without it | Size | Waits on | Issues |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | `refactor:` code that both ESLint and Biome accept: `useConst` (26), `noShadow` renames (20), one unused import, collapse `core.scale.js:1250` (drops its `no-lonely-if` disable), merge the string literals in `docs/scripts/analyzer.js:41`, `Array.isArray` (4), redundant `'use strict'` (3), one approximate constant, one duplicate test title, 9 infos | about 37 files in `src`, `test`, `docs/scripts`, including `src/scales/scale.time.js` and `test/types/extensions/plugin.ts` for D13; **wide** if the base has new findings | Biome with the Contracts config reports 27 errors; after P1 only the suppression sites remain; ESLint stays at 0 errors; formatting a scratch copy makes `tsc -p test/types` fail (D13) | ~110 | nothing (leave `test/fixtures/**/event-replay.js` to P2 while #12444 is open) | none |
| P2 | `build:` the switch: `biome.json` (formatter settings present, `formatter.enabled: false`), `es2018.grit`, `lint-js` on `biome lint`, `lint-md` removed, dependencies swapped, the 5 ESLint config and ignore files deleted, the 15 suppressions of D7, `.gitignore`, contributing guide, the note in the Vitest design | `package.json`, `pnpm-lock.yaml`, `biome.json`, `es2018.grit`, `.gitignore`, `docs/developers/contributing.md`, `openspec/changes/migrate-tests-to-vitest/design.md`, 14 suppression files; deleted `.eslintrc.yml`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml`, `docs/samples/.eslintrc.yml`, `.eslintignore` | `pnpm why eslint` lists eslint; `a?.b` in `src` passes `pnpm lint` | ~280 edited, ~110 deleted | P1; #12444 (`package.json`, `test/.eslintrc.yml`, contributing guide, Vitest design) | none |
| P3 | `test:` the guard's self-test as `lint-es2018` inside `pnpm lint`; delete the 32 dead `eslint-disable` comments | a script under `scripts/`, 2 sample files outside the lint scope, `package.json`, ~20 files in `src` and `test` | a Grit pattern that stops matching passes `pnpm lint` silently | ~110 | P2 | none |
| P4 | `style:` the reformat: `formatter.enabled: true` and the `biome format --write` output, nothing else | `biome.json`, ~630 files, **wide** | `biome format` reports the files as unformatted | 0 hand-written | P2; #12444 merged; timed by open question 12 | none |
| P5 | `chore:` enforce the format: `lint-js` on `biome check`, `.gitattributes` with LF (D14), the `format` script, `.git-blame-ignore-revs` with P4's merge SHA, the contributing guide's format command, blame setting and rebase recipe, and the patch-branch section of D12 | `package.json`, `.gitattributes`, `.git-blame-ignore-revs`, `docs/developers/contributing.md`, `MAINTAINING.md` | an unformatted file passes `pnpm lint` | ~50 | P4 | none |

P1 can start now. P3 and P4 can be built in parallel after P2; P5 needs P4's merge commit. If code lands unformatted between P4 and P5, P5 first adds a formatter-only commit, also listed in the ignore file.

Every piece leaves master releasable:
- After P1, ESLint is green.
- After P2, Biome lints and the formatter is configured but disabled, so existing code and pull requests pass.
- P4 changes only whitespace and layout.
- P5 enforces the format.

## Contracts

- **P1 → P2:** on P2's base, the configuration below reports errors only at the suppression sites of D7.
- **P2:** the committed `biome.json` is the configuration below with the answers to the open questions applied. Each test file matches exactly one globals override, and each globals list is complete. `pnpm lint` passes with warnings only.
- **P2 → later Vitest pieces:** test lint settings live in the `test/**` overrides of `biome.json`.
- **P3:** a guard that stops matching its positive sample fails `pnpm lint`.
- **P2 → P4:** the formatter settings in `biome.json` are final, and only `formatter.enabled` changes in P4.
- **P4:** a single squash-merged commit containing only that switch and formatter output.
- **P5:** `.git-blame-ignore-revs` holds P4's 40-character merge SHA.

The configuration as P2 commits it. It was measured with `formatter.enabled: true` (27 errors, 106 warnings, 9 infos on 53849f16; a review measured 105 warnings on 5c2cbe21):

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": {"enabled": true, "clientKind": "git", "useIgnoreFile": true},
  "files": {"includes": ["src/**/*.{js,ts}", "test/**/*.{js,cjs,ts}", "docs/scripts/**/*.js", "docs/.vitepress/**/*.ts", "!test/integration/react-browser"]},
  "formatter": {"enabled": false, "indentStyle": "space", "indentWidth": 2, "lineEnding": "lf", "lineWidth": 120},
  "javascript": {
    "formatter": {"quoteStyle": "single", "semicolons": "always", "trailingCommas": "none", "bracketSpacing": false, "arrowParentheses": "asNeeded", "quoteProperties": "asNeeded"},
    "globals": ["arguments"]
  },
  "assist": {"enabled": false},
  "plugins": [{"path": "./es2018.grit", "includes": ["src/**", "test/**", "docs/scripts/**"]}],
  "linter": {"enabled": true, "rules": {
    "preset": "recommended",
    "complexity": {"noArguments": "off", "noCommaOperator": "error", "noDivRegex": "error",
      "noExcessiveCognitiveComplexity": {"level": "warn", "options": {"maxAllowedComplexity": 15}},
      "noUselessStringConcat": "error", "noUselessUndefinedInitialization": "error", "noVoid": "error",
      "useArrowFunction": "off", "useLiteralKeys": "error", "useOptionalChain": "off"},
    "correctness": {"noInvalidUseBeforeDeclaration": "error", "noUndeclaredVariables": "error",
      "noUnusedFunctionParameters": "off", "noUnusedImports": "error", "noUnusedInstantiation": "error",
      "noUnusedVariables": "error", "useParseIntRadix": "error"},
    "security": {"noGlobalEval": "error"},
    "style": {"noMultilineString": "error", "noYodaExpression": "warn", "useBlockStatements": "error",
      "useCollapsedElseIf": "error", "useDefaultSwitchClause": "error", "useExponentiationOperator": "off", "useTemplate": "off"},
    "suspicious": {"noAlert": "error", "noAssignInExpressions": "off", "noConfusingVoidType": "off",
      "noConsole": {"level": "error", "options": {"allow": ["warn", "error"]}},
      "noDoubleEquals": {"level": "error", "options": {"ignoreNull": false}},
      "noEqualsToNull": "error", "noGlobalIsFinite": "off", "noGlobalIsNan": "off", "noImplicitAnyLet": "off",
      "noLoopFunc": "error", "noPrototypeBuiltins": "off", "noProto": "error", "noShadow": "error",
      "noShadowRestrictedNames": "off", "noUnusedExpressions": "error", "noUselessEscapeInString": "error",
      "useGuardForIn": "error", "useIterableCallbackReturn": "off"},
    "nursery": {"noArgumentsCallerOrCallee": "error",
      "noExcessiveStatementsPerFunction": {"level": "warn", "options": {"max": 30}},
      "noExtendNative": "error", "noImpliedEval": "error", "noPathConcat": "error", "noProcessExit": "error",
      "noUselessBind": "error", "noUselessCall": "error", "useAccessorPairs": "error", "useTopLevelRequire": "error"}
  }},
  "overrides": [
    {"includes": ["**/*.js", "**/*.cjs"], "linter": {"rules": {"suspicious": {"noTsIgnore": "off"}}}},
    {"includes": ["**/*.ts"], "linter": {"rules": {
      "complexity": {"noArguments": "error"},
      "style": {"noCommonJs": "error", "noInferrableTypes": "error", "noNamespace": "error", "useAsConstAssertion": "error", "useSpreadOverApply": "error"},
      "suspicious": {"noVar": "error"}, "nursery": {"noTripleSlashReference": "error"}}}},
    {"includes": ["test/**"], "linter": {"rules": {
      "correctness": {"noInnerDeclarations": "off"}, "style": {"useImportType": "off"},
      "suspicious": {"noFocusedTests": "error"},
      "nursery": {"noExcessiveStatementsPerFunction": {"level": "warn", "options": {"max": 50}}}}}},
    {"includes": ["test/**", "!test/**/*.spec.js", "!test/setup*.js", "!test/vitest.shared.js"],
     "javascript": {"globals": ["arguments", "acquireChart", "afterEvent", "Chart", "moment", "waitForResize", "afterAll", "afterEach", "beforeAll", "beforeEach", "describe", "expect", "fail", "fdescribe", "fit", "it", "jasmine", "pending", "spyOn", "spyOnProperty", "xdescribe", "xit"]}},
    {"includes": ["test/**/*.spec.js", "test/setup*.js", "test/vitest.shared.js"],
     "javascript": {"globals": ["arguments", "acquireChart", "afterEvent", "Chart", "moment", "waitForResize", "afterAll", "afterEach", "beforeAll", "beforeEach", "createMockContext", "describe", "expect", "it", "releaseChart", "test", "triggerMouseEvent", "vi"]}},
    {"includes": ["test/types/**"], "linter": {"rules": {
      "correctness": {"noUnusedImports": "off", "noUnusedVariables": "off"},
      "complexity": {"noBannedTypes": "warn"},
      "suspicious": {"noEmptyInterface": "warn", "useAdjacentOverloadSignatures": "warn"}}}}
  ]
}
```

The guard, `es2018.grit`. Each alternative was tested positively and negatively with `biome search`; the assembled file is first run as a plugin in P2:

```
language js
or {
  `?.` as $oc where { register_diagnostic(span = $oc, message = "Optional chaining is ES2020") },
  `$a ?? $b` as $nc where { register_diagnostic(span = $nc, message = "Nullish coalescing is ES2020") },
  JsCatchClause(declaration = .) as $cb where { register_diagnostic(span = $cb, message = "Optional catch binding is ES2019") },
  JsReferenceIdentifier() as $gt where { $gt <: r"globalThis", register_diagnostic(span = $gt, message = "globalThis is ES2020") },
  JsReferenceIdentifier() as $bi where { $bi <: r"BigInt", register_diagnostic(span = $bi, message = "BigInt is ES2020") },
  JsBigintLiteralExpression() as $bl where { register_diagnostic(span = $bl, message = "BigInt literals are ES2020") },
  `Object.fromEntries` as $fe where { register_diagnostic(span = $fe, message = "Object.fromEntries is ES2019") },
  `Promise.allSettled` as $ps where { register_diagnostic(span = $ps, message = "Promise.allSettled is ES2020") },
  JsExportFromClause() as $ns where { $ns <: r"(?s)\*\s*as\b.*", register_diagnostic(span = $ns, message = "export * as ns is ES2020") },
  JsForOfStatement() as $fa where { $fa <: r"(?s)for\s+await\b.*", register_diagnostic(span = $fa, message = "Async iteration is not allowed") },
  JsFunctionDeclaration() as $g1 where { $g1 <: r"(?s)async\s+function\s*\*.*", register_diagnostic(span = $g1, message = "Async generators are not allowed") },
  JsFunctionExpression() as $g2 where { $g2 <: r"(?s)async\s+function\s*\*.*", register_diagnostic(span = $g2, message = "Async generators are not allowed") },
  JsMethodClassMember() as $g3 where { $g3 <: r"(?s)(?:static\s+)?async\s*\*.*", register_diagnostic(span = $g3, message = "Async generators are not allowed") },
  JsMethodObjectMember() as $g4 where { $g4 <: r"(?s)async\s*\*.*", register_diagnostic(span = $g4, message = "Async generators are not allowed") },
  JsRegexLiteralExpression() as $rl where { $rl <: or { r"(?s)/.*\(\?<[=!].*/[a-z]*", r"(?s)/.*\(\?<[A-Za-z_].*/[a-z]*", r"(?s)/.*\x5Ck<.*/[a-z]*", r"(?s)/.*/[a-z]*s[a-z]*", r"(?s)/.*\x5C[pP]\{.*/[a-z]*u[a-z]*" }, register_diagnostic(span = $rl, message = "Lookbehind, named groups, the s flag and unicode property escapes are not allowed") },
  JsNewExpression() as $rn where { $rn <: or { `new RegExp($rp, $...)`, `new RegExp($rp)` }, $rp <: or { r"(?s).*\(\?<[=!].*", r"(?s).*\(\?<[A-Za-z_].*", r"(?s).*\x5C\x5Ck<.*", r"(?s).*\x5C\x5C[pP]\{.*" }, register_diagnostic(span = $rn, message = "RegExp feature newer than ES2017") },
  JsCallExpression() as $rk where { $rk <: or { `RegExp($rq, $...)`, `RegExp($rq)` }, $rq <: or { r"(?s).*\(\?<[=!].*", r"(?s).*\(\?<[A-Za-z_].*", r"(?s).*\x5C\x5Ck<.*", r"(?s).*\x5C\x5C[pP]\{.*" }, register_diagnostic(span = $rk, message = "RegExp feature newer than ES2017") },
  JsNewExpression() as $sn where { $sn <: `new RegExp($s1, $f1)`, $f1 <: r"(?s)[\x27\x22`][a-z]*s[a-z]*[\x27\x22`]", register_diagnostic(span = $sn, message = "The RegExp s flag is not allowed") },
  JsCallExpression() as $sc where { $sc <: `RegExp($s2, $f2)`, $f2 <: r"(?s)[\x27\x22`][a-z]*s[a-z]*[\x27\x22`]", register_diagnostic(span = $sc, message = "The RegExp s flag is not allowed") },
  JsStringLiteralExpression() as $js where { $js <: r"(?s).*[\x{2028}\x{2029}].*", register_diagnostic(span = $js, message = "Raw U+2028/U+2029 in strings is ES2019") },
  JsTemplateExpression(tag = $tt) as $mt where { not $tt <: ., $mt <: or { r"(?s).*\x5Cu[^{0-9a-fA-F].*", r"(?s).*\x5Cu[0-9a-fA-F][0-9a-fA-F]?[0-9a-fA-F]?[^0-9a-fA-F].*", r"(?s).*\x5Cx[0-9a-fA-F]?[^0-9a-fA-F].*", r"(?s).*\x5C[1-9].*" }, register_diagnostic(span = $mt, message = "Malformed escapes in tagged templates are not allowed") }
}
```

Grit pitfalls found while testing: regular expressions with capturing groups match nothing (use `(?:…)`); token fields such as `operator_token` cannot be matched, but the bare `` `?.` `` snippet works; `// biome-ignore lint/plugin: <reason>` suppresses a plugin finding.

## Open Questions

1. **Line width.** 100 (+24524/−18866; 141 long lines left in `src`), 120 (+22702/−18619; 67), 140 or 160 (less churn, more long lines). Recommendation: 120. P2 waits on this.
2. **Trailing commas.** None (D2), es5 (+6.9k more lines, 98 more files), all. Recommendation: none. P2 waits on this.
3. **Semicolons.** Always, or as needed (863 files, +40752/−36687). Recommendation: always. P2 waits on this.
4. **Version pin.** Exact (D8) or caret. Recommendation: exact. P2 waits on this.
5. **Documentation site (`docs/.vitepress`).** Lint and format its `.ts` without the ES guard; lint only; or leave it out. `.vue` stays out either way. Recommendation: `.ts` in. P2 waits on this.
6. **Lost rules (D6).** Accept them, or keep a broader Biome rule and change the code: `noShadowRestrictedNames` (10 renamed imports), `noReturnAssign` (33 rewrites), `noUselessElse` (9), `noEmptyBlockStatements` (46 suppressions). Recommendation: accept. P2 waits on this.
7. **Nursery rules (D4).** Keep the 11 (0 findings, exact pin) or drop them. Recommendation: keep. P2 waits on this.
8. **Complexity threshold.** 10 (70 warnings), 15 (25), 20 (12). Recommendation: 15. P2 waits on this.
9. **ES2021+ syntax.** Unguarded today. Either leave it as it is, or add patterns for numeric separators, private members, static blocks, `Object.hasOwn` and the regexp `d` flag (all tested to match), plus logical assignment (not yet tested). Recommendation: add them in P3, since SWC does not lower them. P3 waits on this.
10. **Import ordering.** Off (D3), or a later `style:` piece that also goes into the ignore file (51 files, +160/−149). Recommendation: off. Nothing waits on this.
11. **Reformat timing.** Right after P2, after #12444, or right after a release. Recommendation: after #12444 and right after a release, announced in advance. P4 waits on this.
12. **Root config files** (`rollup.config.js`, `vitest.config.js`, `karma.conf.cjs`), never linted. Include them or leave them out. Recommendation: leave them out. P2 waits on this.
