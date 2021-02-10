module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          // option in element (fallback)
          data: [0, 2, 4, null, 6, 8],
        }
      ]
    },
    options: {
      elements: {
        arc: {
          backgroundColor: 'transparent',
          borderColor: '#ff0000',
          borderWidth: 5,
          borderAlign: [
            'center',
            'inner',
            'center',
            'inner',
            'center',
            'inner',
          ]
        }
      },
      scales: {
        r: {
          display: false
        }
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
