module.exports = {
  config: {
    data: {
      datasets: [
        {
          type: 'bar',
          stack: 'mixed',
          data: [5, 20, 1, 10],
          backgroundColor: '#00ff00',
          borderColor: '#ff0000'
        },
        {
          type: 'line',
          stack: 'mixed',
          data: [6, 16, 3, 19],
          borderColor: '#0000ff',
          fill: false
        },
      ]
    },
    options: {
      scales: {
        x: {
          axis: 'y',
          labels: ['a', 'b', 'c', 'd']
        },
        y: {
          stacked: true
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 256,
      width: 512
    }
  }
};
