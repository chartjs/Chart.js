module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 2, 3, 3, 2, 1],
        borderColor: 'black',
        segments: {
          up: {
            slope: v => v > 0,
            borderColor: 'green',
          },
          down: {
            slope: v => v < 0,
            borderColor: 'red',
            borderDash: [5, 5]
          }
        }
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  }
};
