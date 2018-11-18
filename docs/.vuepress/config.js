module.exports = {
  title: 'Chart.js documentation',
  dest: './dist',
  ga: 'UA-28909194-3',
  head: [
    ['link', { rel: 'icon', href: `/favicon.ico` }],
  ],
  themeConfig: {
    repo: 'chartjs/Chart.js',
    lastUpdated: 'Last Updated',
    editLinks: true,
    docsDir: 'docs',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/docs/' },
      { text: 'Samples', link: '/samples/' }
    ],
    sidebar: [
      {
        title: 'Getting Started',
        collapsable: false,
        children: [
          '/getting-started/',
          '/getting-started/installation',
          '/getting-started/integration'
        ]
      },
      {
        title: 'General',
        collapsable: false,
        children: [
          '/general/',
          '/general/accessibility',
          '/general/responsive',
          '/general/device-pixel-ratio',
          '/general/interactions/',
          '/general/interactions/events',
          '/general/interactions/modes',
          '/general/options',
          '/general/colors',
          '/general/fonts'
        ]
      },
      {
        title: 'Configuration',
        collapsable: false,
        children: [
          '/configuration/',
          '/configuration/animations',
          '/configuration/layout',
          '/configuration/legend',
          '/configuration/title',
          '/configuration/tooltip',
          '/configuration/elements'
        ]
      },
      {
        title: 'Charts',
        collapsable: false,
        children: [
          '/charts/',
          '/charts/line',
          '/charts/bar',
          '/charts/radar',
          '/charts/doughnut',
          '/charts/polar',
          '/charts/bubble',
          '/charts/scatter',
          '/charts/area',
          '/charts/mixed'
        ]
      },
      {
        title: 'Axes',
        collapsable: false,
        children: [
          '/axes/',
          '/axes/cartesian/',
          '/axes/cartesian/category',
          '/axes/cartesian/linear',
          '/axes/cartesian/logarithmic',
          '/axes/cartesian/time',
          '/axes/radial/',
          '/axes/radial/linear',
          '/axes/labelling',
          '/axes/styling'
        ]
      },
      {
        title: 'Developers',
        collapsable: false,
        children: [
          '/developers/',
          '/developers/api',
          '/developers/updates',
          '/developers/plugins',
          '/developers/charts',
          '/developers/axes',
          '/developers/contributing'
        ]
      },
      {
        title: 'Additional Notes',
        collapsable: false,
        children: [
          '/notes/',
          '/notes/comparison',
          '/notes/extensions',
          '/notes/license'
        ]
      }
    ]
  }
}
