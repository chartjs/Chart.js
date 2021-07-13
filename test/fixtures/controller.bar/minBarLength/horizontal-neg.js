module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0, 1, 2],
      datasets: [
        {
          data: [0, -0.01, -30],
          backgroundColor: '#00ff00',
          borderColor: '#000',
          borderWidth: 4,
          minBarLength: 20
        }
      ]
    },
    options: {
      indexAxis: 'y',
      scales: {
        x: {
          ticks: {
            display: false
          }
        },
        y: {display: false}
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
