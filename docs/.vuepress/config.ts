import * as path from 'path';
import markdownItInclude from 'markdown-it-include';
import { DefaultThemeConfig, defineConfig, PluginTuple } from 'vuepress/config';

const docsVersion = "VERSION";
const base: `/${string}/` = process.env.NODE_ENV === "development" ? '/docs/master/' : `/docs/${docsVersion}/`;

export default defineConfig({
  title: 'Chart.js',
  description: 'Open source HTML5 Charts for your website',
  theme: 'chartjs',
  base,
  dest: path.resolve(__dirname, '../../dist/docs'),
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
  ],
  plugins: [
    'tabs',
    ['flexsearch'],
    ['@vuepress/html-redirect', {
      countdown: 0,
    }],
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-28909194-3'
      }
    ],
    ['redirect', {
      redirectors: [
        // Default sample page when accessing /samples.
        {base: '/samples', alternative: ['information']},
      ],
    }],
    ['vuepress-plugin-code-copy', true],
    ['vuepress-plugin-typedoc', {
        entryPoints: ['../../types/index.d.ts'],
        hideInPageTOC: true,
        tsconfig: path.resolve(__dirname, '../../tsconfig.json'),
      },
    ],
    ['@simonbrunel/vuepress-plugin-versions', {
      filters: {
        suffix: (tag) => tag ? ` (${tag})` : '',
        title: (v, vars) => {
          return window.location.href.includes('master') ? 'Development (master)' :
                 vars.tag === 'latest' ? 'Latest (' + v + ')' :
                 v + (vars.tag ? ` (${vars.tag})` : '') + ' (outdated)';
        },
      },
      menu: {
        text: '{{version|title}}',
        items: [
          {
            text: 'Documentation',
            items: [
              {
                text: 'Development (master)',
                link: '/docs/master/',
              },
              {
                text: 'Latest version',
                link: '/docs/latest/',
              },
              {
                type: 'versions',
                text: '{{version}}{{tag|suffix}}',
                link: '/docs/{{version}}/',
                exclude: /^[01]\.|2\.[0-5]\./,
                group: 'minor',
              }
            ]
          },
          {
            text: 'Release notes (5 latest)',
            items: [
              {
                type: 'versions',
                limit: 5,
                target: '_blank',
                group: 'patch',
                link: 'https://github.com/chartjs/Chart.js/releases/tag/v{{version}}'
              }
            ]
          }
        ]
      },
    }],
  ] as PluginTuple[],
  chainWebpack(config) {
    config.merge({
      resolve: {
        alias: {
          'chart.js': path.resolve(__dirname, '../../dist/chart.js'),
        }
      }
    })

    config.module.rule('images').use('url-loader').tap(options => ({
      ...options,
      esModule: false
    }))
  },
  markdown: {
    extendMarkdown: md => {
      md.use(markdownItInclude, path.resolve(__dirname, '../'));
    }
  },
  themeConfig: {
    repo: 'chartjs/Chart.js',
    logo: '/favicon.ico',
    lastUpdated: 'Last Updated',
    searchPlaceholder: 'Search...',
    editLinks: false,
    docsDir: 'docs',
    chart: {
      imports: [
        ['scripts/register.js'],
        ['scripts/utils.js', 'Utils'],
        ['scripts/helpers.js', 'helpers'],
        ['scripts/components.js', 'components']
      ]
    },
    nav: [
      {text: 'Home', link: '/'},
      {text: 'API', link: '/api/'},
      {text: 'Samples', link: `/samples/`},
      {
        text: 'Ecosystem',
        ariaLabel: 'Community Menu',
        items: [
          { text: 'Awesome', link: 'https://github.com/chartjs/awesome' },
          { text: 'Slack', link: 'https://chartjs-slack.herokuapp.com/' },
          { text: 'Stack Overflow', link: 'https://stackoverflow.com/questions/tagged/chart.js' }
        ]
      }
    ],
    sidebar: {
      '/api/': 'API',
      '/samples/': [
        'information',
        {
          title: 'Bar Charts',
          children: [
            'bar/border-radius',
            'bar/floating',
            'bar/horizontal',
            'bar/stacked',
            'bar/stacked-groups',
            'bar/vertical',
          ]
        },
        {
          title: 'Line Charts',
          children: [
            'line/interpolation',
            'line/line',
            'line/multi-axis',
            'line/point-styling',
            'line/segments',
            'line/stepped',
            'line/styling',
          ]
        },
        {
          title: 'Other charts',
          children: [
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
          ]
        },
        {
          title: 'Area charts',
          children: [
            'area/line-boundaries',
            'area/line-datasets',
            'area/line-drawtime',
            'area/line-stacked',
            'area/radar'
          ]
        },
        {
          title: 'Scales',
          children: [
            'scales/linear-min-max',
            'scales/linear-min-max-suggested',
            'scales/linear-step-size',
            'scales/log',
            'scales/stacked',
            'scales/time-line',
            'scales/time-max-span',
            'scales/time-combo',
          ]
        },
        {
          title: 'Scale Options',
          children: [
            'scale-options/center',
            'scale-options/grid',
            'scale-options/ticks',
            'scale-options/titles',
          ]
        },
        {
          title: 'Legend',
          children: [
            'legend/events',
            'legend/html',
            'legend/point-style',
            'legend/position',
            'legend/title',
          ]
        },
        {
          title: 'Title',
          children: [
            'title/alignment',
          ]
        },
        {
          title: 'Subtitle',
          children: [
            'subtitle/basic',
          ]
        },        {
          title: 'Tooltip',
          children: [
            'tooltip/content',
            'tooltip/html',
            'tooltip/interactions',
            'tooltip/point-style',
            'tooltip/position',
          ]
        },
        {
          title: 'Scriptable Options',
          children: [
            'scriptable/bar',
            'scriptable/bubble',
            'scriptable/line',
            'scriptable/pie',
            'scriptable/polar',
            'scriptable/radar',
          ]
        },
        {
          title: 'Animations',
          children: [
            'animations/delay',
            'animations/drop',
            'animations/loop',
            'animations/progressive-line',
            'animations/progressive-line-easing',
          ]
        },
        {
          title: 'Advanced',
          children: [
            'advanced/data-decimation',
            'advanced/derived-axis-type',
            'advanced/derived-chart-type',
            'advanced/linear-gradient',
            'advanced/programmatic-events',
            'advanced/progress-bar',
            'advanced/radial-gradient',
          ]
        },
        {
          title: 'Plugins',
          children: [
            'plugins/chart-area-border',
            'plugins/doughnut-empty-state',
            'plugins/quadrants',
          ]
        },
        'utils'
      ],
      '/': [
        '',
        {
          title: 'Getting Started',
          children: [
            'getting-started/',
            'getting-started/installation',
            'getting-started/integration',
            'getting-started/usage',
          ]
        },
        {
          title: 'General',
          children: [
            'general/accessibility',
            'general/colors',
            'general/data-structures',
            'general/fonts',
            'general/options',
            'general/padding',
            'general/performance'
          ]
        },
        {
          title: 'Configuration',
          children: [
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
          ]
        },
        {
          title: 'Chart Types',
          children: [
            'charts/area',
            'charts/bar',
            'charts/bubble',
            'charts/doughnut',
            'charts/line',
            'charts/mixed',
            'charts/polar',
            'charts/radar',
            'charts/scatter',
          ]
        },
        {
          title: 'Axes',
          children: [
            'axes/',
            {
              title: 'Cartesian',
              children: [
                'axes/cartesian/',
                'axes/cartesian/category',
                'axes/cartesian/linear',
                'axes/cartesian/logarithmic',
                'axes/cartesian/time',
                'axes/cartesian/timeseries'
              ],
            },
            {
              title: 'Radial',
              children: [
                'axes/radial/',
                'axes/radial/linear'
              ],
            },
            'axes/labelling',
            'axes/styling'
          ]
        },
        {
          title: 'Developers',
          children: [
            'developers/',
            'developers/api',
            'developers/axes',
            'developers/charts',
            'developers/contributing',
            'developers/plugins',
            'developers/publishing',
            ['api/', 'TypeDoc'],
            'developers/updates',
          ]
        },
        {
          title: 'Migration',
          children: [
            'migration/v4-migration',
            'migration/v3-migration',
          ]
        },
      ],
    } as any
  } as DefaultThemeConfig
});
