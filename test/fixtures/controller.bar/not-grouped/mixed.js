module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9281',
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2],
      datasets: [
        {
          label: 'data 1',
          data: [1, 2, 2],
          backgroundColor: 'rgb(255,0,0,0.7)',
          grouped: true
        },
        {
          label: 'data 2',
          data: [4, 4, 1],
          backgroundColor: 'rgb(0,255,0,0.7)',
          grouped: true
        },
        {
          label: 'data 3',
          data: [2, 1, 3],
          backgroundColor: 'rgb(0,0,255,0.7)',
          grouped: false
        }
      ]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  },
};
