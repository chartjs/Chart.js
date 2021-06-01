module.exports = {
  config: {
    type: 'pie',
    data: {
      labels: ['aaaa', 'bb', 'c'],
      datasets: [
        {
          data: [1, 2, 3]
        }
      ]
    },
    options: {
      plugins: {
        legend: {
          rtl: true,
          position: 'top',
          labels: {
            textAlign: 'right'
          }
        }
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
