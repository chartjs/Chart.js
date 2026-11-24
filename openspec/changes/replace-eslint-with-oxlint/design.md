## Context

Measured on master at 53849f16 with oxlint 1.95.0, `@stylistic/eslint-plugin` 6.0.1 and `eslint-plugin-es-x` 10.1.0. The installed ESLint stack is eslint 8.37, `@typescript-eslint` 5.57, `eslint-config-chartjs` 0.3.0 and `eslint-plugin-es` 4.1.

What reads or decides lint behaviour today:

| Where | What |
| --- | --- |
| `package.json` | `lint-js`: `eslint "src/**/*.{js,ts}" "test/**/*.js" "docs/**/*.js" --cache`; `lint-md`: `eslint "**/*.md" --cache`; `lint`: `concurrently "pnpm:lint-*"` (also runs `lint-types`, which is `tsc` and stays); `test`: `pnpm lint && pnpm test-ci`; 7 ESLint dev dependencies |
| `.eslintrc.yml` | extends `chartjs`, `plugin:es/restrict-to-es2018`, `plugin:markdown/recommended`; repo rule changes; the TypeScript override with `@typescript-eslint/recommended` |
| `test/.eslintrc.yml` | `env: jasmine`, 5 helper globals, `max-statements` 50, the Vitest-spec override (12 globals) |
| `test/types/.eslintrc.yml` | relaxed rules for type tests; ESLint only reaches `test/types/autogen.js` through it, because the glob is `test/**/*.js` |
| `docs/samples/.eslintrc.yml` | `no-console` off; `docs/samples` has no `.js` file, so it affects only Markdown examples |
| `.eslintignore` | `dist/*`, `test/integration/react-browser/*` |
| `.gitignore:43-44` | `.eslintcache` |
| `.github/workflows/ci.yml:64-65` | `pnpm run lint` on Ubuntu and Windows, Node 26 |
| `docs/developers/contributing.md:7,35` | names ESLint |
| 27 files | 46 `eslint-disable*` comments, all in use except 9 (7 `prefer-const` disables in `.js` files, where the rule is not on, and 2 `no-console` in the TypeScript integration checks) |

No editor configuration, Renovate or lint-staged reads ESLint; Dependabot covers GitHub Actions only.

The effective configuration (`eslint --print-config`): 164 rules for `.js`; `prefer-const` only for `.ts`; 16 `es/` rules from `restrict-to-es2018`; for `.ts`, typescript-eslint switches off 17 core rules that the compiler covers and adds `no-var`, `prefer-const`, `prefer-rest-params`, `prefer-spread` and its own versions of 9 rules. `@typescript-eslint/indent` uses its default `SwitchCase: 1`; core `indent` for `.js` uses `SwitchCase: 0`.

What oxlint does, tested:

- It runs ESLint plugins through `jsPlugins`; `@stylistic` and `es-x` rules report correctly. The schema calls JS plugins "alpha and not subject to semver".
- It has no processor support (`"processor"` in an override is rejected), so Markdown examples cannot be linted.
- It honours `eslint-disable*` comments as written, `@typescript-eslint/` names included: removing the two in `src/platform/platform.base.js` brings up 11 unused-variable findings.
- It reads `.eslintignore` and `.gitignore` by default and needs no cache.
- Its walker skips files whose names look minified (`.min.`, `-min.`, `_min.`); `test/fixtures/scale.timeseries/ticks-reverse-min.js` is never linted.
- With the configuration in Contracts, master gives 170 problems in 1.5 s, against 5.0 s for `lint-js` and 1.8 s for `lint-md`: the same 21 `complexity`, 18 `max-statements` and 10 `no-explicit-any` warnings ESLint gives, 1 unused-variable warning (ESLint gives 2; the second carries a suppression oxlint honours), and the new findings classified in D4.
- oxfmt with the closest settings would reformat 894 files (+27k/−23k lines); see D1.

