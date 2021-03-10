const ticks = {
  display: false
};
const gridLines = {
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
          gridLines,
          title
        },
        left: {
          type: 'linear',
          backgroundColor: 'green',
          position: 'left',
          ticks,
          gridLines,
          title
        },
        bottom: {
          type: 'linear',
          backgroundColor: 'blue',
          position: 'bottom',
          ticks,
          gridLines,
          title
        },
        right: {
          type: 'linear',
          backgroundColor: 'gray',
          position: 'right',
          ticks,
          gridLines,
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
