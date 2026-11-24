## Why

The repository lints with ESLint 8, which reached end of life in October 2024, together with `@typescript-eslint` 5 and the unmaintained `eslint-plugin-es`. Upgrading would mean moving to flat config and new plugin majors anyway. oxlint runs the same rules natively, and loads the ESLint style and ES-version plugins as JS plugins, at about a third of ESLint's time (1.5 s for the whole tree, against 5.0 s plus 1.8 s for the two ESLint runs).

## What Changes

- `pnpm lint` runs oxlint instead of ESLint over the library source, the tests and the documentation scripts. The type check (`lint-types`) stays as it is.
- One `.oxlintrc.json` at the root replaces the five ESLint config and ignore files. The rules of `eslint-config-chartjs`, `eslint:recommended`, `plugin:es/restrict-to-es2018` and the TypeScript override are copied into it, with options pinned so the code that ESLint accepts today is accepted.
- The current style stays: indentation, quotes, semicolons and spacing are checked by `@stylistic/eslint-plugin`, running inside oxlint.
- The ES2018 syntax guard for library and test code stays, through `eslint-plugin-es-x`.
- **BREAKING (contributors):** code examples in Markdown files are no longer linted (oxlint has no processor support). `lint-md` goes away.
- The style checks now also read TypeScript type syntax that the ESLint 8 core rules skipped. About 45 lines in `src/types` and `src/helpers` are fixed before the switch.
- Files ESLint never read become linted: the type tests and the CommonJS integration checks and the documentation site's TypeScript and Vue code.
- Five rules have no oxlint equivalent and are dropped or replaced (design D5).
- Existing `eslint-disable` comments keep working unchanged.
- `eslint`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html`, `eslint-plugin-markdown` and both `@typescript-eslint` packages leave the dev dependencies. `oxlint`, `@stylistic/eslint-plugin` and `eslint-plugin-es-x` are added.

Nothing under `dist/` and nothing in the published package changes.

## Capabilities

### New Capabilities

- `code-linting`: which files `pnpm lint` checks, which rule families apply where, how a finding fails the command, and how inline suppressions work.

### Modified Capabilities

None.

## Impact

- Contributors: same `pnpm lint` command; no `.eslintcache`; editor ESLint integrations stop working (the oxc editor extension replaces them). Markdown examples are no longer checked.
- Open pull requests that add TypeScript may get new style findings on rebase (for example a type alias without a trailing semicolon).
- The approved `migrate-tests-to-vitest` design names `test/.eslintrc.yml` in later pieces; after the switch those edits go to the `test/` overrides of `.oxlintrc.json` (design D9).
- Risk: oxlint marks JS plugins as alpha and not covered by semver. The versions are pinned (design D7).
- CI: the lint step is unchanged (`pnpm run lint`), on Ubuntu and Windows.
