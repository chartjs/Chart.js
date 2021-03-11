var barChartData = {
  labels: ['January', 'February', 'March'],
  datasets: [
    {
      label: 'Dataset 1',
      backgroundColor: 'red',
      data: [5, 5, 5]
    },
    {
      label: 'Dataset 2',
      backgroundColor: 'blue',
      data: [5, 5, 5]
    },
    {
      label: 'Dataset 3',
      backgroundColor: 'green',
      data: [5, 5, 5]
    }
  ]
};

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8614',
  config: {
    type: 'bar',
    data: barChartData,
    options: {
      scales: {
        x: {
          display: false,
          stacked: true
        },
        y: {
          display: false,
          stacked: true
        }
      }
    }
  },
  options: {
    run(chart) {
      chart.data.datasets[1].data = [
        {x: 'January', y: 5},
        // Februay missing
        {x: 'March', y: 5}
      ];
      chart.update();
    }
  }
};
