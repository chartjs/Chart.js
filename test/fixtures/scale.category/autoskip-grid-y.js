module.exports = {
  config: {
    type: 'bar',
    data: {
      // labels: [['Label 1', 'Line 2'], ['Label 2', 'Line 2'], ['Label 3', 'Line 2'], ['Label 4', 'Line 2'], ['Label 5', 'Line 2'], ['Label 6', 'Line 2'], ['Label 7', 'Line 2'], ['Label 8', 'Line 2'], ['Label 9', 'Line 2'], ['Label 10', 'Line 2'], ['Label 11', 'Line 2'], ['Label 12', 'Line 2']],
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
      indexAxis: 'y',
      scales: {
        y: {
          grid: {
            color: 'red',
            lineWidth: 1
          }
        },
        x: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 128,
      height: 200
    }
  }
};
