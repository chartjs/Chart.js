module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['1', '2', '3', '4', '5', '6'],
      datasets: [{
        label: '# of Votes',
        data: [12, 19, 3, 5, 2, 3]
      }],
    },
    options: {
      scales: {
        x: {
          ticks: {
            display: false
          },
          grid: {
            borderColor: 'blue',
            borderWidth: 2,
            color: 'green',
            drawTicks: false,
          }
        },
        y: {
          ticks: {
            display: false
          },
          grid: {
            borderColor: 'black',
            borderWidth: 2,
            color: 'red',
            drawTicks: false,
          }
        }
      }
    }
  }
};
