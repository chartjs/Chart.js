module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8902',
  config: {
    type: 'line',
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7, 8],
      datasets: [{
        data: [65, 59, NaN, 48, 56, 57, 40],
        borderColor: 'rgb(75, 192, 192)',
      }]
    },
    options: {
      plugins: false,
      scales: {
        x: {
          type: 'linear',
          min: 1,
          max: 3
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
