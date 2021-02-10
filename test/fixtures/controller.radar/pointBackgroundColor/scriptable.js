module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          pointBackgroundColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 8 ? '#ff0000'
              : value > 0 ? '#00ff00'
              : value > -8 ? '#0000ff'
              : '#ff00ff';
          }
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
          fill: false
        },
        point: {
          backgroundColor: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 8 ? '#ff00ff'
              : value > 0 ? '#0000ff'
              : value > -8 ? '#ff0000'
              : '#00ff00';
          },
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
