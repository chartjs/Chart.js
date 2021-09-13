module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 3, NaN, NaN, 2, 1],
        borderColor: 'transparent',
        backgroundColor: 'black',
        fill: true,
        segment: {
          backgroundColor: ctx => ctx.p0.skip || ctx.p1.skip ? 'red' : undefined,
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
