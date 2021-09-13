module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 3, NaN, NaN, 2, 1],
        borderColor: 'black',
        segment: {
          borderColor: ctx => ctx.p0.skip || ctx.p1.skip ? 'red' : undefined,
          borderDash: ctx => ctx.p0.skip || ctx.p1.skip ? [5, 5] : undefined
        },
        spanGaps: true
      }]
    },
    options: {
      scales: {
        x: {display: false},
        y: {display: false}
      }
    }
  }
};
