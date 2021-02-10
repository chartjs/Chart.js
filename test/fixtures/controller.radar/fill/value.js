module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          backgroundColor: '#ff0000',
          fill: false
        },
        {
          // option in element (fallback)
          data: [4, -5, -10, null, 10, 5]
        }
      ]
    },
    options: {
      elements: {
        line: {
          backgroundColor: '#00ff00',
          fill: true
        }
      },
      scales: {
        r: {
          display: false,
          min: -15
        }
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
      height: 512,
      width: 512
    }
  }
};
