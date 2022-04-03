const data = {
  labels: [],
  datasets: [{
    label: 'Dataset',
    borderColor: '#2f54eb',
    data: [{
      y: 3,
      x: 1646345700000
    }, {
      y: 7,
      x: 1646346600000
    }, {
      y: 9,
      x: 1646347500000
    }, {
      y: 5,
      x: 1646348400000
    }, {
      y: 5,
      x: 1646349300000
    }],
  }]
};

module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/10215',
  config: {
    type: 'bar',
    data,
    options: {
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'time',
          offset: true,
          offsetAfterAutoskip: true,
          axis: 'x',
          grid: {
            offset: true
          },
        },
        y: {
          display: false,
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {width: 600, height: 400}
  }
};
