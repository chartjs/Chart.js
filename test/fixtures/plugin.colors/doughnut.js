module.exports = {
  config: {
    type: 'doughnut',
    data: {
      datasets: [
        {
          data: [0, 2, 4, null, 6, 8]
        },
        {
          data: [5, 1, 6, 2, null, 9]
        }
      ]
    },
    options: {
      plugins: {
        legend: false,
        colors: {
          enabled: true
        }
      }
    }
  }
};
