module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b'],
      datasets: [{
        data: [100, 0],
        backgroundColor: 'blue'
      }, {
        xAxisID: 'x2',
        data: [0, 100],
        backgroundColor: 'red'
      }],
    },
    options: {
      indexAxis: 'y',
      scales: {
        y: {
          display: false
        },
        x: {
          position: 'top',
          beginAtZero: true,
          grace: '10%',
        },
        x2: {
          position: 'bottom',
          type: 'linear',
          beginAtZero: false,
          grace: '10%',
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 512,
      height: 128
    }
  }
};
