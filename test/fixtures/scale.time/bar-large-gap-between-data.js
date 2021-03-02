var date = moment('May 24 2020', 'MMM DD YYYY');

module.exports = {
  threshold: 0.05,
  config: {
    type: 'bar',
    data: {
      datasets: [{
        backgroundColor: 'rgba(255, 0, 0, 0.5)',
        data: [
          {
            x: date.clone().add(-2, 'day'),
            y: 20,
          },
          {
            x: date.clone().add(-1, 'day'),
            y: 30,
          },
          {
            x: date,
            y: 40,
          },
          {
            x: date.clone().add(1, 'day'),
            y: 50,
          },
          {
            x: date.clone().add(7, 'day'),
            y: 10,
          }
        ]
      }]
    },
    options: {
      scales: {
        x: {
          display: false,
          type: 'time',
          ticks: {
            source: 'auto'
          },
          time: {
            unit: 'day'
          }
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
