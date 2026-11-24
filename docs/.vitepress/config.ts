import { createRequire } from 'node:module';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import markdownItInclude from 'markdown-it-include';
import { defineConfig } from 'vitepress';
import { version } from './docs-version.json';
import { checkSidebar, sidebar } from './sidebar';

const here = path.dirname(fileURLToPath(import.meta.url));
const vueDir = path.dirname(createRequire(import.meta.url).resolve('vue/package.json'));

// Which copy of the docs this build is: master, latest, next or an exact
// version. scripts/docs-config.sh rewrites docs-version.json before a release
// build; the committed default is master, so a local build or the dev server
// needs no extra step. DOCS_BASE overrides the base: the Netlify preview
// serves this site under /vitepress/ beside the VuePress one.
const base = process.env.DOCS_BASE ?? `/docs/${version}/`;

export default defineConfig({
  title: 'Chart.js',
  description: 'Open source HTML5 Charts for your website',
  base,
  head: [['link', {rel: 'icon', href: `${base}favicon.ico`}]],
  lastUpdated: true,
  buildEnd: checkSidebar,
  // Light only: Chart.js default tick and grid colours, and several samples,
  // assume a light page.
  appearance: false,

  // Partials are included into pages, not published on their own. docs/api
  // holds the VuePress build's TypeDoc output until this site generates its own.
  srcExclude: ['**/_*.md', 'api/**'],
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,
    // The API reference is not part of this site yet. Links to it are
    // relative, such as ./../api/index.
    /\/api\//,
  ],

  markdown: {
    // Duplicate headings get the same anchors as on the VuePress site:
    // #animations, #animations-2, ...
    anchor: {uniqueSlugStartIndex: 2},
    config(md) {
      md.use(markdownItInclude, path.resolve(here, '..'));
    },
  },

  vite: {
    resolve: {
      alias: [
        {find: 'chart.js', replacement: path.resolve(here, '../../dist/chart.js')},
        // Temporary, until VuePress is removed: docs/package.json pins Vue 2,
        // which pages under docs/ would otherwise resolve. The package
        // directory, not a file, so that Vite still picks the entry by its
        // export conditions.
        {find: /^vue$/, replacement: vueDir},
        {find: /^vue\/server-renderer$/, replacement: path.join(vueDir, 'server-renderer')},
      ],
    },
  },

  themeConfig: {
    logo: '/favicon.ico',
    search: {
      provider: 'local',
    },
    socialLinks: [
      {icon: 'github', link: 'https://github.com/chartjs/Chart.js'},
    ],
    nav: [
      {text: 'Home', link: '/'},
      {text: 'API', link: '/api/'},
      {text: 'Samples', link: '/samples/'},
      {
        text: 'Ecosystem',
        items: [
          {text: 'Awesome', link: 'https://github.com/chartjs/awesome'},
          {text: 'Discord', link: 'https://discord.gg/HxEguTK6av'},
          {text: 'Stack Overflow', link: 'https://stackoverflow.com/questions/tagged/chart.js'},
        ],
      },
    ],
    sidebar,
  },
});
