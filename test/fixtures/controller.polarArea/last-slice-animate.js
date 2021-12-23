const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: ['A'],
      datasets: [{
        data: [20],
        backgroundColor: 'red',
      }]
    },
    options: {
      animation: {
        duration: 0,
        easing: 'linear'
      },
      responsive: false,
      plugins: {
        legend: false,
        title: false,
        tooltip: false,
        filler: false
      },
      scales: {
        r: {
          ticks: {
            display: false,
          }
        }
      }
    },
  },
  options: {
    canvas: {
      height: 512,
      width: 512
    },
    run: function(chart) {
      chart.options.animation.duration = 8000;
      chart.toggleDataVisibility(0);
      chart.update();
      const animator = Chart.animator;
      // disable animator
      const backup = animator._refresh;
      animator._refresh = function() { };

      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {
          const anims = animator._getAnims(chart);
          const start = anims.items[0]._start;
          for (let i = 0; i < 16; i++) {
            animator._update(start + i * 500);
            let x = i % 4 * 128;
            let y = Math.floor(i / 4) * 128;
            ctx.drawImage(chart.canvas, x, y, 128, 128);
          }
          Chart.helpers.clearCanvas(chart.canvas);
          chart.ctx.drawImage(canvas, 0, 0);

          animator._refresh = backup;
          resolve();
        });
      });
    }
  }
};
