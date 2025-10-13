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
            text: 'top',
            strokeWidth: 1,
            strokeColor: '#333'
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
            text: 'left',
            strokeWidth: 1,
            strokeColor: '#333',
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
            text: 'bottom',
            strokeWidth: 1,
            strokeColor: '#333',
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
            text: 'right',
            strokeWidth: 1,
            strokeColor: '#333',
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
