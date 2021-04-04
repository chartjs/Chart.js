module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 3, NaN, NaN, 2, 1],
        borderColor: 'black',
        segments: {
          borderColor: ctx => ctx.p1.skip || ctx.p2.skip ? 'red' : undefined,
          borderDash: ctx => ctx.p1.skip || ctx.p2.skip ? [5, 5] : undefined
        }
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
