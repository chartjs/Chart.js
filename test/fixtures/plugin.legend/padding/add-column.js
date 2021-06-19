module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9278',
  config: {
    type: 'pie',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      datasets: [{
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        backgroundColor: 'red'
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'left'
        }
      },
      layout: {
        padding: {
          top: 55,
          left: 30,
          right: 30
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 400,
      height: 300
    },
    run(chart) {
      chart.data.labels.push('k');
      chart.data.datasets[0].data.push(11);
      chart.update();
    }
  }
};
