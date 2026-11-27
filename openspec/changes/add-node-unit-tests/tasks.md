## 1. Run the DOM-free specs in Node (P1)

- [x] 1.1 Check that `pnpm exec vitest run --project unit` exits 1 on master with `No projects matched the filter "unit"`
- [x] 1.2 Split `vitest.config.js` into the `unit` and `browser` projects, both fed by the `test/specs/**/*.unit.spec.js` glob (Decisions 1 and 3), with the instances named `chromium` and `firefox`
- [x] 1.3 Rename the 14 specs that pass in Node to `*.unit.spec.js`, in a commit of renames only
- [x] 1.4 Add `test/setup.node.js` (Decision 4) and `test/specs/vitest.setup.node.unit.spec.js`
- [x] 1.5 Update the scripts `dev`, `dev:ff` and `fixtures:update`, and add `test-unit` and `dev:unit` (Decision 5)
- [x] 1.6 Add `setup.node.js` to the Vitest-globals override in `test/.eslintrc.yml`
- [x] 1.7 Describe the unit and browser specs in `docs/developers/contributing.md`: the commands, which specs run where, that moving a spec is a rename, what a DOM failure looks like, and no `skipIf(window)`; add the new commands to the sentence that lists the commands the `.tests.js` guard stops
- [x] 1.8 Verify:
  - [x] `pnpm test-unit` runs 15 files in Node with no browser installed
  - [x] `pnpm test-ci-vitest` runs those files once and the rest in both browsers
  - [x] `coverage/vitest/lcov.info` holds hits from both environments
  - [x] `vitest list --filesOnly` shows each spec in exactly one project
  - [x] `acquireChart` in a unit spec fails with the hint
  - [x] `createMockContext` works in a unit spec
  - [x] `pnpm dev` reruns a saved unit spec and a saved browser spec
  - [x] `pnpm run fixtures:update` still writes only from Chromium

## 2. Run core.helpers and helpers.curve in Node (P2)

- [x] 2.1 Check that `pnpm test-unit core.helpers` finds no file
- [x] 2.2 Rename both specs to `*.unit.spec.js` in a commit of renames only, then replace `window.Chart.helpers` with `Chart.helpers` in both
- [x] 2.3 Verify both pass in `pnpm test-unit` and are gone from the browser project

## 3. Run the unit specs on Windows (P3)

- [ ] 3.1 Add a `pnpm run test-unit` step to `.github/workflows/ci.yml` for `runner.os == 'Windows'`, behind the src/test filter
- [ ] 3.2 Verify the Windows job runs the unit specs on the pull request
