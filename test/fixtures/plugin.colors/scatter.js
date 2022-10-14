module.exports = {
  config: {
    type: 'scatter',
    data: {
      datasets: [{
        data: [{x: 10, y: 15}, {x: 15, y: 10}],
        pointRadius: 10,
        showLine: true,
        label: 'dataset1'
      }, {
        data: [{x: 20, y: 45}, {x: 5, y: 15}],
        pointRadius: 20,
        label: 'dataset2'
      }],
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
        },
      }
    }
  }
};
