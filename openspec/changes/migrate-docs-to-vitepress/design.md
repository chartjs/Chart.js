## Context

The documentation under `docs/` (138 markdown files, 77 of them samples) is built by VuePress 1.9 with a custom theme. Places that decide how it is built and published:

| Place | What it decides |
| --- | --- |
| `docs/.vuepress/config.ts` (395 lines, 259 of them sidebar) | Plugins, `base` (`/docs/VERSION/`), output `dist/docs`, the `chart.js` alias to `dist/chart.js`, nav, three sidebar trees, the sample imports (`Utils`, `helpers`, `components`). |
| `vuepress-theme-chartjs` 0.2.0 (Vue 2, external) | Turns every fence whose info string matches `/ chart-editor( |$)/` into a live editor; evaluates the code with `Chart` and the configured imports as locals and reads `module.exports.{config,actions,output}`. 100 such fences in 88 files. |
| `@simonbrunel/vuepress-plugin-versions` | The version menu; reads `https://data.jsdelivr.com/v1/package/npm/chart.js` at build and again in the browser. |
| `vuepress-plugin-typedoc` + `typedoc` 0.23 | Generates `docs/api` (ignored by git) from `src/types/index.d.ts`: 11 classes, 112 interfaces, 2 enumerations as pages; 75 type aliases and 28 variables as anchors on the index. |
| `docs/.vuepress/redirects` | Four redirects: `/charts/`, `/general/`, `/samples/`, `/getting-started/v3-migration/`. |
| `markdown-it-include`, `vuepress-plugin-tabs` | `!!!include(...)!!!` in 8 files; `:::: tabs` in 3 files, each tab holding a sample. |
| `scripts/docs-config.sh` | Runs `sed s/VERSION/<tag>/` on `docs/.vuepress/config.ts` before a deploy build. |
| `package.json` scripts `docs`, `docs:dev` | Build the library, then `pnpm --filter "./docs/**" build` with `NODE_OPTIONS=--openssl-legacy-provider`. `files` ships `dist/**` except `dist/docs/**`. |
| `.github/workflows/{ci,deploy-docs,release}.yml` | All call `./scripts/docs-config.sh <version> [release]` and `pnpm run docs`; `ci.yml` builds docs on Ubuntu and Windows when `docs/**` changes. `scripts/deploy-docs.sh` copies `dist/docs` to `chartjs.github.io`. |
| `pnpm-workspace.yaml` | `overrides: html-entities`, and `allowBuilds` entries for `vuepress`, `core-js`, `core-js-pure`, `highlight.js`. |
| `docs/developers/contributing.md:40`, `docs/samples/information.md:5` | The only prose that names VuePress and the dev server port. |

What was checked against VitePress 1.6.4 without building a site: all 138 pages were rendered with VitePress's markdown renderer (with `markdown-it-include` and a `chart-editor` fence rule) and compiled as Vue templates, with no error. Without a fence rule a `chart-editor` fence renders as a plain highlighted code block. The tab pages show literal `::::` text. Seven source lines hold links that VitePress rejects as dead (it fails the build; VuePress only warns). With `anchor.uniqueSlugStartIndex: 2` duplicate headings get the same anchors as today (`#animations-2`). TypeDoc 0.28.20 with TypeScript 6.0 converts `src/types/index.d.ts` to the same 11 / 112 / 2 shape when `skipErrorChecking` is set; without it the root `tsconfig.json` does not check under TypeScript 6. `typedoc-plugin-markdown` 4 names the enumeration directory `enumerations/`, not `enums/`. A full `vitepress build` of these docs has not been run; P2 is where that is proved.