## Goals / Non-Goals

**Goals**

- `pnpm lint` runs on oxlint and passes on the same code ESLint passes, apart from the listed new findings, which are fixed first.
- The style and the ES2018 guard stay as they are.
- ESLint and its plugins leave the library package's dependencies.

**Non-Goals**

- Changing the style (no formatter, no `list-style`).
- Linting Markdown examples.
- A shared oxlint config for other chartjs repositories.
- Type-aware rules (oxlint-tsgolint).

## Decisions

**D1. Style is checked by `@stylistic/eslint-plugin` inside oxlint** (user decision). The style stays, and the one-time fixes are small. *Alternatives:* oxfmt, rejected because it would reformat 894 files and conflict with every open pull request, and can't express `function()` without a space; dropping style checks, rejected because style drift would go unchecked.

**D2. Markdown examples are no longer linted** (user decision). oxlint has no processors. Today the check gives 0 errors and 5 unused-variable warnings over 280 examples in 119 files. *Alternatives:* a script that extracts examples into temporary files; keeping ESLint for `.md` only, which would leave an end-of-life ESLint, or require ESLint 9 and flat config.

**D3. One `.oxlintrc.json` in this repository** (user decision), with the shared rules copied in. Overrides replace the nested ESLint files. Globs in overrides are relative to the root. *Alternative:* an oxlint config published from `chartjs/eslint-config-chartjs`, which would need a release in another repository first.

**D4. Options are pinned to ESLint 8's behaviour; code changes only where the new checks read syntax ESLint skipped.** Where `@stylistic` or oxlint defaults differ from ESLint 8, the option is set explicitly:

| Option | Why |
| --- | --- |
| `indent` `SwitchCase: 0` for JS, `1` for TS, `flatTernaryExpressions` only for JS | ESLint 8 core default versus typescript-eslint's default; `@stylistic`'s default is 1 everywhere |
| `space-before-function-paren` `catch: "ignore"` | `@stylistic` 6 also checks `catch (`, which ESLint 8 never did |
| `no-unused-vars` `caughtErrors: "none"` | ESLint 8 default; oxlint follows ESLint 9 (`all`) |
| `no-redeclare` `builtinGlobals: false` | oxlint parses the CommonJS integration checks as scripts, which clashed with the `Chart` test global |
| `object-curly-spacing` `TSTypeLiteral`/`TSMappedType: "always"` | ESLint never checked type literals; the code's own convention is spaced (12 findings with "always", 142 with "never"); there is no "ignore" value |
| `env` `es6`, test globals writable | as in the ESLint files; `es6` also declares `Promise`, without which `es-x/no-promise-all-settled` sees nothing (tested) |
| `globals` `Object`, `RegExp`, `globalThis` | the es-x rules for built-ins track references to declared globals; without these three, `Object.fromEntries`, `new RegExp('(?<=a)')`, `RegExp(..., 's')` and `globalThis` pass (tested; found in review) |

The remaining new findings, all fixed in P1 or P3:

| Class | Where | Count | Fix |
| --- | --- | --- | --- |
| `semi` after type aliases | `src/types/*.d.ts`, 6 files in `src/helpers`, `element.point.ts` | 28 lines | P1 |
| unspaced type literals | `helpers.canvas.ts`, `helpers.collection.ts`, `helpers.config.ts`, `index.d.ts`, `layout.d.ts` | 6 lines | P1 |
| `space-infix-ops` in unions | `index.d.ts` 2010-2016 | 7 lines | P1 |
| type tests newly in scope | `test/types/extensions/scale.ts`, `interaction.ts` (errors), `date_adapter.ts`, `options.ts` (warnings) | 4 lines | P1 |
| typescript-eslint 5 indent quirks (return-type literal members, type-argument lists) | `helpers.curve.ts`, `helpers.dom.ts`, `index.d.ts` | 15 lines | P3, because ESLint rejects this fix |
| documentation site newly in scope | 9 files under `docs/.vitepress` | 52 findings, ~29 lines | P2 (D11) |

