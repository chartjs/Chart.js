module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          backgroundColor: '#ff0000'
        },
        {
          // option in element (fallback)
          data: [4, -5, -10, null, 10, 5],
        }
      ]
    },
    options: {
      elements: {
        line: {
          fill: true,
          backgroundColor: '#00ff00'
        },
        point: {
          radius: 10
        }
      },
      layout: {
        padding: 32
      },
      scales: {
        x: {display: false},
        y: {display: false}
      },
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: true
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
