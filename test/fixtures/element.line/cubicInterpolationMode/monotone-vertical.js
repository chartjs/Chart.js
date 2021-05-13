module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {
          data: [{x: 10, y: 1}, {x: 0, y: 5}, {x: -10, y: 15}, {x: -5, y: 19}],
          borderColor: 'red',
          fill: false,
          cubicInterpolationMode: 'monotone'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {display: false, min: -15, max: 15},
        y: {type: 'linear', display: false, min: 0, max: 20}
      }
    }
  },
  options: {
    canvas: {
      height: 256,
      width: 512
    }
  }
};
