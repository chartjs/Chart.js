module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [1, 2, 3],
      }],
      labels: ['12.12.2012', 'VeryLongLabel', '12/12/2013']
    },
    options: {
      scales: {
        x: {
          ticks: {
            align: 'inner',
          },
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
