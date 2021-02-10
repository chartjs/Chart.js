module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 3, 4],
      datasets: [
        {
          data: [5, 20, 1, 10],
          backgroundColor: '#00ff00',
          borderColor: '#ff0000'
        }
      ]
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
      height: 256,
      width: 512
    }
  }
};
