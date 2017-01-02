'use strict';

module.exports = function(Chart) {

	var helpers = Chart.helpers;

	Chart.defaults.scale = {
		display: true,
		position: 'left',

		// grid line settings
		gridLines: {
			display: true,
			color: 'rgba(0, 0, 0, 0.1)',
			lineWidth: 1,
			drawBorder: true,
			drawOnChartArea: true,
			drawTicks: true,
			tickMarkLength: 10,
			zeroLineWidth: 1,
			zeroLineColor: 'rgba(0,0,0,0.25)',
			offsetGridLines: false,
			borderDash: [],
			borderDashOffset: 0.0
		},

		// scale label
		scaleLabel: {
			// actual label
			labelString: '',

			// display property
			display: false
		},

		// label settings
		ticks: {
			beginAtZero: false,
			minRotation: 0,
			maxRotation: 50,
			mirror: false,
			padding: 0,
			reverse: false,
			display: true,
			autoSkip: true,
			autoSkipPadding: 0,
			labelOffset: 0,
			// We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
			callback: Chart.Ticks.formatters.values
		}
	};

	function computeTextSize(context, tick, font) {
		return helpers.isArray(tick) ?
			helpers.longestText(context, font, tick) :
			context.measureText(tick).width;
	}

	function parseFontOptions(options) {
		var getValueOrDefault = helpers.getValueOrDefault;
		var globalDefaults = Chart.defaults.global;
		var size = getValueOrDefault(options.fontSize, globalDefaults.defaultFontSize);
		var style = getValueOrDefault(options.fontStyle, globalDefaults.defaultFontStyle);
		var family = getValueOrDefault(options.fontFamily, globalDefaults.defaultFontFamily);

		return {
			size: size,
			style: style,
			family: family,
			font: helpers.fontString(size, style, family)
		};
	}

	Chart.Scale = Chart.Element.extend({
		/**
		 * Get the padding needed for the scale
		 * @method getPadding
		 * @private
		 * @returns {Padding} the necessary padding
		 */
		getPadding: function() {
			var me = this;
			return {
				left: me.paddingLeft || 0,
				top: me.paddingTop || 0,
				right: me.paddingRight || 0,
				bottom: me.paddingBottom || 0
			};
		},

		getScaleOptionsAray: function(arg) {
			var me = this;
			var opts = [];
			opts[0] = me.options;
			opts[1] = opts[0].subScale? opts[0].subScale: {};
			opts[2] = opts[1].subScale? opts[1].subScale: {};

			if (arg) {
				return [
					opts[0][arg]? opts[0][arg]: {},
					opts[1][arg]? opts[1][arg]: {},
					opts[2][arg]? opts[2][arg]: {}
				];
			}
			return opts;
		},

		// These methods are ordered by lifecyle. Utilities then follow.
		// Any function defined here is inherited by all scale types.
		// Any function can be extended by the scale type

		beforeUpdate: function() {
			helpers.callCallback(this.options.beforeUpdate, [this]);
		},
		update: function(maxWidth, maxHeight, margins) {
			var me = this;

			// Update Lifecycle - Probably don't want to ever extend or overwrite this function ;)
			me.beforeUpdate();

			// Absorb the master measurements
			me.maxWidth = maxWidth;
			me.maxHeight = maxHeight;
			me.margins = helpers.extend({
				left: 0,
				right: 0,
				top: 0,
				bottom: 0
			}, margins);
			me.longestTextCache = me.longestTextCache || {};

			// Dimensions
			me.beforeSetDimensions();
			me.setDimensions();
			me.afterSetDimensions();

			// Data min/max
			me.beforeDataLimits();
			me.determineDataLimits();
			me.afterDataLimits();

			// Ticks
			me.beforeBuildTicks();
			me.buildTicks();
			me.afterBuildTicks();

			me.beforeTickToLabelConversion();
			me.convertTicksToLabels();
			me.generateTicksInformation();
			me.afterTickToLabelConversion();

			// Tick Rotation
			me.beforeCalculateTickRotation();
			me.calculateTickRotation();
			me.afterCalculateTickRotation();
			// Fit
			me.beforeFit();
			me.fit();
			me.preventionTicksDisplay();
			me.afterFit();
			//
			me.afterUpdate();

			return me.minSize;

		},
		afterUpdate: function() {
			helpers.callCallback(this.options.afterUpdate, [this]);
		},

		//

		beforeSetDimensions: function() {
			helpers.callCallback(this.options.beforeSetDimensions, [this]);
		},
		setDimensions: function() {
			var me = this;
			// Set the unconstrained dimension before label rotation
			if (me.isHorizontal()) {
				// Reset position before calculating rotation
				me.width = me.maxWidth;
				me.left = 0;
				me.right = me.width;
			} else {
				me.height = me.maxHeight;

				// Reset position before calculating rotation
				me.top = 0;
				me.bottom = me.height;
			}

			// Reset padding
			me.paddingLeft = 0;
			me.paddingTop = 0;
			me.paddingRight = 0;
			me.paddingBottom = 0;
		},
		afterSetDimensions: function() {
			helpers.callCallback(this.options.afterSetDimensions, [this]);
		},

		// Data limits
		beforeDataLimits: function() {
			helpers.callCallback(this.options.beforeDataLimits, [this]);
		},
		determineDataLimits: helpers.noop,
		afterDataLimits: function() {
			helpers.callCallback(this.options.afterDataLimits, [this]);
		},

		//
		beforeBuildTicks: function() {
			helpers.callCallback(this.options.beforeBuildTicks, [this]);
		},
		buildTicks: helpers.noop,
		afterBuildTicks: function() {
			helpers.callCallback(this.options.afterBuildTicks, [this]);
		},

		beforeTickToLabelConversion: function() {
			helpers.callCallback(this.options.beforeTickToLabelConversion, [this]);
		},
		convertTicksToLabels: function() {
			var me = this;
			// Convert ticks to strings
			var tickOpts = me.options.ticks;
			me.ticks = me.ticks.map(tickOpts.userCallback || tickOpts.callback);
		},
		// Generate ticksDisplay, ticksDisplayIndex and ticksIsDisplay
		generateTicksInformation: function() {

			var me = this;
			// var opts = me.getScaleOptionsAray();
			var optsTicks = me.getScaleOptionsAray('ticks');

			if (!me.ticks) {
				me.ticks = [];
			}

			if ((!me.ticksLevel) || (me.ticks.length !== me.ticksLevel.length)) {
				me.ticksLevel = [];
				for (var index = 0; index < me.ticks.length; index++) {
					// default tick level = 0;
					me.ticksLevel.push(0);
				}
			}

			var ticksIsDisplay = [];
			var ticksDisplayIndex = [];
			var ticksDisplay = [];
			// Setting display flag for each tick.
			// and setting display ticks array.
			var isDisplay;
			for (index = 0; index < me.ticks.length; index++) {
				// Forced display of the first and last ticks.
				isDisplay = index !== 0? (index !== me.ticks.length - 1? !!optsTicks[me.ticksLevel[index]].display: true): true;
				ticksIsDisplay.push(isDisplay);
				if (isDisplay) {
					ticksDisplay.push(me.ticks[index]);
					ticksDisplayIndex.push(index);
				}
			}

			me.ticksIsDisplay = ticksIsDisplay;
			me.ticksDisplay = ticksDisplay;
			me.ticksDisplayIndex = ticksDisplayIndex;

		},

		afterTickToLabelConversion: function() {
			helpers.callCallback(this.options.afterTickToLabelConversion, [this]);
		},

		//

		beforeCalculateTickRotation: function() {
			helpers.callCallback(this.options.beforeCalculateTickRotation, [this]);
		},
		calculateTickRotation: function() {
			var me = this;
			var context = me.ctx;
			var optsTick = me.getScaleOptionsAray('ticks');
			var tickFont = parseFontOptions(optsTick[0]);
			var labelRotation = me.labelRotation = optsTick[0].minRotation || 0;
			if (!me.options.display) {
				return;
			}

			var tickFirst = me.ticksDisplayIndex[0];
			var tickSecond = me.ticksDisplayIndex[1];
			var tickSecondLast = me.ticksDisplayIndex[me.ticksDisplay.length - 2];
			var tickLast = me.ticksDisplayIndex[me.ticksDisplay.length - 1];

			if (me.isHorizontal()) {
				// horizontal
				var originalLabelWidth = helpers.longestText(context, tickFont.font, me.ticksDisplay, me.longestTextCache);
				var labelWidth = originalLabelWidth;
				var cosRotation;
				var sinRotation;
				var tickWidthLeft = me.getPixelForTick(tickSecond) - me.getPixelForTick(tickFirst) - 6;
				var tickWidthRight = me.getPixelForTick(tickLast) - me.getPixelForTick(tickSecondLast) - 6;

				var tickWidth = Math.min(tickWidthLeft, tickWidthRight);
				// Max label rotation can be set or default to 90 - also act as a loop counter
				while (labelWidth > tickWidth && labelRotation < optsTick[0].maxRotation) {
					var angleRadians = helpers.toRadians(labelRotation);
					cosRotation = Math.cos(angleRadians);
					sinRotation = Math.sin(angleRadians);

					if (sinRotation * originalLabelWidth > me.maxHeight) {
						// go back one step
						labelRotation--;
						break;
					}

					labelRotation++;
					labelWidth = cosRotation * originalLabelWidth;
				}
				// result
				me.labelRotation = labelRotation;
			}
		},

		// Prevention of overlap Ticks.
		preventionTicksDisplay: function() {
			var me = this;
			var context = me.ctx;
			var optsTick = me.getScaleOptionsAray('ticks');
			var tickFont = parseFontOptions(optsTick[0]);
			var labelRotation = me.labelRotation;
			if (!me.options.display) {
				return;
			}

			var tickFirst = me.ticksDisplayIndex[0];
			var tickSecond = me.ticksDisplayIndex[1];
			var tickSecondLast = me.ticksDisplayIndex[me.ticksDisplay.length - 2];
			var tickLast = me.ticksDisplayIndex[me.ticksDisplay.length - 1];

			if (me.isHorizontal()) {
				// horizontal

				// ---------
				// for edge of scale
				var tickWidthLeft = me.getPixelForTick(tickSecond) - me.getPixelForTick(tickFirst) - 6;
				var tickWidthRight = me.getPixelForTick(tickLast) - me.getPixelForTick(tickSecondLast) - 6;
				var cosRotation = Math.cos(helpers.toRadians(labelRotation));
				var labelWidth;
				// near min
				labelWidth = cosRotation * context.measureText(me.ticks[tickSecond]).width;
				labelWidth = labelRotation > 25? labelWidth / 3: labelWidth;
				if (tickWidthLeft < labelWidth) {
					me.ticksIsDisplay[tickSecond] = false;
				}
				// near max
				labelWidth = cosRotation * context.measureText(me.ticks[tickLast]).width;
				labelWidth = labelRotation > 25? labelWidth / 3: labelWidth;
				if (tickWidthRight < labelWidth) {
					me.ticksIsDisplay[tickSecondLast] = false;
				}

			} else {
				// vertical
				var tickHeight, labelHeight;

				// Ticks mark overlap prevention.
				// Temporaly (font size)*1.2 = label height
				// ex) Math.round(18px * 1.2) = 22
				labelHeight = Math.round(tickFont.size * 1.2 * 2); // The factor of *2 has been experimentally determined.
				var po1, po2, isOverlap, le1, le2;
				var isDisplayOfLevel = [true, true, true];

				for (var i = 0; i < me.ticksDisplay.length - 1; i++) {
					po1 = me.ticksDisplayIndex[i];
					po2 = me.ticksDisplayIndex[i + 1];
					le1 = me.ticksLevel[po1];
					le2 = me.ticksLevel[po2];
					tickHeight = me.getPixelForTick(po2) - me.getPixelForTick(po1);
					isOverlap = me.ticksIsDisplay[po1] && me.ticksIsDisplay[po2] && (tickHeight < labelHeight);
					if (isOverlap) {
						isDisplayOfLevel[Math.max(le1,le2)] = false;
					}
				}
				isDisplayOfLevel[0] = true;
				for (i = 1; i < me.ticksIsDisplay.length - 1; i++) {
					me.ticksIsDisplay[i] = me.ticksIsDisplay[i] && isDisplayOfLevel[me.ticksLevel[i]];
				}

				// ---------
				// for edge of scale
				labelHeight = Math.round(tickFont.size * 1.2);
				// near min
				tickHeight = me.getPixelForTick(tickSecond) - me.getPixelForTick(tickFirst);
				if (tickHeight < labelHeight) {
					me.ticksIsDisplay[tickSecond] = false;
				}
				// near max
				tickHeight = me.getPixelForTick(tickLast) - me.getPixelForTick(tickSecondLast);
				if (tickHeight < labelHeight) {
					me.ticksIsDisplay[tickSecondLast] = false;
				}

			}
		},
		afterCalculateTickRotation: function() {
			helpers.callCallback(this.options.afterCalculateTickRotation, [this]);
		},

		//

		beforeFit: function() {
			helpers.callCallback(this.options.beforeFit, [this]);
		},
		fit: function() {
			var me = this;
			// Reset
			var minSize = me.minSize = {
				width: 0,
				height: 0
			};

			var opts = me.getScaleOptionsAray();
			var optsTicks = me.getScaleOptionsAray('ticks');
			var optsScaleLabel = me.getScaleOptionsAray('scaleLabel');
			var optsGridLine = me.getScaleOptionsAray('gridLines');

			var display = opts[0].display;
			var isHorizontal = me.isHorizontal();

			var tickFont = parseFontOptions(optsTicks[0]);
			var scaleLabelFontSize = parseFontOptions(optsScaleLabel[0]).size * 1.5;
			var tickMarkLength = opts[0].gridLines.tickMarkLength;

			// Width
			if (isHorizontal) {
				// subtract the margins to line up with the chartArea if we are a full width scale
				minSize.width = me.isFullWidth() ? me.maxWidth - me.margins.left - me.margins.right : me.maxWidth;
			} else {
				minSize.width = display && optsGridLine[0].drawTicks ? tickMarkLength : 0;
			}

			// height
			if (isHorizontal) {
				minSize.height = display && optsGridLine[0].drawTicks ? tickMarkLength : 0;
			} else {
				minSize.height = me.maxHeight; // fill all the height
			}

			// Are we showing a title for the scale?
			if (optsScaleLabel[0].display && display) {
				if (isHorizontal) {
					minSize.height += scaleLabelFontSize;
				} else {
					minSize.width += scaleLabelFontSize;
				}
			}

			// Don't bother fitting the ticks if we are not showing them
			if (optsTicks[0].display && display) {
				var largestTextWidth = helpers.longestText(me.ctx, tickFont.font, me.ticksDisplay, me.longestTextCache);
				var tallestLabelHeightInLines = helpers.numberOfLabelLines(me.ticks);
				var lineSpace = tickFont.size * 0.5;

				if (isHorizontal) {
					// A horizontal axis is more constrained by the height.
					me.longestLabelWidth = largestTextWidth;

					var angleRadians = helpers.toRadians(me.labelRotation);
					var cosRotation = Math.cos(angleRadians);
					var sinRotation = Math.sin(angleRadians);

					// TODO - improve this calculation
					var labelHeight = (sinRotation * largestTextWidth)
						+ (tickFont.size * tallestLabelHeightInLines)
						+ (lineSpace * tallestLabelHeightInLines);

					minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight);
					me.ctx.font = tickFont.font;

					var firstTick = me.ticksDisplay[0];
					var firstLabelWidth = computeTextSize(me.ctx, firstTick, tickFont.font);

					var lastTick = me.ticksDisplay[me.ticksDisplay.length - 1];
					var lastLabelWidth = computeTextSize(me.ctx, lastTick, tickFont.font);

					// Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned which means that the right padding is dominated
					// by the font height

					// if (opts[0].position === 'bottom') {
					// 	me.paddingLeft = me.labelRotation !== 0? (cosRotation * firstLabelWidth) + 3: firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
					// 	me.paddingRight = me.labelRotation !== 0? (cosRotation * lineSpace) + 3: lastLabelWidth / 2 + 3;
					// } else {
					// 	me.paddingLeft = me.labelRotation !== 0? (cosRotation * lineSpace) + 3: firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
					// 	me.paddingRight = me.labelRotation !== 0? (cosRotation * lastLabelWidth) + 3: lastLabelWidth / 2 + 3;
					// }

					if (me.labelRotation !== 0) {
						me.paddingLeft = opts[0].position === 'bottom'? (cosRotation * firstLabelWidth) + 3: (cosRotation * lineSpace) + 3; // add 3 px to move away from canvas edges
						me.paddingRight = opts[0].position === 'bottom'? (cosRotation * lineSpace) + 3: (cosRotation * lastLabelWidth) + 3;
					} else {
						me.paddingLeft = firstLabelWidth / 2 + 3; // add 3 px to move away from canvas edges
						me.paddingRight = lastLabelWidth / 2 + 3;
					}

				} else {
					// A vertical axis is more constrained by the width. Labels are the dominant factor here, so get that length first
					// Account for padding

					if (optsTicks[0].mirror) {
						largestTextWidth = 0;
					} else {
						largestTextWidth += optsTicks[0].padding;
					}
					minSize.width += largestTextWidth;
					me.paddingTop = tickFont.size / 2;
					me.paddingBottom = tickFont.size / 2;
				}
			}

			me.handleMargins();

			me.width = minSize.width;
			me.height = minSize.height;
		},

		/**
		 * Handle margins and padding interactions
		 * @private
		 */
		handleMargins: function() {
			var me = this;
			if (me.margins) {
				me.paddingLeft = Math.max(me.paddingLeft - me.margins.left, 0);
				me.paddingTop = Math.max(me.paddingTop - me.margins.top, 0);
				me.paddingRight = Math.max(me.paddingRight - me.margins.right, 0);
				me.paddingBottom = Math.max(me.paddingBottom - me.margins.bottom, 0);
			}
		},

		afterFit: function() {
			helpers.callCallback(this.options.afterFit, [this]);
		},

		// Shared Methods
		isHorizontal: function() {
			return this.options.position === 'top' || this.options.position === 'bottom';
		},
		isFullWidth: function() {
			return (this.options.fullWidth);
		},

		// Get the correct value. NaN bad inputs, If the value type is object get the x or y based on whether we are horizontal or not
		getRightValue: function(rawValue) {
			// Null and undefined values first
			if (rawValue === null || typeof(rawValue) === 'undefined') {
				return NaN;
			}
			// isNaN(object) returns true, so make sure NaN is checking for a number; Discard Infinite values
			if (typeof(rawValue) === 'number' && !isFinite(rawValue)) {
				return NaN;
			}
			// If it is in fact an object, dive in one more level
			if (typeof(rawValue) === 'object') {
				if ((rawValue instanceof Date) || (rawValue.isValid)) {
					return rawValue;
				}
				return this.getRightValue(this.isHorizontal() ? rawValue.x : rawValue.y);
			}

			// Value is good, return it
			return rawValue;
		},

		// Used to get the value to display in the tooltip for the data at the given index
		// function getLabelForIndex(index, datasetIndex)
		getLabelForIndex: helpers.noop,

		// Used to get data value locations.  Value can either be an index or a numerical value
		getPixelForValue: helpers.noop,

		// Used to get the data value from a given pixel. This is the inverse of getPixelForValue
		getValueForPixel: helpers.noop,

		// Used for tick location, should
		getPixelForTick: function(index, includeOffset) {
			var me = this;
			if (me.isHorizontal()) {
				var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
				var tickWidth = innerWidth / Math.max((me.ticks.length - ((me.options.gridLines.offsetGridLines) ? 0 : 1)), 1);
				var pixel = (tickWidth * index) + me.paddingLeft;

				if (includeOffset) {
					pixel += tickWidth / 2;
				}

				var finalVal = me.left + Math.round(pixel);
				finalVal += me.isFullWidth() ? me.margins.left : 0;
				return finalVal;
			}
			var innerHeight = me.height - (me.paddingTop + me.paddingBottom);
			return me.top + (index * (innerHeight / (me.ticks.length - 1)));
		},

		// Utility for getting the pixel location of a percentage of scale
		getPixelForDecimal: function(decimal /* , includeOffset*/) {
			var me = this;
			if (me.isHorizontal()) {
				var innerWidth = me.width - (me.paddingLeft + me.paddingRight);
				var valueOffset = (innerWidth * decimal) + me.paddingLeft;

				var finalVal = me.left + Math.round(valueOffset);
				finalVal += me.isFullWidth() ? me.margins.left : 0;
				return finalVal;
			}
			return me.top + (decimal * me.height);
		},

		getBasePixel: function() {
			return this.getPixelForValue(this.getBaseValue());
		},

		getBaseValue: function() {
			var me = this;
			var min = me.min;
			var max = me.max;

			return me.beginAtZero ? 0:
				min < 0 && max < 0? max :
				min > 0 && max > 0? min :
				0;
		},

		// Actually draw the scale on the canvas
		// @param {rectangle} chartArea: the area of the chart to draw full grid lines on
		draw: function(chartArea) {

			var me = this;
			// draw
			me.drawCanvas(me.getItemsToDraw(chartArea));

		},

		// get draw data
		getItemsToDraw: function(chartArea) {

			var me = this;
			// options
			var opts = me.getScaleOptionsAray();
			if (!opts[0].display) {
				return;
			}
			var globalDefaults = Chart.defaults.global;
			var optsTicks = me.getScaleOptionsAray('ticks');
			var optsGridLines = me.getScaleOptionsAray('gridLines');

			// tick length
			var tl = optsGridLines[0].drawTicks? [
				optsGridLines[0].tickMarkLength,
				optsGridLines[1].drawTicks? optsGridLines[1].tickMarkLength || optsGridLines[0].tickMarkLength * 0.6: 0, // sub tick length
				optsGridLines[2].drawTicks? optsGridLines[2].tickMarkLength || optsGridLines[0].tickMarkLength * 0.4: 0  // sub-sub tick length
			]: [0, 0, 0];


			var isHorizontal = me.isHorizontal();
			var isRotated = me.labelRotation !== 0;

			// -----
			var labelRotationRadians = helpers.toRadians(me.labelRotation);

			var itemsToDraw = [];

			if (isHorizontal) {
				// horizontal

				// figure out the maximum number of gridlines to show
				var maxTicks;
				if (optsTicks[0].maxTicksLimit) {
					maxTicks = optsTicks[0].maxTicksLimit;
				}

				// Calculating autoskip
				var skipRatio = false;
				if (optsTicks[0].autoSkip) {
					var cosRotation = Math.cos(labelRotationRadians);
					var longestRotatedLabelWidth = isRotated? me.longestLabelWidth * cosRotation / 2: me.longestLabelWidth * cosRotation;
					var ticksWidth = (longestRotatedLabelWidth + optsTicks[0].autoSkipPadding) * me.ticksDisplay.length;
					var scaleWidth = (me.width - (me.paddingLeft + me.paddingRight));
					if (ticksWidth > scaleWidth) {
						skipRatio = 1 + Math.floor(ticksWidth / scaleWidth);
					}
					// if they defined a max number of optionTicks,
					// increase skipRatio until that number is met
					if (maxTicks && me.ticksDisplay.length > maxTicks) {
						while (!skipRatio || me.ticks.length / (skipRatio || 1) > maxTicks) {
							if (!skipRatio) {
								skipRatio = 1;
							}
							skipRatio += 1;
						}
					}
				}

			}
			// -----

			// ticks
			var tickFont = [
				parseFontOptions(optsTicks[0]),
				parseFontOptions(optsTicks[1]),
				parseFontOptions(optsTicks[2])
			];

			helpers.each(me.ticks, function(label, index) {
				// If the callback returned a null or undefined value, do not draw this line
				if (label === undefined || label === null) {
					return;
				}

				var level = me.ticksLevel[index];

				var isFirstTick = index === 0;
				var isLastTick = index === me.ticks.length - 1;
				// display option
				if (!opts[0].display || (!isFirstTick && !isLastTick && !opts[level].display)) {
					return;
				}

				// Process of autoSkip
				var shouldSkip = (skipRatio > 1 && index % skipRatio > 0) || (index % skipRatio === 0 && index + skipRatio >= me.ticksDisplay.length);
				if (shouldSkip && !isLastTick) {
					return;
				}

				// for glidline border
				// If the option of subScale (level 1, 2) is not defined, it follows scale (level 0)
				var borderDash = helpers.getValueOrDefault(optsGridLines[level].borderDash, optsGridLines[0].borderDash);
				var borderDashOffset = helpers.getValueOrDefault(optsGridLines[level].borderDashOffset, optsGridLines[0].borderDashOffset);
				var display = optsGridLines[0].display? helpers.getValueOrDefault(optsGridLines[level].display, optsGridLines[0].display): false;
				var drawTicks = optsGridLines[0].drawTicks? helpers.getValueOrDefault(optsGridLines[level].drawTicks, optsGridLines[0].drawTicks): false;
				var drawOnChartArea = optsGridLines[0].drawOnChartArea? helpers.getValueOrDefault(optsGridLines[level].drawOnChartArea, optsGridLines[0].drawOnChartArea): false;

				// zero line option
				var lineWidth, lineColor;
				if (index === (typeof me.zeroLineIndex !== 'undefined'? me.zeroLineIndex: 0)) {
					// Draw the first index specially
					lineWidth = optsGridLines[0].zeroLineWidth;
					lineColor = optsGridLines[0].zeroLineColor;
				} else {
					// for array setting
					var lw1 = helpers.getValueAtIndexOrDefault(optsGridLines[0].lineWidth, index);
					var lw2 = helpers.getValueAtIndexOrDefault(optsGridLines[level].lineWidth, index, optsGridLines[0].lineWidth);
					lineWidth = helpers.isArray(optsGridLines[0].lineWidth)? lw1: lw2;

					var lc1 = helpers.getValueAtIndexOrDefault(optsGridLines[0].color, index);
					var lc2 = helpers.getValueAtIndexOrDefault(optsGridLines[level].color, index, optsGridLines[0].color);
					lineColor = helpers.isArray(optsGridLines[0].color)? lc1: lc2;
				}

				// label
				var lFontColor = helpers.getValueOrDefault(optsTicks[level].fontColor, globalDefaults.defaultFontColor);

				// Common properties
				var tx1, ty1, tx2, ty2, x1, y1, x2, y2, labelX, labelY;
				var textAlign = 'middle';
				var textBaseline = 'middle';

				if (isHorizontal) {
					// horizontal

					// label
					if (opts[0].position === 'bottom') {
						// bottom
						textBaseline = !isRotated? 'top':'middle';
						textAlign = !isRotated? 'center': 'right';
						labelY = isRotated? me.top + tl[0]: me.top + tl[level];
					} else {
						// top
						textBaseline = !isRotated? 'bottom':'middle';
						textAlign = !isRotated? 'center': 'left';
						labelY = isRotated? me.bottom - tl[0]: me.bottom - tl[level];
					}
					// x values for optionTicks (need to consider offsetLabel option)
					labelX = me.getPixelForTick(index, optsGridLines[0].offsetGridLines) + optsTicks[0].labelOffset;

					// ticks
					var xLineValue = me.getPixelForTick(index) + helpers.aliasPixel(lineWidth);
					var yTickStart = opts[0].position === 'bottom'? me.top: me.bottom - tl[level];
					var yTickEnd = opts[0].position === 'bottom'? me.top + tl[level]: me.bottom;

					tx1 = tx2 = x1 = x2 = xLineValue;
					ty1 = yTickStart;
					ty2 = yTickEnd;
					// glid line
					y1 = chartArea.top;
					y2 = chartArea.bottom;

				} else {
					// vertical
					var isLeft = opts[0].position === 'left';
					var tickPadding = optsTicks[0].padding;
					var labelXOffset;

					// label
					if (optsTicks[0].mirror) {
						textAlign = isLeft? 'left': 'right';
						labelXOffset = tickPadding;
					} else {
						textAlign = isLeft? 'right': 'left';
						labelXOffset = tl[level] + tickPadding;
					}
					labelX = isLeft? me.right - labelXOffset: me.left + labelXOffset;
					var yLineValue = me.getPixelForTick(index) + helpers.aliasPixel(lineWidth);
					labelY = me.getPixelForTick(index, optsGridLines[0].offsetGridLines);
					var xTickStart = opts[0].position === 'right'? me.left: me.right - tl[level];
					var xTickEnd = opts[0].position === 'right'? me.left + tl[level]: me.right;

					tx1 = xTickStart;
					tx2 = xTickEnd;
					// glid line
					x1 = chartArea.left;
					x2 = chartArea.right;
					ty1 = ty2 = y1 = y2 = yLineValue;
				}

				// data push
				itemsToDraw.push({
					// visible for grid line and ticks line
					display: display,
					level: level,
					// ticks line
					tlDraw: drawTicks,
					tlX1: tx1,
					tlY1: ty1,
					tlX2: tx2,
					tlY2: ty2,
					tlColor: optsGridLines[0].color,
					tFont: tickFont[level],
					// grid line on chart area
					glDraw: drawOnChartArea,
					glX1: x1,
					glY1: y1,
					glX2: x2,
					glY2: y2,
					glWidth: lineWidth,
					glColor: lineColor,
					glBorderDash: borderDash,
					glBorderDashOffset: borderDashOffset,
					// label
					lDisplay: me.ticksIsDisplay[index],
					lX: labelX,
					lY: labelY,
					label: label,
					lRotation: -1 * labelRotationRadians,
					lTextBaseline: textBaseline,
					lTextAlign: textAlign,
					lFontColor: lFontColor,
				});
			});
			return itemsToDraw;
		},

		drawCanvas: function(itemsToDraw) {

			var me = this;
			// canvas
			var context = me.ctx;
			// options
			var opts = me.getScaleOptionsAray();
			var globalDefaults = Chart.defaults.global;
			var isHorizontal = me.isHorizontal();
			var optsGridLines = me.getScaleOptionsAray('gridLines');

			// for scale label
			var optsScaleLabel = me.getScaleOptionsAray('scaleLabel');
			var scaleLabelFontColor = helpers.getValueOrDefault(optsScaleLabel[0].fontColor, globalDefaults.defaultFontColor);
			var scaleLabelFont = parseFontOptions(optsScaleLabel[0]);

			// Draw all of the tick labels, tick marks, and grid lines at the correct places
			helpers.each(itemsToDraw, function(itemToDraw) {

				// line
				if (itemToDraw.display) {

					context.save();
					context.lineWidth = itemToDraw.glWidth;

					context.strokeStyle = itemToDraw.tlColor;

					context.beginPath();

					// ticks line (scale area)
					if (itemToDraw.tlDraw) {
						context.moveTo(itemToDraw.tlX1, itemToDraw.tlY1);
						context.lineTo(itemToDraw.tlX2, itemToDraw.tlY2);
					}
					context.stroke();

					context.strokeStyle = itemToDraw.glColor;

					// dashed line
					if (context.setLineDash) {
						context.setLineDash(itemToDraw.glBorderDash);
						context.lineDashOffset = itemToDraw.glBorderDashOffset;
					}

					// grid line (chart area)
					if (itemToDraw.glDraw) {
						context.moveTo(itemToDraw.glX1, itemToDraw.glY1);
						context.lineTo(itemToDraw.glX2, itemToDraw.glY2);
					}
					context.stroke();
					context.restore();
				}

				// display ticks text
				if (itemToDraw.lDisplay) {
					context.save();
					context.translate(itemToDraw.lX, itemToDraw.lY);
					context.rotate(itemToDraw.lRotation);
					context.font = itemToDraw.tFont.font;
					context.fillStyle = itemToDraw.lFontColor;
					context.textBaseline = itemToDraw.lTextBaseline;
					context.textAlign = itemToDraw.lTextAlign;

					var label = itemToDraw.label;
					if (helpers.isArray(label)) {
						for (var i = 0, y = 0; i < label.length; ++i) {
							// We just make sure the multiline element is a string here..
							context.fillText('' + label[i], 0, y);
							// apply same linestepSize as calculated @ L#320
							y += (itemToDraw.tFont.size * 1.5);
						}
					} else {
						context.fillText(label, 0, 0);
					}
					context.restore();
				}
			});

			// -----------

			// display scale label
			if (optsScaleLabel[0].display) {
				// Draw the scale label
				var scaleLabelX;
				var scaleLabelY;
				var rotation = 0;

				if (isHorizontal) {
					// horizontal
					scaleLabelX = me.left + ((me.right - me.left) / 2); // midpoint of the width
					scaleLabelY = opts[0].position === 'bottom'? me.bottom - (scaleLabelFont.size / 2): me.top + (scaleLabelFont.size / 2);
				} else {
					// vertical
					var isLeft = opts[0].position === 'left';
					scaleLabelX = isLeft? me.left + (scaleLabelFont.size / 2): me.right - (scaleLabelFont.size / 2);
					scaleLabelY = me.top + ((me.bottom - me.top) / 2);
					rotation = -0.5 * Math.PI;
				}

				context.save();
				context.translate(scaleLabelX, scaleLabelY);
				context.rotate(rotation);
				context.textAlign = 'center';
				context.textBaseline = 'middle';
				context.fillStyle = scaleLabelFontColor; // render in correct colour
				context.font = scaleLabelFont.font;
				context.fillText(optsScaleLabel[0].labelString, 0, 0);
				context.restore();
			}

			// draw border
			if (optsGridLines[0].drawBorder) {
				// Draw the line at the edge of the axis
				context.lineWidth = helpers.getValueAtIndexOrDefault(optsGridLines[0].lineWidth, 0);
				context.strokeStyle = helpers.getValueAtIndexOrDefault(optsGridLines[0].color, 0);
				var x1 = me.left,
					x2 = me.right,
					y1 = me.top,
					y2 = me.bottom;

				var aliasPixel = helpers.aliasPixel(context.lineWidth);
				if (isHorizontal) {
					y1 = y2 = opts[0].position === 'top'? me.bottom: me.top;
					y1 += aliasPixel;
					y2 += aliasPixel;
				} else {
					x1 = x2 = opts[0].position === 'left'? me.right: me.left;
					x1 += aliasPixel;
					x2 += aliasPixel;
				}

				context.beginPath();
				context.moveTo(x1, y1);
				context.lineTo(x2, y2);
				context.stroke();
			}
		}
	});
};
