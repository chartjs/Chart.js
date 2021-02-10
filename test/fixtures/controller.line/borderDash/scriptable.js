module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [4, 5, 10, null, -10, -5],
          borderDash: function(ctx) {
            return ctx.datasetIndex === 0 ? [5] : [10];
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
          borderColor: '#00ff00',
          borderDash: function(ctx) {
            return ctx.datasetIndex === 0 ? [5] : [10];
          }
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
