module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 2, 3, 3, 2, 1],
        borderColor: 'black',
        segment: {
          borderColor: 'red',
        }
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
  options: {
    canvas: {
      width: 256,
      height: 256
    }
  }
};
