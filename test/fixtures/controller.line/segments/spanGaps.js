module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 3, null, null, 2, 1],
        segment: {
          borderColor: ctx => ctx.p1.parsed.x > 2 ? 'red' : undefined,
          borderDash: ctx => ctx.p1.parsed.x > 3 ? [6, 6] : undefined,
        },
        spanGaps: true
      }, {
        data: [0, 2, null, null, 1, 0],
        segment: {
          borderColor: ctx => ctx.p1.parsed.x > 2 ? 'red' : undefined,
          borderDash: ctx => ctx.p1.parsed.x > 3 ? [6, 6] : undefined,
        },
        spanGaps: false
      }]
    },
    options: {
      borderColor: 'black',
      radius: 0,
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  }
};
