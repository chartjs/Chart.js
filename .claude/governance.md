# Governance — chart.js
# Inferred by crag analyze — review and adjust as needed

## Identity
- Project: chart.js
- Description: Simple HTML5 charts using the canvas element.
- Stack: node, typescript, php
- Workspace: pnpm

## Gates (run in order, stop on failure)
### Lint
- npm run lint
- npx tsc --noEmit
- composer validate --strict

### Test
- npm run test

### Build
- npm run build

### CI (inferred from workflow)
- pnpm run test-ci --browsers chrome,safari
- xvfb-run --auto-servernum pnpm run test-ci
- pnpm run docs

## Advisories (informational, not enforced)
- actionlint  # [ADVISORY]

## Branch Strategy
- Trunk-based development
- Free-form commits
- Commit trailer: Co-Authored-By: Claude <noreply@anthropic.com>

## Security
- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

## Autonomy
- Auto-commit after gates pass

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

## Dependencies
- Package manager: pnpm (pnpm-lock.yaml)

## Import Conventions
- Module system: ESM

## Anti-Patterns

Do not:
- Do not leave `console.log` in production code — use a proper logger
- Do not use synchronous filesystem APIs in request handlers
- Do not use `any` type — use `unknown` or proper types instead
- Do not use `@ts-ignore` — fix the type error or use `@ts-expect-error` with a reason
- Prefer `as const` over `enum` for string unions
- Do not use `eval()` or `exec()` with user input
- Do not suppress errors with `@` operator

