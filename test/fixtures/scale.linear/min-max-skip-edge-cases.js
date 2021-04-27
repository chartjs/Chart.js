module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8982',
  config: {
    type: 'line',
    options: {
      scales: {
        y: {
          max: 1033,
          min: 266,
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
