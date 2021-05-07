module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {
          data: [
            {x: 0, y: 0},
            {x: 1, y: 20},
            {x: 1.00001, y: 30},
            {x: 2, y: 100},
            {x: 2.00001, y: 100}
          ],
          backgroundColor: '#FF000070',
          borderColor: 'black',
          radius: 0,
          segment: {
            borderDash: ctx => ctx.p0.parsed.x > 1 ? [10, 5] : undefined,
          },
          fill: true
        }
      ]
    },
    options: {
      plugins: {
        legend: false
      },
      scales: {
        x: {
          type: 'linear',
          alignToPixels: true,
          display: false
        },
        y: {
          display: false
        }
      }
    }
  },
  options: {
    canvas: {
      width: 300,
      height: 240
    }
  }
};
