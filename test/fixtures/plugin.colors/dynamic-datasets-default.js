module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [5, 5, 5, 5, 5, 5]
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
  },
  options: {
    run(chart) {
      chart.data.datasets.push({
        data: [5, 5, 5, 5, 5, 5]
      });

      chart.update();
    }
  }
};
