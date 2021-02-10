module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          backgroundColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
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
          backgroundColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
              : '#ff00ff';
          },
          fill: true,
        },
        point: {
          backgroundColor: '#0000ff',
          radius: 10
        }
      },
      scales: {
        r: {
          display: false,
          min: -15,
        },
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: true
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
