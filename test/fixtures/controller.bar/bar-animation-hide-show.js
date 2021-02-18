const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'bar',
    data: {
      labels: [0],
      datasets: [
        {
          data: [1],
          backgroundColor: 'rgba(255,0,0,0.5)'
        },
        {
          data: [2],
          backgroundColor: 'rgba(0,0,255,0.5)'
        },
        {
          data: [3],
          backgroundColor: 'rgba(0,255,0,0.5)'
        }
      ]
    },
    options: {
      animation: {
        duration: 14000,
        easing: 'linear'
      },
      events: [],
      scales: {
        x: {display: false},
        y: {display: false, max: 4}
      }
    }
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
          // make sure previous animation is finished
          animator._update(Date.now() * 2);

          chart.hide(1);
          let start = anims.items[0]._start;
          for (let i = 0; i < 8; i++) {
            animator._update(start + i * 2000);
            let x = i % 4 * 128;
            let y = Math.floor(i / 4) * 128;
            ctx.drawImage(chart.canvas, x, y, 128, 128);
          }

          // make sure previous animation is finished
          animator._update(Date.now() * 2);

          chart.show(1);
          start = anims.items[0]._start;
          for (let i = 0; i < 8; i++) {
            animator._update(start + i * 2000);
            let x = i % 4 * 128;
            let y = Math.floor(2 + i / 4) * 128;
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
