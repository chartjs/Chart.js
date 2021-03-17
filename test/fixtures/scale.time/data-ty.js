function newDateFromRef(days) {
  return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
}

module.exports = {
  threshold: 0.01,
  tolerance: 0.003,
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [{
          t: newDateFromRef(0),
          y: 1
        }, {
          t: newDateFromRef(1),
          y: 10
        }, {
          t: newDateFromRef(2),
          y: 0
        }, {
          t: newDateFromRef(4),
          y: 5
        }, {
          t: newDateFromRef(6),
          y: 77
        }, {
          t: newDateFromRef(7),
          y: 9
        }, {
          t: newDateFromRef(9),
          y: 5
        }],
        fill: false,
        parsing: {
          xAxisKey: 't'
        }
      }],
    },
    options: {
      scales: {
        x: {
          type: 'time',
          position: 'bottom',
          ticks: {
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
