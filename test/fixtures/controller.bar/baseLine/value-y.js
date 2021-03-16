module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        backgroundColor: '#AAFFCC',
        borderColor: '#0000FF',
        borderWidth: 1,
        data: [1, 3]
      }]
    },
    options: {
      base: 2,
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
              return context.tick.value === 2 ? 'red' : 'transparent';
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
