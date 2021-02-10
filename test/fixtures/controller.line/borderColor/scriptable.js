module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [4, 5, 10, null, -10, -5],
          borderColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
              : '#0000ff';
          }
        },
        {
          // option in element (fallback)
          data: [-4, -5, -10, null, 10, 5]
        }
      ]
    },
    options: {
      elements: {
        line: {
          borderColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
              : '#0000ff';
          },
          borderWidth: 10,
          fill: false
        },
        point: {
          borderColor: '#ff0000',
          borderWidth: 10,
          radius: 16
        }
      },
      layout: {
        padding: 32
      },
      scales: {
        x: {display: false},
        y: {
          display: false,
          beginAtZero: true
        }
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
