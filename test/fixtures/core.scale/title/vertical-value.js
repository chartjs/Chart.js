module.exports = {
  config: {
    type: 'line',
    options: {
      events: [],
      scales: {
        y: {
          type: 'linear',
          position: {
            x: 40
          },
          min: 0,
          max: 100,
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'vertical'
          }
        },
        x: {
          type: 'linear',
          position: 'bottom',
          min: 0,
          max: 100,
          ticks: {
            display: false
          },
          grid: {
            display: false
          },
          title: {
            display: true,
            text: 'horizontal'
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
