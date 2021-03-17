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
          x: newDateFromRef(0),
          y: 1
        }, {
          x: newDateFromRef(1),
          y: 10
        }, {
          x: newDateFromRef(2),
          y: 0
        }, {
          x: newDateFromRef(4),
          y: 5
        }, {
          x: newDateFromRef(6),
          y: 77
        }, {
          x: newDateFromRef(7),
          y: 9
        }, {
          x: newDateFromRef(9),
          y: 5
        }],
        fill: false
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
