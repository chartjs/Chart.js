module.exports = {
  config: {
    type: 'radar',
    data: {
      datasets: [{
        data: [1, 2, 3, 4],
        borderWidth: 0,
        radius: 0
      }],
      labels: [['label 1', 'line 2'], ['label 2', 'line 2'], ['label 3', 'line 2'], ['label 4', 'line 2']]
    },
    options: {
      scales: {
        r: {
          startAngle: 180,
          pointLabels: {
            display: true
          },
          grid: {
            circular: true
          }
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
