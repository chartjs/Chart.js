module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6'],
      datasets: [{
        backgroundColor: 'red',
        borderColor: 'red',
        fill: false,
        data: [-4200, -150, 0, 35, 87000, 2300000, 61000000]
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
          min: -1000,
          max: 10000000,
          reverse: true,
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
