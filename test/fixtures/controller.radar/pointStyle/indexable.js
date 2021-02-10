module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in dataset
          data: [0, 5, 10, null, -10, -5],
          pointBackgroundColor: '#ff0000',
          pointBorderColor: '#ff0000',
          pointStyle: [
            'circle',
            'cross',
            'crossRot',
            'dash',
            'line',
            'rect',
          ]
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
          fill: false,
        },
        point: {
          backgroundColor: '#00ff00',
          borderColor: '#00ff00',
          pointStyle: [
            'line',
            'rect',
            'rectRounded',
            'rectRot',
            'star',
            'triangle'
          ],
          radius: 10
        }
      },
      scales: {
        r: {
          display: false,
          min: -15
        }
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
