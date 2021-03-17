module.exports = {
  threshold: 0.01,
  tolerance: 0.0015,
  config: {
    type: 'line',
    data: {
      labels: ['2017', '2019', '2020', '2025', '2042'],
      datasets: [{data: [0, 1, 2, 3, 4], fill: false}]
    },
    options: {
      scales: {
        x: {
          type: 'timeseries',
          min: '2012',
          max: '2051',
          offset: true,
          time: {
            parser: 'YYYY',
          },
          ticks: {
            source: 'labels'
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
