module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8912',
  config: {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue'],
      datasets: [{
        data: [10, -10]
      }]
    },
    options: {
      plugins: false,
      scales: {
        x: {
          display: false,
        },
        y: {
          grace: '100%'
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
