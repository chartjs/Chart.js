module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        backgroundColor: '#AAFFCC',
        borderColor: '#0000FF',
        borderWidth: 1,
        data: [1, 2]
      }]
    },
    options: {
      scales: {
        x: {
          display: false
        },
        y: {
          ticks: {
            display: false
          },
          grid: {
            color: function(context) {
              return context.tick.value === 0 ? 'red' : 'transparent';
            },
            lineWidth: 5,
            tickLength: 0
          },
        }
      },
      maintainAspectRatio: false
    }
  },
  options: {
    canvas: {
      width: 128,
      height: 128
    }
  }
};
