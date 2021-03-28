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
            {
              title: 'Interactions',
              children: [
                'configuration/interactions/',
                'configuration/interactions/events',
                'configuration/interactions/modes'
              ],
            },
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