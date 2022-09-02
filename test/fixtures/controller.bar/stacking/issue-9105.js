module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9105',
  config: {
    type: 'bar',
    data: {
      labels: ['January', 'February', 'March', 'April', 'May', 'June'],
      datasets: [
        {
          backgroundColor: 'rgba(255,99,132,0.8)',
          label: 'Dataset 1',
          data: [12, 19, 3, 5, 2, 3],
          stack: '0',
          yAxisID: 'y'
        },
        {
          backgroundColor: 'rgba(54,162,235,0.8)',
          label: 'Dataset 2',
          data: [13, 19, 3, 5, 8, 3],
          stack: '0',
          yAxisID: 'y'
        },
        {
          backgroundColor: 'rgba(75,192,192,0.8)',
          label: 'Dataset 3',
          data: [13, 19, 3, 5, 8, 3],
          stack: '0',
          yAxisID: 'y'
        }
      ]
    },
    options: {
      plugins: false,
      scales: {
        x: {
          display: false,
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    run(chart) {
      chart.data.datasets[1].stack = '1';
      chart.update();
    }
  }
};
