## Context

Measured on master at 5c2cbe21 on Node 26 with eslint 10.15.0, `@eslint/js` 10.0.1, `@eslint/markdown` 9.0.0, `@stylistic/eslint-plugin` 6.0.1, `eslint-plugin-es-x` 10.1.0, `globals` 17.14.0 and `typescript-eslint` 8.74.0. The installed ESLint 8 stack is eslint 8.37, `@typescript-eslint` 5.57, `eslint-config-chartjs` 0.3.0, `eslint-plugin-es` 4.1, `eslint-plugin-html` 7.1 and `eslint-plugin-markdown` 3.0.

What reads or decides lint behaviour today:

| Where | What |
| --- | --- |
| `package.json` | `lint-js`: `eslint "src/**/*.{js,ts}" "test/**/*.js" "docs/**/*.js" --cache`; `lint-md`: `eslint "**/*.md" --cache`; `lint`: `concurrently "pnpm:lint-*"` (also `lint-types`, which stays); `test`: `pnpm lint && pnpm test-ci`; 7 ESLint dev dependencies |
| `.eslintrc.yml` | extends `chartjs`, `plugin:es/restrict-to-es2018`, `plugin:markdown/recommended`; `settings.es.aggressive`; plugins `html`, `es`; the repository's rule changes; the `**/*.ts` override with `plugin:@typescript-eslint/recommended` and the `@typescript-eslint/` replacements of `indent`, `no-use-before-define`, `no-shadow`, `space-before-function-paren` |
| `eslint-config-chartjs` 0.3.0 | `eslint:recommended` plus about 150 rule lines, 34 of them formatting rules |
| `test/.eslintrc.yml` | `env: jasmine`, 5 helper globals, `max-statements` 50, the Vitest-spec override (jasmine off, 12 globals) |
| `test/types/.eslintrc.yml` | relaxed rules; reaches only `test/types/autogen.js`, because the glob is `test/**/*.js` |
| `docs/samples/.eslintrc.yml` | `no-console` off; `docs/samples` has no `.js`, so it affects only Markdown examples |
| `.eslintignore` | `dist/*`, `docs/api/*`, `test/integration/react-browser/*` |
| `.gitignore` | `.eslintcache` |
| `.github/workflows/ci.yml` | `pnpm run lint` on Ubuntu and Windows; `pnpm run test-ci`, which includes `test-ci-integration` |
| `test/integration/react-browser` | `react-scripts build`, whose webpack ESLint plugin resolves the workspace root's `eslint` |
| 27 files | 46 `eslint-disable*` comments; 2 are file-wide `@typescript-eslint/ban-types` disables (`src/types/index.d.ts:1`, `src/types/utils.d.ts:1`) |

Baseline on master with ESLint 8: `lint-js` reads 687 files, 0 errors, 51 warnings (21 `complexity`, 18 `max-statements`, 10 `no-explicit-any`, 2 `@typescript-eslint/no-unused-vars`), 6.3 s. `lint-md` reads 168 files, 0 errors, 5 warnings, 1.8 s. Both runs were cold, with no cache.

What ESLint 10 does, tested on master with the configuration in Contracts:

- `lint-js`: 687 files, **83 errors, 58 warnings**, 5.3 s. `lint-md`: 171 files, **2 errors, 5 warnings**, 1.5 s. The 51 + 5 existing warnings are the same; `complexity` stays at 21. The new findings:

