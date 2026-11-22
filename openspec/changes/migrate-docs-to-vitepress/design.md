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

What was checked against VitePress 1.6.4, on a copy of `docs/` built with `vitepress build` and a minimal configuration (title, base, `markdown-it-include`, `anchor.uniqueSlugStartIndex: 2`, partials excluded, local search):

- All 134 pages build (the four `_common*.md` partials are excluded) in about 10 seconds. Tip and warning blocks render as callouts, code blocks get a copy button, included partials appear in their pages, and duplicate headings keep today's anchors (`#animations-2`).
- A `chart-editor` fence without a fence rule renders as a plain highlighted code block, so the site builds before the editor package exists. The three tab pages show literal `:::: tabs` text.
- VitePress fails the build on dead links, where VuePress only warns. It reports eight in-site links from seven source lines (two of them 404 on the live site today) and two `http://localhost` links. `'localhostLinks'` is not accepted inside an `ignoreDeadLinks` array; a pattern is needed there.
- With `docs/package.json` still on Vue 2, the build fails with `Missing "./server-renderer" specifier in "vue" package`, even when VitePress and Vue 3 are installed in a package of their own under `docs/.vitepress/`: pages in `docs/` resolve `vue` to `docs/node_modules`. Two Vite aliases, `vue` and `vue/server-renderer` resolved from the VitePress package, make it build.

Checked without a build: TypeDoc 0.28.20 with TypeScript 6.0 converts `src/types/index.d.ts` to the same 11 / 112 / 2 shape when `skipErrorChecking` is set; without it the root `tsconfig.json` does not check under TypeScript 6. `typedoc-plugin-markdown` 4 names the enumeration directory `enumerations/`, not `enums/`. Not yet proved by anything: pnpm accepting a workspace package in a dot directory, the anchors on the generated API index, and one Chart.js instance being shared with the date adapter in the dev server.

