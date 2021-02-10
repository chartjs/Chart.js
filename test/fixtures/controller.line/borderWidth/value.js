module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          borderColor: '#0000ff',
          borderWidth: 6
        },
        {
          // option in element (fallback)
          data: [4, -5, -10, null, 10, 5],
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderColor: '#00ff00',
          borderWidth: 3,
          fill: false,
        },
        point: {
          radius: 10,
        }
      },
      layout: {
        padding: 32
      },
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
