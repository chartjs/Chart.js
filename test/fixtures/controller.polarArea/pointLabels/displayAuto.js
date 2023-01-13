module.exports = {
  config: {
    type: 'polarArea',
    data: {
      datasets: [{
        data: new Array(50).fill(5),
        backgroundColor: ['#f003', '#0f03', '#00f3', '#0003']
      }],
      labels: new Array(50).fill(0).map((el, i) => ['label ' + i, 'line 2'])
    },
    options: {
      scales: {
        r: {
          pointLabels: {
            display: 'auto',
          }
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
