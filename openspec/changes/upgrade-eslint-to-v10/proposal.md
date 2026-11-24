## Why

The repository lints with ESLint 8, which reached end of life in October 2024, together with `@typescript-eslint` 5, the unmaintained `eslint-plugin-es` and an eslintrc-only `eslint-config-chartjs` 0.3.0 from 2022. ESLint 10 keeps the same engine, rules and Markdown support, so upgrading in place keeps every check the repository has today. This change competes with `replace-eslint-with-oxlint`, and the numbers here are measured the same way so the two can be compared (design, Comparison).

## What Changes

- `pnpm lint` runs on ESLint 10 with one flat `eslint.config.js`. It replaces the four `.eslintrc.yml` files and `.eslintignore`.
- The rules of `eslint-config-chartjs` and the repository's overrides are inlined: `@eslint/js` `recommended` plus the chartjs rules, formatting rules through `@stylistic/eslint-plugin`, TypeScript through `typescript-eslint` 8, and the ES2018 guard through `eslint-plugin-es-x` (the same 16 rules as today).
- The style stays the same. The formatting rules now also read TypeScript type syntax that the typescript-eslint 5 rules skipped, so about 50 lines in `src/types` and `src/helpers` are fixed first.
- Markdown code examples stay linted: the same `js` and `ts` fences as today, through `@eslint/markdown`.
- ESLint 10's recommended set adds `no-useless-assignment`, which reports 11 dead assignments. They are removed first, without behaviour change.
- No rule is lost. Four deprecated duplicates give way to the rules that replaced them, and seven newer recommended rules are added.
- The React integration example stops running its own ESLint step, which cannot load ESLint 10.
- Dev dependencies: `eslint` goes from ^8.21 to ^10.15. `@typescript-eslint/eslint-plugin`, `@typescript-eslint/parser`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html` and `eslint-plugin-markdown` leave. `@eslint/js`, `@eslint/markdown`, `@stylistic/eslint-plugin`, `eslint-plugin-es-x`, `globals` and `typescript-eslint` are added.

Nothing under `dist/` and nothing in the published package changes.

## Capabilities

### New Capabilities

- `code-linting`: which files `pnpm lint` checks, which rule families apply where, how a finding fails the command, and how inline suppressions work.

### Modified Capabilities

None.

## Impact

- Contributors: same `pnpm lint` and `--fix`; the cache keeps working. Editor integrations that support flat config keep working. Node 22.23 or newer is needed for `eslint-plugin-es-x` 10.1 (CI runs Node 26).
- Open pull requests that add TypeScript may get new style findings on rebase (for example a type alias without a semicolon); `--fix` handles them.
- The approved `migrate-tests-to-vitest` design names `test/.eslintrc.yml` in later pieces; after the switch, those edits go to the `test/` blocks of `eslint.config.js`.
- CI: the lint step is unchanged (`pnpm run lint`), on Ubuntu and Windows.
