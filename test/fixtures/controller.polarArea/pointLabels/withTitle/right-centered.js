module.exports = {
  config: {
    type: 'polarArea',
    data: {
      datasets: [{
        data: [1, 2, 3, 4],
        backgroundColor: ['#f003', '#0f03', '#00f3', '#0003']
      }],
      labels: [['label 1', 'line 2'], ['label 2', 'line 2'], ['label 3', 'line 2'], ['label 4', 'line 2']]
    },
    options: {
      plugins: {
        title: {
          display: true,
          position: 'right',
          text: 'Chart Title'
        },
        legend: false
      },
      scales: {
        r: {
          pointLabels: {
            display: true,
            centerPointLabels: true
          }
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
