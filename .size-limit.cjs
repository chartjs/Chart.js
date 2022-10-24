function modifyWebpackConfig(config) {
  config.target = 'web';

  return config;
}

module.exports = [
  {
    path: 'dist/chart.js',
    limit: '78.5 KB',
    webpack: false,
    running: false
  },
  {
    path: 'dist/chart.js',
    limit: '34 KB',
    import: '{ Chart }',
    running: false,
    modifyWebpackConfig
  },
  {
    path: 'dist/chart.js',
    limit: '19.5 KB',
    import: '{ BarController, BubbleController, DoughnutController, LineController, PolarAreaController, PieController, RadarController, ScatterController }',
    running: false,
    modifyWebpackConfig
  },
  {
    path: 'dist/chart.js',
    limit: '14 KB',
    import: '{ ArcElement, LineElement, PointElement, BarElement }',
    running: false,
    modifyWebpackConfig
  },
  {
    path: 'dist/chart.js',
    limit: '27.5 KB',
    import: '{ Decimation, Filler, Legend, SubTitle, Title, Tooltip }',
    running: false,
    modifyWebpackConfig
  },
  {
    path: 'dist/chart.js',
    limit: '22.4 KB',
    import: '{ CategoryScale, LinearScale, LogarithmicScale, RadialLinearScale, TimeScale, TimeSeriesScale }',
    running: false,
    modifyWebpackConfig
  }
]
