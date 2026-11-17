module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        backgroundColor: 'red',
        borderColor: 'red',
        showLine: true,
        data: [
          {x: -4200, y: 0}, {x: -150, y: 1}, {x: 0, y: 2}, {x: 35, y: 3},
          {x: 87000, y: 4}, {x: 2300000, y: 5}, {x: 61000000, y: 6}
        ]
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          type: 'symlog',
          ticks: {
            autoSkip: false
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
