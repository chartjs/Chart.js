module.exports = {
  threshold: 0.01,
  config: {
    type: 'line',
    data: {
      labels: ['2015-01-01T20:00:00', '2015-01-01T21:00:00']
    },
    options: {
      scales: {
        x: {
          type: 'time',
          bounds: 'ticks',
          time: {
            unit: 'hour',
          },
          ticks: {
            stepSize: 2
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {width: 512, height: 128}
  }
};
