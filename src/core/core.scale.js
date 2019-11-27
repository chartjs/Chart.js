'use strict';

const defaults = require('./core.defaults');
const Element = require('./core.element');
const helpers = require('../helpers/index');
const Ticks = require('./core.ticks');

const alignPixel = helpers.canvas._alignPixel;
const isArray = helpers.isArray;
const isFinite = helpers.isFinite;
const isNullOrUndef = helpers.isNullOrUndef;
const valueOrDefault = helpers.valueOrDefault;
const resolve = helpers.options.resolve;

defaults._set('scale', {
	display: true,
	position: 'left',
	offset: false,
	reverse: false,
	beginAtZero: false,

	// grid line settings
	gridLines: {
		display: true,
		color: 'rgba(0,0,0,0.1)',
		lineWidth: 1,
		drawBorder: true,
		drawOnChartArea: true,
		drawTicks: true,
		tickMarkLength: 10,
		offsetGridLines: false,
		borderDash: [],
		borderDashOffset: 0.0
	},

	// scale label
	scaleLabel: {
		// display property
		display: false,

		// actual label
		labelString: '',

		// top/bottom padding
		padding: {
			top: 4,
			bottom: 4
		}
	},

	// label settings
	ticks: {
		minRotation: 0,
		maxRotation: 50,
		mirror: false,
		padding: 0,
		display: true,
		autoSkip: true,
		autoSkipPadding: 0,
		labelOffset: 0,
		// We pass through arrays to be rendered as multiline labels, we convert Others to strings here.
		callback: Ticks.formatters.values,
		minor: {},
		major: {}
	}
});

/** Returns a new array containing numItems from arr */
function sample(arr, numItems) {
	var result = [];
	var increment = arr.length / numItems;
	var i = 0;
	var len = arr.length;

	for (; i < len; i += increment) {
		result.push(arr[Math.floor(i)]);
	}
	return result;
}

function getPixelForGridLine(scale, index, offsetGridLines) {
	var length = scale.ticks.length;
	var validIndex = Math.min(index, length - 1);
	var lineValue = scale.getPixelForTick(validIndex);
	var start = scale._startPixel;
	var end = scale._endPixel;
	var epsilon = 1e-6; // 1e-6 is margin in pixels for accumulated error.
	var offset;

	if (offsetGridLines) {
		if (length === 1) {
			offset = Math.max(lineValue - start, end - lineValue);
		} else if (index === 0) {
			offset = (scale.getPixelForTick(1) - lineValue) / 2;
		} else {
			offset = (lineValue - scale.getPixelForTick(validIndex - 1)) / 2;
		}
		lineValue += validIndex < index ? offset : -offset;

		// Return undefined if the pixel is out of the range
		if (lineValue < start - epsilon || lineValue > end + epsilon) {
			return;
		}
	}
	return lineValue;
}

function garbageCollect(caches, length) {
	helpers.each(caches, function(cache) {
		var gc = cache.gc;
		var gcLen = gc.length / 2;
		var i;
		if (gcLen > length) {
			for (i = 0; i < gcLen; ++i) {
				delete cache.data[gc[i]];
			}
			gc.splice(0, gcLen);
		}
	});
}

/**
 * Returns {width, height, offset} objects for the first, last, widest, highest tick
 * labels where offset indicates the anchor point offset from the top in pixels.
 */
function computeLabelSizes(ctx, tickFonts, ticks, caches) {
	var length = ticks.length;
	var widths = [];
	var heights = [];
	var offsets = [];
	var i, j, jlen, label, tickFont, fontString, cache, lineHeight, width, height, nestedLabel, widest, highest;

	for (i = 0; i < length; ++i) {
		label = ticks[i].label;
		tickFont = ticks[i].major ? tickFonts.major : tickFonts.minor;
		ctx.font = fontString = tickFont.string;
		cache = caches[fontString] = caches[fontString] || {data: {}, gc: []};
		lineHeight = tickFont.lineHeight;
		width = height = 0;
		// Undefined labels and arrays should not be measured
		if (!isNullOrUndef(label) && !isArray(label)) {
			width = helpers.measureText(ctx, cache.data, cache.gc, width, label);
			height = lineHeight;
		} else if (isArray(label)) {
			// if it is an array let's measure each element
			for (j = 0, jlen = label.length; j < jlen; ++j) {
				nestedLabel = label[j];
				// Undefined labels and arrays should not be measured
				if (!isNullOrUndef(nestedLabel) && !isArray(nestedLabel)) {
					width = helpers.measureText(ctx, cache.data, cache.gc, width, nestedLabel);
					height += lineHeight;
				}
			}
		}
		widths.push(width);
		heights.push(height);
		offsets.push(lineHeight / 2);
	}
	garbageCollect(caches, length);

	widest = widths.indexOf(Math.max.apply(null, widths));
	highest = heights.indexOf(Math.max.apply(null, heights));

	function valueAt(idx) {
		return {
			width: widths[idx] || 0,
			height: heights[idx] || 0,
			offset: offsets[idx] || 0
		};
	}

	return {
		first: valueAt(0),
		last: valueAt(length - 1),
		widest: valueAt(widest),
		highest: valueAt(highest)
	};
}

