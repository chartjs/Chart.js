module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      datasets: [{
        data: [
          {x: 'a', y: 1},
          {x: null, y: 1},
          {x: 2, y: 1},
          {x: undefined, y: 1},
          {x: 4, y: 1},
          {x: NaN, y: 1},
          {x: 6, y: 1}
        ],
        backgroundColor: 'red',
        borderColor: 'red',
        borderWidth: 5
      }]
    },
    options: {
      scales: {
        y: {
          display: false
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      width: 256,
      height: 256
    }
  }
};
