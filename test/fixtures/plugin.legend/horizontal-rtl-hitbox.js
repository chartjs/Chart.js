module.exports = {
  description: 'https://github.com/chartjs/Chart.js/issues/9278',
  config: {
    type: 'pie',
    data: {
      labels: ['aaa', 'bb', 'c'],
      datasets: [{
        data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
        backgroundColor: 'red'
      }]
    },
    options: {
      plugins: {
        legend: {
          position: 'top',
          rtl: 'true',
        }
      },
      layout: {
        padding: {
          top: 50,
          left: 30,
          right: 30,
          bottom: 50
        }
      }
    },
    plugins: [{
      id: 'legend-hit-box',
      afterDraw(chart) {
        const ctx = chart.ctx;
        ctx.save();
        ctx.strokeStyle = 'green';
        ctx.lineWidth = 1;

        const legend = chart.legend;
        legend.legendHitBoxes.forEach(box => {
          ctx.strokeRect(box.left, box.top, box.width, box.height);
        });

        ctx.restore();
      }
    }]
  },
  options: {
    spriteText: true,
    canvas: {
      width: 400,
      height: 300
    },
  }
};
