module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4],
      datasets: [{
        data: [0, 0.01, 30],
        backgroundColor: '#00ff00',
        borderColor: '#000',
        borderWidth: 4,
        minBarLength: 20,
        yAxisID: 'y2',
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {
          stack: 'demo',
          ticks: {
            display: false
          }
        },
        y2: {
          type: 'linear',
          position: 'left',
          stack: 'demo',
          stackWeight: 1,
          ticks: {
            display: false
          }
        }
      }
    }
  },
  options: {
    canvas: {
      height: 512,
      width: 512
    }
  }
};
