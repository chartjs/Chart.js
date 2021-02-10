module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['a', 'b', 'c'],
      datasets: [
        {
          data: [{y: 'b', x: [2, 8]}, {y: 'c', x: [2, 5]}],
          backgroundColor: '#ff0000'
        },
        {
          data: [{y: 'a', x: 10}, {y: 'c', x: [6, 10]}],
          backgroundColor: '#00ff00'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {display: false, min: 0},
        y: {display: false, stacked: true}
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
