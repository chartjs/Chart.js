module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 4, 2, 6, 4, 8],
          borderColor: '#ff0000',
          cubicInterpolationMode: 'monotone'
        },
        {
          // option in element (fallback)
          data: [2, 6, 4, 8, 6, 10]
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderColor: '#00ff00',
          borderWidth: 20,
          cubicInterpolationMode: 'default',
          fill: false,
          tension: 0.4
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
