const path = require('path');
const docsVersion = "VERSION";
const base = process.env.NODE_ENV === "development" ? '' : `/docs/${docsVersion}/`;

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
    [
      '@vuepress/google-analytics',
      {
        'ga': 'UA-28909194-3'
      }
    ],
    /* COMMENTED OUT FOR SAMPLES DEV, BECAUSE KEEPS CRASHING ON HOT RELOAD
    [
      'vuepress-plugin-typedoc',

      {
        entryPoints: ['../../types/index.esm.d.ts'],
        hideInPageTOC: true,
        tsconfig: '../../tsconfig.json',
        sidebar: {
          fullNames: true,
          parentCategory: 'API',
        },
      },
    ],*/
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
      ]
    },
    nav: [
      {text: 'Home', link: '/'},
      {text: 'API', link: '/api/'},
      // TODO: Make local when samples moved to vuepress
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
        '',
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
          ]
        },
        {
          title: 'Advanced',
          children: [
            'advanced/derived-axis-type',
            'advanced/derived-chart-type',
          ]
        },
        {
          title: 'Area charts',
          children: [
            'area/line-boundaries',
            'area/line-datasets',
            'area/line-stacked',
            'area/radar'
          ]
        }
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
