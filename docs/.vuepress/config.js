module.exports = {
  title: 'chartjs-plugin-annotation',
  description: 'Open source HTML5 Charts for your website',
  base: '/',
  head: [
    ['link', {rel: 'icon', href: '/favicon.ico'}],
  ],
  plugins: [
    [ChartEditorPlugin, {
      imports: [
        ['scripts/register.js'],
        ['scripts/utils.js', 'Utils'],
      ]
    }],
  ],
  themeConfig: {
    repo: 'chartjs/Chart.js',
    logo: '/favicon.ico',
    lastUpdated: 'Last Updated',
    editLinks: false,
    docsDir: 'samples',
    nav: [
      {text: 'Home', link: '/'},
      {text: 'Guide', link: '/guide/'},
      {text: 'Samples', link: '/samples/'},
    ],
    sidebar: {
      // '/guide/': [
      //   '',
      //   'integration',
      //   'usage',
      //   'options',
      //   'interaction',
      //   {
      //     title: 'Annotations',
      //     collapsable: false,
      //     children: [
      //       'types/box',
      //       'types/ellipse',
      //       'types/line',
      //       'types/point'
      //     ]
      //   }
      ],
      // '/samples/': [
      //   {
      //     title: 'Samples',
      //     collapsable: false,
      //     children: [
      //       'types/line',
      //       'types/box',
      //     ],
      //   },
      // ]
    }
  }
};