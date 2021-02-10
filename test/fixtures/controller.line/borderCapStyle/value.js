module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3],
      datasets: [
        {
          // option in dataset
          data: [null, 3, 3],
          borderCapStyle: 'round',
        },
        {
          // option in dataset
          data: [null, 2, 2],
          borderCapStyle: 'square',
        },
        {
          // option in element (fallback)
          data: [null, 1, 1],
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderCapStyle: 'butt',
          borderColor: '#00ff00',
          borderWidth: 32,
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
