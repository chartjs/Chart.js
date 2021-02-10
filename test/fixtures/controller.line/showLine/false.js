module.exports = {
  description: 'should draw all elements except lines',
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [10, 15, 0, -4],
        label: 'dataset1',
        borderColor: 'red',
        backgroundColor: 'green',
        fill: true
      }],
      labels: ['label1', 'label2', 'label3', 'label4']
    },
    options: {
      showLine: false,
      scales: {
        x: {
          display: false
        },
        y: {
          display: false
        }
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: true
      }
    }
  }
};
