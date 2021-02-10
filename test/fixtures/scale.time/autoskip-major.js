var date = moment('Jan 01 1990', 'MMM DD YYYY');
var data = [];
for (var i = 0; i < 60; i++) {
  data.push({x: date.valueOf(), y: i});
  date = date.clone().add(1, 'month');
}

module.exports = {
  threshold: 0.05,
  config: {
    type: 'line',
    data: {
      datasets: [{
        xAxisID: 'x',
        data: data,
        fill: false
      }],
    },
    options: {
      scales: {
        x: {
          type: 'time',
          ticks: {
            major: {
              enabled: true
            },
            source: 'data',
            autoSkip: true,
            maxRotation: 0
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
