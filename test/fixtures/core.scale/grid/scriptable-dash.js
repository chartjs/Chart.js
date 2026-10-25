module.exports = {
  config: {
    type: 'scatter',
    options: {
      scales: {
        x: {
          position: {y: 0},
          min: -10,
          max: 10,
          grid: {
            color: 'lightGray',
            dash: (ctx) => ctx.index % 2 === 0 ? [6, 3] : [],
            lineWidth: 3,
          },
          ticks: {
            display: false
          },
        },
        y: {
          position: {x: 0},
          min: -10,
          max: 10,
          grid: {
            color: 'lightGray',
            dash: (ctx) => ctx.index % 2 === 0 ? [6, 3] : [],
            lineWidth: 3,
          },
          ticks: {
            display: false
          },
        }
      }
    }
  }
};
