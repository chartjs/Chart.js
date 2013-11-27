this.Line = function(data, options) {

	chart.Line.defaults = {
		scaleOverlay: false,
		scaleOverride: false,
		scaleSteps: null,
		scaleStepWidth: null,
		scaleStartValue: null,
		scaleLineColor: "rgba(0,0,0,.1)",
		scaleLineWidth: 1,
		scaleShowLabels: true,
		scaleLabel: "<%=value%>",
		scaleFontFamily: "'Arial'",
		scaleFontSize: 12,
		scaleFontStyle: "normal",
		scaleFontColor: "#666",
		scaleShowGridLines: true,
		scaleGridLineColor: "rgba(0,0,0,.05)",
		scaleGridLineWidth: 1,
		bezierCurve: true,
		pointDot: true,
		pointDotRadius: 4,
		pointDotStrokeWidth: 2,
		datasetStroke: true,
		datasetStrokeWidth: 2,
		datasetFill: true,
		animation: true,
		animationSteps: 60,
		animationEasing: "easeOutQuart",
		onAnimationComplete: null
	};
	var config = (options) ? mergeChartConfig(chart.Line.defaults, options) : chart.Line.defaults;

	return new Line(data, config, context);
}


var Line = function(data, config, ctx) {
	var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString, valueHop, widestXLabel, xAxisLength, yAxisPosX, xAxisPosY, rotateLabels = 0;

	calculateDrawingSizes();

	valueBounds = getValueBounds();
	//Check and set the scale
	labelTemplateString = (config.scaleShowLabels) ? config.scaleLabel : "";
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

	scaleHop = Math.floor(scaleHeight / calculatedScale.steps);
	calculateXAxisSize();
	animationLoop(config, drawScale, drawLines, ctx);

	function drawLines(animPc) {
		for (var i = 0; i < data.datasets.length; i++) {
			ctx.strokeStyle = data.datasets[i].strokeColor;
			ctx.lineWidth = config.datasetStrokeWidth;
			ctx.beginPath();
			ctx.moveTo(yAxisPosX, xAxisPosY - animPc * (calculateOffset(data.datasets[i].data[0], calculatedScale, scaleHop)))

			for (var j = 1; j < data.datasets[i].data.length; j++) {
				if (config.bezierCurve) {
					ctx.bezierCurveTo(xPos(j - 0.5), yPos(i, j - 1), xPos(j - 0.5), yPos(i, j), xPos(j), yPos(i, j));
				} else {
					ctx.lineTo(xPos(j), yPos(i, j));
				}
			}
			ctx.stroke();
			if (config.datasetFill) {
				ctx.lineTo(yAxisPosX + (valueHop * (data.datasets[i].data.length - 1)), xAxisPosY);
				ctx.lineTo(yAxisPosX, xAxisPosY);
				ctx.closePath();
				ctx.fillStyle = data.datasets[i].fillColor;
				ctx.fill();
			} else {
				ctx.closePath();
			}
			if (config.pointDot) {
				ctx.fillStyle = data.datasets[i].pointColor;
				ctx.strokeStyle = data.datasets[i].pointStrokeColor;
				ctx.lineWidth = config.pointDotStrokeWidth;
				for (var k = 0; k < data.datasets[i].data.length; k++) {
					ctx.beginPath();
					ctx.arc(yAxisPosX + (valueHop * k), xAxisPosY - animPc * (calculateOffset(data.datasets[i].data[k], calculatedScale, scaleHop)), config.pointDotRadius, 0, Math.PI * 2, true);
					ctx.fill();
					ctx.stroke();
				}
			}
		}

		function yPos(dataSet, iteration) {
			return xAxisPosY - animPc * (calculateOffset(data.datasets[dataSet].data[iteration], calculatedScale, scaleHop));
		}

		function xPos(iteration) {
			return yAxisPosX + (valueHop * iteration);
		}
	}

	function drawScale() {
		//X axis line
		ctx.lineWidth = config.scaleLineWidth;
		ctx.strokeStyle = config.scaleLineColor;
		ctx.beginPath();
		ctx.moveTo(width - widestXLabel / 2 + 5, xAxisPosY);
		ctx.lineTo(width - (widestXLabel / 2) - xAxisLength - 5, xAxisPosY);
		ctx.stroke();


		if (rotateLabels > 0) {
			ctx.save();
			ctx.textAlign = "right";
		} else {
			ctx.textAlign = "center";
		}
		ctx.fillStyle = config.scaleFontColor;
		for (var i = 0; i < data.labels.length; i++) {
			ctx.save();
			if (rotateLabels > 0) {
				ctx.translate(yAxisPosX + i * valueHop, xAxisPosY + config.scaleFontSize);
				ctx.rotate(-(rotateLabels * (Math.PI / 180)));
				ctx.fillText(data.labels[i], 0, 0);
				ctx.restore();
			} else {
				ctx.fillText(data.labels[i], yAxisPosX + i * valueHop, xAxisPosY + config.scaleFontSize + 3);
			}

			ctx.beginPath();
			ctx.moveTo(yAxisPosX + i * valueHop, xAxisPosY + 3);

			//Check i isnt 0, so we dont go over the Y axis twice.
			if (config.scaleShowGridLines && i > 0) {
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				ctx.lineTo(yAxisPosX + i * valueHop, 5);
			} else {
				ctx.lineTo(yAxisPosX + i * valueHop, xAxisPosY + 3);
			}
			ctx.stroke();
		}

		//Y axis
		ctx.lineWidth = config.scaleLineWidth;
		ctx.strokeStyle = config.scaleLineColor;
		ctx.beginPath();
		ctx.moveTo(yAxisPosX, xAxisPosY + 5);
		ctx.lineTo(yAxisPosX, 5);
		ctx.stroke();

		ctx.textAlign = "right";
		ctx.textBaseline = "middle";
		for (var j = 0; j < calculatedScale.steps; j++) {
			ctx.beginPath();
			ctx.moveTo(yAxisPosX - 3, xAxisPosY - ((j + 1) * scaleHop));
			if (config.scaleShowGridLines) {
				ctx.lineWidth = config.scaleGridLineWidth;
				ctx.strokeStyle = config.scaleGridLineColor;
				ctx.lineTo(yAxisPosX + xAxisLength + 5, xAxisPosY - ((j + 1) * scaleHop));
			} else {
				ctx.lineTo(yAxisPosX - 0.5, xAxisPosY - ((j + 1) * scaleHop));
			}

			ctx.stroke();

			if (config.scaleShowLabels) {
				ctx.fillText(calculatedScale.labels[j], yAxisPosX - 8, xAxisPosY - ((j + 1) * scaleHop));
			}
		}


	}

	function calculateXAxisSize() {
		var longestText = 1;
		//if we are showing the labels
		if (config.scaleShowLabels) {
			ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
			for (var i = 0; i < calculatedScale.labels.length; i++) {
				var measuredText = ctx.measureText(calculatedScale.labels[i]).width;
				longestText = (measuredText > longestText) ? measuredText : longestText;
			}
			//Add a little extra padding from the y axis
			longestText += 10;
		}
		xAxisLength = width - longestText - widestXLabel;
		valueHop = Math.floor(xAxisLength / (data.labels.length - 1));

		yAxisPosX = width - widestXLabel / 2 - xAxisLength;
		xAxisPosY = scaleHeight + config.scaleFontSize / 2;
	}

	function calculateDrawingSizes() {
		maxSize = height;

		//Need to check the X axis first - measure the length of each text metric, and figure out if we need to rotate by 45 degrees.
		ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
		widestXLabel = 1;
		for (var i = 0; i < data.labels.length; i++) {
			var textLength = ctx.measureText(data.labels[i]).width;
			//If the text length is longer - make that equal to longest text!
			widestXLabel = (textLength > widestXLabel) ? textLength : widestXLabel;
		}
		if (width / data.labels.length < widestXLabel) {
			rotateLabels = 45;
			if (width / data.labels.length < Math.cos(rotateLabels) * widestXLabel) {
				rotateLabels = 90;
				maxSize -= widestXLabel;
			} else {
				maxSize -= Math.sin(rotateLabels) * widestXLabel;
			}
		} else {
			maxSize -= config.scaleFontSize;
		}

		//Add a little padding between the x line and the text
		maxSize -= 5;


		labelHeight = config.scaleFontSize;

		maxSize -= labelHeight;
		//Set 5 pixels greater than the font size to allow for a little padding from the X axis.

		scaleHeight = maxSize;

		//Then get the area above we can safely draw on.

	}

	function getValueBounds() {
		var upperValue = Number.MIN_VALUE;
		var lowerValue = Number.MAX_VALUE;
		for (var i = 0; i < data.datasets.length; i++) {
			for (var j = 0; j < data.datasets[i].data.length; j++) {
				if (data.datasets[i].data[j] > upperValue) {
					upperValue = data.datasets[i].data[j]
				};
				if (data.datasets[i].data[j] < lowerValue) {
					lowerValue = data.datasets[i].data[j]
				};
			}
		};

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