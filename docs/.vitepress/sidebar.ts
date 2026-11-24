import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { DefaultTheme, SiteConfig } from 'vitepress';

type Item = DefaultTheme.SidebarItem;
// A page path relative to docs/ ('' is the home page, 'axes/' an index page),
// a group as [title, entries], or a hand-written item.
type Entry = string | [title: string, entries: Entry[]] | Item;

const docs = fileURLToPath(new URL('..', import.meta.url));

// '/' -> index.md, '/axes/' -> axes/index.md, '/general/colors' -> general/colors.md
function pageOf(link: string): string {
  const page = link.replace(/^\//, '');
  return page === '' || page.endsWith('/') ? `${page}index.md` : `${page}.md`;
}

// The label is the page's first heading, as it was on the VuePress site.
function firstHeading(page: string): string {
  const heading = /^# (.+)$/m.exec(readFileSync(docs + page, 'utf8'));
  if (!heading) {
    throw new Error(`docs/${page} has no first heading for the sidebar`);
  }
  return heading[1].trim();
}

function item(entry: Entry, prefix: string): Item {
  if (typeof entry === 'string') {
    const link = `/${prefix}${entry}`;
    return {text: firstHeading(pageOf(link)), link};
  }
  if (Array.isArray(entry)) {
    const [text, entries] = entry;
    // Collapsed except for the group that holds the current page, as before.
    return {text, collapsed: true, items: entries.map(e => item(e, prefix))};
  }
  return entry;
}

const tree = (prefix: string, entries: Entry[]): Item[] => entries.map(e => item(e, prefix));

const samples = tree('samples/', [
  'information',
  ['Bar Charts', [
    'bar/border-radius',
    'bar/floating',
    'bar/horizontal',
    'bar/stacked',
    'bar/stacked-groups',
    'bar/vertical',
  ]],
  ['Line Charts', [
    'line/interpolation',
    'line/line',
    'line/multi-axis',
    'line/point-styling',
    'line/segments',
    'line/stepped',
    'line/styling',
  ]],
  ['Other charts', [
    'other-charts/bubble',
    'other-charts/combo-bar-line',
    'other-charts/doughnut',
    'other-charts/multi-series-pie',
    'other-charts/pie',
    'other-charts/polar-area',
    'other-charts/polar-area-center-labels',
    'other-charts/radar',
    'other-charts/radar-skip-points',
    'other-charts/scatter',
    'other-charts/scatter-multi-axis',
    'other-charts/stacked-bar-line',
  ]],
  ['Area charts', [
    'area/line-boundaries',
    'area/line-datasets',
    'area/line-drawtime',
    'area/line-stacked',
    'area/radar',
  ]],
  ['Scales', [
    'scales/linear-min-max',
    'scales/linear-min-max-suggested',
    'scales/linear-step-size',
    'scales/log',
    'scales/stacked',
    'scales/time-line',
    'scales/time-max-span',
    'scales/time-combo',
  ]],
  ['Scale Options', [
    'scale-options/center',
    'scale-options/grid',
    'scale-options/ticks',
    'scale-options/titles',
  ]],
  ['Legend', [
    'legend/events',
    'legend/html',
    'legend/point-style',
    'legend/position',
    'legend/title',
  ]],
  ['Title', [
    'title/alignment',
  ]],
  ['Subtitle', [
    'subtitle/basic',
  ]],
  ['Tooltip', [
    'tooltip/content',
    'tooltip/html',
    'tooltip/interactions',
    'tooltip/point-style',
    'tooltip/position',
  ]],
  ['Scriptable Options', [
    'scriptable/bar',
    'scriptable/bubble',
    'scriptable/line',
    'scriptable/pie',
    'scriptable/polar',
    'scriptable/radar',
  ]],
  ['Animations', [
    'animations/delay',
    'animations/drop',
    'animations/loop',
    'animations/progressive-line',
    'animations/progressive-line-easing',
  ]],
  ['Advanced', [
    'advanced/data-decimation',
    'advanced/derived-axis-type',
    'advanced/derived-chart-type',
    'advanced/linear-gradient',
    'advanced/programmatic-events',
    'advanced/progress-bar',
    'advanced/radial-gradient',
  ]],
  ['Plugins', [
    'plugins/chart-area-border',
    'plugins/doughnut-empty-state',
    'plugins/quadrants',
  ]],
  'utils',
]);

const guide = tree('', [
  '',
  ['Getting Started', [
    'getting-started/',
    'getting-started/installation',
    'getting-started/integration',
    'getting-started/usage',
    'getting-started/using-from-node-js',
  ]],
  ['General', [
    'general/accessibility',
    'general/colors',
    'general/data-structures',
    'general/fonts',
    'general/options',
    'general/padding',
    'general/performance',
  ]],
  ['Configuration', [
    'configuration/',
    'configuration/animations',
    'configuration/canvas-background',
    'configuration/decimation',
    'configuration/device-pixel-ratio',
    'configuration/elements',
    'configuration/interactions',
    'configuration/layout',
    'configuration/legend',
    'configuration/locale',
    'configuration/responsive',
    'configuration/subtitle',
    'configuration/title',
    'configuration/tooltip',
  ]],
  ['Chart Types', [
    'charts/area',
    'charts/bar',
    'charts/bubble',
    'charts/doughnut',
    'charts/line',
    'charts/mixed',
    'charts/polar',
    'charts/radar',
    'charts/scatter',
  ]],
  ['Axes', [
    'axes/',
    ['Cartesian', [
      'axes/cartesian/',
      'axes/cartesian/category',
      'axes/cartesian/linear',
      'axes/cartesian/logarithmic',
      'axes/cartesian/time',
      'axes/cartesian/timeseries',
    ]],
    ['Radial', [
      'axes/radial/',
      'axes/radial/linear',
    ]],
    'axes/labelling',
    'axes/styling',
  ]],
  ['Developers', [
    'developers/',
    'developers/api',
    'developers/axes',
    'developers/charts',
    'developers/contributing',
    'developers/plugins',
    'developers/publishing',
    // The API reference's index page has a generated title.
    {text: 'TypeDoc', link: '/api/'},
    'developers/updates',
  ]],
  ['Migration', [
    'migration/v4-migration',
    'migration/v3-migration',
  ]],
]);

export const sidebar = {
  '/samples/': samples,
  '/': guide,
} satisfies DefaultTheme.SidebarMulti;

function links(items: Item[]): string[] {
  return items.flatMap(i => [
    ...(i.link ? [i.link] : []),
    ...links(i.items ?? []),
  ]);
}

// Fails the build for a page that no sidebar lists, so that a page added to
// the docs cannot be left out of the navigation. The API reference has its
// own generated sidebar.
export function checkSidebar({pages}: SiteConfig): void {
  const listed = new Set(Object.values(sidebar).flatMap(tree => links(tree).map(pageOf)));
  const missing = pages.filter(page => !page.startsWith('api/') && !listed.has(page));
  if (missing.length) {
    throw new Error(`Pages in no sidebar (add them to docs/.vitepress/sidebar.ts):\n  ${missing.join('\n  ')}`);
  }
}
