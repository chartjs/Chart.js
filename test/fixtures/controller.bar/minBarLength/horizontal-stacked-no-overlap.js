const minBarLength = 50;

module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [1, 2, 3, 4],
      datasets: [
        {
          data: [1, -1, 1, 20],
          backgroundColor: '#bb000066',
          minBarLength
        },
        {
          data: [1, -1, -1, -20],
          backgroundColor: '#00bb0066',
          minBarLength
        },
        {
          data: [1, -1, 1, 40],
          backgroundColor: '#0000bb66',
          minBarLength
        },
        {
          data: [1, -1, -1, -40],
          backgroundColor: '#00000066',
          minBarLength
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          display: false,
          stacked: true
        },
        y: {
          type: 'linear',
          position: 'left',
          stacked: true,
          ticks: {
            display: false
          }
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
