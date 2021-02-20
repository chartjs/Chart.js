const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'polarArea',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E'],
      datasets: [{
        data: [1, 5, 10, 2, 4],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
        borderWidth: 4,
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 206, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)'
        ]
      }]
    },
    options: {
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 8000,
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
      const animator = Chart.animator;
      const anims = animator._getAnims(chart);
      // disable animator
      const backup = animator._refresh;
      animator._refresh = function() { };

      return new Promise((resolve) => {
        window.requestAnimationFrame(() => {

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
