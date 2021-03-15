module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/4234',
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [0, 2, 45, 30]
      }],
      labels: ['A', 'B', 'C', 'D']
    },
    options: {
      scales: {
        y: {
          ticks: {
            count: 21,
            callback: (v) => v.toString(),
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