function getTickMarkLength(options) {
	return options.drawTicks ? options.tickMarkLength : 0;
}

function getScaleLabelHeight(options) {
	var font, padding;

	if (!options.display) {
		return 0;
	}

	font = helpers.options._parseFont(options);
	padding = helpers.options.toPadding(options.padding);

	return font.lineHeight + padding.height;
}

function parseFontOptions(options, nestedOpts) {
	return helpers.extend(helpers.options._parseFont({
		fontFamily: valueOrDefault(nestedOpts.fontFamily, options.fontFamily),
		fontSize: valueOrDefault(nestedOpts.fontSize, options.fontSize),
		fontStyle: valueOrDefault(nestedOpts.fontStyle, options.fontStyle),
		lineHeight: valueOrDefault(nestedOpts.lineHeight, options.lineHeight)
	}), {
		color: resolve([nestedOpts.fontColor, options.fontColor, defaults.global.defaultFontColor])
	});
}

function parseTickFontOptions(options) {
	var minor = parseFontOptions(options, options.minor);
	var major = options.major.enabled ? parseFontOptions(options, options.major) : minor;

	return {minor: minor, major: major};
}

function getEvenSpacing(arr) {
	var len = arr.length;
	var i, diff;

	if (len < 2) {
		return false;
	}

	for (diff = arr[0], i = 1; i < len; ++i) {
		if (arr[i] - arr[i - 1] !== diff) {
			return false;
		}
	}
	return diff;
}

function calculateSpacing(majorIndices, ticks, axisLength, ticksLimit) {
	var evenMajorSpacing = getEvenSpacing(majorIndices);
	var spacing = ticks.length / ticksLimit;
	var factors, factor, i, ilen;

	// If the major ticks are evenly spaced apart, place the minor ticks
	// so that they divide the major ticks into even chunks
	if (!evenMajorSpacing) {
		return Math.max(spacing, 1);
	}

	factors = helpers.math._factorize(evenMajorSpacing);
	for (i = 0, ilen = factors.length - 1; i < ilen; i++) {
		factor = factors[i];
		if (factor > spacing) {
			return factor;
		}
	}
	return Math.max(spacing, 1);
}

function getMajorIndices(ticks) {
	var result = [];
	var i, ilen;
	for (i = 0, ilen = ticks.length; i < ilen; i++) {
		if (ticks[i].major) {
			result.push(i);
		}
	}
	return result;
}

function skipMajors(ticks, newTicks, majorIndices, spacing) {
	let count = 0;
	let next = majorIndices[0];
	let i;

	spacing = Math.ceil(spacing);
	for (i = 0; i < ticks.length; i++) {
		if (i === next) {
			newTicks.push(ticks[i]);
			count++;
			next = majorIndices[count * spacing];
		}
	}
}

function skip(ticks, newTicks, spacing, majorStart, majorEnd) {
	const start = valueOrDefault(majorStart, 0);
	const end = Math.min(valueOrDefault(majorEnd, ticks.length), ticks.length);
	let count = 0;
	let length, i, next;

	spacing = Math.ceil(spacing);
	if (majorEnd) {
		length = majorEnd - majorStart;
		spacing = length / Math.floor(length / spacing);
	}

	next = start;

	while (next < 0) {
		count++;
		next = Math.round(start + count * spacing);
	}

	for (i = Math.max(start, 0); i < end; i++) {
		if (i === next) {
			newTicks.push(ticks[i]);
			count++;
			next = Math.round(start + count * spacing);
		}
	}
}

class Scale extends Element {

	/**
	 * Parse a supported input value to internal representation.
	 * @param {*} raw
	 * @param {number} index
	 * @private
	 * @since 3.0
	 */
	_parse(raw, index) { // eslint-disable-line no-unused-vars
		return raw;
	}

	/**
	 * Parse an object for axis to internal representation.
	 * @param {object} obj
	 * @param {string} axis
	 * @param {number} index
	 * @private
	 * @since 3.0
	 */
	_parseObject(obj, axis, index) {
		if (obj[axis] !== undefined) {
			return this._parse(obj[axis], index);
		}
		return null;
	}

	/**
	 * @private
	 * @since 3.0
	 */
	_getUserBounds() {
		var min = this._userMin;
		var max = this._userMax;
		if (isNullOrUndef(min) || isNaN(min)) {
			min = Number.POSITIVE_INFINITY;
		}
		if (isNullOrUndef(max) || isNaN(max)) {
			max = Number.NEGATIVE_INFINITY;
		}
		return {min, max, minDefined: isFinite(min), maxDefined: isFinite(max)};
	}

	/**
	 * @private
	 * @since 3.0
	 */
	_getMinMax(canStack) {
		var me = this;
		var {min, max, minDefined, maxDefined} = me._getUserBounds();
		var minPositive = Number.POSITIVE_INFINITY;
		var i, ilen, metas, minmax;

		if (minDefined && maxDefined) {
			return {min, max};
		}

		metas = me._getMatchingVisibleMetas();
		for (i = 0, ilen = metas.length; i < ilen; ++i) {
			minmax = metas[i].controller._getMinMax(me, canStack);
			if (!minDefined) {
				min = Math.min(min, minmax.min);
			}
			if (!maxDefined) {
				max = Math.max(max, minmax.max);
			}
			minPositive = Math.min(minPositive, minmax.minPositive);
		}

		return {min, max, minPositive};
	}

