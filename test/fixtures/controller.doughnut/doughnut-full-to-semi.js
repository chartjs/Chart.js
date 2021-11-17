module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9832',
  config: {
    type: 'doughnut',
    data: {
      datasets: [{
        label: 'Set 1',
        data: [50, 50, 25],
        backgroundColor: ['#BF616A', '#D08770', '#EBCB8B'],
        borderWidth: 0
      },
      {
        label: 'Se1 2',
        data: [50, 50, 25],
        backgroundColor: ['#BF616A', '#D08770', '#EBCB8B'],
        borderWidth: 0
      }]
    },
    options: {
      rotation: -90
    }
  },
  options: {
    canvas: {
      width: 512,
      height: 512
    },
    run(chart) {
      chart.options.circumference = 180;
      chart.update();
    }
  }
};
