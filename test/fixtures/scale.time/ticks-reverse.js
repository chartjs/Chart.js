module.exports = {
  threshold: 0.01,
  tolerance: 0.0015,
  config: {
    type: 'line',
    data: {
      labels: ['2017', '2018', '2019', '2020', '2021'],
      datasets: [{data: [0, 1, 2, 3, 4], fill: false}]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          reverse: true,
          time: {
            parser: 'YYYY',
            unit: 'year'
          },
          ticks: {
            source: 'labels',
          },
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