	_invalidateCaches() {}

	/**
	 * Get the padding needed for the scale
	 * @method getPadding
	 * @private
	 * @returns {Padding} the necessary padding
	 */
	getPadding() {
		var me = this;
		return {
			left: me.paddingLeft || 0,
			top: me.paddingTop || 0,
			right: me.paddingRight || 0,
			bottom: me.paddingBottom || 0
		};
	}

	/**
	 * Returns the scale tick objects ({label, major})
	 * @since 2.7
	 */
	getTicks() {
		return this.ticks;
	}

	/**
	* @private
	*/
	_getLabels() {
		var data = this.chart.data;
		return this.options.labels || (this.isHorizontal() ? data.xLabels : data.yLabels) || data.labels || [];
	}

	// These methods are ordered by lifecyle. Utilities then follow.
	// Any function defined here is inherited by all scale types.
	// Any function can be extended by the scale type

	beforeUpdate() {
		helpers.callback(this.options.beforeUpdate, [this]);
	}

	/**
	 * @param {number} maxWidth - the max width in pixels
	 * @param {number} maxHeight - the max height in pixels
	 * @param {object} margins - the space between the edge of the other scales and edge of the chart
	 *   This space comes from two sources:
	 *     - padding - space that's required to show the labels at the edges of the scale
	 *     - thickness of scales or legends in another orientation
	 */
	update(maxWidth, maxHeight, margins) {
		var me = this;
		var tickOpts = me.options.ticks;
		var sampleSize = tickOpts.sampleSize;
		var samplingEnabled;

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

		me.ticks = null;
		me._labelSizes = null;
		me._maxLabelLines = 0;
		me.longestLabelWidth = 0;
		me.longestTextCache = me.longestTextCache || {};
		me._gridLineItems = null;
		me._labelItems = null;

		// Dimensions
		me.beforeSetDimensions();
		me.setDimensions();
		me.afterSetDimensions();

		// Data min/max
		me.beforeDataLimits();
		me.determineDataLimits();
		me.afterDataLimits();

		me.beforeBuildTicks();

		me.ticks = me.buildTicks() || [];

		// Allow modification of ticks in callback.
		me.afterBuildTicks();

		// Compute tick rotation and fit using a sampled subset of labels
		// We generally don't need to compute the size of every single label for determining scale size
		samplingEnabled = sampleSize < me.ticks.length;
		me._convertTicksToLabels(samplingEnabled ? sample(me.ticks, sampleSize) : me.ticks);

		// _configure is called twice, once here, once from core.controller.updateLayout.
		// Here we haven't been positioned yet, but dimensions are correct.
		// Variables set in _configure are needed for calculateTickRotation, and
		// it's ok that coordinates are not correct there, only dimensions matter.
		me._configure();

		// Tick Rotation
		me.beforeCalculateTickRotation();
		me.calculateTickRotation();
		me.afterCalculateTickRotation();

		me.beforeFit();
		me.fit();
		me.afterFit();

		// Auto-skip
		me.ticks = tickOpts.display && (tickOpts.autoSkip || tickOpts.source === 'auto') ? me._autoSkip(me.ticks) : me.ticks;

		if (samplingEnabled) {
			// Generate labels using all non-skipped ticks
			me._convertTicksToLabels(me.ticks);
		}

		// IMPORTANT: after this point, we consider that `this.ticks` will NEVER change!

		me.afterUpdate();

		// TODO(v3): remove minSize as a public property and return value from all layout boxes. It is unused
		// make maxWidth and maxHeight private
		return me.minSize;
	}

	/**
	 * @private
	 */
	_configure() {
		var me = this;
		var reversePixels = me.options.reverse;
		var startPixel, endPixel;

		if (me.isHorizontal()) {
			startPixel = me.left;
			endPixel = me.right;
		} else {
			startPixel = me.top;
			endPixel = me.bottom;
			// by default vertical scales are from bottom to top, so pixels are reversed
			reversePixels = !reversePixels;
		}
		me._startPixel = startPixel;
		me._endPixel = endPixel;
		me._reversePixels = reversePixels;
		me._length = endPixel - startPixel;
	}

	afterUpdate() {
		helpers.callback(this.options.afterUpdate, [this]);
	}

	//

	beforeSetDimensions() {
		helpers.callback(this.options.beforeSetDimensions, [this]);
	}
	setDimensions() {
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
	}
	afterSetDimensions() {
		helpers.callback(this.options.afterSetDimensions, [this]);
	}

	// Data limits
	beforeDataLimits() {
		helpers.callback(this.options.beforeDataLimits, [this]);
	}
	determineDataLimits() {}
	afterDataLimits() {
		helpers.callback(this.options.afterDataLimits, [this]);
	}

	//
	beforeBuildTicks() {
		helpers.callback(this.options.beforeBuildTicks, [this]);
	}
	buildTicks() {}
	afterBuildTicks() {
		helpers.callback(this.options.afterBuildTicks, [this]);
	}

