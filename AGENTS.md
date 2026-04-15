<!-- crag:auto-start -->
# AGENTS.md

> Generated from governance.md by crag. Regenerate: `crag compile --target agents-md`

## Project: chart.js

Simple HTML5 charts using the canvas element.

## Quality Gates

All changes must pass these checks before commit:

### Lint
1. `npm run lint`
2. `npx tsc --noEmit`
3. `composer validate --strict`

### Test
1. `npm run test`

### Build
1. `npm run build`

### Ci (inferred from workflow)
1. `pnpm run test-ci --browsers chrome,safari`
2. `xvfb-run --auto-servernum pnpm run test-ci`
3. `pnpm run docs`

## Coding Standards

- Stack: node, typescript, php
- Follow project commit conventions

## Architecture

- Type: monolith
- Entry: ./dist/chart.cjs

## Key Directories

- `.github/` — CI/CD
- `docs/` — documentation
- `scripts/` — tooling
- `src/` — source
- `test/` — tests

## Code Style

- Indent: 2 spaces
- Linter: eslint

## Anti-Patterns

Do not:
- Do not leave `console.log` in production code — use a proper logger
- Do not use synchronous filesystem APIs in request handlers
- Do not use `any` type — use `unknown` or proper types instead
- Do not use `@ts-ignore` — fix the type error or use `@ts-expect-error` with a reason
- Prefer `as const` over `enum` for string unions
- Do not use `eval()` or `exec()` with user input
- Do not suppress errors with `@` operator

## Security

- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

## Workflow

1. Read `governance.md` at the start of every session — it is the single source of truth.
2. Run all mandatory quality gates before committing.
3. If a gate fails, fix the issue and re-run only the failed gate.
4. Use the project commit conventions for all changes.

<!-- crag:auto-end -->
