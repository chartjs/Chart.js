module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9025',
  threshold: 0.2,
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [
          {x: 10000000, y: 65},
          {x: 20000000, y: 12},
          {x: 30000000, y: 23},
          {x: 40000000, y: 51},
          {x: 50000000, y: 17},
          {x: 60000000, y: 23}
        ]
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          min: 10000000,
          max: 60000000,
          ticks: {
            minRotation: 45,
            maxRotation: 45,
            count: 6
          }
        }
      }
    }
  },
  options: {
    canvas: {
      width: 200,
      height: 200
    },
    spriteText: true
  }
};

