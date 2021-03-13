const ticks = {
  display: false
};
const grid = {
  display: false
};
const title = {
  display: true,
  test: ''
};
module.exports = {
  config: {
    type: 'line',
    options: {
      events: [],
      scales: {
        top: {
          type: 'linear',
          backgroundColor: 'red',
          position: 'top',
          ticks,
          grid,
          title
        },
        left: {
          type: 'linear',
          backgroundColor: 'green',
          position: 'left',
          ticks,
          grid,
          title
        },
        bottom: {
          type: 'linear',
          backgroundColor: 'blue',
          position: 'bottom',
          ticks,
          grid,
          title
        },
        right: {
          type: 'linear',
          backgroundColor: 'gray',
          position: 'right',
          ticks,
          grid,
          title
        },
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 256
    },
  }
};