ESLint gives the same messages before and after the P1 edits (checked with ESLint's `lintText` on the edited text), so P1 can land while ESLint still runs.

**D5. Lost rules.** No oxlint equivalent: `no-dupe-args`, `no-octal`, `no-octal-escape` (parse errors in module code, so nothing is lost); deprecated `no-catch-shadow`, `no-native-reassign`, `no-negated-in-lhs`, `no-new-symbol` are covered by `no-shadow`, `no-global-assign`, `no-unsafe-negation`, `no-new-native-nonconstructor`. Real losses: `consistent-this`, `no-process-exit`, `dot-notation`, `camelcase`, `no-undef-init`; see D11. Two silent differences found in review: oxlint's `es6` environment declares newer globals (`WeakRef`, `AggregateError`, `SharedArrayBuffer`, `Atomics`, `BigInt64Array`), so `no-undef` no longer rejects them as ESLint 8's `es6` did; and oxlint's `no-shadow` does not report TypeScript enum members that share a name with an outer binding (the two enums in `src/types/index.d.ts` have none).

**D6. The ES2018 guard moves from `eslint-plugin-es` to its successor `eslint-plugin-es-x`**, with all 16 rules of `restrict-to-es2018`. SWC targets ES2022 in `rollup.config.js`, so nothing lowers this syntax and the guard protects browser support. The rules are listed once, in an override for `src/**`, `test/**` and `docs/scripts/**`, the files ESLint applied them to; the documentation site, which is not shipped, falls outside it.

**D7. Versions.** The JS plugin API is alpha. `eslint-plugin-es-x` 10.1 declares a required peer `eslint >=10.6`, which pnpm would install. See D11.

**D8. Directives, cache and scripts.** The `eslint-disable*` spelling stays: oxlint honours it, and renaming would touch 27 files, many held by open pull requests. The 9 dead directives stay; they are not part of parity. `--cache` and the `.eslintcache` ignore line go. `lint-js` keeps its name and becomes `oxlint src test docs`; `lint-md` is removed. `ticks-reverse-min.js` stays unlinted; renaming a fixture and its image for the linter is not worth it.

**D9. The approved migrate-tests-to-vitest design.** Its P3 and P12, and the open #12444, edit `test/.eslintrc.yml`. P3 here deletes that file and carries the contents, including what #12444 adds, into the `test/` overrides of `.oxlintrc.json`. The Vitest override matches `test/**/*.spec.js` and `test/setup*.js`, so later Vitest files such as `test/umd/umd.spec.js` and `test/setup.umd.js` get the Vitest globals without a config edit. It also edits the Files cells of that design's P3 and P12 rows and adds one sentence before its Pieces table: after this change, `test/.eslintrc.yml` means the `test/` overrides of `.oxlintrc.json`, whose globs are relative to the root. The VitePress design's P10, which deletes `docs/.vuepress`, then also drops `docs/.vuepress/**` from `ignorePatterns`.

**D10. Review changes.** The design review led to: the three `globals` and a task and scenarios for the built-in checks of the ES2018 guard (the first config missed them); the es-x rules listed once in a scoped override instead of on everywhere and off for the docs site; the wider Vitest glob; P3 re-measuring on its own base; the three nested ESLint files and `.gitignore` moving from P4 into P3. Kept against review advice: `env.es6` (it declares `Promise`, see D4), the TypeScript override's off-list for rules the compiler covers (parity; only `no-redeclare` and `no-undef` change results today) and `jasmine: false` in the Vitest override (it flags Jasmine use in converted specs).

**D11. Answers from the user (2026-11-24).**

- *Documentation site:* `docs/.vitepress` is linted (P2), without the ES2018 guard. Rejected: leaving it unlinted, as ESLint did.
- *Spacing in TypeScript types:* the code is fixed to spaced type literals and spaced `|`, and both are enforced. Rejected: `ignoreTypes` for exact parity.
- *Lost rules:* `typescript/no-this-alias` replaces `consistent-this` and `unicorn/no-process-exit` replaces `no-process-exit`; `dot-notation`, `camelcase` and `no-undef-init` are dropped. Rejected: dropping all five.
- *Pins:* `oxlint` exact (`1.95.0`), `@stylistic/eslint-plugin` `^6.0.1`, `eslint-plugin-es-x` `^10.1.0`. Rejected: all exact, all caret.
- *`eslint` peer of `eslint-plugin-es-x`:* marked optional with `packageExtensions` in `pnpm-workspace.yaml` for `eslint-plugin-es-x` and `eslint-type-tracer`; P3 proves nothing imports it. Rejected: accepting ESLint 10 in the lockfile; dropping es-x.
- *Waiting:* pieces wait only on the maintainer pull requests #12444 and #12484; contributor pull requests rebase.

## Risks / Trade-offs

- **JS plugins are alpha.** An oxlint minor can break `@stylistic` or `es-x`. Mitigation: exact pins and a manual upgrade (no bot updates npm dev dependencies here). If oxlint drops the API, the fallback is dropping style checks (D1).
- **Windows.** CI lints on `windows-latest`; JS plugins were tested on macOS only. The switch pull request's CI is the test.
- **Weaker checks.** Markdown examples, `camelcase`, `dot-notation` and `no-undef-init` are no longer checked.
- **Work landing between P1 and P3.** The counts are measured on 53849f16. Maintainer pieces that land in between (VitePress P4 and later under `docs/.vitepress`, rework-legend P7 and P19 in `src/types/index.d.ts` and a new `plugin.legend.ts`) are checked only by ESLint and can add findings. P3 therefore re-runs the configuration on its own base and fixes what is new.
- **Contributor pull requests.** Open pull requests that add TypeScript may get new findings on rebase (#12386 adds a type alias without a semicolon); `--fix` handles them.
- **Deprecation notices.** `@stylistic` 6 deprecates `object-curly-spacing` and `array-bracket-spacing` in favour of `list-style` and prints two notice lines on every run. Moving to `list-style` changes the style (592 findings in the closest configuration), so the rules stay until `@stylistic` 7.

## Pieces

Sizes are hand-edited changed lines; the lockfile is excluded.

| Piece | Builds | Files | Fails without it | Size | Waits on | Issues |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | `style:` fix the TypeScript type syntax and type-test lines the new checks read and ESLint skips | `src/types/{index,utils,geometric,layout}.d.ts`, `src/helpers/helpers.{canvas,collection,config,config.types,curve,easing}.ts`, `src/elements/element.point.ts`, `test/types/{extensions/scale,interaction,date_adapter,options}.ts` | oxlint with the Contracts config reports 43 errors and 4 warnings in these files; ESLint stays at 0 errors | ~45 | nothing | none |
| P2 | `style:` restyle the documentation site's code | 9 files under `docs/.vitepress` | the Contracts config reports 52 errors there | ~29 | #12484 (`docs/.vitepress/config.ts`) | none |
| P3 | `build:` the switch: `.oxlintrc.json`; `lint-js` on oxlint, `lint-md` removed; dev dependencies swapped; the TypeScript re-indent and any findings new since 53849f16; `test/.eslintrc.yml` carried into the config; the ESLint config files deleted except `.eslintignore`; `.gitignore`; contributing guide; the note in the Vitest design | `.oxlintrc.json`, `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml`, `src/helpers/helpers.{curve,dom}.ts`, `src/types/index.d.ts`, files with new findings (**wide**), `.gitignore`, `docs/developers/contributing.md`, `openspec/changes/migrate-tests-to-vitest/design.md`; deleted: `.eslintrc.yml`, `test/.eslintrc.yml`, `test/types/.eslintrc.yml`, `docs/samples/.eslintrc.yml` | `pnpm why eslint` lists eslint; `type P = {x: number};` in a `.d.ts` passes lint | ~345 edited, ~70 deleted | P1, P2; #12444 (`package.json`, `test/.eslintrc.yml`) | none |
| P4 | `chore:` delete `.eslintignore` | `.eslintignore` | `git ls-files '*eslint*'` lists it | 3, deleted | P3; #12484 (`.eslintignore`) | none |

`.eslintignore` waits for #12484, which edits it; until P4, oxlint still reads it, and its entries are already covered by `ignorePatterns` and `.gitignore`. If #12484 has merged when P3 is built, P3 deletes it too and P4 is dropped.

P1 and P2 can be built in parallel. Contributor pull requests that share `index.d.ts`, `helpers.dom.ts` or the type tests do not order anything (D11); they rebase over one-line edits.

## Contracts

- **P1 → P3:** on 53849f16 with P1 applied, the configuration below reports only the 15 indentation lines of D4 (P3) and, until P2 has landed, the documentation site findings. On P3's own base it may report more (see Risks); P3 fixes them.
- **P3:** the committed `.oxlintrc.json` is the configuration below, with the answers to the open questions applied. If #12444 has landed, the `test/**` overrides also take its additions (`triggerMouseEvent` for `test/fixtures/**/*.js`).
- **P3 → later Vitest pieces:** test lint settings live in the `test/` overrides of `.oxlintrc.json`.
- **P4:** after P3, nothing reads `.eslintignore` except oxlint, whose ignores already cover it.

The configuration, as measured (170 problems on master):

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["eslint", "typescript", "node", "unicorn"],
  "jsPlugins": ["@stylistic/eslint-plugin", "eslint-plugin-es-x"],
  "categories": {"correctness": "off"},
  "env": {"browser": true, "node": true, "es6": true},
  "globals": {"Object": "readonly", "RegExp": "readonly", "globalThis": "readonly"},
  "ignorePatterns": ["test/integration/react-browser/**", "docs/.vuepress/**"],
  "rules": {
    "accessor-pairs": "error", "complexity": ["warn", 10], "constructor-super": "error",
    "curly": ["error", "all"], "default-case": "error", "eqeqeq": "error", "for-direction": "error",
    "func-names": ["error", "never"], "getter-return": "error", "guard-for-in": "error",
    "max-statements": ["warn", 30], "no-alert": "error", "no-async-promise-executor": "error",
    "no-caller": "error", "no-case-declarations": "error", "no-class-assign": "error",
    "no-compare-neg-zero": "error", "no-cond-assign": "error",
    "no-console": ["error", {"allow": ["warn", "error"]}], "no-const-assign": "error",
    "no-constant-condition": "error", "no-control-regex": "error", "no-debugger": "error",
    "no-delete-var": "error", "no-div-regex": "error", "no-dupe-class-members": "error",
    "no-dupe-else-if": "error", "no-dupe-keys": "error", "no-duplicate-case": "error",
    "no-else-return": "error", "no-empty": "error", "no-empty-character-class": "error",
    "no-empty-pattern": "error", "no-eq-null": "error", "no-eval": "error", "no-ex-assign": "error",
    "no-extend-native": "error", "no-extra-bind": "error", "no-extra-boolean-cast": "error",
    "no-fallthrough": "error", "no-func-assign": "error", "no-global-assign": "error",
    "no-implied-eval": "error", "no-import-assign": "error",
    "no-inner-declarations": ["error", "functions"], "no-invalid-regexp": "error",
    "no-irregular-whitespace": "error", "no-iterator": "error", "no-label-var": "error",
    "no-labels": "error", "no-lone-blocks": "error", "no-lonely-if": "error", "no-loop-func": "error",
    "no-loss-of-precision": "error", "no-misleading-character-class": "error", "no-multi-str": "error",
    "no-new": "error", "no-new-func": "error", "no-new-native-nonconstructor": "error",
    "no-new-wrappers": "error", "no-nonoctal-decimal-escape": "error", "no-obj-calls": "error",
    "no-proto": "error", "no-prototype-builtins": "error",
    "no-redeclare": ["error", {"builtinGlobals": false}], "no-regex-spaces": "error",
    "no-return-assign": "error", "no-script-url": "error", "no-self-assign": "error",
    "no-self-compare": "error", "no-sequences": "error", "no-setter-return": "error",
    "no-shadow": "error", "no-shadow-restricted-names": "error", "no-sparse-arrays": "error",
    "no-this-before-super": "error", "no-undef": "error", "no-unexpected-multiline": "error",
    "no-unreachable": "error", "no-unsafe-finally": "error", "no-unsafe-negation": "error",
    "no-unsafe-optional-chaining": "error", "no-unused-expressions": "error",
    "no-unused-labels": "error", "no-unused-vars": ["error", {"caughtErrors": "none"}],
    "no-use-before-define": ["error", {"functions": false}], "no-useless-backreference": "error",
    "no-useless-call": "error", "no-useless-catch": "error", "no-useless-concat": "error",
    "no-useless-escape": "error", "no-void": "error", "no-with": "error",
    "one-var": ["error", {"initialized": "never"}], "radix": "error", "require-yield": "error",
    "use-isnan": "error", "valid-typeof": "error", "yoda": ["warn", "never"],

    "node/callback-return": "error", "node/global-require": "error",
    "node/handle-callback-err": "error", "node/no-path-concat": "error",
    "unicorn/no-process-exit": "error", "typescript/no-this-alias": "error",

    "@stylistic/array-bracket-spacing": ["error", "never"],
    "@stylistic/brace-style": ["error", "1tbs"],
    "@stylistic/comma-dangle": ["error", "only-multiline"],
    "@stylistic/comma-spacing": "error", "@stylistic/comma-style": ["error", "last"],
    "@stylistic/computed-property-spacing": ["error", "never"], "@stylistic/eol-last": "error",
    "@stylistic/indent": ["error", 2, {"flatTernaryExpressions": true, "SwitchCase": 0}],
    "@stylistic/key-spacing": "error", "@stylistic/keyword-spacing": "error",
    "@stylistic/new-parens": "error", "@stylistic/no-extra-parens": ["error", "functions"],
    "@stylistic/no-extra-semi": "error", "@stylistic/no-floating-decimal": "error",
    "@stylistic/no-mixed-spaces-and-tabs": "error",
    "@stylistic/no-multi-spaces": ["error", {"ignoreEOLComments": true}],
    "@stylistic/no-multiple-empty-lines": ["error", {"max": 2}],
    "@stylistic/no-trailing-spaces": "error", "@stylistic/no-whitespace-before-property": "error",
    "@stylistic/object-curly-spacing": ["error", "never", {"overrides": {"TSTypeLiteral": "always", "TSMappedType": "always"}}],
    "@stylistic/one-var-declaration-per-line": "error",
    "@stylistic/quote-props": ["error", "as-needed"],
    "@stylistic/quotes": ["error", "single", {"avoidEscape": true}],
    "@stylistic/semi": ["error", "always"], "@stylistic/semi-spacing": "error",
    "@stylistic/space-before-blocks": ["error", "always"],
    "@stylistic/space-before-function-paren": ["error", {"anonymous": "never", "named": "never", "asyncArrow": "never", "catch": "ignore"}],
    "@stylistic/space-in-parens": ["error", "never"], "@stylistic/space-infix-ops": "error",
    "@stylistic/space-unary-ops": ["error", {"words": true, "nonwords": false}],
    "@stylistic/spaced-comment": ["error", "always"], "@stylistic/switch-colon-spacing": "error",
    "@stylistic/wrap-iife": "error", "@stylistic/wrap-regex": "error"
  },
  "overrides": [
    {
      "files": ["**/*.ts", "**/*.vue"],
      "rules": {
        "constructor-super": "off", "getter-return": "off", "no-const-assign": "off",
        "no-dupe-class-members": "off", "no-dupe-keys": "off", "no-func-assign": "off",
        "no-import-assign": "off", "no-new-native-nonconstructor": "off", "no-obj-calls": "off",
        "no-redeclare": "off", "no-setter-return": "off", "no-this-before-super": "off",
        "no-undef": "off", "no-unreachable": "off", "no-unsafe-negation": "off", "valid-typeof": "off",
        "no-unused-vars": ["warn", {"caughtErrors": "none"}], "no-use-before-define": "error",
        "no-array-constructor": "error", "no-empty-function": "error", "no-var": "error",
        "prefer-const": "error", "prefer-rest-params": "error", "prefer-spread": "error",
        "typescript/adjacent-overload-signatures": "error", "typescript/ban-ts-comment": "error",
        "typescript/ban-types": "error", "typescript/no-empty-interface": "error",
        "typescript/no-explicit-any": "warn", "typescript/no-extra-non-null-assertion": "error",
        "typescript/no-inferrable-types": "error", "typescript/no-misused-new": "error",
        "typescript/no-namespace": "error", "typescript/no-non-null-asserted-optional-chain": "error",
        "typescript/no-non-null-assertion": "warn", "typescript/no-unnecessary-type-constraint": "error",
        "typescript/no-var-requires": "error", "typescript/prefer-as-const": "error",
        "typescript/prefer-namespace-keyword": "error", "typescript/triple-slash-reference": "error",
        "@stylistic/indent": ["error", 2, {"SwitchCase": 1}]
      }
    },
    {
      "files": ["test/**"],
      "env": {"jasmine": true},
      "globals": {"acquireChart": "writable", "afterEvent": "writable", "Chart": "writable", "moment": "writable", "waitForResize": "writable"},
      "rules": {"max-statements": ["warn", 50]}
    },
    {
      "files": ["test/**/*.spec.js", "test/setup*.js", "test/vitest.shared.js"],
      "env": {"jasmine": false},
      "globals": {"afterAll": "readonly", "afterEach": "readonly", "beforeAll": "readonly", "beforeEach": "readonly", "createMockContext": "readonly", "describe": "readonly", "expect": "readonly", "it": "readonly", "releaseChart": "readonly", "test": "readonly", "triggerMouseEvent": "readonly", "vi": "readonly"}
    },
    {
      "files": ["test/types/**"],
      "rules": {
        "no-unused-vars": "off", "@stylistic/object-curly-spacing": ["warn", "always"],
        "typescript/adjacent-overload-signatures": "warn", "typescript/ban-types": "warn",
        "typescript/no-empty-interface": "warn"
      }
    },
    {
      "files": ["src/**", "test/**", "docs/scripts/**"],
      "rules": {
        "es-x/no-async-iteration": "error", "es-x/no-bigint": "error", "es-x/no-export-ns-from": "error",
        "es-x/no-global-this": "error", "es-x/no-json-superset": "error",
        "es-x/no-malformed-template-literals": "error", "es-x/no-nullish-coalescing-operators": "error",
        "es-x/no-object-fromentries": "error", "es-x/no-optional-catch-binding": "error",
        "es-x/no-optional-chaining": "error", "es-x/no-promise-all-settled": "error",
        "es-x/no-regexp-lookbehind-assertions": "error", "es-x/no-regexp-named-capture-groups": "error",
        "es-x/no-regexp-s-flag": "error", "es-x/no-regexp-unicode-property-escapes": "error",
        "es-x/no-regexp-unicode-property-escapes-2019": "error"
      }
    }
  ]
}
```

## Open Questions

None.
