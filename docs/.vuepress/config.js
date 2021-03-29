const path = require('path');
const pkg = require('../../package.json');
const docsVersion = pkg.version.indexOf('-') > -1 ? 'next' : 'latest';

module.exports = {
  title: 'Chart.js',
  description: 'Open source HTML5 Charts for your website',
  theme: 'chartjs',
  base: '/',
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
  ],
  plugins: [
    'tabs',
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
      // {text: 'Guide', link: '/guide/'},
      // {text: 'Samples', link: '/samples/'},
    ],
    sidebar: {
      '/': [
        '',
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
          path: '/configuration/',
          children: [
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
          path: '/axes/',
          children: [
            {
              title: 'Cartesian',
              path: '/axes/cartesian/',
              children: [
                'axes/cartesian/category',
                'axes/cartesian/linear',
                'axes/cartesian/logarithmic',
                'axes/cartesian/time',
                'axes/cartesian/timeseries'
              ],
            },
            {
              title: 'Radial',
              path: '/axes/radial/',
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
          path: '/developers/',
          children: [
            'developers/api',
            [`https://chartjs.org/docs/${docsVersion}/typedoc/`, 'TypeDoc'],
            'developers/updates',
            'developers/plugins',
            'developers/charts',
            'developers/axes',
            'developers/contributing',
            'developers/publishing'
          ]
        },
        {
          title: 'Additional Notes',
          children: [
            ['https://github.com/chartjs/awesome', 'Extensions'],
            'notes/license'
          ]
        }
      ],
    }
  }
};
