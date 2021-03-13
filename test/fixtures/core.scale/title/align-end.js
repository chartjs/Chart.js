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
            align: 'end',
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
            align: 'end',
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
            align: 'end',
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
            align: 'end',
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
