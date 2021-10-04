module.exports = {
  config: {
    type: 'bubble',
    data: {
      datasets: [{
        backgroundColor: 'red',
        data: [{x: 12, y: 54, r: 22.4}]
      }, {
        backgroundColor: 'blue',
        data: [{x: 18, y: 38, r: 25}]
      }]
    },
    options: {
      layout: {
        autoPadding: false,
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 256,
      height: 256
    }
  }
};