[chartjs-plugin-zoom pull request 972](https://github.com/chartjs/chartjs-plugin-zoom/pull/972) moved that plugin's docs to VitePress 1.6.4 with a local Vue 3 port of the chart editor, a `docs-version.json` written by `docs-config.sh`, and a TypeDoc pipeline. This design follows its choices where they fit; `vitepress-theme-chartjs` is in effect the extraction of its editor.

## Prior art

The docs of chartjs-plugin-zoom run on VitePress 1.6.4 since [chartjs-plugin-zoom pull request 972](https://github.com/chartjs/chartjs-plugin-zoom/pull/972). Paths below are in that repository; each piece starts from them instead of from nothing.

| Piece | Start from | What differs here |
| --- | --- | --- |
| P2 | `docs/.vitepress/config.ts` (base from `docs-version.json`, favicon link with the base, `lastUpdated`, `appearance: false`, local search, social link), `theme/index.ts`, `theme/styles/palette.css`, the `printf` line of `scripts/docs-config.sh` | Includes, the anchor index, the excluded partials, the Vue aliases and the temporary package exist only here. |
| P3 | the sidebar shape in `config.ts` | Zoom writes each title by hand for 25 pages; here 134 titles are read from the pages. |
| P4 | `typedoc.json` (`plugin`, `docsRoot`, `githubPages: false`, `useCodeBlocks`, `sidebar` for VitePress) and the `typedoc-sidebar.json` import | `skipErrorChecking`, `membersWithOwnFile` and the entry point `src/types/index.d.ts`; zoom's `treatWarningsAsErrors` is tried and kept only if the conversion is clean. |
| P6 | `docs/.vitepress/versions.ts`: fetching the jsDelivr list, parsing, ordering and collapsing versions, with a fallback when the fetch fails | Zoom returns a nav item built once at build time. Here the same functions feed a component that also refreshes in the browser (D4). |
| P8 | `docs/.vitepress/markdown/chart-editor.ts` and `theme/{ChartEditor,ChartView,CodeEditor,CodeTextarea,CodeOutput,ChartActions,Tooltip}.vue`, `theme/styles/editor.css`, `theme-config.ts` | This is the code `vitepress-theme-chartjs` is extracted from. In zoom the editor imports `chart.js` and a local `chart-imports` module directly; a package cannot import its consumer's module, hence the `imports` option in Contracts; everything else keeps zoom's shape. |

Zoom made the move in one pull request, with the dependencies in its single root package. That does not carry over: here the docs are a workspace package still on Vue 2 while VuePress deploys, and a single pull request would be far over the size limit.

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

**D2. Default theme with brand colours and logo; light scheme only** (user decisions). Brand `#FF6384` for the site name and accent `#3080D0` mapped to the theme's brand variables. `appearance: false`: Chart.js default tick and grid colours and several samples assume a light page. *Alternative:* recreate today's look in CSS; rejected because it must track VitePress internals.

**D3. The chart editor comes from a new shared package `vitepress-theme-chartjs`** (user decision), unscoped on npm and in the repository `chartjs/vitepress-theme-chartjs`, with the entry points named in Contracts. It is consumed here and can later serve the plugin repositories. Neither the repository nor the npm package exists yet; `## Contracts` states what this repository needs. Everything except live charts is built before it exists. *Alternatives:* port the editor into this repository (no external wait, no reuse); reuse `@kurkle/astro-chartjs-editor` (Astro-bound today).

**D4. The version menu is a component in this repository** (user decision), in the nav after the site title and in the mobile nav screen, with a build-time list and a refresh in the browser. The current version is taken from the built version, not from `window.location`. Links to other versions carry `target="_self"`, which the VitePress router leaves to the browser, so they load the other site.

**D5. Both sites build side by side until one piece switches the deploy.** Until the switch, VitePress's dependencies live in a temporary workspace package at `docs/.vitepress/package.json`, with scripts named `site:build`, `site:dev` and `api` (never `build` or `dev`, so the root `pnpm --filter "./docs/**" build` does not run them), and output in `docs/.vitepress/dist` (never under `dist/`, which `pnpm pack` ships). Root scripts `docs:vitepress` and `docs:vitepress:dev` build the library and then run it. The config, theme and version marker sit at their final paths from the first piece. Because `docs/package.json` pins Vue 2 for VuePress, the config carries two temporary aliases that point `vue` and `vue/server-renderer` at the Vue 3 of the temporary package (measured: the build fails without them and passes with them). The switch moves the dependencies into `docs/package.json` and deletes the temporary package and the aliases. *Unproved until P2:* that pnpm accepts a workspace package in a dot directory. *Fallback:* the package in a sibling directory `docs-vitepress/`, with the same aliases. *Alternative:* one large switch pull request; rejected because it cannot be reviewed in pieces and leaves master without a tested site until it lands.

**D6. Markdown content is not rewritten before the switch.** `markdown-it-include` stays (it works on VitePress's renderer); `srcExclude: ['**/_*.md']` stops the partials being published as pages. The three tab pages keep the VuePress syntax while VuePress still publishes them and are converted to the syntax of `vitepress-plugin-tabs` in the switch piece, the first moment VuePress no longer reads them. Until then the undeployed VitePress build shows literal `:::: tabs` text on those three pages. *Alternative:* a shim that renders the old syntax under VitePress; rejected in review as two pieces and a dependency for a preview nobody is served.

**D7. The seven dead links are fixed first, as their own piece.** They are wrong today (two 404 on the live site) and valid fixes under VuePress.

**D8. API addresses are kept** (user decision, with the deprecation risk known). `membersWithOwnFile: [Class, Interface, Enum]` keeps type aliases and variables on the index page, as today; the two `api/enums/*.html` addresses get redirect stubs to `api/enumerations/`. TypeDoc runs with `skipErrorChecking` on the root `tsconfig.json` and a docs-only `typescript` `~6.0`, pinned below 7 because TypeDoc 0.28 does not accept it; type checking stays where it is (`lint-types`). *Risk:* the plugin marks `membersWithOwnFile` as being deprecated. *Alternative:* the plugin's default layout, one page per alias; rejected because it breaks `api/#color`-style links.

**D9. Redirects are static stub pages written after the build** (meta refresh, canonical link, and a script that keeps `location.hash`) for the four existing redirects and the two enumeration pages. The site is served from GitHub Pages, which has no server redirects.

**D10. The docs version is a committed marker file.** `docs/.vitepress/docs-version.json` holds `{"version": "master"}`; `scripts/docs-config.sh` keeps its name and arguments and writes the tag there (from P2, beside the old `sed`, which goes with the VuePress configuration). The workflows therefore need no edit for this. *Alternative:* an environment variable; rejected because it edits three workflows that open pull requests hold.

**D11. The sample environment is one module** in the theme directory, `chart-imports.ts` as in chartjs-plugin-zoom, that imports `docs/scripts/{register,utils,helpers,components}.js` and exports `{Utils, helpers, components}`, loaded only in the browser. A Vite alias maps `chart.js` to `dist/chart.js` (as the webpack alias does), so the samples, the scripts and the date adapter share one Chart.js; `chartjs-adapter-luxon` is excluded from dependency pre-bundling for the same reason (unproved until P8).

**D12. Search is VitePress's local search; code copy is built in.** No account or crawler is needed. *Alternative:* Algolia DocSearch.

**D13. The switch is one piece and the clean-up another.** P9 moves the VitePress dependencies into `docs/package.json` in place of the VuePress ones, repoints `pnpm run docs`, converts the tab pages and removes the temporary package, aliases, root scripts and CI step. It is one commit to revert. P10 deletes what is then dead (`docs/.vuepress/`, the `sed`, workspace leftovers) and completes [#10583](https://github.com/chartjs/Chart.js/issues/10583). P10 is about 455 lines, of which 442 are three whole-file deletions.

**D14. One-line hunks in held files do not wait.** `package.json` script lines, the `ci.yml` step and `contributing.md` line 40 are merged and the holding pull requests rebase, as `migrate-tests-to-vitest` does. The exception is P7, which waits for [#12422](https://github.com/chartjs/Chart.js/pull/12422) because that pull request rewrites every workflow.

**D15. "Last updated" and the repository link are kept.** `lastUpdated: true` and a GitHub social link, as the VuePress configuration has today. The deploy checks out a shallow clone, as it does today, so the date shown keeps the meaning it has now.

**D16. Sample sizing.** The site stylesheet caps `.chart-view` at 800px, as today. VitePress's default content column is narrower than VuePress's unlimited one; wide option tables scroll horizontally inside the column. P9 compares one wide table page and one sample page with the live site before the switch.

**D17. No analytics** (user decision). The VuePress site carries a Universal Analytics tag (`UA-28909194-3`), a product that no longer collects; nothing replaces it. A tag can be added later in the site's `head`. `scripts/sample-redirect-template.html` carries the same dead tag and is not touched here.

**D18. The docs' own TypeScript and Vue code is type-checked** with `vue-tsc`, as chartjs-plugin-zoom does with its `typecheck:docs` script. The repository's ESLint covers only `docs/**/*.js`, so without this nothing checks the config, the sidebar, the redirects or the version menu. The script arrives in P2 and CI runs it from P7. Linting `.ts` and `.vue` files is left to the ESLint migration.

**D19. The package contract follows chartjs-plugin-zoom** (user decision after comparing with its migration): the source link is theme configuration, `chart.js` is an imported peer, and the only injected part is the sample imports.

**D20. Pull requests get a preview of the docs from Netlify** (user decision; chosen over Cloudflare, whose Pages integration documents that it creates no preview for pull requests from forks, which is where almost every pull request here comes from). A `netlify.toml` builds what the deploy builds (`./scripts/docs-config.sh master && pnpm run docs`) and publishes it under `/docs/master/`, the address it has in production, with `/` redirecting there; no secret or workflow is involved, and builds are skipped when nothing the docs are built from changed. Because that shows the VuePress site until the switch, the VitePress build is served beside it under `/vitepress/` from P12 until P9, which needs the base to be overridable by an environment variable. *Proved by P11* ([#12429](https://github.com/chartjs/Chart.js/pull/12429), opened from a fork): Netlify builds a pull request from a fork, its image runs the repository's Node and pnpm versions, and the preview serves pages, samples and the API reference under `/docs/master/`. Netlify redirects addresses with capital letters to lower case (`api/classes/Chart.html` to `api/classes/chart`), which GitHub Pages does not do; the page is the same. The Netlify site `chartjs-docs` is connected to `chartjs/Chart.js`.

**D21. What review changed.**
- The switch was four pieces (repoint, delete configuration, remove dependencies, fold the temporary package) and is two (D13): the dependency sets are one file swap, and a separate refactor piece only repeated the same edits.
- The tab shim and its optional removal piece were dropped (D6).
- Writing the version marker moved from its own three-line piece into P2.
- The switch now removes the CI step that P7 adds; before, CI would have called a script the switch deletes.
- D5 claimed a separate package was enough to keep Vue 2 away from VitePress. A probe build showed it is not; the aliases were added and the fallback corrected.
- The sidebar completeness check runs inside the build instead of once in a pull request, so drift is caught until the switch and after.
- The API generator cleans `docs/api` before writing, and P4 checks that a VuePress build after a VitePress build is unchanged, because both tools generate into that directory until the switch.
- The repository link, "Last updated", the favicon link and sample sizing were missing from the tasks (D15, D16).

## Risks / Trade-offs

- **External dependency.** P8 and everything after it wait on a package that does not exist. Mitigation: P1 to P7 land without it, and the site without live charts is built in CI.
- **The dot-directory workspace package is unproved under pnpm.** If it fails, P2 uses the sibling directory and later pieces change paths only.
- **API anchors.** The anchor ids `typedoc-plugin-markdown` 4 writes on the index page were not rendered. P4 checks the 20 in-site links; links from outside to an alias anchor may land at the top of the index.
- **Deprecated option.** If `membersWithOwnFile` is removed, the API layout needs redirects for 103 entries or a pinned plugin version.
- **Two sites for a while.** A docs pull request merged during the migration can break only the new build. P7 makes CI catch it.
- **Sidebar drift.** A page added to the VuePress sidebar after P3 (today [#12386](https://github.com/chartjs/Chart.js/pull/12386)) must also be added to the new sidebar; the build fails on a page that is in neither sidebar.
- **Both tools generate `docs/api`** until the switch. Each cleans it before writing; running both dev servers at once is not supported.
- **Editing a partial** needs a dev-server restart under `markdown-it-include`.
- **Readers see a new look** at the switch, on master first and on `latest` with the next release. 

## Pieces

Lines are hand-written changed lines; the lockfile, generated `docs/api` and binary files are not counted.

| Piece | Builds | Files | Fails without it | Lines | Waits on | [#10583](https://github.com/chartjs/Chart.js/issues/10583) |
| --- | --- | --- | --- | --- | --- | --- |
| P1 | Fix the links that resolve only by accident | `docs/axes/_common_ticks.md`, `docs/axes/radial/linear.md`, `docs/axes/index.md`, `docs/developers/index.md`, `docs/getting-started/index.md` | the radial axis "Color" link 404s on the live site; a VitePress build reports 8 dead in-site links | ~7 | nothing | advances |
| P2 | A VitePress site beside VuePress: temporary package, config (title, base from the version marker, favicon, nav with repository link, last updated, includes, anchor index, local search, light only, `chart.js` and Vue 3 aliases, partials excluded), theme entry with brand palette, public files, root `docs:vitepress` scripts, a type-check script for the docs code, version marker written by `docs-config.sh`. Links under `/api/` are ignored until P4 | `docs/.vitepress/{package.json,config.ts,docs-version.json,tsconfig.json}`, `docs/.vitepress/theme/{index.ts,styles/palette.css}`, `docs/public/*` (3 binary copies), `pnpm-workspace.yaml`, `.gitignore`, `package.json`, `scripts/docs-config.sh` | `pnpm run docs:vitepress` does not exist; with it `docs/.vitepress/dist/getting-started/usage.html` exists while `pnpm run docs` still builds the VuePress site | ~200 | P1 | advances |
| P3 | Sidebar: the three trees as path lists, labels read from each page's first heading; the build fails on a page that is in no sidebar | `docs/.vitepress/sidebar.ts`, `docs/.vitepress/config.ts` | pages have no sidebar | ~210 | P2 | advances |
| P4 | API reference: TypeDoc pipeline and generated sidebar; the `/api/` link exemption removed | `docs/typedoc.json`, `docs/.vitepress/package.json`, `docs/.vitepress/config.ts` | `api/classes/Chart.html` is missing; the 20 guide links into `api/` are dead | ~60 | P3 (same file) | advances |
| P5 | Redirect stubs for the four old directories and the two `api/enums` pages | `docs/.vitepress/redirects.ts`, `docs/.vitepress/config.ts` | `charts/index.html` and `api/enums/UpdateModeEnum.html` are absent from the output | ~50 | P4 (same file; enumeration targets) | advances |
| P6 | Version menu with build-time list and browser refresh | `docs/.vitepress/theme/{VersionMenu.vue,versions.ts,versions.data.ts,index.ts}` | built for master the nav has no menu titled "Development (master)" | ~230 | P2 | advances |
| P7 | CI builds and type-checks the VitePress site when docs change | `.github/workflows/ci.yml` | a pull request that breaks only the new build, or the types of the docs code, passes CI | ~8 | P2, [#12422](https://github.com/chartjs/Chart.js/pull/12422) | advances |
| P8 | Live samples: the package, its fence plugin, the sample imports module, source link configuration, adapter excluded from pre-bundling | `docs/.vitepress/{package.json,config.ts}`, `docs/.vitepress/theme/{index.ts,chart-imports.ts,styles/palette.css}` | sample pages show code but no chart; checked on a bar sample, a time-scale sample, the HTML legend sample and the progress-bar sample, in build and in dev | ~70 | P5, P6 (same files); **first release of `vitepress-theme-chartjs`** | advances |
| P9 | The switch: `docs/package.json` carries the VitePress dependencies and scripts in place of the VuePress ones; `pnpm run docs` and `docs:dev` build VitePress into `dist/docs`; the tab pages use the tabs plugin; temporary package, Vue aliases, root scripts, CI step and the `/vitepress/` preview removed; command and port on the samples page | `docs/package.json`, `docs/.vitepress/package.json` (deleted), `docs/.vitepress/{config.ts,theme/index.ts}`, `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.github/workflows/ci.yml`, `netlify.toml`, `docs/charts/doughnut.md`, `docs/configuration/animations.md`, `docs/configuration/canvas-background.md`, `docs/samples/information.md` | after `./scripts/docs-config.sh master && pnpm run docs`, `dist/docs` is VuePress output and `pnpm why vuepress` lists it | ~140 | P3 to P8 | advances |
| P10 | Remove what is dead: the VuePress directory, the `sed`, the workspace override and build allowances, the ignore entry, the contributor sentence | `docs/.vuepress/**` (deleted: 442 lines and 3 binaries), `scripts/docs-config.sh`, `pnpm-workspace.yaml`, `.gitignore`, `docs/developers/contributing.md` | a 395-line configuration nothing reads, which pull requests keep editing | ~455, of which 442 whole-file deletions | P9 and one clean master deploy of it; [#12386](https://github.com/chartjs/Chart.js/pull/12386) | **completes** |
| P11 | Docs preview on pull requests: Netlify builds what `pnpm run docs` builds and serves it at its production path | `netlify.toml` | a docs pull request has no preview link; the pull request that adds the file, opened from a fork, gets one | ~20 | nothing | follow-up |
| P12 | The preview also serves the undeployed VitePress site under `/vitepress/`; the base can be overridden by an environment variable | `netlify.toml`, `docs/.vitepress/config.ts` | P3 to P8 can be reviewed only by building locally | ~10 | P2, P11 | follow-up |

P11 and P12 were added after the design was opened and keep the next free numbers; in build order P11 comes first of all and P12 right after P2.

**Parallel.** P1 and P11 can start now. After P2: P3, P6 and P7 share no hand-edited file. P3, P4, P5 are serial on `config.ts`. P8 follows P5 and P6. P9 and P10 are serial. Everything up to P7 lands before the package exists.

**Held by open pull requests.** P7 by [#12422](https://github.com/chartjs/Chart.js/pull/12422) (also [#12315](https://github.com/chartjs/Chart.js/pull/12315), [#12392](https://github.com/chartjs/Chart.js/pull/12392), [#12305](https://github.com/chartjs/Chart.js/pull/12305) on the same file). P10 by [#12386](https://github.com/chartjs/Chart.js/pull/12386), which adds a page to the old sidebar. P9 edits `docs/charts/doughnut.md`, which [#12243](https://github.com/chartjs/Chart.js/pull/12243) also edits, and `docs/package.json`, which [#12351](https://github.com/chartjs/Chart.js/pull/12351) edits (that one closes itself when `markdown-it` leaves the file); per D14 they rebase. `docs/developers/contributing.md` is also edited by `migrate-tests-to-vitest` ([#12423](https://github.com/chartjs/Chart.js/pull/12423)) in other sections.

## Contracts

**Between pieces**

- P2 to all: `pnpm run docs:vitepress` builds into `docs/.vitepress/dist`; the config reads `docs/.vitepress/docs-version.json`, which `scripts/docs-config.sh <version> [release]` writes; the theme entry extends the default theme; the temporary package owns the dependencies.
- P4 to P5: enumeration pages are at `api/enumerations/<Name>.html`.
- P7 to P9: the CI step that runs `pnpm run docs:vitepress` is removed in the piece that removes the script; the type-check step stays and follows the script to `docs/package.json`.
- P11 to P12 and P9: the preview publishes a directory whose `docs/master/` is the output of `pnpm run docs`; P12 adds `vitepress/` beside it and P9 removes that again.
- P9 to P10: nothing invokes VuePress and nothing in the lockfile comes from it.

**What this repository needs from `vitepress-theme-chartjs`**

The names below are the agreed ones. A reference implementation is the editor under `docs/.vitepress/` of chartjs-plugin-zoom.

- Entry points (ESM, shipped compiled so they work when Vite leaves the package external in the server build):
  - `vitepress-theme-chartjs/markdown`: `chartEditor(md)`, a markdown-it plugin.
  - `vitepress-theme-chartjs`: the `ChartEditor` component, an installer `app.use(chartEditorPlugin, options)` that registers it globally, and the type `ChartjsThemeConfig`.
  - `vitepress-theme-chartjs/style.css`, imported by the consumer; the JavaScript entries import no CSS.
- Options and theme configuration, shaped as in chartjs-plugin-zoom so that its editor moves into the package with few changes:
  ```ts
  interface ChartEditorOptions {
    // The names sample code can use besides Chart, here {Utils, helpers, components}.
    // Called once, in the browser only, before the first sample runs.
    imports?: () => Promise<Record<string, unknown>>
  }
  interface ChartjsThemeConfig extends DefaultTheme.Config {
    // Source link of a sample: https://github.com/{repo}/blob/{branch}/{dir}/{page path}
    source: { repo: string; branch: string; dir: string }
  }
  ```
- `chart.js` is a peer dependency that the package imports, as the zoom editor and the old theme do. This repository satisfies it with its Vite alias to `dist/chart.js` (and already lists `chart.js` under `peerDependencyRules.ignoreMissing`), so samples, scripts and editor share one Chart.js.
- Fence syntax: a fence is taken over when its trimmed info string matches `/ chart-editor( |$)/`; every other fence goes to the previous rule untouched. The code reaches the component verbatim (backticks, `${}`, quotes, `{{ }}`, `</script>`, non-ASCII).
- Sample format: the code runs as the body of a strict-mode function whose locals are `Chart`, every name `imports` resolved to, a `console` whose `log` is captured (last 50 lines), and `module` with an empty `exports`. Afterwards the component reads `module.exports.config` (a Chart.js configuration, not made reactive or frozen), `module.exports.actions` (`[{name, handler(chart)}]`, read on the first evaluation only) and `module.exports.output` (when truthy, an output tab showing the captured log, the string as placeholder).
- Block markers: comments whose text matches `/^\s*<(\/?)block:([\w\s]+)(?::(\d+))?>\s*$/`, located with a parser so a marker inside a string is ignored. Named blocks become tabs sorted by the number; with no markers there is one tab; code outside named blocks is hidden but runs.
- Edits are evaluated 500 ms after the last keystroke; a thrown error keeps the previous chart and shows the message. The first evaluation creates the chart; later ones replace `data` and `options` and call `update()`; the chart is destroyed when the page is left.
- The chart and editor render in the page's own document, with no iframe or shadow root (19 sample lines look up elements written in the markdown), after the page is mounted. The elements carry the class names `chart-editor` and `chart-view`. A sample in a tab hidden at first draws correctly when shown (checked in P9, when tabs exist).
- No network requests at runtime (no CDN fonts or icons).
- Server rendering: importing either entry in Node touches no `window` or `document`; on the server the component renders a placeholder and neither calls `imports` nor evaluates code.
- Peers: `vitepress ^1.6.0`, `vue ^3.5.0`, `chart.js ^4.0.0`. Semver; this repository depends on a caret range of the first release.

## Open Questions

None.
