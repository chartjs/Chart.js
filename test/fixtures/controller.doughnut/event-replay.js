function drawMousePoint(ctx, center) {
  ctx.beginPath();
  ctx.arc(center.x, center.y, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'yellow';
  ctx.fill();
}

const canvas = document.createElement('canvas');
canvas.width = 512;
canvas.height = 512;
const ctx = canvas.getContext('2d');

module.exports = {
  config: {
    type: 'pie',
    data: {
      datasets: [{
        backgroundColor: ['red', 'green', 'blue'],
        hoverBackgroundColor: 'black',
        data: [1, 1, 1]
      }]
    }
  },
  options: {
    canvas: {
      width: 512,
      height: 512
    },
    async run(chart) {
      ctx.drawImage(chart.canvas, 0, 0, 256, 256);

      const arc = chart.getDatasetMeta(0).data[0];
      const center = arc.getCenterPoint();
      await jasmine.triggerMouseEvent(chart, 'mousemove', arc);
      drawMousePoint(chart.ctx, center);
      ctx.drawImage(chart.canvas, 256, 0, 256, 256);

      chart.toggleDataVisibility(0);
      chart.update();
      drawMousePoint(chart.ctx, center);
      ctx.drawImage(chart.canvas, 0, 256, 256, 256);

      await jasmine.triggerMouseEvent(chart, 'mouseout', arc);
      ctx.drawImage(chart.canvas, 256, 256, 256, 256);

      Chart.helpers.clearCanvas(chart.canvas);
      chart.ctx.drawImage(canvas, 0, 0);
    }
  }
};
