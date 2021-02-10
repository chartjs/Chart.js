module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          pointBackgroundColor: '#0000ff',
          pointRadius: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 10
              : value > -4 ? 5
              : 2;
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
          backgroundColor: '#ff0000',
          radius: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 2
              : value > -4 ? 5
              : 10;
          },
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
