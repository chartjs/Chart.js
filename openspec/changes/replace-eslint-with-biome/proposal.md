## Why

The repository lints with ESLint 8, which reached end of life in October 2024, together with `@typescript-eslint` 5 and the unmaintained `eslint-plugin-es`. This change replaces ESLint with Biome, which lints and formats in one native tool (about 0.8 s for lint plus format check over the whole tree, against 4.7 s plus 1.5 s for the two ESLint runs). It is one of three competing designs, next to `replace-eslint-with-oxlint` and an upgrade to current ESLint. Unlike them, it gives up the hand-kept style for formatter output.

## What Changes

- `pnpm lint` runs Biome instead of ESLint over the library source, the tests (now including the type tests and the integration checks' TypeScript) and the documentation scripts and site. The type check (`lint-types`) stays as it is.
- One self-contained `biome.json` at the root replaces the five ESLint config and ignore files. The rules of `eslint-config-chartjs`, `eslint:recommended` and the TypeScript override are mapped to Biome rules where Biome has them.
- **BREAKING (contributors):** the code style becomes Biome's formatter output. Anonymous functions get a space (`function ()`), `case` labels are indented inside `switch`, and lines wrap at 120 columns. One mechanical reformat commit (about 630 files) applies it, and `.git-blame-ignore-revs` keeps it out of blame. `pnpm format` rewrites a file into that style once the reformat has landed.
- **BREAKING (contributors):** inline suppressions become `// biome-ignore <rule>: <reason>`. `eslint-disable` comments stop working: 11 are converted, 32 dead ones are deleted.
- **BREAKING (contributors):** code examples in Markdown files are no longer linted. `lint-md` goes away.
- The ES2018 syntax guard stays, as a GritQL plugin in the repository instead of `eslint-plugin-es`, with a self-test so a Biome upgrade cannot silently disable it.
- Four ESLint rules are replaced by their broader Biome counterparts, with about 100 lines of code changed to follow them. About 10 rules have no Biome equivalent and are lost (design D6).
- Imports are sorted by Biome in a second mechanical commit after the reformat, also kept out of blame.
- The root config files (`rollup.config.js`, `vitest.config.js`, `karma.conf.cjs`) are linted and formatted for the first time.
- The guard also rejects ES2021+ syntax that the build does not lower, which ESLint never checked.
- `eslint`, `eslint-config-chartjs`, `eslint-plugin-es`, `eslint-plugin-html`, `eslint-plugin-markdown` and both `@typescript-eslint` packages leave the dev dependencies; `@biomejs/biome` is added at an exact version.

Nothing under `dist/` and nothing in the published package changes.

## Capabilities

### New Capabilities

- `code-linting`: which files `pnpm lint` checks, which rule families apply where, the enforced code format, the ES2018 guard, how a finding fails the command, and how inline suppressions work.

### Modified Capabilities

None.

## Impact

- Contributors: `pnpm lint` and a new `pnpm format`; no `.eslintcache`; the Biome editor extension replaces the ESLint one.
- Open pull requests: the reformat touches files in 69 of the 76 open pull requests. The contributing guide gets a rebase recipe (design D9).
- The `migrate-tests-to-vitest` design names `test/.eslintrc.yml` in later pieces; after the switch those edits go to the `test/**` overrides of `biome.json` (design D10). The `migrate-docs-to-vitepress` design's D18 left linting of the site to this change.
- Patch releases cherry-pick from master onto branches cut from old tags (MAINTAINING.md). Those branches keep ESLint, and cherry-picks across the reformat are resolved by hand. `MAINTAINING.md` gets the procedure (design D12).
- CI: the lint step is unchanged (`pnpm run lint`), on Ubuntu and Windows.
