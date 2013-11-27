this.Pie = function(data, options) {
	chart.Pie.defaults = {
		segmentShowStroke: true,
		segmentStrokeColor: "#fff",
		segmentStrokeWidth: 2,
		animation: true,
		animationSteps: 100,
		animationEasing: "easeOutBounce",
		animateRotate: true,
		animateScale: false,
		onAnimationComplete: null
	};

	var config = (options) ? mergeChartConfig(chart.Pie.defaults, options) : chart.Pie.defaults;

	return new Pie(data, config, context);
};

var Pie = function(data, config, ctx) {
	var segmentTotal = 0;

	//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
	var pieRadius = Min([height / 2, width / 2]) - 5;

	for (var i = 0; i < data.length; i++) {
		segmentTotal += data[i].value;
	}


	animationLoop(config, null, drawPieSegments, ctx);

	function drawPieSegments(animationDecimal) {
		var cumulativeAngle = -Math.PI / 2,
			scaleAnimation = 1,
			rotateAnimation = 1;
		if (config.animation) {
			if (config.animateScale) {
				scaleAnimation = animationDecimal;
			}
			if (config.animateRotate) {
				rotateAnimation = animationDecimal;
			}
		}
		for (var i = 0; i < data.length; i++) {
			var segmentAngle = rotateAnimation * ((data[i].value / segmentTotal) * (Math.PI * 2));
			ctx.beginPath();
			ctx.arc(width / 2, height / 2, scaleAnimation * pieRadius, cumulativeAngle, cumulativeAngle + segmentAngle);
			ctx.lineTo(width / 2, height / 2);
			ctx.closePath();
			ctx.fillStyle = data[i].color;
			ctx.fill();

			if (config.segmentShowStroke) {
				ctx.lineWidth = config.segmentStrokeWidth;
				ctx.strokeStyle = config.segmentStrokeColor;
				ctx.stroke();
			}
			cumulativeAngle += segmentAngle;
		}
	}
}