| Class | Count | Where | Fix |
| --- | --- | --- | --- |
| `@stylistic/semi` after type aliases | 28 | `src/types/{index,utils,geometric}.d.ts`, `helpers.{canvas,config.types,curve,easing}.ts`, `element.point.ts` | P1, `--fix` |
| `@stylistic/object-curly-spacing` in type literals | 12 (6 lines) + 2 in one `ts` example | `helpers.{canvas,collection,config}.ts`, `index.d.ts`, `layout.d.ts`; `docs/general/data-structures.md:209` | P1, `--fix` |
| `@stylistic/space-infix-ops` in unions | 7 | `index.d.ts:2010-2016` | P1, `--fix` |
| unused `eslint-disable` directives | 7 warnings | 6 `prefer-const` in `.js`, where the rule is off; `no-unused-vars` at `helpers.rtl.ts:37`, which the TypeScript rule reports | P1 |
| `no-useless-assignment` (new in recommended) | 11 | `core.controller.js:357`, `helpers.segment.js:287`, `plugin.colors.ts:39`, `plugin.decimation.js:57,77`, `filler.helper.js:17`, `scale.radialLinear.js:121-122`, three specs | P2 |
| `@stylistic/indent` against typescript-eslint 5's indent quirks | 15 | `helpers.curve.ts`, `helpers.dom.ts`, `index.d.ts` | P3; ESLint 8 rejects this fix |
| unknown rule `@typescript-eslint/ban-types` in a directive | 2 | `index.d.ts:1`, `utils.d.ts:1` | P3, rename |
| `no-empty-object-type`, `no-unsafe-function-type` (what `ban-types` hid) | 6 + 1 | `index.d.ts:3766-3822`, `utils.d.ts:6` | covered by the renamed directives |
| `no-unsafe-declaration-merging` | 1 | `index.d.ts:1420` (`declare class Scale` and `interface Scale`) | P3, directive |

- After `--fix` of the P1 classes, ESLint 8 still passes the edited files, apart from the 15 indentation lines of P3. That was checked by running ESLint 8 over each fixed file.
- Removing the stale directive at `helpers.rtl.ts:37` empties the method body, and `no-empty-function` then fails in both versions. P1 renames the directive to `@typescript-eslint/no-unused-vars` instead.
- `--print-config` for a library `.js` file and a spec gives 167 rules, against 164 on ESLint 8. Removed: `no-catch-shadow`, `no-native-reassign`, `no-negated-in-lhs`, `no-new-symbol`, all deprecated duplicates of rules that stay on (`no-shadow`, `no-global-assign`, `no-unsafe-negation`, `no-new-native-nonconstructor`). Added: `no-new-native-nonconstructor`, `no-constant-binary-expression`, `no-empty-static-block`, `no-unused-private-class-members`, `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error`. For `.ts`, the differences are typescript-eslint 8's own: `ban-types` split into `no-empty-object-type`, `no-unsafe-function-type` and `no-wrapper-object-types`; `no-var-requires` became `no-require-imports`; `no-empty-interface` is covered by `no-empty-object-type`; `no-class-assign` and `no-with` are left to the compiler.
- Behaviour, with temporary files:
  - Optional chaining and `Object.fromEntries` give es-x findings. `globalThis` and `WeakRef` give `no-undef`.
  - `static id = 'bar'` passes.
  - `type P = {x: number}` gives three style findings, and a `Function` type gives `no-unsafe-function-type`.
  - A Vitest spec using `jasmine` gives `no-undef`.
  - In Markdown, a `js` fence with `debugger;` fails, and an undeclared name in it passes. `javascript` and `jsx` fences pass.
  - Files under `.hidden/` and `docs/.vitepress/` are not read.
- `eslint-plugin-markdown` 3 lints only `js` and `ts` fences. `@eslint/markdown` 9 maps `javascript` to `.js` and `typescript` to `.ts`, so it would also lint about 160 `javascript` and `typescript` fences in 39 files. Linted with today's rules (ESLint 8 on the fences relabelled in memory, not on ESLint 10), they give 974 problems: 865 `indent` (the examples use 4 spaces), 24 parse errors on fragments, and others. `--fix` would rewrite 902 lines in 36 files.
- `eslint-plugin-html` does nothing today: no `.html` file is in the globs, and `html` fences are not linted.
- With ESLint 10 at the workspace root, `test/integration/react-browser` fails to build (`[eslint] Invalid Options: Unknown options: extensions, resolvePluginsRelativeTo`). react-scripts 5 resolves the root `eslint`. `DISABLE_ESLINT_PLUGIN=true`, set in the example's `.env`, makes the build pass. Pinning `eslint@^8.57` inside the example fails differently: it then tries to load the root's eslintrc config.
- `pnpm install` gives no new peer warnings for the lint packages. Its one unmet `eslint` peer is react-scripts' plugins inside the React example (which wants `^8`), and that is covered by the item above.
- `@stylistic` 6 prints two deprecation lines per run, for `array-bracket-spacing` and `object-curly-spacing` (it prefers `list-style`).

