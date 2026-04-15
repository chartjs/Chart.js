<!-- crag:auto-start -->
# GEMINI.md

> Generated from governance.md by crag. Regenerate: `crag compile --target gemini`

## Project Context

- **Name:** chart.js
- **Description:** Simple HTML5 charts using the canvas element.
- **Stack:** node, typescript, php
- **Runtimes:** node

## Rules

### Quality Gates

Run these checks in order before committing any changes:

1. [lint] `npm run lint`
2. [lint] `npx tsc --noEmit`
3. [lint] `composer validate --strict`
4. [test] `npm run test`
5. [build] `npm run build`
6. [ci (inferred from workflow)] `pnpm run test-ci --browsers chrome,safari`
7. [ci (inferred from workflow)] `xvfb-run --auto-servernum pnpm run test-ci`
8. [ci (inferred from workflow)] `pnpm run docs`

### Security

- No hardcoded secrets — grep for sk_live, AKIA, password= before commit

### Workflow

- Follow project commit conventions
- Run quality gates before committing
- Review security implications of all changes

<!-- crag:auto-end -->
