module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/8699',
  config: {
    type: 'line',
    data: {
      datasets: [{
        backgroundColor: 'red',
        data: [{x: 0, y: 3}, {x: 2, y: -3}, {x: 4, y: 0}, {x: 6, y: 5}, {x: 8, y: -5}, {x: 10, y: 0}],
        fill: 'origin'
      }]
    },
    options: {
      plugins: {
        legend: false,
        title: false,
      },
      scales: {
        x: {
          display: false,
          type: 'linear',
          min: 5
        },
        y: {
          display: false
        }
      }
    }
  },
};
