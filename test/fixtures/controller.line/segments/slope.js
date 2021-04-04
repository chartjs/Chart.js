function slope({p1, p2}) {
  return (p1.y - p2.y) / (p2.x - p1.x);
}

module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f'],
      datasets: [{
        data: [1, 2, 3, 3, 2, 1],
        borderColor: 'black',
        segments: {
          borderColor: ctx => slope(ctx) > 0 ? 'green' : slope(ctx) < 0 ? 'red' : undefined,
          borderDash: ctx => slope(ctx) < 0 ? [5, 5] : undefined
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
