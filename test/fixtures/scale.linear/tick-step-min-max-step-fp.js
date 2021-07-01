module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9334',
  config: {
    type: 'line',
    options: {
      scales: {
        y: {
          display: false,
        },
        x: {
          type: 'linear',
          min: 7.2,
          max: 21.6,
          ticks: {
            stepSize: 1.8
          }
        },
      }
    }
  },
  options: {
    spriteText: true
  }
};
