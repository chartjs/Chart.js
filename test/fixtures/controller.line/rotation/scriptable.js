module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          pointBorderColor: '#0000ff',
          pointRotation: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 120
              : value > -4 ? 60
              : 0;
          }
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
          fill: false,
        },
        point: {
          borderColor: '#ff0000',
          rotation: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 0
              : value > -4 ? 60
              : 120;
          },
          pointStyle: 'line',
          radius: 10,
        }
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
