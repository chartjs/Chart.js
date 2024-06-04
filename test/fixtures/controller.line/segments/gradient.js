const getGradient = (context) => {
  const {chart, p0, p1} = context;
  const ctx = chart.ctx;
  const {x: x0} = p0.getProps(['x'], true);
  const {x: x1} = p1.getProps(['x'], true);
  const gradient = ctx.createLinearGradient(x0, 0, x1, 0);
  gradient.addColorStop(0, p0.options.backgroundColor);
  gradient.addColorStop(1, p1.options.backgroundColor);
  return gradient;
};

module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [{
        data: [{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}, {x: 3, y: 3}, {x: 4, y: 4}, {x: 5, y: 5}, {x: 6, y: 6}],
        pointBackgroundColor: ['red', 'yellow', 'green', 'green', 'blue', 'pink', 'blue'],
        pointBorderWidth: 0,
        pointRadius: 10,
        borderWidth: 5,
        segment: {
          borderColor: getGradient,
        }
      }]
    },
    options: {
      scales: {
        x: {type: 'linear', display: false},
        y: {display: false}
      }
    }
  }
};
