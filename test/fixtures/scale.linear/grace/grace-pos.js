module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/7734',
  config: {
    type: 'bar',
    data: {
      labels: ['a'],
      datasets: [{
        data: [0.18],
      }],
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          display: false
        },
        x: {
          grace: '5%'
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
