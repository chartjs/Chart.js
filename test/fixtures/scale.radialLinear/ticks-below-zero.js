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
          min: -1,
          max: 1,
          grid: {
            display: true,
            color: 'blue',
            lineWidth: 2
          },
          angleLines: {
            color: 'rgba(255, 255, 255, 0.5)',
            lineWidth: 2
          },
          pointLabels: {
            display: false
          },
          ticks: {
            display: true,
            autoSkip: false,
            stepSize: 0.2,
            callback: function(value) {
              if (value === 0.8) {
                return 'Strong';
              }
              if (value === 0.4) {
                return 'Weak';
              }
              if (value === 0) {
                return 'No';
              }
            }
          }
        }
      }
    }
  }
};
