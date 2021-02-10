module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [
        {
          data: {0: 5, 1: 20, 2: 1, 3: 10},
          backgroundColor: '#00ff00',
          borderColor: '#ff0000'
        },
        {
          data: {0: 10, 1: null, 2: 1, 3: NaN},
          backgroundColor: '#ff0000',
          borderColor: '#ff0000'
        }
      ]
    },
    options: {
      skipNull: true,
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