	beforeTickToLabelConversion() {
		helpers.callback(this.options.beforeTickToLabelConversion, [this]);
	}
	/**
	 * Convert ticks to label strings
	 */
	generateTickLabels(ticks) {
		var me = this;
		var tickOpts = me.options.ticks;
		var i, ilen, tick;
		for (i = 0, ilen = ticks.length; i < ilen; i++) {
			tick = ticks[i];
			tick.label = helpers.callback(tickOpts.callback, [tick.value, i, ticks], me);
		}
	}
	afterTickToLabelConversion() {
		helpers.callback(this.options.afterTickToLabelConversion, [this]);
	}

	//

	beforeCalculateTickRotation() {
		helpers.callback(this.options.beforeCalculateTickRotation, [this]);
	}
	calculateTickRotation() {
		var me = this;
		var options = me.options;
		var tickOpts = options.ticks;
		var numTicks = me.ticks.length;
		var minRotation = tickOpts.minRotation || 0;
		var maxRotation = tickOpts.maxRotation;
		var labelRotation = minRotation;
		var labelSizes, maxLabelWidth, maxLabelHeight, maxWidth, tickWidth, maxHeight, maxLabelDiagonal;

		if (!me._isVisible() || !tickOpts.display || minRotation >= maxRotation || numTicks <= 1 || !me.isHorizontal()) {
			me.labelRotation = minRotation;
			return;
		}

		labelSizes = me._getLabelSizes();
		maxLabelWidth = labelSizes.widest.width;
		maxLabelHeight = labelSizes.highest.height - labelSizes.highest.offset;

		// Estimate the width of each grid based on the canvas width, the maximum
		// label width and the number of tick intervals
		maxWidth = Math.min(me.maxWidth, me.chart.width - maxLabelWidth);
		tickWidth = options.offset ? me.maxWidth / numTicks : maxWidth / (numTicks - 1);

		// Allow 3 pixels x2 padding either side for label readability
		if (maxLabelWidth + 6 > tickWidth) {
			tickWidth = maxWidth / (numTicks - (options.offset ? 0.5 : 1));
			maxHeight = me.maxHeight - getTickMarkLength(options.gridLines)
				- tickOpts.padding - getScaleLabelHeight(options.scaleLabel);
			maxLabelDiagonal = Math.sqrt(maxLabelWidth * maxLabelWidth + maxLabelHeight * maxLabelHeight);
			labelRotation = helpers.toDegrees(Math.min(
				Math.asin(Math.min((labelSizes.highest.height + 6) / tickWidth, 1)),
				Math.asin(Math.min(maxHeight / maxLabelDiagonal, 1)) - Math.asin(maxLabelHeight / maxLabelDiagonal)
			));
			labelRotation = Math.max(minRotation, Math.min(maxRotation, labelRotation));
		}

		me.labelRotation = labelRotation;
	}
	afterCalculateTickRotation() {
		helpers.callback(this.options.afterCalculateTickRotation, [this]);
	}

	//

	beforeFit() {
		helpers.callback(this.options.beforeFit, [this]);
	}
	fit() {
		var me = this;
		// Reset
		var minSize = me.minSize = {
			width: 0,
			height: 0
		};

		var chart = me.chart;
		var opts = me.options;
		var tickOpts = opts.ticks;
		var scaleLabelOpts = opts.scaleLabel;
		var gridLineOpts = opts.gridLines;
		var display = me._isVisible();
		var isBottom = opts.position === 'bottom';
		var isHorizontal = me.isHorizontal();

		// Width
		if (isHorizontal) {
			minSize.width = me.maxWidth;
		} else if (display) {
			minSize.width = getTickMarkLength(gridLineOpts) + getScaleLabelHeight(scaleLabelOpts);
		}

		// height
		if (!isHorizontal) {
			minSize.height = me.maxHeight; // fill all the height
		} else if (display) {
			minSize.height = getTickMarkLength(gridLineOpts) + getScaleLabelHeight(scaleLabelOpts);
		}

		// Don't bother fitting the ticks if we are not showing the labels
		if (tickOpts.display && display) {
			var tickFonts = parseTickFontOptions(tickOpts);
			var labelSizes = me._getLabelSizes();
			var firstLabelSize = labelSizes.first;
			var lastLabelSize = labelSizes.last;
			var widestLabelSize = labelSizes.widest;
			var highestLabelSize = labelSizes.highest;
			var lineSpace = tickFonts.minor.lineHeight * 0.4;
			var tickPadding = tickOpts.padding;

			if (isHorizontal) {
				// A horizontal axis is more constrained by the height.
				var isRotated = me.labelRotation !== 0;
				var angleRadians = helpers.toRadians(me.labelRotation);
				var cosRotation = Math.cos(angleRadians);
				var sinRotation = Math.sin(angleRadians);

				var labelHeight = sinRotation * widestLabelSize.width
					+ cosRotation * (highestLabelSize.height - (isRotated ? highestLabelSize.offset : 0))
					+ (isRotated ? 0 : lineSpace); // padding

				minSize.height = Math.min(me.maxHeight, minSize.height + labelHeight + tickPadding);

				var offsetLeft = me.getPixelForTick(0) - me.left;
				var offsetRight = me.right - me.getPixelForTick(me.ticks.length - 1);
				var paddingLeft, paddingRight;

				// Ensure that our ticks are always inside the canvas. When rotated, ticks are right aligned
				// which means that the right padding is dominated by the font height
				if (isRotated) {
					paddingLeft = isBottom ?
						cosRotation * firstLabelSize.width + sinRotation * firstLabelSize.offset :
						sinRotation * (firstLabelSize.height - firstLabelSize.offset);
					paddingRight = isBottom ?
						sinRotation * (lastLabelSize.height - lastLabelSize.offset) :
						cosRotation * lastLabelSize.width + sinRotation * lastLabelSize.offset;
				} else {
					paddingLeft = firstLabelSize.width / 2;
					paddingRight = lastLabelSize.width / 2;
				}

				// Adjust padding taking into account changes in offsets
				// and add 3 px to move away from canvas edges
				me.paddingLeft = Math.max((paddingLeft - offsetLeft) * me.width / (me.width - offsetLeft), 0) + 3;
				me.paddingRight = Math.max((paddingRight - offsetRight) * me.width / (me.width - offsetRight), 0) + 3;
			} else {
				// A vertical axis is more constrained by the width. Labels are the
				// dominant factor here, so get that length first and account for padding
				var labelWidth = tickOpts.mirror ? 0 :
					// use lineSpace for consistency with horizontal axis
					// tickPadding is not implemented for horizontal
					widestLabelSize.width + tickPadding + lineSpace;

				minSize.width = Math.min(me.maxWidth, minSize.width + labelWidth);

				me.paddingTop = firstLabelSize.height / 2;
				me.paddingBottom = lastLabelSize.height / 2;
			}
		}

		me.handleMargins();

		if (isHorizontal) {
			me.width = me._length = chart.width - me.margins.left - me.margins.right;
			me.height = minSize.height;
		} else {
			me.width = minSize.width;
			me.height = me._length = chart.height - me.margins.top - me.margins.bottom;
		}
	}

