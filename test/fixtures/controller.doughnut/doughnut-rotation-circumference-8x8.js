const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'doughnut',
    data: {
      labels: ['A', 'B', 'C', 'D', 'E'],
      datasets: [{
        data: [1, 5, 10, 50, 100],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)'
        ],
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
      rotation: -360,
      circumference: 180,
      events: []
    }
  },
  options: {
    canvas: {
      height: 512,
      width: 512
    },
    run: function(chart) {
      return new Promise((resolve) => {
        for (let i = 0; i < 64; i++) {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const evenodd = row % 2 ? 1 : -1;
          chart.options.rotation = col * 45 * evenodd;
          chart.options.circumference = 360 - row * 45;
          chart.update();
          ctx.drawImage(chart.canvas, col * 64, row * 64, 64, 64);
        }
        ctx.strokeStyle = 'red';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let i = 1; i < 8; i++) {
          ctx.moveTo(i * 64, 0);
          ctx.lineTo(i * 64, 511);
          ctx.moveTo(0, i * 64);
          ctx.lineTo(511, i * 64);
        }
        ctx.stroke();
        Chart.helpers.clearCanvas(chart.canvas);
        chart.ctx.drawImage(canvas, 0, 0);
        resolve();
      });
    }
  }
};
