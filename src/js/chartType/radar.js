this.Radar = function(data, options) {

	chart.Radar.defaults = {
		scaleOverlay: false,
		scaleOverride: false,
		scaleSteps: null,
		scaleStepWidth: null,
		scaleStartValue: null,
		scaleShowLine: true,
		scaleLineColor: "rgba(0,0,0,.1)",
		scaleLineWidth: 1,
		scaleShowLabels: false,
		scaleLabel: "<%=value%>",
		scaleFontFamily: "'Arial'",
		scaleFontSize: 12,
		scaleFontStyle: "normal",
		scaleFontColor: "#666",
		scaleShowLabelBackdrop: true,
		scaleBackdropColor: "rgba(255,255,255,0.75)",
		scaleBackdropPaddingY: 2,
		scaleBackdropPaddingX: 2,
		angleShowLineOut: true,
		angleLineColor: "rgba(0,0,0,.1)",
		angleLineWidth: 1,
		pointLabelFontFamily: "'Arial'",
		pointLabelFontStyle: "normal",
		pointLabelFontSize: 12,
		pointLabelFontColor: "#666",
		pointDot: true,
		pointDotRadius: 3,
		pointDotStrokeWidth: 1,
		datasetStroke: true,
		datasetStrokeWidth: 2,
		datasetFill: true,
		animation: true,
		animationSteps: 60,
		animationEasing: "easeOutQuart",
		onAnimationComplete: null
	};

	var config = (options) ? mergeChartConfig(chart.Radar.defaults, options) : chart.Radar.defaults;

	return new Radar(data, config, context);
};


