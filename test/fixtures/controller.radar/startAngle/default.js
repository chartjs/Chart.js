module.exports = {
  config: {
    type: 'radar',
    data: {
      datasets: [{
        data: [6, 3, 2, 3],
        borderWidth: 3,
        borderColor: 'blue'
      }],
      labels: [['label 1', 'line 2'], ['label 2', 'line 2'], ['label 3', 'line 2'], ['label 4', 'line 2']]
    },
    options: {
      scales: {
        r: {
          min: 0,
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
