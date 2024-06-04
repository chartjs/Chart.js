module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [0, 5, 10, null, -10, -5]
        },
        {
          data: [4, -5, -10, null, 10, 5]
        }
      ]
    },
    options: {
      scales: {
        r: {
          ticks: {
            display: false
          },
          pointLabels: {
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