	/**
	 * Handle margins and padding interactions
	 * @private
	 */
	handleMargins() {
		var me = this;
		if (me.margins) {
			me.margins.left = Math.max(me.paddingLeft, me.margins.left);
			me.margins.top = Math.max(me.paddingTop, me.margins.top);
			me.margins.right = Math.max(me.paddingRight, me.margins.right);
			me.margins.bottom = Math.max(me.paddingBottom, me.margins.bottom);
		}
	}

	afterFit() {
		helpers.callback(this.options.afterFit, [this]);
	}

	// Shared Methods
	isHorizontal() {
		var pos = this.options.position;
		return pos === 'top' || pos === 'bottom';
	}
	isFullWidth() {
		return this.options.fullWidth;
	}

	_convertTicksToLabels(ticks) {
		var me = this;

		me.beforeTickToLabelConversion();

		me.generateTickLabels(ticks);

		me.afterTickToLabelConversion();
	}

	/**
	 * @private
	 */
	_getLabelSizes() {
		var me = this;
		var labelSizes = me._labelSizes;

		if (!labelSizes) {
			me._labelSizes = labelSizes = computeLabelSizes(me.ctx, parseTickFontOptions(me.options.ticks), me.ticks, me.longestTextCache);
			me.longestLabelWidth = labelSizes.widest.width;
		}

		return labelSizes;
	}

	/**
	 * Used to get the label to display in the tooltip for the given value
	 * @param value
	 */
	getLabelForValue(value) {
		return value;
	}

	/**
	 * Returns the location of the given data point. Value can either be an index or a numerical value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param value
	 * @param index
	 * @param datasetIndex
	 */
	getPixelForValue() {}

	/**
	 * Used to get the data value from a given pixel. This is the inverse of getPixelForValue
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 * @param pixel
	 */
	getValueForPixel() {}

	/**
	 * Returns the location of the tick at the given index
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getPixelForTick(index) {
		var me = this;
		var offset = me.options.offset;
		var numTicks = me.ticks.length;
		var tickWidth = 1 / Math.max(numTicks - (offset ? 0 : 1), 1);

		return index < 0 || index > numTicks - 1
			? null
			: me.getPixelForDecimal(index * tickWidth + (offset ? tickWidth / 2 : 0));
	}

	/**
	 * Utility for getting the pixel location of a percentage of scale
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getPixelForDecimal(decimal) {
		var me = this;

		if (me._reversePixels) {
			decimal = 1 - decimal;
		}

		return me._startPixel + decimal * me._length;
	}

	getDecimalForPixel(pixel) {
		var decimal = (pixel - this._startPixel) / this._length;
		return this._reversePixels ? 1 - decimal : decimal;
	}

	/**
	 * Returns the pixel for the minimum chart value
	 * The coordinate (0, 0) is at the upper-left corner of the canvas
	 */
	getBasePixel() {
		return this.getPixelForValue(this.getBaseValue());
	}

	getBaseValue() {
		var me = this;
		var min = me.min;
		var max = me.max;

		return me.beginAtZero ? 0 :
			min < 0 && max < 0 ? max :
			min > 0 && max > 0 ? min :
			0;
	}

