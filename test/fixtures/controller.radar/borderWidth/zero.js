module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          backgroundColor: '#0000ff',
          borderColor: '#0000ff',
          borderWidth: 0,
        },
        {
          // option in element (fallback)
          data: [4, -5, -10, null, 10, 5]
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderColor: '#00ff00',
          borderWidth: 1,
          fill: false
        },
        point: {
          backgroundColor: '#00ff00',
          radius: 10
        }
      },
      scales: {
        r: {
          display: false,
          min: -15
        }
      }

    }
  },
  options: {
    canvas: {
      height: 512,
      width: 512
    }
  }
};
