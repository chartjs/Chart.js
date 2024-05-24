module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E'],
      datasets: [{
        data: [1, 1, 2, 3, 5]
      }]
    },
    options: {
      responsive: false,
      scales: {
        r: {
          reverse: true,
          grid: {
            display: true,
          },
          angleLines: {
            color: 'red',
            lineWidth: 5,
          },
          pointLabels: {
            display: false
          },
          ticks: {
            display: true,
          }
        }
      }
    }
  },
  options: {
    spriteText: true,
  }
};