## Goals / Non-Goals

**Goals**

- `pnpm lint` runs on ESLint 10 and passes on the code ESLint 8 passes, apart from the listed findings, which are fixed first.
- Every check of today stays, Markdown examples and the ES2018 guard included.
- Leave the eslintrc-only and unmaintained packages behind.

**Non-Goals**

- Changing the style (no formatter, no `list-style`).
- Linting more Markdown examples than today (D14.2).
- A shared flat config in `eslint-config-chartjs` (D14.1).
- Linting `docs/.vitepress`, the TypeScript type tests, or `.vue` files (D14.5).
- Type-aware rules.

## Decisions

**D1. One `eslint.config.js` in this repository, with the chartjs rules inlined.** `eslint-config-chartjs` 0.3.0 is eslintrc-only and lives in another repository; a flat config there needs a release first and pays off only when the other chartjs repositories migrate too. *Alternative:* publish it first (D14.1).

**D2. Correctness rules come from `@eslint/js` `recommended` plus the chartjs rules beyond it.** The four deprecated duplicates are dropped for the active rules that replace them. The deprecated Node rules (`callback-return`, `global-require`, `handle-callback-err`, `no-path-concat`, `no-process-exit`) stay core until ESLint 11 removes them. `camelcase`, `dot-notation`, `consistent-this` and `no-undef-init` are frozen, not removed. No rule is lost. *Alternative:* an explicit list without `recommended`, which would keep exact parity but leave out `no-useless-assignment` and the other six additions.

**D3. All 34 formatting rules come from `@stylistic`, for JavaScript and TypeScript alike.** The core formatting rules still exist in ESLint 10 but are deprecated and go in 11. typescript-eslint 8 removed `@typescript-eslint/indent`, `space-before-function-paren` and `no-extra-semi`, so TypeScript needs `@stylistic` anyway. Options are pinned to ESLint 8's behaviour:

| Option | Why |
| --- | --- |
| `indent` `SwitchCase: 0` and `flatTernaryExpressions` for JS, `SwitchCase: 1` for TS | ESLint 8 core default versus typescript-eslint 5's default |
| `space-before-function-paren` `catch: "ignore"` | `@stylistic` 6 also checks `catch (`, which ESLint 8 never did |
| `object-curly-spacing` `always` for type literals and mapped types | the code's own convention for types (12 findings with `always` against 142 with `never`, as measured in the oxlint design) |

*Alternative:* core rules for JS and `@stylistic` for TS only, which ESLint 11 would undo.

**D4. TypeScript uses `typescript-eslint` 8 `recommended`, scoped to `**/*.ts` with `extends`.** ESLint 8's severities are kept: `no-explicit-any`, `no-unused-vars` and `no-non-null-assertion` warn. `adjacent-overload-signatures`, `no-empty-function` and `no-inferrable-types`, which version 8 moved out of `recommended`, are set explicitly. The two `ban-types` directives are renamed to the rules that now report what they suppressed (`no-empty-object-type` in `index.d.ts`, `no-unsafe-function-type` in `utils.d.ts`). The merged `Scale` declaration gets a `no-unsafe-declaration-merging` directive: it is intended, and the rule stays on for new merges.

