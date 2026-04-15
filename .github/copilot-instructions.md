<!-- crag:auto-start -->
# Copilot Instructions — chart.js

> Generated from governance.md by crag. Regenerate: `crag compile --target copilot`

Simple HTML5 charts using the canvas element.

**Stack:** node, typescript, php

## Runtimes

node

## Quality Gates

When you propose changes, the following checks must pass before commit:

- **lint**: `npm run lint`
- **lint**: `npx tsc --noEmit`
- **lint**: `composer validate --strict`
- **test**: `npm run test`
- **build**: `npm run build`
- **ci (inferred from workflow)**: `pnpm run test-ci --browsers chrome,safari`
- **ci (inferred from workflow)**: `xvfb-run --auto-servernum pnpm run test-ci`
- **ci (inferred from workflow)**: `pnpm run docs`

## Expectations for AI-Assisted Code

1. **Run gates before suggesting a commit.** If you cannot run them (no shell access), explicitly remind the human to run them.
2. **Respect classifications.** `MANDATORY` gates must pass. `OPTIONAL` gates should pass but may be overridden with a note. `ADVISORY` gates are informational only.
3. **Respect workspace paths.** When a gate is scoped to a subdirectory, run it from that directory.
4. **No hardcoded secrets.** - No hardcoded secrets — grep for sk_live, AKIA, password= before commit
5. Follow project commit conventions.
6. **Conservative changes.** Do not rewrite unrelated files. Do not add new dependencies without explaining why.

## Tool Context

This project uses **crag** (https://www.npmjs.com/package/@whitehatd/crag) as its AI-agent governance layer. The `governance.md` file is the authoritative source. If you have shell access, run `crag check` to verify the infrastructure and `crag diff` to detect drift.

<!-- crag:auto-end -->
