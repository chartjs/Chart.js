module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E']
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
            display: false
          }
        }
      }
    }
  }
};
