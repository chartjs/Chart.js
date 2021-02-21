module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {data: [10, 5, 0, 25, 78, -10]}
      ],
      labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', '']
    },
    options: {
      plugins: {
        legend: false
      },
      scales: {
        x: {
          display: false
        },
        y: {
          type: 'linear',
          position: 'left',
          ticks: {
            callback: function(value) {
              return value + ' very long unit!';
            },
          }
        },
        y1: {
          type: 'linear',
          position: 'left',
          display: false
        },
        y2: {
          type: 'linear',
          position: 'left',
          display: false
        },
        y3: {
          type: 'linear',
          position: 'left',
          display: false
        },
        y4: {
          type: 'linear',
          position: 'left',
          display: false
        },
        y5: {
          type: 'linear',
          position: 'left',
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 256
    }
  }
};
