module.exports = {
  config: {
    type: 'radar',
    data: {
      labels: ["A", "B", "C", "D", "E"]
    },
    options: {
      responsive: false,
      scales: {
        r: {
          grid: {
            borderDash: [10, 10],
            color: "rgba(0, 0, 0, 1)",
            lineWidth: 2
          },
          angleLines: {
            display: false
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
