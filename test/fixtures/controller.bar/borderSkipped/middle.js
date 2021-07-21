module.exports = {
  threshold: 0.01,
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          backgroundColor: 'red',
          data: [12, 19, 12, 5, 4, 12],
        },
        {
          backgroundColor: 'green',
          data: [12, 19, -4, 5, 8, 3],
        },
        {
          backgroundColor: 'blue',
          data: [7, 11, -12, 12, 0, -7],
        }
      ]
    },
    options: {
      borderRadius: Number.MAX_VALUE,
      borderSkipped: 'middle',
      borderWidth: 2,
      scales: {
        x: {display: false, stacked: true},
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
