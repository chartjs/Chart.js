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
          },
          angleLines: {
            color: function(context) {
              return context.index % 2 === 0 ? 'red' : 'green';
            },
            lineWidth: function(context) {
              return context.index % 2 === 0 ? 1 : 5;
            },
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
