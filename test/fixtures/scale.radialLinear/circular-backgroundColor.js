module.exports = {
  threshold: 0.05,
  config: {
    type: 'radar',
    data: {
      labels: [1, 2, 3, 4, 5, 6],
      datasets: [
        {
          data: [3, 2, 2, 1, 3, 1]
        }
      ]
    },
    options: {
      plugins: {
        legend: false,
        tooltip: false,
        filler: false
      },
      scales: {
        r: {
          backgroundColor: '#00FF00',
          min: 0,
          max: 3,
          grid: {
            circular: true
          },
          pointLabels: {
            display: false
          },
          ticks: {
            display: false,
            stepSize: 1,
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  },
};
