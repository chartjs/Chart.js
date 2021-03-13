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
          grid: {
            display: true,
            color: function(context) {
              return context.index % 2 === 0 ? 'green' : 'red';
            },
            lineWidth: function(context) {
              return context.index % 2 === 0 ? 5 : 1;
            },
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.5)',
            lineWidth: 2
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
