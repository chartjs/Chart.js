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
          pointLabels: {
            display: false
          },
          ticks: {
            backdropPadding: (context) => 2 * context.index,
            backdropColor: [
              'rgba(255, 0, 0, 0.5)',
              'rgba(255, 255, 0, 0.5)',
              'rgba(0, 255, 0, 0.5)',
              'rgba(0, 255, 255, 0.5)',
              'rgba(0, 0, 255, 0.5)',
            ]
          },
        }
      }
    }
  },
  options: {
    spriteText: true,
  }
};
