module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0],
      datasets: [{
        data: [0],
        radius: 16,
        borderWidth: 0,
        backgroundColor: 'red'
      }],
    },
    options: {
      plugins: {
        legend: false,
        tooltip: false,
        title: false,
        filler: false
      },
      scales: {
        x: {
          display: false,
          offset: true
        },
        y: {
          display: false
        }
      },
      layout: {
        padding: 16
      }
    }
  },
  options: {
    canvas: {
      height: 32,
      width: 32
    }
  }
};
