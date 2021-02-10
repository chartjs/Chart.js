module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [-2, -6, -4, -8, -6, -10],
          backgroundColor: '#ff0000',
          fill: function(ctx) {
            return ctx.datasetIndex === 0 ? true : false;
          }
        },
        {
          // option in element (fallback)
          data: [0, 4, 2, 6, 4, 8],
        }
      ]
    },
    options: {
      elements: {
        line: {
          backgroundColor: '#00ff00',
          fill: function(ctx) {
            return ctx.datasetIndex === 0 ? true : false;
          }
        }
      },
      layout: {
        padding: 32
      },
      scales: {
        x: {display: false},
        y: {display: false}
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
