module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E'],
      datasets: [{
        data: [1, 5, 10, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
      }, {
        data: [1, 5, 10, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
      }]
    },
    options: {
      responsive: false,
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: false
      }
    },
  },
  options: {
    run(chart) {
      chart.hide(0, 4);
      chart.hide(1, 2);
    }
  }
};
