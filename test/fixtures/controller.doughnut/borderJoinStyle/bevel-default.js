module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [0, 2, 4, null, 6, 8],
          backgroundColor: 'transparent',
          borderColor: '#000',
          borderWidth: 10,
          spacing: 50,
        },
      ]
    },
    options: {
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
