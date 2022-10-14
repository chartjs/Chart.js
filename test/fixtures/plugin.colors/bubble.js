module.exports = {
  config: {
    type: 'bubble',
    data: {
      datasets: [{
        data: [{x: 12, y: 54, r: 22.4}]
      }, {
        data: [{x: 18, y: 38, r: 25}]
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            display: false,
          }
        },
        y: {
          ticks: {
            display: false,
          }
        }
      },
      plugins: {
        legend: false,
        colors: {
          enabled: true
        }
      }
    }
  }
};
