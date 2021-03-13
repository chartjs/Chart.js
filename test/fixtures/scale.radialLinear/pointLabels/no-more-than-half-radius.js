module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['Too long label 1', 'Too long label 2', 'Too long label 3', 'Too long label 4'],
      datasets: [
        {
          backgroundColor: '#E43E51',
          data: [1, 1, 1, 1]
        }
      ]
    },
    options: {
      scales: {
        r: {
          max: 1,
          ticks: {
            display: false,
          },
          grid: {
            display: false
          }
        }
      },
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