[chartjs-plugin-zoom pull request 972](https://github.com/chartjs/chartjs-plugin-zoom/pull/972) moved that plugin's docs to VitePress 1.6.4 with a local Vue 3 port of the chart editor, a `docs-version.json` written by `docs-config.sh`, and a TypeDoc pipeline. This design follows its choices where they fit; `vitepress-theme-chartjs` is in effect the extraction of its editor.

## Goals / Non-Goals

**Goals**

- The site is built by VitePress 1.6 and nothing of VuePress, Vue 2 or webpack 4 remains in the lockfile.
- Every address that serves a page today keeps working, including heading anchors and API class and interface pages.
- The sample format, the markdown content and the three workflows are not rewritten.
- The docs deploy works after every piece.

**Non-Goals**

- Building `vitepress-theme-chartjs`. It lives in its own repository; this design states the contract.
- A redesign of the home page, a dark scheme, or recreating the VuePress look.
- Fixing the five in-page anchors that are already broken today (`general/options#pointLabel` and others).
- `scripts/sample-redirect-template.html` and the CodeSandbox templates of [#10920](https://github.com/chartjs/Chart.js/issues/10920).
- Moving the test suite (`migrate-tests-to-vitest`) or ESLint.

## Decisions

**D1. VitePress 1.6.4, not 2.0 alpha** (user decision). The published docs do not build on a prerelease. A later move to 2.x is its own small change.

**D2. Default theme with brand colours and logo; light scheme only** (user decision for the theme). Brand `#FF6384` for the site name and accent `#3080D0` mapped to the theme's brand variables. `appearance: false`: Chart.js default tick and grid colours and several samples assume a light page. *Alternative:* recreate today's look in CSS; rejected because it must track VitePress internals.

**D3. The chart editor comes from a new shared package `vitepress-theme-chartjs`** (user decision). It is consumed here and can later serve the plugin repositories. Neither the repository nor the npm package exists yet; `## Contracts` states what this repository needs. Everything except live charts is built before it exists. *Alternatives:* port the editor into this repository (no external wait, no reuse); reuse `@kurkle/astro-chartjs-editor` (Astro-bound today).

**D4. The version menu is a component in this repository** (user decision), in the nav after the site title and in the mobile nav screen, with a build-time list and a refresh in the browser. The current version is taken from the built version, not from `window.location`. Links to other versions carry `target="_self"`, which the VitePress router leaves to the browser, so they load the other site.

**D5. Both sites build side by side until one piece switches the deploy.** VitePress's server bundle resolves `vue` from the docs root, where `docs/package.json` pins Vue 2 for VuePress, so the two cannot share a package. Until VuePress is removed, VitePress's dependencies live in a temporary workspace package at `docs/.vitepress/package.json`, with scripts named `site:build`, `site:dev` and `api` (never `build` or `dev`, so the root `pnpm --filter "./docs/**" build` does not run them), and output in `docs/.vitepress/dist` (never under `dist/`, which `pnpm pack` ships). Root scripts `docs:vitepress` and `docs:vitepress:dev` run it. The config, theme and version marker sit at their final paths from the first piece. *Unproved until P2:* that pnpm accepts a workspace package in a dot directory and that the server bundle then resolves Vue 3. *Fallback:* a sibling `docs-vitepress/` directory with `srcDir: '../docs'`, moved into place at the end. *Alternative:* one large switch pull request; rejected because it cannot be reviewed in pieces and leaves master without a tested site until it lands.

**D6. Markdown content is not rewritten for the move.** `markdown-it-include` stays (it works on VitePress's renderer); `srcExclude: ['**/_*.md']` stops the partials being published as pages. The `:::: tabs` / `::: tab Label` syntax stays and a shim of about 25 lines renders it through the components of `vitepress-plugin-tabs`, because the content must build under both tools until the switch and `docs/charts/doughnut.md` is held by [#12243](https://github.com/chartjs/Chart.js/pull/12243). A last, optional piece converts the three pages and deletes the shim. *Alternative:* convert includes and tabs to VitePress syntax up front; rejected because VuePress would then fail on the same files.

**D7. The seven dead links are fixed first, as their own piece.** They are wrong today (two 404 on the live site) and valid fixes under VuePress.

**D8. API addresses are kept.** `membersWithOwnFile: [Class, Interface, Enum]` keeps type aliases and variables on the index page, as today; the two `api/enums/*.html` addresses get redirect stubs to `api/enumerations/`. TypeDoc runs with `skipErrorChecking` on the root `tsconfig.json` and a docs-only `typescript` `~6.0`, pinned below 7 because TypeDoc 0.28 does not accept it; type checking stays where it is (`lint-types`). *Risk:* the plugin marks `membersWithOwnFile` as being deprecated. *Alternative:* the plugin's default layout, one page per alias; rejected because it breaks `api/#color`-style links.

**D9. Redirects are static stub pages written after the build** (meta refresh, canonical link, and a script that keeps `location.hash`) for the four existing redirects and the two enumeration pages. The site is served from GitHub Pages, which has no server redirects.

**D10. The docs version is a committed marker file.** `docs/.vitepress/docs-version.json` holds `{"version": "master"}`; `scripts/docs-config.sh` keeps its name and arguments and writes the tag there. The workflows therefore need no edit. *Alternative:* an environment variable; rejected because it edits three workflows that open pull requests hold.

**D11. The sample environment is one runtime module** in the theme directory that imports `docs/scripts/{register,utils,helpers,components}.js` and exports `globals = {Chart, Utils, helpers, components}`, loaded only in the browser. A Vite alias maps `chart.js` to `dist/chart.js` (as the webpack alias does), so the samples, the scripts and the date adapter share one Chart.js; `chartjs-adapter-luxon` is excluded from dependency pre-bundling for the same reason (unproved until P10).

**D12. Search is VitePress's local search; code copy is built in.** No account or crawler is needed. *Alternative:* Algolia DocSearch.

**D13. The switch is four small steps.** P11 repoints `pnpm run docs` (about 12 lines, a one-commit revert); P12 deletes the old configuration after one clean deploy; P13 removes the VuePress dependencies and completes [#10583](https://github.com/chartjs/Chart.js/issues/10583), because the issue's reason is the unmaintained dependency and its alerts, which end only when the packages leave the lockfile; P14 folds the temporary package into `docs/package.json` as a refactor.

**D14. One-line hunks in held files do not wait.** `package.json` script lines and `contributing.md` line 40 are merged and the holding pull requests rebase, as `migrate-tests-to-vitest` does. P7 (one step in `ci.yml`) waits for [#12422](https://github.com/chartjs/Chart.js/pull/12422), which rewrites every workflow.

## Risks / Trade-offs

- **External dependency.** P10 and everything after it wait on a package that does not exist. Mitigation: P1 to P9 land without it, and the site without live charts is built in CI.
- **D5 is unproved.** If the dot-directory package fails, P2 uses the fallback and later pieces change paths only.
- **API anchors.** The anchor ids `typedoc-plugin-markdown` 4 writes on the index page were not rendered. A link to an alias anchor may land at the top of the index. P4 checks the 20 in-site links; outside links cannot be checked.
- **Deprecated option.** If `membersWithOwnFile` is removed, the API layout needs redirects for 103 entries or a pinned plugin version.
- **Two sites for a while.** A docs pull request merged during the migration can break only the new build. P7 makes CI catch it; before P7, P11's author reconciles.
- **Sidebar drift.** A page added to the VuePress sidebar after P3 (today [#12386](https://github.com/chartjs/Chart.js/pull/12386)) must also be added to the new sidebar; P11 checks every page is listed.
- **Editing a partial** needs a dev-server restart under `markdown-it-include`.
- **Readers see a new look** at the switch, on master first and on `latest` with the next release.

## Pieces

Lines are hand-written changed lines; the lockfile, generated `docs/api` and binary files are not counted.

| Piece | Builds | Files | Fails without it | Lines | Waits on | [#10583](https://github.com/chartjs/Chart.js/issues/10583) |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | Fix seven links that resolve only by accident | `docs/axes/_common_ticks.md`, `docs/axes/radial/linear.md`, `docs/axes/index.md`, `docs/developers/index.md`, `docs/getting-started/index.md` | the radial axis "Color" link 404s on the live site; a VitePress build reports 7 dead links | ~7 | nothing | advances |
| P2 | A VitePress site beside VuePress: temporary package, config (title, base from the version marker, nav, includes, anchor index, local search, light only, alias, partials excluded), theme entry with brand palette, public files, root `docs:vitepress` scripts. Links under `/api/` are ignored until P4 | `docs/.vitepress/{package.json,config.ts,docs-version.json}`, `docs/.vitepress/theme/{index.ts,styles/palette.css}`, `docs/public/*` (3 binary copies), `pnpm-workspace.yaml`, `.gitignore`, `package.json` | `pnpm run docs:vitepress` does not exist; with it `docs/.vitepress/dist/getting-started/usage.html` exists while `pnpm run docs` still builds the VuePress site | ~190 | P1 | advances |
| P3 | Sidebar: the three trees as path lists, labels read from each page's first heading | `docs/.vitepress/sidebar.ts`, `docs/.vitepress/config.ts` | pages have no sidebar; a script in the pull request finds every non-partial page in it | ~200 | P2 | advances |
| P4 | API reference: TypeDoc pipeline and generated sidebar; the `/api/` link exemption removed | `docs/typedoc.json`, `docs/.vitepress/package.json`, `docs/.vitepress/config.ts` | `api/classes/Chart.html` is missing; the 20 guide links into `api/` are dead | ~60 | P3 (same file) | advances |
| P5 | Redirect stubs for the four old directories and the two `api/enums` pages | `docs/.vitepress/redirects.ts`, `docs/.vitepress/config.ts` | `charts/index.html` and `api/enums/UpdateModeEnum.html` are absent from the output | ~50 | P4 (same file; enumeration targets) | advances |
| P6 | Version menu with build-time list and browser refresh | `docs/.vitepress/theme/{VersionMenu.vue,versions.ts,versions.data.ts,index.ts}` | built for master the nav has no menu titled "Development (master)" | ~230 | P2 | advances |
| P7 | CI builds the VitePress site when docs change | `.github/workflows/ci.yml` | a pull request that breaks only the new build passes CI | ~6 | P2, [#12422](https://github.com/chartjs/Chart.js/pull/12422) | advances |
| P8 | `docs-config.sh` also writes the version marker | `scripts/docs-config.sh` | after `./scripts/docs-config.sh 4.6.1 release` the VitePress build still has base `/docs/master/` | ~3 | P2 | advances |
| P9 | Tabs: plugin components and the shim for the current syntax | `docs/.vitepress/markdown/legacy-tabs.ts`, `docs/.vitepress/{config.ts,package.json}`, `docs/.vitepress/theme/index.ts` | `charts/doughnut.html` shows literal `::::` text | ~50 | P5, P6 (same files) | advances |
| P10 | Live samples: the package, its fence plugin, the runtime module, adapter excluded from pre-bundling | `docs/.vitepress/{package.json,config.ts}`, `docs/.vitepress/theme/{index.ts,chart-runtime.ts,styles/palette.css}` | sample pages show code but no chart; checked on a bar sample, a time-scale sample, the HTML legend sample and a tabbed sample, in build and in dev | ~70 | P9; **first release of `vitepress-theme-chartjs`** | advances |
| P11 | The switch: `pnpm run docs` and `docs:dev` build VitePress into `dist/docs`; temporary root scripts removed; sidebar reconciled; command and port on the samples page | `package.json`, `docs/.vitepress/{config.ts,sidebar.ts}`, `.gitignore`, `docs/samples/information.md` | after `./scripts/docs-config.sh master && pnpm run docs`, `dist/docs` is VuePress output | ~12 | P3 to P10 | advances |
| P12 | Delete the VuePress configuration and stop rewriting it | `docs/.vuepress/config.ts` (deleted), `scripts/docs-config.sh` | a dead 395-line configuration that pull requests keep editing | 396, deletion | P11 and one clean master deploy; [#12386](https://github.com/chartjs/Chart.js/pull/12386) | advances |
| P13 | Remove VuePress: dependencies and scripts, stylus, redirects file, old public directory, workspace override and build allowances, ignore entry, the contributor sentence | `docs/package.json`, `docs/.vuepress/**` (deleted), `pnpm-workspace.yaml`, `.gitignore`, `docs/developers/contributing.md` | `pnpm why vuepress` still lists it | ~45 | P12 | **completes** |
| P14 | Refactor: fold the temporary package into `docs/package.json`; no behaviour change | `docs/package.json`, `docs/.vitepress/package.json` (deleted), `pnpm-workspace.yaml`, `package.json` | two packages for one site; the output of `pnpm run docs` is the same before and after | ~40 | P13 | follow-up |
| P15 | Optional: tabs in the plugin's own syntax; shim deleted | `docs/charts/doughnut.md`, `docs/configuration/animations.md`, `docs/configuration/canvas-background.md`, `docs/.vitepress/markdown/legacy-tabs.ts` (deleted), `docs/.vitepress/config.ts` | the shim stays for good | ~45 | P13; [#12243](https://github.com/chartjs/Chart.js/pull/12243) | follow-up |

**Parallel.** P1 can start now. After P2: P3, P6, P7 and P8 share no hand-edited file. P3, P4, P5 are serial on `config.ts`. P9 follows P5 and P6. P10 to P14 are serial. Everything up to P9 lands before the package exists.

**Held by open pull requests.** P7 by [#12422](https://github.com/chartjs/Chart.js/pull/12422) (also [#12315](https://github.com/chartjs/Chart.js/pull/12315), [#12392](https://github.com/chartjs/Chart.js/pull/12392), [#12305](https://github.com/chartjs/Chart.js/pull/12305) on the same file). P12 by [#12386](https://github.com/chartjs/Chart.js/pull/12386). P15 by [#12243](https://github.com/chartjs/Chart.js/pull/12243). `docs/package.json` is touched by [#12351](https://github.com/chartjs/Chart.js/pull/12351), which closes itself when `markdown-it` leaves that file in P13. `docs/developers/contributing.md` is also edited by `migrate-tests-to-vitest` ([#12423](https://github.com/chartjs/Chart.js/pull/12423)) in other sections.

## Contracts

**Between pieces**

- P2 to all: `pnpm run docs:vitepress` builds into `docs/.vitepress/dist`; the config reads `docs/.vitepress/docs-version.json`; the theme entry extends the default theme; the temporary package owns the dependencies.
- P4 to P5: enumeration pages are at `api/enumerations/<Name>.html`.
- P8 to P11: `scripts/docs-config.sh <version> [release]` leaves the right tag in the version marker, so the workflows do not change.
- P9 to P10: tab content goes through the normal fence rule, so samples inside tabs need nothing extra.
- P11 to P12 and P13: nothing invokes VuePress.

**What this repository needs from `vitepress-theme-chartjs`**

The names are proposals (see Open Questions); the behaviour is required. A reference implementation is the editor under `docs/.vitepress/` of chartjs-plugin-zoom.

- Entry points (ESM, shipped compiled so they work when Vite leaves the package external in the server build):
  - `vitepress-theme-chartjs/markdown`: `chartEditor(md)`, a markdown-it plugin.
  - `vitepress-theme-chartjs`: the `ChartEditor` component and an installer, `app.use(chartEditorPlugin, options)`, that registers it globally.
  - `vitepress-theme-chartjs/style.css`, imported by the consumer; the JavaScript entries import no CSS.
- Options:
  ```ts
  interface ChartEditorOptions {
    // Called once, in the browser only, before the first sample runs.
    runtime: () => Promise<{
      globals: Record<string, unknown>   // must contain Chart; here Chart, Utils, helpers, components
      createChart?: (canvas: HTMLCanvasElement, config: object) => unknown  // default: new globals.Chart(canvas, config)
    }>
    // Source link: https://github.com/{repo}/blob/{branch}/{dir}/{page path}
    source?: { repo: string; branch: string; dir: string }
  }
  ```
- The package never imports `chart.js` at runtime; `Chart` arrives through `globals`. This repository cannot depend on its own published package, and a second copy would break registration.
- Fence syntax: a fence is taken over when its trimmed info string matches `/ chart-editor( |$)/`; every other fence goes to the previous rule untouched. The code reaches the component verbatim (backticks, `${}`, quotes, `{{ }}`, `</script>`, non-ASCII).
- Sample format: the code runs as the body of a strict-mode function whose locals are every key of `globals`, a `console` whose `log` is captured (last 50 lines), and `module` with an empty `exports`. Afterwards the component reads `module.exports.config` (a Chart.js configuration, not made reactive or frozen), `module.exports.actions` (`[{name, handler(chart)}]`, read on the first evaluation only) and `module.exports.output` (when truthy, an output tab showing the captured log, the string as placeholder).
- Block markers: comments whose text matches `/^\s*<(\/?)block:([\w\s]+)(?::(\d+))?>\s*$/`, located with a parser so a marker inside a string is ignored. Named blocks become tabs sorted by the number; with no markers there is one tab; code outside named blocks is hidden but runs.
- Edits are evaluated 500 ms after the last keystroke; a thrown error keeps the previous chart and shows the message. The first evaluation creates the chart; later ones replace `data` and `options` and call `update()`; the chart is destroyed when the page is left.
- The chart and editor render in the page's own document, with no iframe or shadow root (19 sample lines look up elements written in the markdown), after the page is mounted. The elements carry the class names `chart-editor` and `chart-view`. A sample in a tab hidden at first draws correctly when shown.
- No network requests at runtime (no CDN fonts or icons).
- Server rendering: importing either entry in Node touches no `window` or `document`; on the server the component renders a placeholder and neither calls `runtime` nor evaluates code.
- Peers: `vitepress ^1.6.0`, `vue ^3.5.0`. Semver; this repository depends on a caret range of the first release.

## Open Questions

None yet recorded here; see the pull request until the question round is written back.
