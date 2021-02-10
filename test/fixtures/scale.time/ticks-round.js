module.exports = {
  threshold: 0.05,
  config: {
    type: 'line',
    data: {
      labels: ['2015-01-01T20:00:00', '2015-02-02T21:00:00', '2015-02-21T01:00:00']
    },
    options: {
      scales: {
        x: {
          type: 'time',
          bounds: 'ticks',
          time: {
            unit: 'week',
            round: 'week'
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
    canvas: {width: 512, height: 256}
  }
};
