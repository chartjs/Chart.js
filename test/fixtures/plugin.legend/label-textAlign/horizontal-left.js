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
          position: 'top',
          labels: {
            textAlign: 'left'
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
