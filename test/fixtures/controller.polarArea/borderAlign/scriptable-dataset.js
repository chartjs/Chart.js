module.exports = {
  config: {
    type: 'polarArea',
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
      ]
    },
    options: {
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderColor: '#ff00ff',
          borderWidth: 8,
        }
      },
      scales: {
        r: {
          display: false
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
