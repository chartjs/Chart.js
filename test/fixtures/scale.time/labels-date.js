function newDateFromRef(days) {
  return moment('01/01/2015 12:00', 'DD/MM/YYYY HH:mm').add(days, 'd').toDate();
}

module.exports = {
  threshold: 0.1,
  tolerance: 0.002,
  config: {
    type: 'line',
    data: {
      labels: [newDateFromRef(0), newDateFromRef(1), newDateFromRef(2), newDateFromRef(4), newDateFromRef(6), newDateFromRef(7), newDateFromRef(9)],
      fill: false
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
