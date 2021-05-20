module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9025',
  threshold: 0.2,
  config: {
    type: 'scatter',
    options: {
      scales: {
        y: {
          min: 1612781975085.5466,
          max: 1620287255085.5466,
          ticks: {
            autoSkip: false,
            minRotation: 45,
            maxRotation: 45,
            count: 13
          }
        },
        x: {
          min: 1612781975085.5466,
          max: 1620287255085.5466,
          ticks: {
            autoSkip: false,
            minRotation: 45,
            maxRotation: 45,
            count: 13
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 350,
      width: 350
    }
  }
};
