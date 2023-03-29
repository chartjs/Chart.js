function modifyWebpackConfig(config) {
  config.target = 'web';

  return config;
}

module.exports = [
  {
    path: 'dist/chart.js',
    limit: '79 KB',
    webpack: false,
    running: false
  },
  {
    path: 'dist/chart.js',
    limit: '37.0 KB',
    import: '{ Chart }',
    running: false,
    modifyWebpackConfig
  },
  {
    path: 'dist/chart.js',
    limit: '22.0 KB',
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
    limit: '36.5 KB',
    import: '{ Decimation, Filler, Legend, SubTitle, Title, Tooltip, Colors }',
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
