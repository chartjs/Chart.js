module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['0', '1', '2', '3', '4', '5', '6', '7'],
      datasets: [
        {
          data: [null, 1000, null, 1000, null, 1000, null, 1000],
          backgroundColor: '#00ff00',
          borderColor: '#ff0000'
        },
        {
          data: [null, null, 1000, 1000, null, null, 1000, 1000],
          backgroundColor: '#ff0000',
          borderColor: '#ff0000'
        },
        {
          data: [null, null, null, null, 1000, 1000, 1000, 1000],
          backgroundColor: '#0000ff',
          borderColor: '#0000ff'
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
