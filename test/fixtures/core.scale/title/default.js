module.exports = {
  config: {
    type: 'line',
    options: {
      events: [],
      scales: {
        top: {
          type: 'linear',
          position: 'top',
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'top'
          }
        },
        left: {
          type: 'linear',
          position: 'left',
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'left'
          }
        },
        bottom: {
          type: 'linear',
          position: 'bottom',
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'bottom'
          }
        },
        right: {
          type: 'linear',
          position: 'right',
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'right'
          }
        },
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 256
    },
  }
};
