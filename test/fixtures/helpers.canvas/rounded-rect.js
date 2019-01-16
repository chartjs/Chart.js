var roundedRect = Chart.helpers.canvas.roundedRect;

module.exports = {
	config: {
		type: 'line',
		plugins: [{
			afterDraw: function(chart) {
				var ctx = chart.ctx;
				ctx.strokeStyle = '#0000ff';
				ctx.lineWidth = 4;
				ctx.fillStyle = '#00ff00';
				ctx.beginPath();
				roundedRect(ctx, 10, 10, 50, 50, 25);
				roundedRect(ctx, 70, 10, 100, 50, 25);
				roundedRect(ctx, 10, 70, 50, 100, 25);
				roundedRect(ctx, 70, 70, 100, 100, 25);
				roundedRect(ctx, 180, 10, 50, 50, 100);
				roundedRect(ctx, 240, 10, 100, 50, 100);
				roundedRect(ctx, 180, 70, 50, 100, 100);
				roundedRect(ctx, 240, 70, 100, 100, 100);
				roundedRect(ctx, 350, 10, 50, 50, 0);
				ctx.fill();
				ctx.stroke();
			}
		}],
		options: {
			scales: {
				xAxes: [{display: false}],
				yAxes: [{display: false}]
			}
		}
	},
	options: {
		canvas: {
			height: 256,
			width: 512
		}
	}
};
