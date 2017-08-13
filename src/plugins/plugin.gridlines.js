'use strict';

module.exports = function(Chart) {
	var helpers = Chart.helpers;
	var globalDefaults = Chart.defaults.global;

	// Stores all gridLines that should be displayed
	var lines = [];

	function getGridLine(chart, scale, position, tickIndex) {
		var chartArea = chart.chartArea;
		var scaleOptions = scale.options;
		var gridLines = scaleOptions.gridLines;

		var lineWidth, lineColor, borderDash, borderDashOffset;

		if (tickIndex === (typeof scale.zeroLineIndex !== 'undefined' ? scale.zeroLineIndex : 0)) {
			lineWidth = gridLines.zeroLineWidth;
			lineColor = gridLines.zeroLineColor;
			borderDash = gridLines.zeroLineBorderDash;
			borderDashOffset = gridLines.zeroLineBorderDashOffset;
		} else {
			lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, tickIndex);
			lineColor = helpers.getValueAtIndexOrDefault(gridLines.color, tickIndex);
			borderDash = helpers.getValueOrDefault(gridLines.borderDash, globalDefaults.borderDash);
			borderDashOffset = helpers.getValueOrDefault(gridLines.borderDashOffset, globalDefaults.borderDashOffset);
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
		lines = [];

		// Temporary object that stores already collected gridLine positions to check and prevent gridLines from overlapping
		var gridLinesHash = {
			horizontal: {},
			vertical: {}
		};

		// Marks scale border positions to prevent overlapping of gridLines and scale borders
		helpers.each(chart.scales, function(scale) {
			var scaleOptions = scale.options;

			// gridLines.drawBorder is deprecated
			if (scaleOptions.gridLines.drawBorder && scaleOptions.borderColor !== null && scaleOptions.borderWidth !== 0 && scaleOptions.borderWidth !== null) {
				var glHashByOrientantion = gridLinesHash[!scale.isHorizontal() ? 'horizontal' : 'vertical'];
				var borderPosition;

				if (scale.isHorizontal()) {
					borderPosition = scale.position === 'top' ? scale.bottom : scale.top;
				} else {
					borderPosition = scale.position === 'left' ? scale.right : scale.left;
				}

				glHashByOrientantion[Math.round(borderPosition)] = true;
			}
		});

		// Collects gridLines
		helpers.each(chart.scales, function(scale) {
			var scaleOptions = scale.options;

			if (scaleOptions.display && scaleOptions.gridLines.display && scaleOptions.gridLines.drawOnChartArea) {
				var glHashByOrientantion = gridLinesHash[scale.isHorizontal() ? 'horizontal' : 'vertical'];
				var position;

				for (var tickIndex = 0; tickIndex < scale.ticks.length; tickIndex++) {
					var tick = scale.ticks[tickIndex];

					if (tick === null || tick === undefined) {
						continue;
					}

					position = scale.getPixelForTick(tickIndex);

					if (glHashByOrientantion[position] === undefined) {
						glHashByOrientantion[position] = true;
						lines.push(getGridLine(chart, scale, position, tickIndex));
					}
				}

				// When offsetGridLines is enabled, there should be one more gridLine than there
				// are ticks in scale.ticks array, thefore the missing gridLine has to be manually added
				if (scaleOptions.gridLines.offsetGridLines) {
					position = Math.round(!scale.isHorizontal() ? scale.bottom : scale.right);

					if (glHashByOrientantion[position] === undefined) {
						glHashByOrientantion[position] = true;
						lines.push(getGridLine(chart, scale, position, undefined));
					}
				}
			}
		});
	}

	function drawGridLines(chart) {
		var context = chart.ctx;

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			context.lineWidth = line.width;
			context.strokeStyle = line.color;
			if (context.setLineDash) {
				context.setLineDash(line.borderDash);
				context.lineDashOffset = line.borderDashOffset;
			}

			var aliasPixel = helpers.aliasPixel(context.lineWidth);
			var x1 = line.x1;
			var x2 = line.x2;
			var y1 = line.y1;
			var y2 = line.y2;

			if (y1 === y2) {
				y1 += aliasPixel;
				y2 += aliasPixel;
			} else {
				x1 += aliasPixel;
				x2 += aliasPixel;
			}

			context.beginPath();

			context.moveTo(x1, y1);
			context.lineTo(x2, y2);

			context.stroke();
			context.restore();
		}
	}

	return {
		id: 'gridlines',

		afterUpdate: function(chart) {
			collectVisibleGridLines(chart);
		},

		beforeDraw: function(chart) {
			drawGridLines(chart);
		}
	};
};
