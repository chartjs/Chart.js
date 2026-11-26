## 1. Run the DOM-free specs in Node (P1)

- [ ] 1.1 Check that `pnpm exec vitest run --project unit` exits 1 on master with `No projects matched the filter "unit"`
- [ ] 1.2 Split `vitest.config.js` into the `unit` and `browser` projects, both fed by `unitSpecs` (Decisions 1 and 3), with the instances named `chromium` and `firefox`
- [ ] 1.3 Add the guard that refuses to start when a `unitSpecs` entry names a missing file
- [ ] 1.4 Add `test/setup.node.js` (Decision 4) and `test/specs/vitest.setup.node.spec.js`
- [ ] 1.5 Update the scripts `dev`, `dev:ff` and `fixtures:update`, and add `test-unit` and `dev:unit` (Decision 5)
- [ ] 1.6 Add `setup.node.js` to the Vitest-globals override in `test/.eslintrc.yml`
- [ ] 1.7 Describe the unit and browser specs in `docs/developers/contributing.md`: the commands, which specs run where, how to put a spec on the list, what a DOM failure looks like, and no `skipIf(window)`
- [ ] 1.8 Verify:
  - [ ] `pnpm test-unit` runs 15 files in Node with no browser installed
  - [ ] `pnpm test-ci-vitest` runs those files once and the rest in both browsers
  - [ ] `coverage/vitest/lcov.info` holds hits from both environments
  - [ ] a typo in `unitSpecs` stops the run
  - [ ] `acquireChart` in a unit spec fails with the hint
  - [ ] `pnpm dev` reruns a saved unit spec and a saved browser spec
  - [ ] `pnpm run fixtures:update` still writes only from Chromium

## 2. Run core.helpers and helpers.curve in Node (P2)

- [ ] 2.1 Check that `pnpm test-unit core.helpers` finds no file
- [ ] 2.2 Replace `window.Chart.helpers` with `Chart.helpers` in both specs and add them to `unitSpecs`
- [ ] 2.3 Verify both pass in `pnpm test-unit` and are gone from the browser project

## 3. Run the unit specs on Windows (P3)

- [ ] 3.1 Add a `pnpm run test-unit` step to `.github/workflows/ci.yml` for `runner.os == 'Windows'`, behind the src/test filter
- [ ] 3.2 Verify the Windows job runs the unit specs on the pull request
