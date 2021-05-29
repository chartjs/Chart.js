module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        borderColor: 'red',
        data: [50, 75],
      }, {
        borderColor: 'blue',
        data: [25, 50],
      }]
    },
    options: {
      scales: {
        x: {
          display: false
        },
        y: {
          stacked: true,
          bounds: 'data'
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
