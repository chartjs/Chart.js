module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [4, 5, 10, null, -10, -5],
          backgroundColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
              : '#ff00ff';
          }
        },
        {
          // option in element (fallback)
          data: [-4, -5, -10, null, 10, 5],
        }
      ]
    },
    options: {
      elements: {
        line: {
          fill: true,
          backgroundColor: function(ctx) {
            var index = ctx.index;
            return index === 0 ? '#ff0000'
              : index === 1 ? '#00ff00'
              : '#ff00ff';
          }
        },
        point: {
          backgroundColor: '#0000ff',
          radius: 10
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
      height: 256,
      width: 512
    }
  }
};
