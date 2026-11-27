module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
      datasets: [{
        backgroundColor: 'red',
        borderColor: 'red',
        fill: false,
        data: [-4200, -4200, -4165, -4200, -4080, 0, 82800, 2295800, 60995800, 99995800]
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          display: false,
        },
        y: {
          type: 'symlog',
          ticks: {
            autoSkip: false
          }
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