	/**
	 * Returns a subset of ticks to be plotted to avoid overlapping labels.
	 * @private
	 */
	_autoSkip(ticks) {
		const me = this;
		const tickOpts = me.options.ticks;
		const axisLength = me._length;
		const ticksLimit = tickOpts.maxTicksLimit || axisLength / me._tickSize() + 1;
		const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
		const numMajorIndices = majorIndices.length;
		const first = majorIndices[0];
		const last = majorIndices[numMajorIndices - 1];
		const newTicks = [];

		// If there are too many major ticks to display them all
		if (numMajorIndices > ticksLimit) {
			skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
			return newTicks;
		}

		const spacing = calculateSpacing(majorIndices, ticks, axisLength, ticksLimit);

		if (numMajorIndices > 0) {
			let i, ilen;
			const avgMajorSpacing = numMajorIndices > 1 ? (last - first) / (numMajorIndices - 1) : null;
			skip(ticks, newTicks, spacing, helpers.isNullOrUndef(avgMajorSpacing) ? 0 : first - avgMajorSpacing, first);
			for (i = 0, ilen = numMajorIndices - 1; i < ilen; i++) {
				skip(ticks, newTicks, spacing, majorIndices[i], majorIndices[i + 1]);
			}
			skip(ticks, newTicks, spacing, last, helpers.isNullOrUndef(avgMajorSpacing) ? ticks.length : last + avgMajorSpacing);
			return newTicks;
		}
		skip(ticks, newTicks, spacing);
		return newTicks;
	}

	/**
	 * @private
	 */
	_tickSize() {
		var me = this;
		var optionTicks = me.options.ticks;

		// Calculate space needed by label in axis direction.
		var rot = helpers.toRadians(me.labelRotation);
		var cos = Math.abs(Math.cos(rot));
		var sin = Math.abs(Math.sin(rot));

		var labelSizes = me._getLabelSizes();
		var padding = optionTicks.autoSkipPadding || 0;
		var w = labelSizes ? labelSizes.widest.width + padding : 0;
		var h = labelSizes ? labelSizes.highest.height + padding : 0;

		// Calculate space needed for 1 tick in axis direction.
		return me.isHorizontal()
			? h * cos > w * sin ? w / cos : h / sin
			: h * sin < w * cos ? h / cos : w / sin;
	}

	/**
	 * @private
	 */
	_isVisible() {
		var display = this.options.display;

		if (display !== 'auto') {
			return !!display;
		}

		return this._getMatchingVisibleMetas().length > 0;
	}

	/**
	 * @private
	 */
	_computeGridLineItems(chartArea) {
		var me = this;
		var chart = me.chart;
		var options = me.options;
		var gridLines = options.gridLines;
		var position = options.position;
		var offsetGridLines = gridLines.offsetGridLines;
		var isHorizontal = me.isHorizontal();
		var ticks = me.ticks;
		var ticksLength = ticks.length + (offsetGridLines ? 1 : 0);
		var tl = getTickMarkLength(gridLines);
		var items = [];

		var context = {
			scale: me,
			tick: ticks[0],
		};
		var axisWidth = gridLines.drawBorder ? resolve([gridLines.lineWidth, 0], context, 0) : 0;
		var axisHalfWidth = axisWidth / 2;
		var alignBorderValue = function(pixel) {
			return alignPixel(chart, pixel, axisWidth);
		};
		var borderValue, i, tick, lineValue, alignedLineValue;
		var tx1, ty1, tx2, ty2, x1, y1, x2, y2;

		if (position === 'top') {
			borderValue = alignBorderValue(me.bottom);
			ty1 = me.bottom - tl;
			ty2 = borderValue - axisHalfWidth;
			y1 = alignBorderValue(chartArea.top) + axisHalfWidth;
			y2 = chartArea.bottom;
		} else if (position === 'bottom') {
			borderValue = alignBorderValue(me.top);
			y1 = chartArea.top;
			y2 = alignBorderValue(chartArea.bottom) - axisHalfWidth;
			ty1 = borderValue + axisHalfWidth;
			ty2 = me.top + tl;
		} else if (position === 'left') {
			borderValue = alignBorderValue(me.right);
			tx1 = me.right - tl;
			tx2 = borderValue - axisHalfWidth;
			x1 = alignBorderValue(chartArea.left) + axisHalfWidth;
			x2 = chartArea.right;
		} else {
			borderValue = alignBorderValue(me.left);
			x1 = chartArea.left;
			x2 = alignBorderValue(chartArea.right) - axisHalfWidth;
			tx1 = borderValue + axisHalfWidth;
			tx2 = me.left + tl;
		}

		for (i = 0; i < ticksLength; ++i) {
			tick = ticks[i] || {};

			context = {
				scale: me,
				tick,
			};

			const lineWidth = resolve([gridLines.lineWidth], context, i);
			const lineColor = resolve([gridLines.color], context, i);
			const borderDash = gridLines.borderDash || [];
			const borderDashOffset = resolve([gridLines.borderDashOffset], context, i);

			lineValue = getPixelForGridLine(me, i, offsetGridLines);

			// Skip if the pixel is out of the range
			if (lineValue === undefined) {
				continue;
			}

			alignedLineValue = alignPixel(chart, lineValue, lineWidth);

			if (isHorizontal) {
				tx1 = tx2 = x1 = x2 = alignedLineValue;
			} else {
				ty1 = ty2 = y1 = y2 = alignedLineValue;
			}

			items.push({
				tx1: tx1,
				ty1: ty1,
				tx2: tx2,
				ty2: ty2,
				x1: x1,
				y1: y1,
				x2: x2,
				y2: y2,
				width: lineWidth,
				color: lineColor,
				borderDash: borderDash,
				borderDashOffset: borderDashOffset,
			});
		}

		items.ticksLength = ticksLength;
		items.borderValue = borderValue;

		return items;
	}

