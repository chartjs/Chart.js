module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: ['Label1', 'Label2', 'Label3']
    },
    options: {
      scales: {
        x: {
          ticks: {
            align: 'inner',
          },
        },
        y: {
          ticks: {
            align: 'inner',
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
