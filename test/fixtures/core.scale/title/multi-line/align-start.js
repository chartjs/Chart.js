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
            align: 'start',
            text: ['top', 'line2', 'line3']
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
            align: 'start',
            text: ['left', 'line2', 'line3']
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
            align: 'start',
            text: ['bottom', 'line2', 'line3']
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
            align: 'start',
            text: ['right', 'line2', 'line3']
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
