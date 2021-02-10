module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 2, 3, 4, 5, 6],
          backgroundColor: [
            '#ff0000',
            '#00ff00',
            '#0000ff'
          ]
        },
        {
          // option in element (fallback)
          data: [6, 5, 4, 3, 2, 1],
        }
      ]
    },
    options: {
      elements: {
        bar: {
          backgroundColor: [
            '#000000',
            '#888888'
          ]
        }
      },
      scales: {
        x: {display: false},
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