**D5. The ES2018 guard lists the same 16 `eslint-plugin-es-x` rules that `plugin:es/restrict-to-es2018` enabled, with `aggressive` mode.** es-x's own `restrict-to-es2018` preset would also forbid class fields, which the library already uses 64 times. SWC targets ES2022 in `rollup.config.js`, so nothing lowers this syntax and the guard protects browser support. Flat config with `ecmaVersion: 2022` would declare the ES2016-2021 globals. `AggregateError`, `Atomics`, `BigInt`, `BigInt64Array`, `BigUint64Array`, `FinalizationRegistry`, `globalThis`, `SharedArrayBuffer` and `WeakRef` are set to `off`, so `no-undef` still rejects them as it does today.

**D6. Markdown keeps today's coverage through a wrapper around `@eslint/markdown`'s processor.** Before the processor runs, the wrapper relabels `javascript` and `typescript` fences to a label of the same length that nothing lints, so line numbers stay right and the same fences as today (about 110) are checked. Inside examples, `no-undef`, `no-unused-vars`, `no-unused-expressions` and `eol-last` are off, as `plugin:markdown/recommended` had them. *Alternative:* lint every fence (D14.2).

**D7. ESLint 9 and 10 default changes are set back where fixing is not possible.**
- `no-unused-vars` keeps `caughtErrors: "none"`. The one finding the new default gives, `catch (e)` at `helpers.dom.ts:296`, cannot be fixed, because the guard forbids optional catch binding.
- `no-inner-declarations` keeps `blockScopedFunctions: "disallow"`.
- Unused directives are reported as warnings, which is ESLint 10's default; after P1 there are none.

**D8. `no-useless-assignment` stays on, and its 11 findings are removed in their own piece (P2).** They are dead initial values and increments whose result is never read, and removing them changes no behaviour. *Alternative:* turn the rule off (D14.3).

**D9. Ignores, scripts and cache.**
- `globalIgnores` covers `dist/`, `docs/api/`, `test/integration/react-browser/` and `**/.*/`. The last entry keeps ESLint 8's skip of hidden directories: flat config does not skip them, and this checkout has hundreds of Markdown files under `.claude/`.
- `lint-js`, `lint-md`, `--cache` and the `.eslintcache` ignore line stay.
- `.eslintignore` and the four `.eslintrc.yml` files are deleted.
- `eslint-plugin-html` leaves without replacement.
- `test/types/.eslintrc.yml` gets no block of its own. It reaches only `test/types/autogen.js`, since the `.ts` type tests are not linted, and its only effective rule is `object-curly-spacing: always` for that file's one spaced import. P3 unspaces that import instead (`import {fileURLToPath} from 'url'`); ESLint 8's override would warn on that edit, so it cannot land earlier.

**D10. The React integration example builds without react-scripts' ESLint step.** A one-line `test/integration/react-browser/.env` sets `DISABLE_ESLINT_PLUGIN=true`. react-scripts reads it on every platform, so the script and the dependencies stay as they are. The example checks that Chart.js builds in a React app; its ESLint step lints only the example's few lines with react-scripts' own config. *Alternative:* `eslint@^8` pinned inside the example, which fails because ESLint 8 then finds no eslintrc config of its own.

**D11. Test globals.** Karma specs get `globals.jasmine` and the 5 helpers as writable. Specs that run under Vitest (`test/**/*.spec.js`, `test/setup*.js`, `test/vitest.shared.js`) get the Jasmine globals turned off and the 12 Vitest names as readonly. The glob matches the same 4 files as today's override, and it also covers the Vitest design's later `test/setup.umd.js` without another edit. If #12444 lands first, `test/fixtures/**/*.js` also get `triggerMouseEvent`, as that pull request adds to `test/.eslintrc.yml`.

**D12. The approved migrate-tests-to-vitest design.** Its P3 and P12 edit `test/.eslintrc.yml`. P3 here adds one sentence before its Pieces table, saying that after this change `test/.eslintrc.yml` means the `test/` blocks of `eslint.config.js`.

