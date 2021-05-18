module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9078',
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: [
          {x: 1, y: 3.5},
          {x: 2, y: 4.7},
          {x: 3, y: 7.3},
          {x: 4, y: 6.7}
        ]
      }]
    },
    options: {
      scales: {
        x: {
          type: 'linear',
          display: false,
        },
        y: {
          min: 3.5,
          max: 8.5,
          ticks: {
            count: 6,
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 256,
      height: 256
    }
  }
};
