// Daily ticks with majors at the first of each month, which are uneven (31,
// 28, 31, 30, ... days apart). The same whole step is repeated from each
// major, so the same days are labelled every month.
var date = moment('Jan 01 2022', 'MMM DD YYYY');
var data = [];
for (var i = 0; i < 181; i++) {
  data.push({x: date.valueOf(), y: i});
  date = date.clone().add(1, 'day');
}

module.exports = {
  threshold: 0.05,
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: data,
        pointRadius: 0,
        fill: false
      }],
    },
    options: {
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day'
          },
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
    spriteText: true,
    canvas: {width: 800, height: 200}
  }
};
