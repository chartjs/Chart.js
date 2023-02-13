module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [5, 2, 4, 7, 6, 8]
        }
      ]
    },
    options: {
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderColor: 'black',
          borderWidth: 1,
          borderDash: function(ctx) {
            var value = (ctx.dataIndex || 0) % 2;
            return value === 0 ? [3, 3] : [];
          }
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
