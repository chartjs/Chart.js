'use strict';

// Undefined border is a border not explictly set by any axis. Four undefined borders are always created around
// the chartArea. If an axis has border.display set to true, a defined border will be created for that axis, if
// it's set to false an undefined border will be created.
// If there is an undefined and a defined border overlapping each other, only the defined will be drawn.
//
// Simplified, undefined border is some kind of placeholder for every border, which is replaced by a defined one,
// if such border overlapping it exists, guarateeing there will be always a line, even if the border isn't displayed.

module.exports = function(Chart) {
	var helpers = Chart.helpers;
	var globalDefaults = Chart.defaults.global;

	Chart.defaults.scale.border = {
		display: false,
		color: 'rgba(0, 0, 0, 0.4)',
		lineWidth: 1,
		borderDash: [],
		borderDashOffset: 0.0
	};

	function bordersOverlap(b) {
		return b.undefinedBorder === false
			&& b.x1 === this.x1
			&& b.x2 === this.x2
			&& b.y1 === this.y1
			&& b.y2 === this.y2;
	}

	function drawLine(context, x1, x2, y1, y2) {
		var aliasPixel = helpers.aliasPixel(context.lineWidth);

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

	function getChartAreaBorder(index, scale, chartArea) {
		var gridLines = scale.options.gridLines;

		var isHorizontal = scale.isHorizontal();

		var border = {
			x1: chartArea.left,
			x2: chartArea.right,
			y1: chartArea.top,
			y2: chartArea.bottom,
			isHorizontal: isHorizontal,
			undefinedBorder: true
		};

		if (!isHorizontal) {
			border.y1 = border.y2 = (index === 0 ? chartArea.top : chartArea.bottom);
		} else {
			border.x1 = border.x2 = (index === 0 ? chartArea.left : chartArea.right);
		}

		// If this gridLine is zeroLine, include zeroLine properties
		if ((typeof scale.zeroLineIndex !== 'undefined' ? scale.zeroLineIndex : 0) === index) {
			border.forceUseStyle = true;
			border.lineWidth = gridLines.zeroLineWidth;
			border.lineColor = gridLines.zeroLineColor;
			border.borderDash = gridLines.zeroLineBorderDash;
			border.borderDashOffset = gridLines.zeroLineBorderDashOffset;
		}

		return border;
	}

	function getChartAreaBorders(scale, chartArea, gridLinesCount, undefinedBorderOptions) {
		var gridLines = scale.options.gridLines;
		var isHorizontal = scale.isHorizontal();

		// The undefinedBorder variables are used to determine if the undefinedBorders for the specific
		// direction(determined by isHorizontal) is already set, as every direction can only have them set once.
		if (isHorizontal && undefinedBorderOptions.horizontal === undefined) {
			undefinedBorderOptions.horizontal = {
				lineWidth: gridLines.lineWidth,
				lineColor: gridLines.color,
				borderDash: gridLines.borderDash,
				borderDashOffset: gridLines.borderDashOffset
			};
		} else if (!isHorizontal && undefinedBorderOptions.vertical === undefined) {
			undefinedBorderOptions.vertical = {
				lineWidth: gridLines.lineWidth,
				lineColor: gridLines.color,
				borderDash: gridLines.borderDash,
				borderDashOffset: gridLines.borderDashOffset
			};
		} else {
			// Ensures that every chartArea border is added only once
			return undefined;
		}

		// Get the first and last gridLine as undefined borders
		return [getChartAreaBorder(0, scale, chartArea), getChartAreaBorder(gridLinesCount-1, scale, chartArea)];
	}

	function getScaleBorder(scale, borderOptions) {
		// Get position of the border
		var bx1 = scale.left,
			bx2 = scale.right,
			by1 = scale.top,
			by2 = scale.bottom;

		if (scale.isHorizontal()) {
			by1 = by2 = scale.position === 'top' ? scale.bottom : scale.top;
		} else {
			bx1 = bx2 = scale.position === 'left' ? scale.right : scale.left;
		}

		// Axis border(the line near ticks) is defined when border.display option is true or undefined otherwise
		// Undefined borders may not be drawn in the end if there is any defined border overlapping them,
		// therefore they must be drawn after all the scales are iterated
		// The direction has to be flipped because the border line of an axis has the opposite direction than
		// its gridLines. For visual explanation check the issue #4041
		return {
			x1: bx1,
			x2: bx2,
			y1: by1,
			y2: by2,
			isHorizontal: !scale.isHorizontal(),
			lineWidth: borderOptions.lineWidth,
			lineColor: borderOptions.color,
			borderDash: helpers.getValueOrDefault(borderOptions.borderDash, globalDefaults.borderDash),
			borderDashOffset: helpers.getValueOrDefault(borderOptions.borderDashOffset, globalDefaults.borderDashOffset),
			undefinedBorder: !borderOptions.display
		};
	}

	function drawGridLines(chart, scale, undefinedBorderOptions, bordersToDraw) {
		var gridLines = scale.options.gridLines;
		if (!gridLines.display) {
			return;
		}

		var context = chart.ctx;
		var chartArea = chart.chartArea;

		var isHorizontal = scale.isHorizontal();

		var lineWidth, lineColor, borderDash, borderDashOffset;

		// When gridLines.offsetGridLines is enabled, there is one less tick than
		// there should be gridLines, so we have to take that into account
		var gridLinesCount = scale.ticks.length + (gridLines.offsetGridLines ? 1 : 0);

		// First and last gridLine of first found axis for each direction are marked as undefined borders.
		// First and last gridLines are never drawn for any scale to ensure that there won't be any overlapping on chartArea borders.
		// All four sides of chartArea have to be marked, to be sure there will always be some border. If the border is defined by
		// any axis, that border will be preferred later
		// getChartAreaBorder returns undefined when chartArea border for this direction were already marked
		var chartAreaBorders = getChartAreaBorders(scale, chartArea, gridLinesCount, undefinedBorderOptions);
		if (chartAreaBorders !== undefined) {
			Array.prototype.push.apply(bordersToDraw, chartAreaBorders);
		}

		// Draw all gridLines excluding the first and the last
		for (var index = 1; index < gridLinesCount - 1; index++) {
			if (scale.ticks[index] === null || scale.ticks[index] === undefined) {
				continue;
			}

			// Set visual settings for current gridLine
			if (index === (typeof scale.zeroLineIndex !== 'undefined' ? scale.zeroLineIndex : 0)) {
				lineWidth = gridLines.zeroLineWidth;
				lineColor = gridLines.zeroLineColor;
				borderDash = gridLines.zeroLineBorderDash;
				borderDashOffset = gridLines.zeroLineBorderDashOffset;
			} else {
				lineWidth = helpers.getValueAtIndexOrDefault(gridLines.lineWidth, index);
				lineColor = helpers.getValueAtIndexOrDefault(gridLines.color, index);
				borderDash = helpers.getValueOrDefault(gridLines.borderDash, globalDefaults.borderDash);
				borderDashOffset = helpers.getValueOrDefault(gridLines.borderDashOffset, globalDefaults.borderDashOffset);
			}

			// Get position of current gridLine
			var x1, x2, y1, y2;
			if (isHorizontal) {
				var xLineValue = scale.getPixelForTick(index);

				x1 = x2 = xLineValue;
				y1 = chartArea.top;
				y2 = chartArea.bottom;
			} else {
				var yLineValue = scale.getPixelForTick(index);

				x1 = chartArea.left;
				x2 = chartArea.right;
				y1 = y2 = yLineValue;
			}

			context.lineWidth = lineWidth;
			context.strokeStyle = lineColor;
			if (context.setLineDash) {
				context.setLineDash(borderDash);
				context.lineDashOffset = borderDashOffset;
			}

			// Draw current gridLine
			drawLine(context, x1, x2, y1, y2);
		}
	}

	function drawBorders(context, bordersToDraw, undefinedBorderOptions) {
		// Draws all the borders. Skips undefined orders which would be overlapped by a defined border
		helpers.each(bordersToDraw, function(borderToDraw) {
			// When the border is undefined, check if there isn't a defined border on the same place, if there is one dont draw this border
			if (!borderToDraw.undefinedBorder || bordersToDraw.findIndex(bordersOverlap, borderToDraw) === -1) {
				context.save();

				var _undefinedBorderOptions = borderToDraw.isHorizontal ? undefinedBorderOptions.horizontal : undefinedBorderOptions.vertical;

				// Use given properties if border is defined or they were explictly set(e.g. when the undefined border is also a zeroLine)
				// Otherwise use default properties for undefined borders
				var useGivenOptions = !borderToDraw.undefinedBorder || borderToDraw.forceUseStyle;

				context.lineWidth = useGivenOptions ? borderToDraw.lineWidth : _undefinedBorderOptions.lineWidth;
				context.strokeStyle = useGivenOptions ? borderToDraw.lineColor : _undefinedBorderOptions.lineColor;
				if (context.setLineDash) {
					context.setLineDash(useGivenOptions ? borderToDraw.borderDash : _undefinedBorderOptions.borderDash);
					context.lineDashOffset = useGivenOptions ? borderToDraw.borderDashOffset : _undefinedBorderOptions.borderDashOffset;
				}

				// Draw the border
				drawLine(context, borderToDraw.x1, borderToDraw.x2, borderToDraw.y1, borderToDraw.y2);

				// If there are no defined borders overlapping this undefined border, mark it
				// as defined to prevent other undefined borders to be drawn over it
				if (borderToDraw.undefinedBorder) {
					borderToDraw.undefinedBorder = false;
				}
			}
		});
	}

	function setUndefinedBorderOptionsToDefault(undefinedBorderOptions) {
		var gridLineDefaults = Chart.defaults.scale.gridLines;

		if (undefinedBorderOptions.horizontal === undefined) {
			undefinedBorderOptions.horizontal = {
				lineWidth: gridLineDefaults.lineWidth,
				lineColor: gridLineDefaults.color,
				borderDash: gridLineDefaults.borderDash,
				borderDashOffset: gridLineDefaults.borderDashOffset
			};
		}

		if (undefinedBorderOptions.vertical === undefined) {
			undefinedBorderOptions.vertical = {
				lineWidth: gridLineDefaults.lineWidth,
				lineColor: gridLineDefaults.color,
				borderDash: gridLineDefaults.borderDash,
				borderDashOffset: gridLineDefaults.borderDashOffset
			};
		}
	}

	return {
		id: 'gridlines',

		beforeDatasetsDraw: function(chart) {
			// Shut down the plugin if the chart is radar or polarArea
			if (chart.scale !== undefined && chart.scale.options.type === 'radialLinear') {
				return;
			}

			var bordersToDraw = [];

			// Properties used by all undefined borders. They are set by the first axis of the corresponding
			// orientation (y = horizontal, x = vertical)
			var undefinedBorderOptions = {horizontal: undefined, vertical: undefined};

			helpers.each(chart.scales, function(scale) {
				var scaleOptions = scale.options;

				if (scaleOptions.display) {
					// Draw gridLines and mark undefined borders
					drawGridLines(chart, scale, undefinedBorderOptions, bordersToDraw);

					// Adds the border of this scale to the array to be drawn later after all the gridLines are drawn
					if (scaleOptions.gridLines.display || scaleOptions.border.display) {
						bordersToDraw.push(getScaleBorder(scale, scaleOptions.border));
					}
				}
			});

			// Set common undefinedBorder properties to default gridLines options if no axis for the specific
			// direction was found
			setUndefinedBorderOptionsToDefault(undefinedBorderOptions);

			drawBorders(chart.ctx, bordersToDraw, undefinedBorderOptions);
		}
	};
};
