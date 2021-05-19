module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8982',
  config: {
    type: 'scatter',
    options: {
      scales: {
        y: {
          max: 1069,
          min: 230,
          ticks: {
            autoSkip: false
          }
        },
        x: {
          max: 1069,
          min: 230,
          ticks: {
            autoSkip: false
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 200,
      width: 557
    }
  }
};
