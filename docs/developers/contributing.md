# Contributing

New contributions to the library are welcome, but we ask that you please follow these guidelines:

- Before opening a PR for major additions or changes, please discuss the expected API and/or implementation by [filing an issue](https://github.com/chartjs/Chart.js/issues) or asking about it in the [Chart.js Discord](https://discord.gg/HxEguTK6av) #dev channel. This will save you development time by getting feedback upfront and make reviews faster by giving the maintainers more context and details.
- Consider whether your changes are useful for all users, or if creating a Chart.js [plugin](plugins.md) would be more appropriate.
- Check that your code will pass tests and `eslint` code standards. `pnpm test` will run both the linter and tests for you.
- Add unit tests and document new functionality (in the `test/` and `docs/` directories respectively).
- Avoid breaking changes unless there is an upcoming major release, which is infrequent. We encourage people to write plugins for the most new advanced features, and care a lot about backward compatibility.
- We strongly prefer new methods to be added as private whenever possible. A method can be made private either by making a top-level `function` outside of a class or by prefixing it with `_` and adding `@private` JSDoc if inside a class. Public APIs take considerable time to review and become locked once implemented as we have limited ability to change them without breaking backward compatibility. Private APIs allow the flexibility to address unforeseen cases.

## Joining the project

Active committers and contributors are invited to introduce themselves and request commit access to this project. We have a very active Discord community that you can join [here](https://discord.gg/HxEguTK6av). If you think you can help, we'd love to have you!

## Building and Testing

Firstly, we need to ensure development dependencies are installed. With Node.js (22.12 or later, 24, or 26 and later) and pnpm installed, after cloning the Chart.js repo to a local directory, and navigating to that directory in the command line, we can run the following:

```bash
> pnpm install
> pnpm exec playwright install chromium firefox
```

This will install the local development dependencies for Chart.js, and once, the browsers the specs run in.

The following commands are now available from the repository root:

```bash
> pnpm run build             // build dist files in ./dist
> pnpm run autobuild         // build and watch for source changes
> pnpm run dev               // run the unit specs in Node and the browser specs in Chromium, and watch for source and test changes
> pnpm run dev:ff            // the same with the browser specs in Firefox
> pnpm run dev:unit          // run only the unit specs, in Node, and watch; no browser needed
> pnpm run test-unit         // run the unit specs once, in Node; no browser needed
> pnpm run lint              // lint the code and Markdown (ESLint), check src/**/*.ts with the TypeScript transition flags, then build and check the types (API reports, tsc)
> pnpm test                  // perform code linting and run all tests with coverage
> pnpm run test-ci-vitest    // run the specs once: the unit specs in Node, the browser specs in Chromium and Firefox
> pnpm run test-ci-umd       // run the smoke suite against dist/chart.umd.min.js, in Chromium and Firefox
> pnpm run api-report        // compare the built types in ./dist with the API reports in ./etc
> pnpm api-report --local    // rewrite the API reports in ./etc from the built types
```

The files `etc/chart.js.api.md` and `etc/chart.js-helpers.api.md` record the public types of `chart.js` and `chart.js/helpers`, as [API Extractor](https://api-extractor.com/) reads them from the built `dist/types.d.ts` and `dist/helpers/index.d.ts`. `pnpm run lint` (through `lint-types`) builds, then fails when the built types differ from these reports, and API Extractor leaves the report it generated in `node_modules/.cache/api-extractor/` for comparison. When a change is meant to change the published types, run `pnpm run build`, then `pnpm api-report --local`, and commit the rewritten reports with the change. Their diff is part of the pull request: within a major version it should only add, so a removed member or a type that turns into `any` needs a reason.

The specs, `test/specs/*.spec.js`, run in [Vitest](https://vitest.dev/): the unit specs in Node, and the browser specs in Vitest browser mode, in Chromium and Firefox through Playwright (see [Unit specs and browser specs](#unit-specs-and-browser-specs)). They run against the source in `src/` with no build step and use Vitest's API (`vi.spyOn`, `expect.objectContaining`, ...). The suite no longer offers local Safari or Edge runs, and watch mode no longer stops at the first failing spec; pass `--bail=1` to stop a run after the first failure.

A small smoke suite in `test/umd` checks the built bundle instead of the source: that `dist/chart.umd.min.js` loads, has the whole `Chart` namespace, renders a few of the image fixtures and creates a chart in a web worker (`test/umd/worker.js`). Its config is `vitest.umd.config.js`. It, and the packages in `test/integration`, use the files in `dist`, so run `pnpm run build` before `pnpm test` or `pnpm run test-ci`, and again after changing the source; without a build the smoke suite stops and says so.

The TypeScript packages in `test/integration` compile the published types as a consumer does, with `skipLibCheck` off. `typescript-node` and `typescript-node-next` pin TypeScript 4.7.4, the oldest version the published types support; `typescript-latest` follows the newest TypeScript release. A declaration that needs newer syntax than 4.7 fails the first two.

`pnpm run dev`, `pnpm run dev:ff`, `pnpm run dev:unit`, `pnpm run test-unit` and `pnpm run test-ci-vitest` can be appended with a string that is used to match the spec filenames. For example: `pnpm run dev plugin` will start watch mode for the `*.spec.js` files whose path contains `plugin`, each in the project it belongs to. `pnpm test` takes no such string.

All image-based tests run from the one file `test/specs/fixtures.spec.js`, so a file name does not select them. Filter by test name with `-t` instead. Each fixture test is named after its path under `test/fixtures` without the extension (`scale.time/ticks-round`), in a group named after its top-level directory. `-t` takes a regular expression and runs every test whose full name contains a match, so `-t scale.time` runs `scale.timeseries` too. Include the slash to select one directory: `pnpm run dev fixtures -t "scale\.time/"` runs the fixtures in `test/fixtures/scale.time` and its subdirectories, and `-t "controller\.bar/stacking/"` only those in `test/fixtures/controller.bar/stacking`. End with `$` to select one fixture: `-t "scale\.time/ticks-round$"`.

Vitest runs the tests in a random order and prints the seed it used (`Running tests with seed "..."`). To repeat an order, pass the seed: `pnpm run test-ci-vitest --sequence.seed=<seed>`.

A spec can compare a value with a stored [snapshot](https://vitest.dev/guide/snapshot.html) (`toMatchSnapshot`), kept in `test/specs/__snapshots__`. Chromium and Firefox compare with the same file, so a snapshot holds only values that are equal in both and on every machine: no pixel positions that depend on the width of text. A local run writes a snapshot that is missing; on CI (`CI` set) a missing one fails. When a change is meant to change a snapshot, rewrite it with `pnpm exec vitest run -u --browser.headless test/specs/x.spec.js` and read its diff before committing it.

### Unit specs and browser specs

`vitest.config.js` has two projects, and each spec runs in exactly one of them:

- **Unit specs** are the files named `*.unit.spec.js`. They run in the `unit` project, in Node, with no DOM or canvas, so `pnpm run test-unit` needs no browser installed. Their setup, `test/setup.node.js`, provides `Chart`, the Chart.js matchers (`toEqualOptions`, `toBeCloseToPoint`, ...) and `createMockContext`.
- **Browser specs** are every other `*.spec.js` file. They run in the `browser` project, in Chromium and Firefox, with `test/setup.js`.

The name alone decides, so moving a spec is a rename. A spec that needs nothing of the browser becomes a unit spec with `git mv test/specs/x.spec.js test/specs/x.unit.spec.js`; run `pnpm run test-unit` afterwards. A unit spec that uses the DOM fails, and is not skipped: `window`, `document` or `Image` throw a `ReferenceError` that names them, and `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize` and `triggerMouseEvent` throw `acquireChart needs a browser: rename test/specs/x.unit.spec.js to drop .unit from its name`. Rename such a file back instead of guarding its tests with `it.skipIf(typeof window === 'undefined')`, which would run them nowhere.

### Converting a Jasmine spec

The specs used to run under Karma and Jasmine and were named `test/specs/*.tests.js`. If a branch still has such a file, the main Vitest config (`vitest.config.js`) refuses to start and names the file, so `pnpm test`, `pnpm run test-ci`, `pnpm run test-ci-vitest`, `pnpm run test-unit`, `pnpm run dev`, `pnpm run dev:ff`, `pnpm run dev:unit` and `pnpm run fixtures:update` fail. Rename the file with `git mv test/specs/x.tests.js test/specs/x.spec.js` and replace the Jasmine idioms as in the table below. The globals `Chart`, `moment`, `acquireChart`, `releaseChart`, `afterEvent`, `waitForResize`, `createMockContext` and `triggerMouseEvent` still exist in the browser specs, so a converted spec needs no imports. In the unit specs `moment` does not exist and the chart helpers throw (see [Unit specs and browser specs](#unit-specs-and-browser-specs)).

| Jasmine | Vitest |
| --- | --- |
| `describe('auto', jasmine.fixture.specs('x'))` | delete the line: `test/specs/fixtures.spec.js` runs every fixture |
| `jasmine.triggerMouseEvent(` | `triggerMouseEvent(` |
| `spyOn(o, 'm')` | `vi.spyOn(o, 'm').mockImplementation(() => {})` |
| `spyOn(o, 'm').and.callThrough()` | `vi.spyOn(o, 'm')` |
| `jasmine.createSpy(...)` | `vi.fn()` |
| `jasmine.createSpy(...).and.returnValue(v)` | `vi.fn(() => v)` |
| `.calls.count()` / `.calls.argsFor(i)` / `.calls.first().args` / `.calls.all()` / `.calls.reset()` | `.mock.calls.length` / `.mock.calls[i]` / `.mock.calls[0]` / `.mock.calls` / `.mockClear()` |
| `.calls.mostRecent().args` | `.mock.lastCall` |
| `.calls.first().object` | `.mock.contexts[0]` |
| `.calls.all()[i].object` | `.mock.contexts[i]` |
| `jasmine.objectContaining` / `jasmine.any` | `expect.objectContaining` / `expect.any` |
| `toBeTrue()` / `toBeFalse()` | `toBe(true)` / `toBe(false)` |
| `expect(x).withContext(m)` | `expect(x, m)` |
| `expect(x).withContext(i)` with a number `i` | ``expect(x, `${i}`)`` |
| `function(done)` | an `async` test awaiting a Promise; `done.fail(m)` rejects |
| `fail(m)` | `expect.unreachable(m)` |
| `fail(m)` in a callback that must not run | a flag the callback sets, and `expect(flag, m).toBe(false)` after the wait (a throw from an observer or timer callback is not attributed to the test) |
| `pending()` | `ctx.skip()` |
| `this.x` in hooks and tests | a `let` in the enclosing `describe` |
| `jasmine.addMatchers({...})` | `expect.extend({...})` in that spec |
| `jasmine.clock().withMock(fn)` | `vi.useFakeTimers({toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval']})`, then the body in `try { ... } finally { vi.useRealTimers(); }` (Vitest's default would also fake `requestAnimationFrame` and stall the animations) |
| `jasmine.clock().tick(n)` | `vi.advanceTimersByTime(n)` |
| `toBe(0)` / `toEqual(0)` on a value that can be -0 | `toBeCloseTo(0)` (Vitest's `toBe` and `toEqual` use `Object.is`) |
| `toBeGreaterThan(m)` / `toBeLessThan(m)` and the other comparison matchers given a non-number such as a moment | pass `m.valueOf()` (Vitest requires a number or bigint) |

`toEqual` stays `toEqual`. A spy records the `this` it was called with as passed, so a call with `this` of `undefined` records `undefined`, not `window`.

### Documentation

We use [Vuepress](https://vuepress.vuejs.org/) to manage the docs which are contained as Markdown files in the docs directory. You can run the doc server locally using these commands:

```bash
> pnpm run docs:dev
```

### Image-Based Tests

Some display-related functionality is difficult to test via typical unit tests. For this reason, we introduced image-based tests ([#3988](https://github.com/chartjs/Chart.js/pull/3988) and [#5777](https://github.com/chartjs/Chart.js/pull/5777)) to assert that a chart is drawn pixel-for-pixel matching an expected image.

Generated charts in image-based tests should be **as minimal as possible** and focus only on the tested feature to prevent failure if another feature breaks (e.g. disable the title and legend when testing scales).

Every config file under `test/fixtures` is a test: `test/specs/fixtures.spec.js` finds them all and compares each rendered chart with the PNG of the same name, in Chromium and Firefox. No spec needs a line for it. You can create a new image-based test by following the steps below:

- Create a JS file ([example](https://github.com/chartjs/Chart.js/blob/f7b671006a86201808402c3b6fe2054fe834fd4a/test/fixtures/controller.bubble/radius-scriptable.js)) or JSON file ([example](https://github.com/chartjs/Chart.js/blob/4b421a50bfa17f73ac7aa8db7d077e674dbc148d/test/fixtures/plugin.filler/fill-line-dataset.json)) that defines chart config and generation options. A JS file sets `module.exports`, as the existing ones do; it can use the globals `Chart`, `moment` and `triggerMouseEvent`.
- Add this file in `test/fixtures/{area}/{feature-name}.json` (or `.js`), where `{area}` is an existing directory or a new one.
- Run `pnpm run fixtures:update -t "{area}/{feature-name}$"`. It renders the selected fixtures in Chromium and writes the PNG of each one whose image is missing or differs, printing each file it writes. Without `-t` it does this for every fixture. (`-t` takes a regular expression, as described under [Building and Testing](#building-and-testing); the `$` keeps it from also selecting `{feature-name}-something`.)
- Look at the written `test/fixtures/{area}/{feature-name}.png`: it should show the feature and nothing it does not test, with no tooltip or hover effect.
- Run `pnpm run test-ci-vitest fixtures -t "{area}/{feature-name}$"`: the test should pass in both browsers.
- Verify test relevancy by changing the feature values *slightly* in the config file: the test should then fail.

Only `pnpm run fixtures:update` writes images; every other run compares, and a fixture without a PNG fails with a message naming it. Run the update for a fixture whose image you mean to change, and look at each PNG it rewrites before committing it.

Tests should pass in both browsers. In general, we've hidden all text in image tests since it's quite difficult to get them to pass between different browsers. As a result, it is recommended to hide all scales in image-based tests. It is also recommended to disable animations. If tests still do not pass, adjust `tolerance` (the accepted ratio of differing pixels) and/or `threshold` (how different a pixel must be to count) at the beginning of the config file, keeping them **as low as possible**.

When a test fails, the actual, expected and difference images are logged to the browser console, where the Vitest UI (`pnpm run dev`) shows them. If you'd like to see the images of a test that passes, set `"debug": true` in the config file: the test then always fails and logs them. Remove it before committing.

## Bugs and Issues

Please report these on the GitHub page - at <a href="https://github.com/chartjs/Chart.js" target="_blank">github.com/chartjs/Chart.js</a>. Please do not use issues for support requests. For help using Chart.js, please take a look at the [`chart.js`](https://stackoverflow.com/questions/tagged/chart.js) tag on Stack Overflow.

Well-structured, detailed bug reports are hugely valuable for the project.

Guidelines for reporting bugs:

- Check the issue search to see if it has already been reported
- Isolate the problem to a simple test case
- Please include a demonstration of the bug on a website such as [JS Bin](https://jsbin.com/), [JS Fiddle](https://jsfiddle.net/), or [Codepen](https://codepen.io/pen/). ([Template](https://codepen.io/pen?template=wvezeOq)). If filing a bug against `master`, you may reference the latest code via <https://www.chartjs.org/dist/master/chart.umd.min.js> (changing the filename to point at the file you need as appropriate). Do not rely on these files for production purposes as they may be removed at any time.

Please provide any additional details associated with the bug, if it's browser or screen density specific, or only happens with a certain configuration or data.
