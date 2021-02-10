module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          borderSkipped: false,
          borderWidth: function(ctx) {
            var value = ctx.dataset.data[ctx.dataIndex] || 0;
            return {top: Math.abs(value)};
          }
        },
        {
          // option in element (fallback)
          data: [0, 5, 10, null, -10, -5]
        }
      ]
    },
    options: {
      elements: {
        bar: {
          backgroundColor: 'transparent',
          borderColor: '#80808080',
          borderSkipped: false,
          borderWidth: function(ctx) {
            return {left: ctx.dataIndex * 2};
          }
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