**D13. What the design review changed.** The architecture, complexity and rule-readers reviews found no failure scenario. Two measured simplifications were taken: the Markdown block drops an unused `plugins` key (the processor is passed as an object, and the result stays 5 warnings), and the `test/types` block goes (D9). A third, applying the Jasmine globals through `ignores` instead of turning them off for Vitest specs, gives the same result but adds a block, so it was not taken. The es-x `flat/restrict-to-es2018` preset was tested in place of the 16 named rules: with the class-field rules off it gives 218 errors, most of them false positives such as `no-iterator-prototype-map` on every `.map(`, which confirms D5. The VitePress design's `.eslintignore` edit (its P4, #12484) has already landed, so deleting the file orders nothing.

**D14. The user's answers to the open questions** (2026-11-24):
1. The chartjs rules are inlined in this repository's `eslint.config.js` (D1). No release of `eslint-config-chartjs` is needed.
2. Markdown examples are linted as today, the `js` and `ts` fences only, through the wrapper (D6). Widening is its own change after the VitePress switch.
3. `no-useless-assignment` stays on, and P2 removes its 11 findings (D8).
4. The React integration example turns off its ESLint step with `DISABLE_ESLINT_PLUGIN=true` in its `.env` (D10).
5. `docs/.vitepress`, the TypeScript type tests and `.vue` files stay unlinted, as ESLint 8 left them; a follow-up after the VitePress switch decides.
6. Dependencies use caret ranges, and `typescript` rises to ^4.8.4.

## Risks / Trade-offs

- **The Markdown wrapper relies on how `@eslint/markdown` maps fence labels to file extensions.** That mapping is an implementation detail, not an API. If a minor version changes it, coverage changes; the wrapper is ten lines and goes away if a later change widens coverage.
- **Node floor.** `eslint-plugin-es-x` 10.1 declares Node `^22.23 || ^24.18 || >=26.4`. CI uses 26; contributors on older Node get an engine warning.
- **ESLint 11** removes the core Node rules (D2). They then move to `eslint-plugin-n` or go.
- **Deprecation notices.** `@stylistic` prints two lines per run, for `array-bracket-spacing` and `object-curly-spacing`. Moving to `list-style` changes the style, so the rule stays until `@stylistic` 7.
- **Contributor pull requests.** Open pull requests that add TypeScript may get new findings on rebase; `--fix` handles the style ones.
- **Windows.** No path-specific configuration; the CI run of P3 on `windows-latest` is the test.

## Comparison

