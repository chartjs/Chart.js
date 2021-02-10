module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        fill: true,
        backgroundColor: 'red',
        data: [
          {x: -1000000, y: 1},
          {x: 1000000000, y: 2}
        ]
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
          ticks: {
            display: false
          }
        },
        y: {
          ticks: {
            display: false
          }
        }
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false
      }
    }
  },
  options: {
    canvas: {width: 1000, height: 200}
  }
};
