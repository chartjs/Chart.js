module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5', 'Label 6', 'Label 7', 'Label 8', 'Label 9', 'Label 10', 'Label 11', 'Label 12'],
      datasets: [{
        data: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      }, {
        data: [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]
      }, {
        data: [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
      }]
    },
    options: {
      scales: {
        x: {
          ticks: {
            maxRotation: 0
          },
          grid: {
            color: 'red',
            lineWidth: 1
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 512,
      height: 256
    }
  }
};
