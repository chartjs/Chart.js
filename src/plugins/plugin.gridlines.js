'use strict';

var defaults = require('../core/core.defaults');
var helpers = require('../helpers/index');
var MODEL_KEY = '$gridlines';

// This is copied from core.scale.js, which is also required here and im not sure where it should be placed for both of them to access it
function getLineValue(scale, index, offsetGridLines) {
	var lineValue = scale.getPixelForTick(index);

	if (offsetGridLines) {
		if (index === 0) {
			lineValue -= (scale.getPixelForTick(1) - lineValue) / 2;
		} else {
			lineValue -= (lineValue - scale.getPixelForTick(index - 1)) / 2;
		}
	}
	return lineValue;
}

function getGridLine(chart, scale, position, tickIndex) {
	var chartArea = chart.chartArea;
	var scaleOptions = scale.options;
	var gridLines = scaleOptions.gridLines;

	var lineWidth, lineColor, borderDash, borderDashOffset;

	if (tickIndex !== undefined && tickIndex === scale.zeroLineIndex) {
		lineWidth = gridLines.zeroLineWidth;
		lineColor = gridLines.zeroLineColor;
		borderDash = gridLines.zeroLineBorderDash;
		borderDashOffset = gridLines.zeroLineBorderDashOffset;
	} else {
		lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, tickIndex);
		lineColor = helpers.getValueAtIndexOrDefault(gridLines.color, tickIndex);
		borderDash = helpers.getValueOrDefault(gridLines.borderDash, defaults.global.borderDash);
		borderDashOffset = helpers.getValueOrDefault(gridLines.borderDashOffset, defaults.global.borderDashOffset);
	}

	var x1, x2, y1, y2;

	if (scale.isHorizontal()) {
		x1 = x2 = position;
		y1 = chartArea.top;
		y2 = chartArea.bottom;
	} else {
		x1 = chartArea.left;
		x2 = chartArea.right;
		y1 = y2 = position;
	}

	return {
		x1: x1,
		x2: x2,
		y1: y1,
		y2: y2,
		width: lineWidth,
		color: lineColor,
		borderDash: borderDash,
		borderDashOffset: borderDashOffset
	};
}

function collectVisibleGridLines(chart) {
	var lines = [];

	// Temporary object that stores already collected gridLine positions to prevent gridLines from overlapping
	var gridLinesHash = {
		horizontal: {},
		vertical: {}
	};

	// Marks scale border positions to prevent overlapping of gridLines and scale borders
	helpers.each(chart.scales, function(scale) {
		var scaleOptions = scale.options;
		var glHashByOrientation = gridLinesHash[!scale.isHorizontal() ? 'horizontal' : 'vertical'];
		var borderPosition;

		// gridLines.drawBorder is deprecated
		if (scaleOptions.gridLines.drawBorder && scaleOptions.borderColor !== null && scaleOptions.borderWidth !== 0 && scaleOptions.borderWidth !== null) {
			if (scale.isHorizontal()) {
				borderPosition = scale.position === 'top' ? scale.bottom : scale.top;
			} else {
				borderPosition = scale.position === 'left' ? scale.right : scale.left;
			}

			glHashByOrientation[Math.round(borderPosition)] = true;
		}
	});

	// Collects gridLines
	helpers.each(chart.scales, function(scale) {
		var scaleOptions = scale.options;
		var glHashByOrientation = gridLinesHash[scale.isHorizontal() ? 'horizontal' : 'vertical'];
		var position;

		if (scaleOptions.display && scaleOptions.gridLines.display && scaleOptions.gridLines.drawOnChartArea) {
			for (var tickIndex = 0, ticksCount = scale.ticks.length; tickIndex < ticksCount; tickIndex++) {
				if (helpers.isNullOrUndef(scale.ticks[tickIndex])) {
					continue;
				}

				position = getLineValue(scale, tickIndex, scaleOptions.gridLines.offsetGridLines && ticksCount > 1);

				if (glHashByOrientation[position] === undefined) {
					glHashByOrientation[position] = true;
					lines.push(getGridLine(chart, scale, position, tickIndex));
				}
			}

			// When offsetGridLines is enabled, there should be one more gridLine than there
			// are ticks in scale.ticks array, therefore the missing gridLine has to be manually added
			if (scaleOptions.gridLines.offsetGridLines) {
				position = Math.round(!scale.isHorizontal() ? scale.bottom : scale.right);

				if (glHashByOrientation[position] === undefined) {
					glHashByOrientation[position] = true;
					lines.push(getGridLine(chart, scale, position, undefined));
				}
			}
		}
	});

	return lines;
}

function drawGridLines(ctx, lines) {
	var aliasPixel;
	var x1, x2, y1, y2;

	for (var i = 0, ilen = lines.length; i < ilen; i++) {
		var line = lines[i];

		ctx.lineWidth = line.width;
		ctx.strokeStyle = line.color;
		if (ctx.setLineDash) {
			ctx.setLineDash(line.borderDash);
			ctx.lineDashOffset = line.borderDashOffset;
		}

		aliasPixel = helpers.aliasPixel(ctx.lineWidth);
		x1 = line.x1;
		x2 = line.x2;
		y1 = line.y1;
		y2 = line.y2;

		if (y1 === y2) {
			y1 += aliasPixel;
			y2 += aliasPixel;
		} else {
			x1 += aliasPixel;
			x2 += aliasPixel;
		}

		ctx.beginPath();

		ctx.moveTo(x1, y1);
		ctx.lineTo(x2, y2);

		ctx.stroke();
		ctx.restore();
	}
}

module.exports = {
	id: 'gridlines',

	afterUpdate: function(chart) {
		chart[MODEL_KEY] = {
			lines: collectVisibleGridLines(chart)
		};
	},

	beforeDraw: function(chart) {
		var model = chart[MODEL_KEY];
		if (model) {
			drawGridLines(chart.ctx, model.lines);
		}
	}
};
