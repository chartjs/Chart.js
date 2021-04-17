module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/7734',
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        data: [1.2, -0.2],
      }],
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          display: false
        },
        x: {
          grace: 0.3
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 512,
      height: 128
    }
  }
};
