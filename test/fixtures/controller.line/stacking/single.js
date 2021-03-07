module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2],
      datasets: [
        {
          data: [0, -1, -1],
          backgroundColor: '#ff0000',
        },
        {
          data: [0, 2, 2],
          backgroundColor: '#00ff00',
        },
        {
          data: [0, 0, 1],
          backgroundColor: '#0000ff',
        }
      ]
    },
    options: {
      elements: {
        line: {
          fill: '-1',
        },
        point: {
          radius: 0
        }
      },
      layout: {
        padding: 32
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: true
      },
      scales: {
        x: {display: false},
        y: {display: false, stacked: 'single'}
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
