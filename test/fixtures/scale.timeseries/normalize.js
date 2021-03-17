module.exports = {
  threshold: 0.01,
  tolerance: 0.002,
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [
          {x: '2017', y: null},
          {x: '2018', y: 1},
          {x: '2019', y: 2},
          {x: '2020', y: 3},
          {x: '2021', y: 4}
        ],
        fill: false
      }]
    },
    options: {
      normalized: true,
      scales: {
        x: {
          type: 'timeseries',
          time: {
            parser: 'YYYY'
          },
          ticks: {
            source: 'data'
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
