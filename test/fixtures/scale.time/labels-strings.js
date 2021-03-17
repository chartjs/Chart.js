module.exports = {
  threshold: 0.05,
  tolerance: 0.002,
  config: {
    type: 'line',
    data: {
      labels: ['2015-01-01T12:00:00', '2015-01-02T21:00:00', '2015-01-03T22:00:00', '2015-01-05T23:00:00', '2015-01-07T03:00', '2015-01-08T10:00', '2015-01-10T12:00']
    },
    options: {
      scales: {
        x: {
          type: 'time',
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {width: 1000, height: 200}
  }
};
