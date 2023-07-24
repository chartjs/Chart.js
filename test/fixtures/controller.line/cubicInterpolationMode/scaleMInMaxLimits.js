module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {
          data: [
            {x: -10, y: 150},
            {x: 0, y: 81},
            {x: 10, y: 49},
            {x: 20, y: 32},
            {x: 30, y: 21},
            {x: 35, y: 1},
            {x: 40, y: 16},
            {x: 45, y: 13},
          ],
          borderColor: '#ff0000',
          cubicInterpolationMode: 'monotone'
        }
      ]
    },
    options: {
      scales: {
        x: {display: false, type: 'linear', min: 5, max: 37},
        y: {display: false}
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