	/**
	 * @private
	 */
	_computeLabelItems() {
		var me = this;
		var options = me.options;
		var optionTicks = options.ticks;
		var position = options.position;
		var isMirrored = optionTicks.mirror;
		var isHorizontal = me.isHorizontal();
		var ticks = me.ticks;
		var fonts = parseTickFontOptions(optionTicks);
		var tickPadding = optionTicks.padding;
		var tl = getTickMarkLength(options.gridLines);
		var rotation = -helpers.toRadians(me.labelRotation);
		var items = [];
		var i, ilen, tick, label, x, y, textAlign, pixel, font, lineHeight, lineCount, textOffset;

		if (position === 'top') {
			y = me.bottom - tl - tickPadding;
			textAlign = !rotation ? 'center' : 'left';
		} else if (position === 'bottom') {
			y = me.top + tl + tickPadding;
			textAlign = !rotation ? 'center' : 'right';
		} else if (position === 'left') {
			x = me.right - (isMirrored ? 0 : tl) - tickPadding;
			textAlign = isMirrored ? 'left' : 'right';
		} else {
			x = me.left + (isMirrored ? 0 : tl) + tickPadding;
			textAlign = isMirrored ? 'right' : 'left';
		}

		for (i = 0, ilen = ticks.length; i < ilen; ++i) {
			tick = ticks[i];
			label = tick.label;

			pixel = me.getPixelForTick(i) + optionTicks.labelOffset;
			font = tick.major ? fonts.major : fonts.minor;
			lineHeight = font.lineHeight;
			lineCount = isArray(label) ? label.length : 1;

			if (isHorizontal) {
				x = pixel;
				textOffset = position === 'top'
					? ((!rotation ? 0.5 : 1) - lineCount) * lineHeight
					: (!rotation ? 0.5 : 0) * lineHeight;
			} else {
				y = pixel;
				textOffset = (1 - lineCount) * lineHeight / 2;
			}

			items.push({
				x: x,
				y: y,
				rotation: rotation,
				label: label,
				font: font,
				textOffset: textOffset,
				textAlign: textAlign
			});
		}

		return items;
	}

	/**
	 * @private
	 */
	_drawGrid(chartArea) {
		var me = this;
		var gridLines = me.options.gridLines;

		if (!gridLines.display) {
			return;
		}

		var ctx = me.ctx;
		var chart = me.chart;
		var context = {
			scale: me,
			tick: me.ticks[0],
		};
		var axisWidth = gridLines.drawBorder ? resolve([gridLines.lineWidth, 0], context, 0) : 0;
		var items = me._gridLineItems || (me._gridLineItems = me._computeGridLineItems(chartArea));
		var width, color, i, ilen, item;

		for (i = 0, ilen = items.length; i < ilen; ++i) {
			item = items[i];
			width = item.width;
			color = item.color;

			if (width && color) {
				ctx.save();
				ctx.lineWidth = width;
				ctx.strokeStyle = color;
				if (ctx.setLineDash) {
					ctx.setLineDash(item.borderDash);
					ctx.lineDashOffset = item.borderDashOffset;
				}

				ctx.beginPath();

				if (gridLines.drawTicks) {
					ctx.moveTo(item.tx1, item.ty1);
					ctx.lineTo(item.tx2, item.ty2);
				}

				if (gridLines.drawOnChartArea) {
					ctx.moveTo(item.x1, item.y1);
					ctx.lineTo(item.x2, item.y2);
				}

				ctx.stroke();
				ctx.restore();
			}
		}

		if (axisWidth) {
			// Draw the line at the edge of the axis
			var firstLineWidth = axisWidth;
			context = {
				scale: me,
				tick: me.ticks[items.ticksLength - 1],
			};
			var lastLineWidth = resolve([gridLines.lineWidth, 1], context, items.ticksLength - 1);
			var borderValue = items.borderValue;
			var x1, x2, y1, y2;

			if (me.isHorizontal()) {
				x1 = alignPixel(chart, me.left, firstLineWidth) - firstLineWidth / 2;
				x2 = alignPixel(chart, me.right, lastLineWidth) + lastLineWidth / 2;
				y1 = y2 = borderValue;
			} else {
				y1 = alignPixel(chart, me.top, firstLineWidth) - firstLineWidth / 2;
				y2 = alignPixel(chart, me.bottom, lastLineWidth) + lastLineWidth / 2;
				x1 = x2 = borderValue;
			}

			ctx.lineWidth = axisWidth;
			ctx.strokeStyle = resolve([gridLines.color], context, 0);
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
		}
	}

