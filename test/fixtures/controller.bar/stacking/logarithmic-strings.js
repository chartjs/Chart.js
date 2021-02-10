module.exports = {
  config: {
    type: 'bar',
    data: {
      datasets: [{
        data: ['10', '100', '10', '100'],
        backgroundColor: '#ff0000'
      }, {
        data: ['100', '10', '0', '100'],
        backgroundColor: '#00ff00'
      }],
      labels: ['label1', 'label2', 'label3', 'label4']
    },
    options: {
      datasets: {
        bar: {
          barPercentage: 1,
        }
      },
      scales: {
        x: {
          type: 'category',
          display: false,
          stacked: true,
        },
        y: {
          type: 'logarithmic',
          display: false,
          stacked: true
        }
      }
    }
  }
};
