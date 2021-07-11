const path = require('path');
const docsVersion = "VERSION";
const base = process.env.NODE_ENV === "development" ? '/docs/master/' : `/docs/${docsVersion}/`;

module.exports = {
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
        {base: '/samples', alternative: ['bar/vertical']},
      ],
    }],
    ['vuepress-plugin-code-copy', true],
    [
      'vuepress-plugin-typedoc',
      {
        entryPoints: ['../../types/index.esm.d.ts'],
        hideInPageTOC: true,
        tsconfig: 'tsconfig.json',
        sidebar: {
          fullNames: true,
          parentCategory: 'API',
        },
      },
    ],
    ['@simonbrunel/vuepress-plugin-versions', {
      filters: {
        suffix: (tag) => tag ? ` (${tag})` : '',
        title: (v, vars) => window.location.href.includes('master') ? 'Development (master)' : v + (vars.tag ? ` (${tag})` : ''),
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
  ],
  chainWebpack(config) {
    config.merge({
      resolve: {
        alias: {
          'chart.js': path.resolve(__dirname, '../../dist/chart.esm.js'),
        }
      }
    })
  },
  markdown: {
    extendMarkdown: md => {
      md.use(require('markdown-it-include'), path.resolve(__dirname, '../'));
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
      '/api/': {
        title: 'API'
      },
      '/samples/': [
        {
          title: 'Bar Charts',
          children: [
            'bar/vertical',
            'bar/horizontal',
            'bar/stacked',
            'bar/stacked-groups',
            'bar/floating',
            'bar/border-radius',
          ]
        },
        {
          title: 'Line Charts',
          children: [
            'line/line',
            'line/multi-axis',
            'line/stepped',
            'line/interpolation',
            'line/styling',
            // 'line/point-styling',
            'line/segments',
          ]
        },
        {
          title: 'Other charts',
          children: [
            'other-charts/bubble',
            'other-charts/scatter',
            'other-charts/scatter-multi-axis',
            'other-charts/doughnut',
            'other-charts/pie',
            'other-charts/multi-series-pie',
            'other-charts/polar-area',
            'other-charts/radar',
            'other-charts/radar-skip-points',
            'other-charts/combo-bar-line',
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
            'scales/time-line',
            'scales/time-max-span',
            'scales/time-combo',
            'scales/stacked'
          ]
        },
        {
          title: 'Scale Options',
          children: [
            'scale-options/grid',
            'scale-options/ticks',
            'scale-options/titles',
            'scale-options/center'
          ]
        },
        {
          title: 'Legend',
          children: [
            'legend/position',
            'legend/title',
            'legend/point-style',
            'legend/events',
            'legend/html',
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
            'tooltip/position',
            'tooltip/interactions',
            'tooltip/point-style',
            'tooltip/content',
            'tooltip/html',
          ]
        },
        {
          title: 'Scriptable Options',
          children: [
            'scriptable/bar',
            'scriptable/bubble',
            'scriptable/pie',
            'scriptable/line',
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
          ]
        },
        {
          title: 'Advanced',
          children: [
            'advanced/data-decimation',
            'advanced/progress-bar',
            'advanced/radial-gradient',
            'advanced/linear-gradient',
            'advanced/programmatic-events',
            'advanced/derived-axis-type',
            'advanced/derived-chart-type',
          ]
        },
        {
          title: 'Plugins',
          children: [
            'plugins/chart-area-border',
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
            'getting-started/v3-migration'
          ]
        },
        {
          title: 'General',
          children: [
            'general/data-structures',
            'general/accessibility',
            'general/options',
            'general/colors',
            'general/fonts',
            'general/padding',
            'general/performance'
          ]
        },
        {
          title: 'Configuration',
          children: [
            'configuration/',
            'configuration/responsive',
            'configuration/device-pixel-ratio',
            'configuration/locale',
            'configuration/interactions',
            'configuration/canvas-background',
            'configuration/animations',
            'configuration/layout',
            'configuration/legend',
            'configuration/title',
            'configuration/subtitle',
            'configuration/tooltip',
            'configuration/elements',
            'configuration/decimation'
          ]
        },
        {
          title: 'Chart Types',
          children: [
            'charts/line',
            'charts/bar',
            'charts/radar',
            'charts/doughnut',
            'charts/polar',
            'charts/bubble',
            'charts/scatter',
            'charts/area',
            'charts/mixed'
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
            ['api/', 'TypeDoc'],
            'developers/updates',
            'developers/plugins',
            'developers/charts',
            'developers/axes',
            'developers/contributing',
            'developers/publishing'
          ]
        },
      ],
    }
  }
};
