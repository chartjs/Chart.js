module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/4234',
  config: {
    type: 'line',
    options: {
      scales: {
        y: {
          max: 50,
          min: 0,
          ticks: {
            count: 21,
          }
        },
        x: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
