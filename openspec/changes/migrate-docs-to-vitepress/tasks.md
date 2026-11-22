## 1. P1: Fix links that resolve only by accident

- [ ] 1.1 Show the failure: open `docs/latest/axes/radial/linear.html` and follow the grid `Color` link (404)
- [ ] 1.2 Make the links in `docs/axes/_common_ticks.md` root-relative, since the partial is included from two directory depths
- [ ] 1.3 Correct `docs/axes/radial/linear.md` (two links), `docs/axes/index.md` (trailing slash), `docs/developers/index.md` (the v3 migration guide's real path), `docs/getting-started/index.md` (the samples information page)
- [ ] 1.4 `pnpm run docs` still succeeds and the links resolve

## 2. P2: A VitePress site beside VuePress

- [ ] 2.1 Add the root scripts and confirm `pnpm run docs:vitepress` fails for lack of a site
- [ ] 2.2 Add the temporary workspace package `docs/.vitepress/package.json` (scripts `site:build`, `site:dev`) and register it in `pnpm-workspace.yaml`; if pnpm or Vue resolution fails there, use the sibling-directory fallback of D5 and note it in `design.md`
- [ ] 2.3 Add `docs/.vitepress/docs-version.json` and `config.ts`: title, description, base, nav, `markdown-it-include`, `anchor.uniqueSlugStartIndex: 2`, local search, `appearance: false`, the `chart.js` alias, `srcExclude` for partials, `ignoreDeadLinks` for localhost and, until P4, `/api/`
- [ ] 2.4 Add the theme entry and the brand palette; copy the three public files to `docs/public/`
- [ ] 2.5 Ignore `docs/.vitepress/{cache,.temp,dist}` in `.gitignore`
- [ ] 2.6 Check: `docs/.vitepress/dist/getting-started/usage.html` exists, `axes/_common.html` does not, `configuration/animations.html` contains `id="animations-2"`, `pnpm run docs` still writes the VuePress site to `dist/docs`, and `pnpm pack` lists no docs file

## 3. P3: Sidebar

- [ ] 3.1 Write the check that lists every non-partial page and fails when one is not in the sidebar
- [ ] 3.2 Add `docs/.vitepress/sidebar.ts` with the guide and samples trees as path lists and a helper that reads each page's first heading
- [ ] 3.3 Wire it into the config; compare sections, order and titles with the live site

## 4. P4: API reference

- [ ] 4.1 Remove the `/api/` exemption and see the 20 guide links fail the build
- [ ] 4.2 Add `docs/typedoc.json` and the `api` script; run it before `site:build` and `site:dev`
- [ ] 4.3 Load the generated sidebar for `/api/`, tolerating its absence
- [ ] 4.4 Check `api/classes/Chart.html`, `api/interfaces/Plugin.html`, `api/enumerations/UpdateModeEnum.html` and that `api/#color` lands on the alias; record the anchor format in `design.md` if it differs

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

- [ ] 7.1 Add a step to `ci.yml` that runs `pnpm run docs:vitepress` when `docs/**` changes
- [ ] 7.2 Show it red on a branch with a dead link

## 8. P8: Version marker in docs-config.sh

- [ ] 8.1 Show that `./scripts/docs-config.sh 4.6.1 release` leaves the VitePress base at `/docs/master/`
- [ ] 8.2 Write the tag to `docs/.vitepress/docs-version.json` in addition to the `sed`
- [ ] 8.3 Check the four tags: master, a release, latest, next

## 9. P9: Tabs

- [ ] 9.1 See literal `::::` text in the built `charts/doughnut.html`
- [ ] 9.2 Add `vitepress-plugin-tabs` and the shim for `:::: tabs` / `::: tab Label`, quoted labels included
- [ ] 9.3 Check the three tab pages switch tabs

## 10. P10: Live samples

- [ ] 10.1 See a sample page render code and no chart
- [ ] 10.2 Add `vitepress-theme-chartjs`, its fence plugin and stylesheet
- [ ] 10.3 Add the runtime module exporting `globals` and register the editor with the lazy loader and the source link
- [ ] 10.4 Exclude the date adapter from pre-bundling
- [ ] 10.5 Check in build and in dev: a bar sample with actions, a time-scale sample, the HTML legend sample, the progress-bar sample's output tab, a tabbed sample

## 11. P11: The switch

- [ ] 11.1 See `pnpm run docs` leave VuePress output in `dist/docs`
- [ ] 11.2 Point the root `docs` and `docs:dev` scripts at the VitePress package, without the OpenSSL flag; set `outDir` to `dist/docs`; remove the temporary root scripts
- [ ] 11.3 Reconcile the sidebar with pages merged since P3 (the P3 check passes)
- [ ] 11.4 Update the command and port in `docs/samples/information.md`
- [ ] 11.5 Check `pnpm pack` lists no docs file, and after merge that `chartjs.org/docs/master/` serves the new site with working version links

## 12. P12: Delete the VuePress configuration

- [ ] 12.1 Confirm one clean master deploy since P11
- [ ] 12.2 Delete `docs/.vuepress/config.ts` and the `sed` line in `scripts/docs-config.sh`

## 13. P13: Remove VuePress

- [ ] 13.1 `pnpm why vuepress` lists it
- [ ] 13.2 Remove the VuePress dependencies and scripts from `docs/package.json`; delete the rest of `docs/.vuepress/`
- [ ] 13.3 Remove the `html-entities` override and each `allowBuilds` entry that `pnpm why` shows unused; remove `docs/.vuepress/dist` from `.gitignore`
- [ ] 13.4 Name VitePress in `docs/developers/contributing.md`
- [ ] 13.5 `pnpm why vuepress`, `pnpm why webpack` and `pnpm why vue` show no VuePress, webpack 4 or Vue 2

## 14. P14: One docs package

- [ ] 14.1 Save the file list and hashes of `dist/docs`
- [ ] 14.2 Move dependencies and scripts into `docs/package.json`, delete `docs/.vitepress/package.json`, drop its workspace entry
- [ ] 14.3 The file list of `dist/docs` is the same

## 15. P15: Tabs in the plugin's syntax (optional)

- [ ] 15.1 Convert the three pages
- [ ] 15.2 Delete the shim and its registration; the three pages render as before
