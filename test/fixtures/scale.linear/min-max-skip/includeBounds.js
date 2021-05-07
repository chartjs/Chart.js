module.exports = {
  config: {
    type: 'scatter',
    options: {
      scales: {
        y: {
          max: 1225.2,
          min: 369.5,
          ticks: {
            includeBounds: false
          }
        },
        x: {
          min: 20,
          max: 100,
          ticks: {
            includeBounds: false
          }
        }
      }
    }
  },
  options: {
    spriteText: true
  }
};
