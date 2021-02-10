module.exports = {
  description: 'should draw all elements except lines turned off per dataset',
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [10, 15, 0, -4],
        label: 'dataset1',
        borderColor: 'red',
        backgroundColor: 'green',
        showLine: false,
        fill: false
      }],
      labels: ['label1', 'label2', 'label3', 'label4']
    },
    options: {
      showLine: true,
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
  },
  options: {
    canvas: {
      width: 512,
      height: 512
    }
  }
};
