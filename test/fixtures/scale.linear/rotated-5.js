module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9025',
  threshold: 0.2,
  config: {
    type: 'scatter',
    options: {
      scales: {
        y: {
          min: 0,
          max: 500000,
          ticks: {
            minRotation: 5,
            maxRotation: 5,
          }
        },
        x: {
          min: 0,
          max: 500000,
          ticks: {
            minRotation: 5,
            maxRotation: 5,
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
