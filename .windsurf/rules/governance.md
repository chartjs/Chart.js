---
trigger: always_on
description: Governance rules for chart.js — compiled from governance.md by crag
---

# Windsurf Rules — chart.js

Generated from governance.md by crag. Regenerate: `crag compile --target windsurf`

## Project

Simple HTML5 charts using the canvas element.

**Stack:** node, typescript, php

## Runtimes

node

## Cascade Behavior

When Windsurf's Cascade agent operates on this project:

- **Always read governance.md first.** It is the single source of truth for quality gates and policies.
- **Run all mandatory gates before proposing changes.** Stop on first failure.
- **Respect classifications.** OPTIONAL gates warn but don't block. ADVISORY gates are informational.
- **Respect path scopes.** Gates with a `path:` annotation must run from that directory.
- **No destructive commands.** Never run rm -rf, dd, DROP TABLE, force-push to main, curl|bash, docker system prune.
- - No hardcoded secrets — grep for sk_live, AKIA, password= before commit
- Follow the project commit conventions.

## Quality Gates (run in order)

1. `npm run lint`
2. `npx tsc --noEmit`
3. `composer validate --strict`
4. `npm run test`
5. `npm run build`
6. `pnpm run test-ci --browsers chrome,safari`
7. `xvfb-run --auto-servernum pnpm run test-ci`
8. `pnpm run docs`

## Rules of Engagement

1. **Minimal changes.** Don't rewrite files that weren't asked to change.
2. **No new dependencies** without explicit approval.
3. **Prefer editing** existing files over creating new ones.
4. **Always explain** non-obvious changes in commit messages.
5. **Ask before** destructive operations (delete, rename, migrate schema).

---

**Tool:** crag — https://www.npmjs.com/package/@whitehatd/crag
