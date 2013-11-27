this.Doughnut = function(data, options) {

	chart.Doughnut.defaults = {
		segmentShowStroke: true,
		segmentStrokeColor: "#fff",
		segmentStrokeWidth: 2,
		percentageInnerCutout: 50,
		animation: true,
		animationSteps: 100,
		animationEasing: "easeOutBounce",
		animateRotate: true,
		animateScale: false,
		onAnimationComplete: null
	};

	var config = (options) ? mergeChartConfig(chart.Doughnut.defaults, options) : chart.Doughnut.defaults;

	return new Doughnut(data, config, context);

};


var Doughnut = function(data, config, ctx) {
	var segmentTotal = 0;

	//In case we have a canvas that is not a square. Minus 5 pixels as padding round the edge.
	var doughnutRadius = Min([height / 2, width / 2]) - 5;

	var cutoutRadius = doughnutRadius * (config.percentageInnerCutout / 100);

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
			ctx.arc(width / 2, height / 2, scaleAnimation * doughnutRadius, cumulativeAngle, cumulativeAngle + segmentAngle, false);
			ctx.arc(width / 2, height / 2, scaleAnimation * cutoutRadius, cumulativeAngle + segmentAngle, cumulativeAngle, true);
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