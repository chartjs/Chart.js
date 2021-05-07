module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9025',
  threshold: 0.15,
  config: {
    type: 'scatter',
    options: {
      scales: {
        y: {
          max: 1069,
          min: 230,
          ticks: {
            autoSkip: false,
            minRotation: 22.5
          }
        },
        x: {
          max: 1069,
          min: 230,
          ticks: {
            autoSkip: false,
            minRotation: 35
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 214,
      width: 416
    }
  }
};
