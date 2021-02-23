module.exports = {
  description: 'Invalid data, https://github.com/chartjs/Chart.js/issues/5563',
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [{
          x: '14:45:00',
          y: 20,
        }, {
          x: '20:30:00',
          y: 10,
        }, {
          x: '25:15:00',
          y: 15,
        }, {
          x: null,
          y: 15,
        }, {
          x: undefined,
          y: 15,
        }, {
          x: NaN,
          y: 15,
        }, {
          x: 'monday',
          y: 15,
        }],
      }]
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            parser: 'HH:mm:ss',
            unit: 'hour'
          },
        },
      },
      layout: {
        padding: 16
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {width: 1000, height: 200}
  }
};
