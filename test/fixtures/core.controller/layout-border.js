module.exports = {
  config: {
    type: 'line',
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      },
      layout: {
        borderColor: 'red',
        borderWidth: {
          top: 1,
          right: 2,
          bottom: 3,
          left: 4
        }
      }
    }
  },
  options: {
    canvas: {
      width: 256,
      height: 128
    }
  }
};