	/**
	 * @private
	 */
	_drawLabels() {
		var me = this;
		var optionTicks = me.options.ticks;

		if (!optionTicks.display) {
			return;
		}

		var ctx = me.ctx;
		var items = me._labelItems || (me._labelItems = me._computeLabelItems());
		var i, j, ilen, jlen, item, tickFont, label, y;

		for (i = 0, ilen = items.length; i < ilen; ++i) {
			item = items[i];
			tickFont = item.font;

			// Make sure we draw text in the correct color and font
			ctx.save();
			ctx.translate(item.x, item.y);
			ctx.rotate(item.rotation);
			ctx.font = tickFont.string;
			ctx.fillStyle = tickFont.color;
			ctx.textBaseline = 'middle';
			ctx.textAlign = item.textAlign;

			label = item.label;
			y = item.textOffset;
			if (isArray(label)) {
				for (j = 0, jlen = label.length; j < jlen; ++j) {
					// We just make sure the multiline element is a string here..
					ctx.fillText('' + label[j], 0, y);
					y += tickFont.lineHeight;
				}
			} else {
				ctx.fillText(label, 0, y);
			}
			ctx.restore();
		}
	}

	/**
	 * @private
	 */
	_drawTitle() {
		var me = this;
		var ctx = me.ctx;
		var options = me.options;
		var scaleLabel = options.scaleLabel;

		if (!scaleLabel.display) {
			return;
		}

		var scaleLabelFontColor = valueOrDefault(scaleLabel.fontColor, defaults.global.defaultFontColor);
		var scaleLabelFont = helpers.options._parseFont(scaleLabel);
		var scaleLabelPadding = helpers.options.toPadding(scaleLabel.padding);
		var halfLineHeight = scaleLabelFont.lineHeight / 2;
		var scaleLabelAlign = scaleLabel.align;
		var position = options.position;
		var rotation = 0;
		var isReverse = me.options.reverse;
		var scaleLabelX, scaleLabelY, textAlign;

		if (me.isHorizontal()) {
			switch (scaleLabelAlign) {
			case 'start':
				scaleLabelX = me.left + (isReverse ? me.width : 0);
				textAlign = isReverse ? 'right' : 'left';
				break;
			case 'end':
				scaleLabelX = me.left + (isReverse ? 0 : me.width);
				textAlign = isReverse ? 'left' : 'right';
				break;
			default:
				scaleLabelX = me.left + me.width / 2;
				textAlign = 'center';
			}
			scaleLabelY = position === 'top'
				? me.top + halfLineHeight + scaleLabelPadding.top
				: me.bottom - halfLineHeight - scaleLabelPadding.bottom;
		} else {
			var isLeft = position === 'left';
			scaleLabelX = isLeft
				? me.left + halfLineHeight + scaleLabelPadding.top
				: me.right - halfLineHeight - scaleLabelPadding.top;
			switch (scaleLabelAlign) {
			case 'start':
				scaleLabelY = me.top + (isReverse ? 0 : me.height);
				textAlign = isReverse === isLeft ? 'right' : 'left';
				break;
			case 'end':
				scaleLabelY = me.top + (isReverse ? me.height : 0);
				textAlign = isReverse === isLeft ? 'left' : 'right';
				break;
			default:
				scaleLabelY = me.top + me.height / 2;
				textAlign = 'center';
			}
			rotation = isLeft ? -0.5 * Math.PI : 0.5 * Math.PI;
		}

		ctx.save();
		ctx.translate(scaleLabelX, scaleLabelY);
		ctx.rotate(rotation);
		ctx.textAlign = textAlign;
		ctx.textBaseline = 'middle';
		ctx.fillStyle = scaleLabelFontColor; // render in correct colour
		ctx.font = scaleLabelFont.string;
		ctx.fillText(scaleLabel.labelString, 0, 0);
		ctx.restore();
	}

	draw(chartArea) {
		var me = this;

		if (!me._isVisible()) {
			return;
		}

		me._drawGrid(chartArea);
		me._drawTitle();
		me._drawLabels();
	}

	/**
	 * @private
	 */
	_layers() {
		var me = this;
		var opts = me.options;
		var tz = opts.ticks && opts.ticks.z || 0;
		var gz = opts.gridLines && opts.gridLines.z || 0;

		if (!me._isVisible() || tz === gz || me.draw !== me._draw) {
			// backward compatibility: draw has been overridden by custom scale
			return [{
				z: tz,
				draw: function() {
					me.draw.apply(me, arguments);
				}
			}];
		}

		return [{
			z: gz,
			draw: function() {
				me._drawGrid.apply(me, arguments);
				me._drawTitle.apply(me, arguments);
			}
		}, {
			z: tz,
			draw: function() {
				me._drawLabels.apply(me, arguments);
			}
		}];
	}

	/**
	 * Returns visible dataset metas that are attached to this scale
	 * @param {string} [type] - if specified, also filter by dataset type
	 * @private
	 */
	_getMatchingVisibleMetas(type) {
		var me = this;
		var metas = me.chart._getSortedVisibleDatasetMetas();
		var axisID = me.axis + 'AxisID';
		var result = [];
		var i, ilen, meta;

		for (i = 0, ilen = metas.length; i < ilen; ++i) {
			meta = metas[i];
			if (meta[axisID] === me.id && (!type || meta.type === type)) {
				result.push(meta);
			}
		}
		return result;
	}
}

Scale.prototype._draw = Scale.prototype.draw;

module.exports = Scale;
