module.exports = {
  config: {
    type: 'line',
    options: {
      scales: {
        x: {
          labels: ['Left Label', 'Center Label', 'Right Label'],
          position: {
            y: 30
          },
        },
        y: {
          display: false,
          min: -100,
          max: 100,
        }
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    },
    spriteText: true
  }
};
