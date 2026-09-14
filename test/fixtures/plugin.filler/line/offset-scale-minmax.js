module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/12280',
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [10, 25, 15, 40, 30, 45],
        fill: true,
        backgroundColor: 'red',
        borderColor: 'blue'
      }]
    },
    options: {
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      },
      elements: {
        point: {
          radius: 0
        }
      },
      scales: {
        x: {
          display: false,
          offset: true,
          min: 'a',
          max: 'd'
        },
        y: {
          display: false
        }
      }
    }
  },
};