ESLint 10 numbers are measured on 5c2cbe21. The oxlint numbers come from the `replace-eslint-with-oxlint` design (#12486), measured on 53849f16. Biome was not run.

| | ESLint 10 (this design) | oxlint (#12486) | Biome 2 |
| --- | --- | --- | --- |
| Lint time, cold | 5.3 s js + 1.5 s md (ESLint 8: 6.3 s + 1.8 s, same machine) | 1.5 s, no Markdown | not measured |
| Markdown examples | linted, the same `js` and `ts` fences as today | not linted | embedded code analysis exists, off by default; not measured |
| Style kept | yes, `@stylistic` | yes, `@stylistic` through alpha JS plugins | no: the formatter has no option for `function()` without a space; a whole-tree reformat |
| ES2018 guard | yes, es-x | yes, es-x through JS plugins | no equivalent rule |
| Rules lost | none; 4 deprecated duplicates swapped, 7 added | 5 (`consistent-this`, `no-process-exit`, `dot-notation`, `camelcase`, `no-undef-init`), 2 replaced | many; not inventoried |
| Hand-changed lines | ~50 + ~15 + ~190, plus 103 deleted | ~45 + ~29 + ~345, plus ~73 deleted | not measured |
| Dev dependencies | 7 → 7 | 7 → 3, and es-x still asks for an `eslint` peer | 7 → 1 |
| API stability | stable, semver | JS plugins are "alpha and not subject to semver" | stable |
| Other | the React example's ESLint step is turned off (D10) | the React example keeps ESLint 8 | not measured |

## Pieces

Sizes are hand-edited changed lines. The lockfile is excluded.

| Piece | Builds | Files | Fails without it | Size | Waits on | Issues |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | `style:` fix what the new checks read and ESLint 8 accepts: semicolons after type aliases, spaced type literals, spaced unions, the `ts` example in `data-structures.md`; delete the 6 dead `prefer-const` directives; rename the directive at `helpers.rtl.ts:37` to `@typescript-eslint/no-unused-vars` | `src/types/{index,utils,geometric,layout}.d.ts`, `src/helpers/helpers.{canvas,collection,config,config.types,curve,easing,rtl}.ts`, `src/elements/element.point.ts`, `src/core/core.controller.js`, `src/elements/element.line.js`, `src/helpers/helpers.segment.js`, `src/plugins/plugin.tooltip.js`, `src/scales/scale.{linearbase,time}.js`, `docs/general/data-structures.md` | `pnpm exec eslint "src/**/*.{js,ts}" "test/**/*.js" "docs/**/*.js" --report-unused-disable-directives --rule '@typescript-eslint/semi: [error, always]' --rule '@typescript-eslint/space-infix-ops: error'` gives 42 errors on master and 0 after; `pnpm lint-js` stays at 0 errors | ~50 | nothing | none |
| P2 | `refactor:` remove the 11 dead assignments `no-useless-assignment` reports | `src/core/core.controller.js`, `src/helpers/helpers.segment.js`, `src/plugins/plugin.colors.ts`, `src/plugins/plugin.decimation.js`, `src/plugins/plugin.filler/filler.helper.js`, `src/scales/scale.radialLinear.js`, `test/specs/{core.datasetController,core.layouts,scale.time}.tests.js` | `pnpm dlx eslint@10 --no-config-lookup --rule 'no-useless-assignment: error' "src/**/*.js" "test/**/*.js"` gives 10 errors on master and 0 after; `plugin.colors.ts:39` is checked by hand (`return ++i` → `return i + 1`) | ~15 | P1 (`core.controller.js`, `helpers.segment.js`) | none |
| P3 | `build:` the switch: `eslint.config.js`; dev dependencies; the five ESLint 8 files deleted; the 15 TypeScript indentation lines; the two `ban-types` directives renamed and the `Scale` merge directive; the React example without its ESLint step; the note in the Vitest design | `eslint.config.js`, `package.json`, `pnpm-lock.yaml`, `src/helpers/helpers.{curve,dom}.ts`, `src/types/{index,utils}.d.ts`, `test/types/autogen.js`, `test/integration/react-browser/.env`, `openspec/changes/migrate-tests-to-vitest/design.md`; deleted: `.eslintrc.yml`, `.eslintignore`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml`, `docs/samples/.eslintrc.yml` | `pnpm exec eslint --version` prints v8.37.0; `type P = {x: number};` in a `.d.ts` passes lint | ~190 edited, 103 deleted | P1, P2; #12444 (`package.json`, `test/.eslintrc.yml`, the Vitest design) | none |

P1 and P2 share two files, so P2 follows P1. Both are small and can be built back to back. Contributor pull requests that touch `index.d.ts` (15 of them), `helpers.config.ts`, `helpers.dom.ts` and the other P1 and P2 files do not order anything: they rebase over one-line edits.

## Contracts

- **P1 → P3:** after P1, the configuration below reports only the 15 indentation lines, the 2 unknown-rule directives, the `Scale` merge and the P2 findings.
- **P2 → P3:** after P2, `no-useless-assignment` reports nothing.
- **P3:** the committed `eslint.config.js` is the configuration below, as D14 settles it. If #12444 has landed, it also has the `test/fixtures/**/*.js` block of D11. After P3, `pnpm lint` gives 0 errors and 55 warnings: the 50 of `lint-js` after P1 and the 5 of `lint-md`.
- **P3 → later Vitest pieces:** test lint settings live in the `test/` blocks of `eslint.config.js`.

The configuration, as measured. The example is fenced `javascript` so that `lint-md` skips it: it uses `Object.fromEntries`, which the ES2018 guard rejects in `js` examples. `eslint.config.js` itself is outside the lint globs, so the guard does not apply to it.

```javascript
import js from '@eslint/js';
import markdown from '@eslint/markdown';
import stylistic from '@stylistic/eslint-plugin';
import esX from 'eslint-plugin-es-x';
import {defineConfig, globalIgnores} from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const named = (names, value) => Object.fromEntries(names.map((name) => [name, value]));

const newerBuiltIns = named(['AggregateError', 'Atomics', 'BigInt', 'BigInt64Array', 'BigUint64Array',
  'FinalizationRegistry', 'globalThis', 'SharedArrayBuffer', 'WeakRef'], 'off');

const mdProcessor = markdown.processors.markdown;
const skippedFence = /^([ \t>]*(?:`{3,}|~{3,})[ \t]*)(javascript|typescript)\b/gmu;
const markdownJsTs = {
  ...mdProcessor,
  meta: {name: 'markdown-js-ts'},
  preprocess: (text, filename) => mdProcessor.preprocess(
    text.replace(skippedFence, (m, open, lang) => open + 'x'.repeat(lang.length)), filename),
};

export default defineConfig([
  globalIgnores(['dist/', 'docs/api/', 'test/integration/react-browser/', '**/.*/']),
  {files: ['**/*.md'], processor: markdownJsTs},
  {
    plugins: {'@stylistic': stylistic, 'es-x': esX},
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {ecmaFeatures: {impliedStrict: true}},
      globals: {...globals.browser, ...globals.node, ...newerBuiltIns},
    },
    settings: {'es-x': {aggressive: true}},
    rules: {
      ...js.configs.recommended.rules,
      'accessor-pairs': 'error', 'callback-return': 'error', camelcase: 'error',
      complexity: ['warn', 10], 'consistent-this': ['error', 'me'], curly: ['error', 'all'],
      'default-case': 'error', 'dot-notation': 'error', eqeqeq: 'error', 'func-names': ['error', 'never'],
      'global-require': 'error', 'guard-for-in': 'error', 'handle-callback-err': 'error',
      'max-statements': ['warn', 30], 'no-alert': 'error', 'no-caller': 'error',
      'no-console': ['error', {allow: ['warn', 'error']}], 'no-div-regex': 'error', 'no-else-return': 'error',
      'no-eq-null': 'error', 'no-eval': 'error', 'no-extend-native': 'error', 'no-extra-bind': 'error',
      'no-implied-eval': 'error', 'no-inner-declarations': ['error', 'functions', {blockScopedFunctions: 'disallow'}],
      'no-iterator': 'error', 'no-label-var': 'error', 'no-labels': 'error', 'no-lone-blocks': 'error',
      'no-lonely-if': 'error', 'no-loop-func': 'error', 'no-multi-str': 'error', 'no-new': 'error',
      'no-new-func': 'error', 'no-new-wrappers': 'error', 'no-octal-escape': 'error', 'no-path-concat': 'error',
      'no-process-exit': 'error', 'no-proto': 'error', 'no-return-assign': 'error', 'no-script-url': 'error',
      'no-self-compare': 'error', 'no-sequences': 'error', 'no-shadow': 'error', 'no-undef-init': 'error',
      'no-unused-expressions': 'error', 'no-unused-vars': ['error', {caughtErrors: 'none'}],
      'no-use-before-define': ['error', {functions: false}], 'no-useless-call': 'error',
      'no-useless-concat': 'error', 'no-void': 'error', 'one-var': ['error', {initialized: 'never'}],
      radix: 'error', yoda: ['warn', 'never'],
      '@stylistic/array-bracket-spacing': ['error', 'never'], '@stylistic/brace-style': ['error', '1tbs'],
      '@stylistic/comma-dangle': ['error', 'only-multiline'], '@stylistic/comma-spacing': 'error',
      '@stylistic/comma-style': ['error', 'last'], '@stylistic/computed-property-spacing': ['error', 'never'],
      '@stylistic/eol-last': 'error',
      '@stylistic/indent': ['error', 2, {flatTernaryExpressions: true, SwitchCase: 0}],
      '@stylistic/key-spacing': 'error', '@stylistic/keyword-spacing': 'error', '@stylistic/new-parens': 'error',
      '@stylistic/no-extra-parens': ['error', 'functions'], '@stylistic/no-extra-semi': 'error',
      '@stylistic/no-floating-decimal': 'error', '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-multi-spaces': ['error', {ignoreEOLComments: true}],
      '@stylistic/no-multiple-empty-lines': ['error', {max: 2}], '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/object-curly-spacing': ['error', 'never', {overrides: {TSTypeLiteral: 'always', TSMappedType: 'always'}}],
      '@stylistic/one-var-declaration-per-line': 'error', '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/quotes': ['error', 'single', {avoidEscape: true}], '@stylistic/semi': ['error', 'always'],
      '@stylistic/semi-spacing': 'error', '@stylistic/space-before-blocks': ['error', 'always'],
      '@stylistic/space-before-function-paren': ['error', {anonymous: 'never', named: 'never', asyncArrow: 'never', catch: 'ignore'}],
      '@stylistic/space-in-parens': ['error', 'never'], '@stylistic/space-infix-ops': 'error',
      '@stylistic/space-unary-ops': ['error', {words: true, nonwords: false}],
      '@stylistic/spaced-comment': ['error', 'always'], '@stylistic/switch-colon-spacing': 'error',
      '@stylistic/wrap-iife': 'error', '@stylistic/wrap-regex': 'error',
      ...named(['no-async-iteration', 'no-bigint', 'no-export-ns-from', 'no-global-this', 'no-json-superset',
        'no-malformed-template-literals', 'no-nullish-coalescing-operators', 'no-object-fromentries',
        'no-optional-catch-binding', 'no-optional-chaining', 'no-promise-all-settled',
        'no-regexp-lookbehind-assertions', 'no-regexp-named-capture-groups', 'no-regexp-s-flag',
        'no-regexp-unicode-property-escapes', 'no-regexp-unicode-property-escapes-2019'].map((r) => `es-x/${r}`), 'error'),
    },
  },
  {
    files: ['**/*.md/*.js'],
    rules: {'@stylistic/eol-last': 'off', 'no-undef': 'off', 'no-unused-expressions': 'off', 'no-unused-vars': 'off'},
  },
  {files: ['docs/samples/**'], rules: {'no-console': 'off'}},
  {
    files: ['**/*.ts'],
    extends: [tseslint.configs.recommended],
    rules: {
      '@typescript-eslint/adjacent-overload-signatures': 'error', 'no-empty-function': 'off',
      '@typescript-eslint/no-empty-function': 'error', '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn', '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {caughtErrors: 'none'}],
      'no-shadow': 'off', '@typescript-eslint/no-shadow': 'error',
      'no-use-before-define': 'off', '@typescript-eslint/no-use-before-define': 'error',
      '@stylistic/indent': ['error', 2, {SwitchCase: 1}],
    },
  },
  {
    files: ['test/**'],
    languageOptions: {globals: {...globals.jasmine,
      ...named(['acquireChart', 'afterEvent', 'Chart', 'moment', 'waitForResize'], 'writable')}},
    rules: {'max-statements': ['warn', 50]},
  },
  {
    files: ['test/**/*.spec.js', 'test/setup*.js', 'test/vitest.shared.js'],
    languageOptions: {globals: {...named(Object.keys(globals.jasmine), 'off'),
      ...named(['afterAll', 'afterEach', 'beforeAll', 'beforeEach', 'createMockContext', 'describe', 'expect',
        'it', 'releaseChart', 'test', 'triggerMouseEvent', 'vi'], 'readonly')}},
  },
]);
```

## Open Questions

None. The user answered all six (D14).
