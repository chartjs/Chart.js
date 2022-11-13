module.exports = {
  config: {
    data: {
      labels: [0, 1, 2, 3],
      datasets: [
        {
          type: 'line',
          data: [5, 20, 1, 10],
        },
        {
          type: 'bar',
          data: [6, 16, 3, 19]
        },
        {
          type: 'pie',
          data: [5, 20, 1, 10],
        }
      ]
    },
    options: {
      scales: {
        x: {
          ticks: {
            display: false,
          }
        },
        y: {
          ticks: {
            display: false,
          }
        }
      },
      plugins: {
        legend: false,
        colors: {
          enabled: true
        }
      }
    }
  }
};
