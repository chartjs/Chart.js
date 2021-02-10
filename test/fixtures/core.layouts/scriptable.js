module.exports = {
  config: {
    type: 'line',
    data: {
      datasets: [
        {data: [10, 5, 0, 25, 78, -10]}
      ],
      labels: ['tick1', 'tick2', 'tick3', 'tick4', 'tick5', 'tick6']
    },
    options: {
      layout: {
        padding: function(ctx) {
          // 10% padding
          const horizontalPadding = ctx.chart.width * 0.1;
          const verticalPadding = ctx.chart.height * 0.1;
          return {
            top: verticalPadding,
            right: horizontalPadding,
            bottom: verticalPadding,
            left: horizontalPadding
          };
        }
      },
      plugins: {
        legend: false
      },
      scales: {
        x: {
          type: 'category',
          ticks: {
            maxRotation: 0,
            autoSkip: false
          }
        },
        y: {
          type: 'linear',
          position: 'right'
        }
      }
    }
  },
  options: {
    spriteText: true,
    canvas: {
      height: 150,
      width: 512
    }
  }
};
