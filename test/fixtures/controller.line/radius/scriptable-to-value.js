module.exports = {
  config: {
    type: 'line',
    data: {
      labels: ['A', 'B', 'C'],
      datasets: [{
        data: [12, 19, 3]
      }]
    },
    options: {
      animation: {
        duration: 0
      },
      backgroundColor: 'red',
      radius: () => 20,
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
    },
    run: (chart) => {
      chart.options.radius = 5;
      chart.update();
    }
  }
};
