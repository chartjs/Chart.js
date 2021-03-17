var timeOpts = {
  parser: 'YYYY',
  unit: 'year',
  displayFormats: {
    year: 'YYYY'
  }
};

module.exports = {
  threshold: 0.01,
  tolerance: 0.002,
  config: {
    type: 'line',
    data: {
      labels: ['1975', '1976', '1977'],
      xLabels: ['1985', '1986', '1987'],
      yLabels: ['1995', '1996', '1997']
    },
    options: {
      scales: {
        x: {
          type: 'time',
          labels: ['2015', '2016', '2017'],
          time: timeOpts
        },
        x2: {
          type: 'time',
          position: 'bottom',
          time: timeOpts
        },
        y: {
          type: 'time',
          time: timeOpts
        },
        y2: {
          position: 'left',
          type: 'time',
          labels: ['2005', '2006', '2007'],
          time: timeOpts
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