var Radar = function(data, config, ctx) {
	var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;

	//If no labels are defined set to an empty array, so referencing length for looping doesn't blow up.
	if (!data.labels) data.labels = [];

	calculateDrawingSizes();

	var valueBounds = getValueBounds();

	labelTemplateString = (config.scaleShowLabels) ? config.scaleLabel : null;

	//Check and set the scale
	if (!config.scaleOverride) {

		calculatedScale = calculateScale(scaleHeight, valueBounds.maxSteps, valueBounds.minSteps, valueBounds.maxValue, valueBounds.minValue, labelTemplateString);
	} else {
		calculatedScale = {
			steps: config.scaleSteps,
			stepValue: config.scaleStepWidth,
			graphMin: config.scaleStartValue,
			labels: []
		}
		populateLabels(labelTemplateString, calculatedScale.labels, calculatedScale.steps, config.scaleStartValue, config.scaleStepWidth);
	}

	scaleHop = maxSize / (calculatedScale.steps);

	animationLoop(config, drawScale, drawAllDataPoints, ctx);

	//Radar specific functions.
	function drawAllDataPoints(animationDecimal) {
		var rotationDegree = (2 * Math.PI) / data.datasets[0].data.length;

		ctx.save();
		//translate to the centre of the canvas.
		ctx.translate(width / 2, height / 2);

		//We accept multiple data sets for radar charts, so show loop through each set
		for (var i = 0; i < data.datasets.length; i++) {
			ctx.beginPath();

			ctx.moveTo(0, animationDecimal * (-1 * calculateOffset(data.datasets[i].data[0], calculatedScale, scaleHop)));
			for (var j = 1; j < data.datasets[i].data.length; j++) {
				ctx.rotate(rotationDegree);
				ctx.lineTo(0, animationDecimal * (-1 * calculateOffset(data.datasets[i].data[j], calculatedScale, scaleHop)));

			}
			ctx.closePath();


			ctx.fillStyle = data.datasets[i].fillColor;
			ctx.strokeStyle = data.datasets[i].strokeColor;
			ctx.lineWidth = config.datasetStrokeWidth;
			ctx.fill();
			ctx.stroke();


			if (config.pointDot) {
				ctx.fillStyle = data.datasets[i].pointColor;
				ctx.strokeStyle = data.datasets[i].pointStrokeColor;
				ctx.lineWidth = config.pointDotStrokeWidth;
				for (var k = 0; k < data.datasets[i].data.length; k++) {
					ctx.rotate(rotationDegree);
					ctx.beginPath();
					ctx.arc(0, animationDecimal * (-1 * calculateOffset(data.datasets[i].data[k], calculatedScale, scaleHop)), config.pointDotRadius, 2 * Math.PI, false);
					ctx.fill();
					ctx.stroke();
				}

			}
			ctx.rotate(rotationDegree);

		}
		ctx.restore();


	}

	function drawScale() {
		var rotationDegree = (2 * Math.PI) / data.datasets[0].data.length;
		ctx.save();
		ctx.translate(width / 2, height / 2);

		if (config.angleShowLineOut) {
			ctx.strokeStyle = config.angleLineColor;
			ctx.lineWidth = config.angleLineWidth;
			for (var h = 0; h < data.datasets[0].data.length; h++) {

				ctx.rotate(rotationDegree);
				ctx.beginPath();
				ctx.moveTo(0, 0);
				ctx.lineTo(0, -maxSize);
				ctx.stroke();
			}
		}

		for (var i = 0; i < calculatedScale.steps; i++) {
			ctx.beginPath();

			if (config.scaleShowLine) {
				ctx.strokeStyle = config.scaleLineColor;
				ctx.lineWidth = config.scaleLineWidth;
				ctx.moveTo(0, -scaleHop * (i + 1));
				for (var j = 0; j < data.datasets[0].data.length; j++) {
					ctx.rotate(rotationDegree);
					ctx.lineTo(0, -scaleHop * (i + 1));
				}
				ctx.closePath();
				ctx.stroke();

			}

			if (config.scaleShowLabels) {
				ctx.textAlign = 'center';
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				ctx.textBaseline = "middle";

				if (config.scaleShowLabelBackdrop) {
					var textWidth = ctx.measureText(calculatedScale.labels[i]).width;
					ctx.fillStyle = config.scaleBackdropColor;
					ctx.beginPath();
					ctx.rect(
						Math.round(-textWidth / 2 - config.scaleBackdropPaddingX), //X
						Math.round((-scaleHop * (i + 1)) - config.scaleFontSize * 0.5 - config.scaleBackdropPaddingY), //Y
						Math.round(textWidth + (config.scaleBackdropPaddingX * 2)), //Width
						Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY * 2)) //Height
					);
					ctx.fill();
				}
				ctx.fillStyle = config.scaleFontColor;
				ctx.fillText(calculatedScale.labels[i], 0, -scaleHop * (i + 1));
			}

		}
		for (var k = 0; k < data.labels.length; k++) {
			ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize + "px " + config.pointLabelFontFamily;
			ctx.fillStyle = config.pointLabelFontColor;
			var opposite = Math.sin(rotationDegree * k) * (maxSize + config.pointLabelFontSize);
			var adjacent = Math.cos(rotationDegree * k) * (maxSize + config.pointLabelFontSize);

			if (rotationDegree * k == Math.PI || rotationDegree * k == 0) {
				ctx.textAlign = "center";
			} else if (rotationDegree * k > Math.PI) {
				ctx.textAlign = "right";
			} else {
				ctx.textAlign = "left";
			}

			ctx.textBaseline = "middle";

			ctx.fillText(data.labels[k], opposite, -adjacent);

		}
		ctx.restore();
	};

	function calculateDrawingSizes() {
		maxSize = (Min([width, height]) / 2);

		labelHeight = config.scaleFontSize * 2;

		var labelLength = 0;
		for (var i = 0; i < data.labels.length; i++) {
			ctx.font = config.pointLabelFontStyle + " " + config.pointLabelFontSize + "px " + config.pointLabelFontFamily;
			var textMeasurement = ctx.measureText(data.labels[i]).width;
			if (textMeasurement > labelLength) labelLength = textMeasurement;
		}

		//Figure out whats the largest - the height of the text or the width of what's there, and minus it from the maximum usable size.
		maxSize -= Max([labelLength, ((config.pointLabelFontSize / 2) * 1.5)]);

		maxSize -= config.pointLabelFontSize;
		maxSize = CapValue(maxSize, null, 0);
		scaleHeight = maxSize;
		//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
		labelHeight = Default(labelHeight, 5);
	};

	function getValueBounds() {
		var upperValue = Number.MIN_VALUE;
		var lowerValue = Number.MAX_VALUE;

		for (var i = 0; i < data.datasets.length; i++) {
			for (var j = 0; j < data.datasets[i].data.length; j++) {
				if (data.datasets[i].data[j] > upperValue) {
					upperValue = data.datasets[i].data[j]
				}
				if (data.datasets[i].data[j] < lowerValue) {
					lowerValue = data.datasets[i].data[j]
				}
			}
		}

		var maxSteps = Math.floor((scaleHeight / (labelHeight * 0.66)));
		var minSteps = Math.floor((scaleHeight / labelHeight * 0.5));

		return {
			maxValue: upperValue,
			minValue: lowerValue,
			maxSteps: maxSteps,
			minSteps: minSteps
		};


	}
}