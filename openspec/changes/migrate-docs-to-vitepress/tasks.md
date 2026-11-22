## 1. P1: Fix links that resolve only by accident

- [ ] 1.1 Show the failure: open `docs/latest/axes/radial/linear.html` and follow the grid `Color` link (404)
- [ ] 1.2 Make the links in `docs/axes/_common_ticks.md` root-relative, since the partial is included from two directory depths
- [ ] 1.3 Correct `docs/axes/radial/linear.md` (two links), `docs/axes/index.md` (trailing slash), `docs/developers/index.md` (the v3 migration guide's real path), `docs/getting-started/index.md` (the samples information page)
- [ ] 1.4 `pnpm run docs` still succeeds and the links resolve; a throwaway VitePress build of `docs/` reports no dead in-site link outside `api/`

## 2. P2: A VitePress site beside VuePress

- [ ] 2.1 Add the root scripts `docs:vitepress` and `docs:vitepress:dev` (build the library, then run the site) and confirm they fail for lack of a site
- [ ] 2.2 Add the temporary workspace package `docs/.vitepress/package.json` (scripts `site:build`, `site:dev`) and register it in `pnpm-workspace.yaml`; if pnpm rejects a package in a dot directory, use the sibling directory of D5 and note it in `design.md`
- [ ] 2.3 Add `docs/.vitepress/docs-version.json` and `config.ts`: title, description, base, favicon link, nav, repository link, `lastUpdated`, `markdown-it-include`, `anchor.uniqueSlugStartIndex: 2`, local search, `appearance: false`, the `chart.js` alias, the two Vue 3 aliases, `srcExclude` for partials, `ignoreDeadLinks` patterns for localhost and, until P4, `/api/`
- [ ] 2.4 Add the theme entry and the brand palette; copy the three public files to `docs/public/`
- [ ] 2.5 Make `scripts/docs-config.sh` write the tag to the version marker beside the existing `sed`; check master, a release, latest and next give bases `/docs/master/`, `/docs/x.y.z/`, `/docs/latest/`, `/docs/next/`
- [ ] 2.6 Add `docs/.vitepress/tsconfig.json` and a `typecheck` script (`vue-tsc --noEmit`) with a root `docs:typecheck`; see it fail on a deliberate type error in `config.ts`
- [ ] 2.7 Ignore `docs/.vitepress/{cache,.temp,dist}` in `.gitignore`
- [ ] 2.8 Check the output: `getting-started/usage.html` exists, `axes/_common.html` does not, `configuration/animations.html` contains `id="animations-2"`, `charts/bar.html` has a tip callout and a copy button, `axes/cartesian/linear.html` contains the included common options, a page shows its last-updated date and the repository link
- [ ] 2.9 Check `pnpm run docs` still writes the VuePress site to `dist/docs` and `pnpm pack` lists no docs file

## 3. P3: Sidebar

- [ ] 3.1 Make the build fail when a non-partial page outside `api/` is in no sidebar, and see it fail for every page
- [ ] 3.2 Add `docs/.vitepress/sidebar.ts` with the guide and samples trees as path lists and a helper that reads each page's first heading
- [ ] 3.3 Wire it into the config; compare sections, order and titles with the live site

## 4. P4: API reference

- [ ] 4.1 Remove the `/api/` exemption and see the 20 guide links fail the build
- [ ] 4.2 Add `docs/typedoc.json` and the `api` script, which cleans `docs/api` before writing; run it before `site:build` and `site:dev`
- [ ] 4.3 Load the generated sidebar for `/api/`, tolerating its absence
- [ ] 4.4 Check `api/classes/Chart.html`, `api/interfaces/Plugin.html`, `api/enumerations/UpdateModeEnum.html` and that `api/#color` lands on the alias; record the anchor format in `design.md` if it differs
- [ ] 4.5 Run `pnpm run docs:vitepress` and then `pnpm run docs`: the VuePress output has the same `api/` file list as before this piece

## 5. P5: Redirects

- [ ] 5.1 Check that `charts/index.html` and `api/enums/UpdateModeEnum.html` are absent from the output
- [ ] 5.2 Add `docs/.vitepress/redirects.ts` and write the six stubs in `buildEnd`, base-aware and keeping the hash
- [ ] 5.3 Open each stub from a local preview and land on its target

## 6. P6: Version menu

- [ ] 6.1 Unit-check the version grouping: one entry per minor from 2.6 on, newest patch, 0.x, 1.x and 2.0 to 2.5 excluded
- [ ] 6.2 Add the build-time loader with a fallback to the built version alone
- [ ] 6.3 Add the component and mount it after the site title and in the mobile nav screen
- [ ] 6.4 Check the three titles (master, latest, outdated) and that a version link leaves the app

## 7. P7: CI builds the new site

- [ ] 7.1 Add steps to `ci.yml` that run `pnpm run docs:vitepress` and `pnpm run docs:typecheck` when `docs/**` changes
- [ ] 7.2 Show it red on a branch with a dead link, and on one with a type error in the docs code

## 8. P8: Live samples

- [ ] 8.1 See a sample page render code and no chart
- [ ] 8.2 Add `vitepress-theme-chartjs`, its fence plugin and stylesheet
- [ ] 8.3 Add `chart-imports.ts` exporting `Utils`, `helpers` and `components`, register the editor with it as a lazy import, and set `themeConfig.source`
- [ ] 8.4 Exclude the date adapter from pre-bundling; cap `.chart-view` at 800px
- [ ] 8.5 Check in build and in dev: a bar sample with actions, a time-scale sample, the HTML legend sample, the progress-bar sample's output tab; the page text is in the HTML without scripts

## 9. P9: The switch

- [ ] 9.1 See `pnpm run docs` leave VuePress output in `dist/docs` and `pnpm why vuepress` list it
- [ ] 9.2 Replace the dependencies and scripts of `docs/package.json` with the VitePress set (`build`: API then site); delete `docs/.vitepress/package.json`, its workspace entry and the two Vue aliases
- [ ] 9.3 Root `docs` and `docs:dev` lose the OpenSSL flag; `outDir` becomes `dist/docs`; remove the root `docs:vitepress` scripts and the CI build step from P7; `docs:typecheck` points at `docs/package.json`
- [ ] 9.4 Add `vitepress-plugin-tabs` and convert the three tab pages; check tabs switch and a sample in a tab hidden at first draws at full size
- [ ] 9.5 Update the command and port in `docs/samples/information.md`
- [ ] 9.6 Compare one wide options table page and one sample page with the live site
- [ ] 9.7 Check `pnpm why vuepress`, `pnpm why webpack` and `pnpm why vue` show no VuePress, webpack 4 or Vue 2; `pnpm pack` lists no docs file; `ci.yml` calls no removed script
- [ ] 9.8 After merge: `chartjs.org/docs/master/` serves the new site, an old page address, a redirect stub and a version link work

## 10. P10: Remove what is dead

- [ ] 10.1 Confirm one clean master deploy since P9
- [ ] 10.2 Delete `docs/.vuepress/` and the `sed` line in `scripts/docs-config.sh`; `git status` after `./scripts/docs-config.sh 4.6.1 release` shows only the version marker
- [ ] 10.3 Remove the `html-entities` override and each `allowBuilds` entry that `pnpm why` shows unused; remove `docs/.vuepress/dist` from `.gitignore`
- [ ] 10.4 Name VitePress in `docs/developers/contributing.md`
- [ ] 10.5 `git grep -i vuepress` finds only the history line in `docs/migration/v3-migration.md`
