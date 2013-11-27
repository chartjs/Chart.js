this.PolarArea = function(data, options) {

	chart.PolarArea.defaults = {
		scaleOverlay: true,
		scaleOverride: false,
		scaleSteps: null,
		scaleStepWidth: null,
		scaleStartValue: null,
		scaleShowLine: true,
		scaleLineColor: "rgba(0,0,0,.1)",
		scaleLineWidth: 1,
		scaleShowLabels: true,
		scaleLabel: "<%=value%>",
		scaleFontFamily: "'Arial'",
		scaleFontSize: 12,
		scaleFontStyle: "normal",
		scaleFontColor: "#666",
		scaleShowLabelBackdrop: true,
		scaleBackdropColor: "rgba(255,255,255,0.75)",
		scaleBackdropPaddingY: 2,
		scaleBackdropPaddingX: 2,
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

	var config = (options) ? mergeChartConfig(chart.PolarArea.defaults, options) : chart.PolarArea.defaults;

	return new PolarArea(data, config, context);
};


var PolarArea = function(data, config, ctx) {
	var maxSize, scaleHop, calculatedScale, labelHeight, scaleHeight, valueBounds, labelTemplateString;


	calculateDrawingSizes();

	valueBounds = getValueBounds();

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

	//Wrap in an animation loop wrapper
	animationLoop(config, drawScale, drawAllSegments, ctx);

	function calculateDrawingSizes() {
		maxSize = (Min([width, height]) / 2);
		//Remove whatever is larger - the font size or line width.

		maxSize -= Max([config.scaleFontSize * 0.5, config.scaleLineWidth * 0.5]);

		labelHeight = config.scaleFontSize * 2;
		//If we're drawing the backdrop - add the Y padding to the label height and remove from drawing region.
		if (config.scaleShowLabelBackdrop) {
			labelHeight += (2 * config.scaleBackdropPaddingY);
			maxSize -= config.scaleBackdropPaddingY * 1.5;
		}

		scaleHeight = maxSize;
		//If the label height is less than 5, set it to 5 so we don't have lines on top of each other.
		labelHeight = Default(labelHeight, 5);
	}

	function drawScale() {
		for (var i = 0; i < calculatedScale.steps; i++) {
			//If the line object is there
			if (config.scaleShowLine) {
				ctx.beginPath();
				ctx.arc(width / 2, height / 2, scaleHop * (i + 1), 0, (Math.PI * 2), true);
				ctx.strokeStyle = config.scaleLineColor;
				ctx.lineWidth = config.scaleLineWidth;
				ctx.stroke();
			}

			if (config.scaleShowLabels) {
				ctx.textAlign = "center";
				ctx.font = config.scaleFontStyle + " " + config.scaleFontSize + "px " + config.scaleFontFamily;
				var label = calculatedScale.labels[i];
				//If the backdrop object is within the font object
				if (config.scaleShowLabelBackdrop) {
					var textWidth = ctx.measureText(label).width;
					ctx.fillStyle = config.scaleBackdropColor;
					ctx.beginPath();
					ctx.rect(
						Math.round(width / 2 - textWidth / 2 - config.scaleBackdropPaddingX), //X
						Math.round(height / 2 - (scaleHop * (i + 1)) - config.scaleFontSize * 0.5 - config.scaleBackdropPaddingY), //Y
						Math.round(textWidth + (config.scaleBackdropPaddingX * 2)), //Width
						Math.round(config.scaleFontSize + (config.scaleBackdropPaddingY * 2)) //Height
					);
					ctx.fill();
				}
				ctx.textBaseline = "middle";
				ctx.fillStyle = config.scaleFontColor;
				ctx.fillText(label, width / 2, height / 2 - (scaleHop * (i + 1)));
			}
		}
	}

	function drawAllSegments(animationDecimal) {
		var startAngle = -Math.PI / 2,
			angleStep = (Math.PI * 2) / data.length,
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

			ctx.beginPath();
			ctx.arc(width / 2, height / 2, scaleAnimation * calculateOffset(data[i].value, calculatedScale, scaleHop), startAngle, startAngle + rotateAnimation * angleStep, false);
			ctx.lineTo(width / 2, height / 2);
			ctx.closePath();
			ctx.fillStyle = data[i].color;
			ctx.fill();

			if (config.segmentShowStroke) {
				ctx.strokeStyle = config.segmentStrokeColor;
				ctx.lineWidth = config.segmentStrokeWidth;
				ctx.stroke();
			}
			startAngle += rotateAnimation * angleStep;
		}
	}

	function getValueBounds() {
		var upperValue = Number.MIN_VALUE;
		var lowerValue = Number.MAX_VALUE;
		for (var i = 0; i < data.length; i++) {
			if (data[i].value > upperValue) {
				upperValue = data[i].value;
			}
			if (data[i].value < lowerValue) {
				lowerValue = data[i].value;
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