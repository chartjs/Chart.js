module.exports = {
  config: {
    type: 'line',
    data: {
      labels: [0, 1, 2, 3, 4, 5],
      datasets: [
        {
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: '#ff0000',
          borderWidth: 0,
          tension: 0.4,
          fill: true
        },
      ]
    },
    options: {
      animation: {
        duration: 1
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
    },
    run() {
      return new Promise(resolve => setTimeout(resolve, 50));
    }
  }
};
