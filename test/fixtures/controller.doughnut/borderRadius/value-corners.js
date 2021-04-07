module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 2, 4, null, 6, 8],
          borderRadius: {
            outerStart: 20,
            outerEnd: 40,
          }
        },
      ]
    },
    options: {
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderColor: '#888',
        }
      },
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
