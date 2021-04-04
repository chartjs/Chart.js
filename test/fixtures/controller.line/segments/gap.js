module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 3, NaN, NaN, 2, 1],
        borderColor: 'black',
        segments: {
          gap: {
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
