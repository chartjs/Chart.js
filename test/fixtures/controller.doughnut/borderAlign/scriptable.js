module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 2, 4, null, 6, 8],
          borderAlign: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 'inner' : 'center';
          },
          borderColor: '#0000ff',
        },
        {
          // option in element (fallback)
          data: [0, 2, 4, null, 6, 8],
        }
      ]
    },
    options: {
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderColor: '#ff00ff',
          borderWidth: 8,
          borderAlign: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return value > 4 ? 'center' : 'inner';
          }
        }
      },
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
