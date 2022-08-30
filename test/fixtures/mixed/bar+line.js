module.exports = {
  config: {
    data: {
      datasets: [
        {
          type: 'line',
          data: [6, 16, 3, 19],
          borderColor: '#0000ff',
          fill: false
        },
        {
          type: 'bar',
          data: [5, 20, 1, 10],
          backgroundColor: '#00ff00',
          borderColor: '#ff0000'
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          position: 'top'
        },
        y: {
          axis: 'y',
          labels: ['a', 'b', 'c', 'd']
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
