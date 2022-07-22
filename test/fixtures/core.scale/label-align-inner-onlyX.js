module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: ['Label1_long', 'Label2_long', 'Label3_long']
    },
    options: {
      scales: {
        x: {
          ticks: {
            align: 'inner',
          },
        },
        y: {
          display: false
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
