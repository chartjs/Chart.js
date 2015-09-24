(function() {
	"use strict";

	var root = this,
		Chart = root.Chart,
		helpers = Chart.helpers;

	var time = {
		units: [
			'millisecond',
			'second',
			'minute',
			'hour',
			'day',
			'week',
			'month',
			'quarter',
			'year',
		],
		unit: {
			'millisecond': {
				display: 'SSS [ms]', // 002 ms
				maxStep: 1000,
			},
			'second': {
				display: 'h:mm:ss a', // 11:20:01 AM
				maxStep: 60,
			},
			'minute': {
				display: 'h:mm:ss a', // 11:20:01 AM
				maxStep: 60,
			},
			'hour': {
				display: 'MMM D, hA', // Sept 4, 5PM
				maxStep: 24,
			},
			'day': {
				display: 'll', // Sep 4 2015
				maxStep: 7,
			},
			'week': {
				display: 'll', // Week 46, or maybe "[W]WW - YYYY" ?
				maxStep: 4.3333,
			},
			'month': {
				display: 'MMM YYYY', // Sept 2015
				maxStep: 12,
			},
			'quarter': {
				display: '[Q]Q - YYYY', // Q3
				maxStep: 4,
			},
			'year': {
				display: 'YYYY', // 2015
				maxStep: false,
			},
		}
	};

	var defaultConfig = {
		position: "bottom",

		time: {
			format: false, // false == date objects or use pattern string from http://momentjs.com/docs/#/parsing/string-format/
			unit: false, // false == automatic or override with week, month, year, etc.
			round: false, // none, or override with week, month, year, etc.
			displayFormat: false, // defaults to unit's corresponding unitFormat below or override using pattern string from http://momentjs.com/docs/#/displaying/format/
		},
	};

	var TimeScale = Chart.Scale.extend({
		parseTime: function(label) {
			// Date objects
			if (typeof label.getMonth === 'function' || typeof label == 'number') {
				return moment(label);
			}
			// Moment support
			if (label.isValid && label.isValid()) {
				return label;
			}
			// Custom parsing (return an instance of moment)
			if (typeof this.options.time.format !== 'string' && this.options.time.format.call) {
				return this.options.time.format(label);
			}
			// Moment format parsing
			return moment(label, this.options.time.format);
		},
		generateTicks: function(index) {

			this.ticks = [];
			this.labelMoments = [];

			// Parse each label into a moment
			this.data.labels.forEach(function(label, index) {
				var labelMoment = this.parseTime(label);
				if (this.options.time.round) {
					labelMoment.startOf(this.options.time.round);
				}
				this.labelMoments.push(labelMoment);
			}, this);

			// Find the first and last moments, and range
			this.firstTick = moment.min.call(this, this.labelMoments).clone();
			this.lastTick = moment.max.call(this, this.labelMoments).clone();

			// Set unit override if applicable
			if (this.options.time.unit) {
				this.tickUnit = this.options.time.unit || 'day';
				this.displayFormat = time.unit.day.display;
				this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit, true));
			} else {
				// Determine the smallest needed unit of the time
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var labelCapacity = innerWidth / this.options.ticks.fontSize + 4;
				var buffer = this.options.time.round ? 0 : 2;

				this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, true) + buffer);
				var done;

				helpers.each(time.units, function(format) {
					if (this.tickRange <= labelCapacity) {
						return;
					}
					this.tickUnit = format;
					this.tickRange = Math.ceil(this.lastTick.diff(this.firstTick, this.tickUnit) + buffer);
					this.displayFormat = time.unit[format].display;

				}, this);
			}

			this.firstTick.startOf(this.tickUnit);
			this.lastTick.endOf(this.tickUnit);
			this.smallestLabelSeparation = this.width;

			var i = 0;

			for (i = 1; i < this.labelMoments.length; i++) {
				this.smallestLabelSeparation = Math.min(this.smallestLabelSeparation, this.labelMoments[i].diff(this.labelMoments[i - 1], this.tickUnit, true));
			}


			// Tick displayFormat override
			if (this.options.time.displayFormat) {
				this.displayFormat = this.options.time.displayFormat;
			}

			// For every unit in between the first and last moment, create a moment and add it to the ticks tick
			if (this.options.ticks.userCallback) {
				for (i = 0; i <= this.tickRange; i++) {
					this.ticks.push(
						this.options.ticks.userCallback(this.firstTick.clone()
							.add(i, this.tickUnit)
							.format(this.options.time.displayFormat ? this.options.time.displayFormat : time.unit[this.tickUnit].display)
						)
					);
				}
			} else {
				for (i = 0; i <= this.tickRange; i++) {
					this.ticks.push(this.firstTick.clone()
						.add(i, this.tickUnit)
						.format(this.options.time.displayFormat ? this.options.time.displayFormat : time.unit[this.tickUnit].display)
					);
				}
			}
		},
		getSmallestDataDistance: function() {
			return this.smallestLabelSeparation;
		},
		getPixelForValue: function(value, datasetIndex, includeOffset) {
			// This must be called after fit has been run so that 
			//      this.left, this.top, this.right, and this.bottom have been defined

			var decimal = 0.5;

			if (this.isHorizontal()) {
				var innerWidth = this.width - (this.paddingLeft + this.paddingRight);
				var valueWidth = innerWidth / Math.max(this.ticks.length - 1, 1);
				var valueOffset = (innerWidth * decimal) + this.paddingLeft;

				return this.left + Math.round(valueOffset);
			} else {
				return this.top + (decimal * (this.height / this.ticks.length));
			}
		},
		// getPointPixelForValue: function(value, index, datasetIndex) {

		// 	var offset = this.labelMoments[index].diff(this.firstTick, this.tickUnit, true);
		// 	return this.getPixelForValue(value, offset / this.tickRange, datasetIndex);
		// },

		// // Functions needed for bar charts
		// calculateBaseWidth: function() {

		// 	var base = this.getPixelForValue(null, this.smallestLabelSeparation / this.tickRange, 0, true) - this.getPixelForValue(null, 0, 0, true);
		// 	var spacing = 2 * this.options.categorySpacing;
		// 	if (base < spacing * 2) {
		// 		var mod = Math.min((spacing * 2) / base, 1.5);
		// 		base = (base / 2) * mod;
		// 		return base;
		// 	}
		// 	return base - spacing;
		// },
		// calculateBarWidth: function(barDatasetCount) {
		// 	//The padding between datasets is to the right of each bar, providing that there are more than 1 dataset
		// 	var baseWidth = this.calculateBaseWidth() - ((barDatasetCount - 1) * this.options.spacing);

		// 	if (this.options.stacked) {
		// 		return Math.max(baseWidth, 1);
		// 	}
		// 	return Math.max((baseWidth / barDatasetCount), 1);
		// },
		// calculateBarX: function(barDatasetCount, datasetIndex, elementIndex) {

		// 	var xWidth = this.calculateBaseWidth(),
		// 		offset = this.labelMoments[elementIndex].diff(this.firstTick, this.tickUnit, true),
		// 		xAbsolute = this.getPixelForValue(null, offset / this.tickRange, datasetIndex, true) - (xWidth / 2),
		// 		barWidth = this.calculateBarWidth(barDatasetCount);

		// 	if (this.options.stacked) {
		// 		return xAbsolute + barWidth / 2;
		// 	}

		// 	return xAbsolute + (barWidth * datasetIndex) + (datasetIndex * this.options.spacing) + barWidth / 2;
		// },

		// calculateTickRotation: function(maxHeight, margins) {
		// 	//Get the width of each grid by calculating the difference
		// 	//between x offsets between 0 and 1.
		// 	var labelFont = helpers.fontString(this.options.ticks.fontSize, this.options.ticks.fontStyle, this.options.ticks.fontFamily);
		// 	this.ctx.font = labelFont;

		// 	var firstWidth = this.ctx.measureText(this.ticks[0]).width;
		// 	var lastWidth = this.ctx.measureText(this.ticks[this.ticks.length - 1]).width;
		// 	var firstRotated;
		// 	var lastRotated;

		// 	this.paddingRight = lastWidth / 2 + 3;
		// 	this.paddingLeft = firstWidth / 2 + 3;

		// 	this.labelRotation = 0;

		// 	if (this.options.display) {
		// 		var originalLabelWidth = helpers.longestText(this.ctx, labelFont, this.ticks);
		// 		var cosRotation;
		// 		var sinRotation;
		// 		var firstRotatedWidth;

		// 		this.labelWidth = originalLabelWidth;

		// 		//Allow 3 pixels x2 padding either side for label readability
		// 		// only the index matters for a dataset scale, but we want a consistent interface between scales

		// 		var datasetWidth = Math.floor(this.getPixelForValue(null, 1 / this.ticks.length) - this.getPixelForValue(null, 0)) - 6;

		// 		//Max label rotation can be set or default to 90 - also act as a loop counter
		// 		while (this.labelWidth > datasetWidth && this.labelRotation <= this.options.ticks.maxRotation) {
		// 			cosRotation = Math.cos(helpers.toRadians(this.labelRotation));
		// 			sinRotation = Math.sin(helpers.toRadians(this.labelRotation));

		// 			firstRotated = cosRotation * firstWidth;
		// 			lastRotated = cosRotation * lastWidth;

		// 			// We're right aligning the text now.
		// 			if (firstRotated + this.options.ticks.fontSize / 2 > this.yLabelWidth) {
		// 				this.paddingLeft = firstRotated + this.options.ticks.fontSize / 2;
		// 			}

		// 			this.paddingRight = this.options.ticks.fontSize / 2;

		// 			if (sinRotation * originalLabelWidth > maxHeight) {
		// 				// go back one step
		// 				this.labelRotation--;
		// 				break;
		// 			}

		// 			this.labelRotation++;
		// 			this.labelWidth = cosRotation * originalLabelWidth;


		// 		}
		// 	} else {
		// 		this.labelWidth = 0;
		// 		this.paddingRight = 0;
		// 		this.paddingLeft = 0;
		// 	}

		// 	if (margins) {
		// 		this.paddingLeft -= margins.left;
		// 		this.paddingRight -= margins.right;

		// 		this.paddingLeft = Math.max(this.paddingLeft, 0);
		// 		this.paddingRight = Math.max(this.paddingRight, 0);
		// 	}

		// },
		// Fit this axis to the given size
		// @param {number} maxWidth : the max width the axis can be
		// @param {number} maxHeight: the max height the axis can be
		// @return {object} minSize : the minimum size needed to draw the axis
		fit: function(maxWidth, maxHeight, margins) {
			// Set the unconstrained dimension before label rotation
			if (this.isHorizontal()) {
				this.width = maxWidth;
			} else {
				this.height = maxHeight;
			}

			this.generateTicks();
			this.calculateTickRotation(maxHeight, margins);

			var minSize = {
				width: 0,
				height: 0,
			};

			var labelFont = helpers.fontString(this.options.ticks.fontSize, this.options.ticks.fontStyle, this.options.ticks.fontFamily);
			var longestLabelWidth = helpers.longestText(this.ctx, labelFont, this.ticks);

			// Width
			if (this.isHorizontal()) {
				minSize.width = maxWidth;
			} else if (this.options.display) {
				var labelWidth = this.options.ticks.show ? longestLabelWidth + 6 : 0;
				minSize.width = Math.min(labelWidth, maxWidth);
			}

			// Height
			if (this.isHorizontal() && this.options.display) {
				var labelHeight = (Math.sin(helpers.toRadians(this.labelRotation)) * longestLabelWidth) + 1.5 * this.options.ticks.fontSize;
				minSize.height = Math.min(this.options.ticks.show ? labelHeight : 0, maxHeight);
			} else if (this.options.display) {
				minSize.height = maxHeight;
			}

			this.width = minSize.width;
			this.height = minSize.height;
			return minSize;
		},
		// Actualy draw the scale on the canvas
		// @param {rectangle} chartArea : the area of the chart to draw full grid lines on
		draw: function(chartArea) {
			if (this.options.display) {

				var setContextLineSettings;

				// Make sure we draw text in the correct color
				this.ctx.fillStyle = this.options.ticks.fontColor;

				if (this.isHorizontal()) {
					setContextLineSettings = true;
					var yTickStart = this.options.position == "bottom" ? this.top : this.bottom - 10;
					var yTickEnd = this.options.position == "bottom" ? this.top + 10 : this.bottom;
					var isRotated = this.labelRotation !== 0;
					var skipRatio = false;

					if ((this.options.ticks.fontSize + 4) * this.ticks.length > (this.width - (this.paddingLeft + this.paddingRight))) {
						skipRatio = 1 + Math.floor(((this.options.ticks.fontSize + 4) * this.ticks.length) / (this.width - (this.paddingLeft + this.paddingRight)));
					}

					helpers.each(this.ticks, function(tick, index) {
						// Blank ticks
						if ((skipRatio > 1 && index % skipRatio > 0) || (tick === undefined || tick === null)) {
							return;
						}
						var xLineValue = this.getPixelForValue(null, (1 / (this.ticks.length - 1)) * index, null, false); // xvalues for grid lines
						var xLabelValue = this.getPixelForValue(null, (1 / (this.ticks.length - 1)) * index, null, true); // x values for ticks (need to consider offsetLabel option)

						if (this.options.gridLines.show) {
							if (index === 0) {
								// Draw the first index specially
								this.ctx.lineWidth = this.options.gridLines.zeroLineWidth;
								this.ctx.strokeStyle = this.options.gridLines.zeroLineColor;
								setContextLineSettings = true; // reset next time
							} else if (setContextLineSettings) {
								this.ctx.lineWidth = this.options.gridLines.lineWidth;
								this.ctx.strokeStyle = this.options.gridLines.color;
								setContextLineSettings = false;
							}

							xLineValue += helpers.aliasPixel(this.ctx.lineWidth);

							// Draw the tick area
							this.ctx.beginPath();

							if (this.options.gridLines.drawTicks) {
								this.ctx.moveTo(xLineValue, yTickStart);
								this.ctx.lineTo(xLineValue, yTickEnd);
							}

							// Draw the chart area
							if (this.options.gridLines.drawOnChartArea) {
								this.ctx.moveTo(xLineValue, chartArea.top);
								this.ctx.lineTo(xLineValue, chartArea.bottom);
							}

							// Need to stroke in the loop because we are potentially changing line widths & colours
							this.ctx.stroke();
						}

						if (this.options.ticks.show) {
							this.ctx.save();
							this.ctx.translate(xLabelValue, (isRotated) ? this.top + 12 : this.top + 8);
							this.ctx.rotate(helpers.toRadians(this.labelRotation) * -1);
							this.ctx.font = this.font;
							this.ctx.textAlign = (isRotated) ? "right" : "center";
							this.ctx.textBaseline = (isRotated) ? "middle" : "top";
							this.ctx.fillText(tick, 0, 0);
							this.ctx.restore();
						}
					}, this);
				} else {
					// Vertical
					if (this.options.gridLines.show) {}

					if (this.options.ticks.show) {
						// Draw the ticks
					}
				}
			}
		}
	});
	Chart.scaleService.registerScaleType("time", TimeScale, defaultConfig);

}).call(this);
