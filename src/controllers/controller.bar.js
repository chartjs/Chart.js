'use strict';

var DatasetController = require('../core/core.datasetController');
var defaults = require('../core/core.defaults');
var elements = require('../elements/index');
var helpers = require('../helpers/index');

var valueOrDefault = helpers.valueOrDefault;

defaults._set('bar', {
	hover: {
		mode: 'index'
	},

	scales: {
		xAxes: [{
			type: 'category',
			offset: true,
			gridLines: {
				offsetGridLines: true
			}
		}],

		yAxes: [{
			type: 'linear'
		}]
	}
});

defaults._set('global', {
	datasets: {
		bar: {
			categoryPercentage: 0.8,
			barPercentage: 0.9
		}
	}
});

/**
 * Computes the "optimal" sample size to maintain bars equally sized while preventing overlap.
 * @private
 */
function computeMinSampleSize(scale, pixels) {
	var min = scale._length;
	var prev, curr, i, ilen;

	for (i = 1, ilen = pixels.length; i < ilen; ++i) {
		min = Math.min(min, Math.abs(pixels[i] - pixels[i - 1]));
	}

	for (i = 0, ilen = scale.getTicks().length; i < ilen; ++i) {
		curr = scale.getPixelForTick(i);
		min = i > 0 ? Math.min(min, Math.abs(curr - prev)) : min;
		prev = curr;
	}

	return min;
}

/**
 * Computes an "ideal" category based on the absolute bar thickness or, if undefined or null,
 * uses the smallest interval (see computeMinSampleSize) that prevents bar overlapping. This
 * mode currently always generates bars equally sized (until we introduce scriptable options?).
 * @private
 */
function computeFitCategoryTraits(index, ruler, options) {
	var thickness = options.barThickness;
	var count = ruler.stackCount;
	var curr = ruler.pixels[index];
	var min = helpers.isNullOrUndef(thickness)
		? computeMinSampleSize(ruler.scale, ruler.pixels)
		: -1;
	var size, ratio;

	if (helpers.isNullOrUndef(thickness)) {
		size = min * options.categoryPercentage;
		ratio = options.barPercentage;
	} else {
		// When bar thickness is enforced, category and bar percentages are ignored.
		// Note(SB): we could add support for relative bar thickness (e.g. barThickness: '50%')
		// and deprecate barPercentage since this value is ignored when thickness is absolute.
		size = thickness * count;
		ratio = 1;
	}

	return {
		chunk: size / count,
		ratio: ratio,
		start: curr - (size / 2)
	};
}

/**
 * Computes an "optimal" category that globally arranges bars side by side (no gap when
 * percentage options are 1), based on the previous and following categories. This mode
 * generates bars with different widths when data are not evenly spaced.
 * @private
 */
function computeFlexCategoryTraits(index, ruler, options) {
	var pixels = ruler.pixels;
	var curr = pixels[index];
	var prev = index > 0 ? pixels[index - 1] : null;
	var next = index < pixels.length - 1 ? pixels[index + 1] : null;
	var percent = options.categoryPercentage;
	var start, size;

	if (prev === null) {
		// first data: its size is double based on the next point or,
		// if it's also the last data, we use the scale size.
		prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
	}

	if (next === null) {
		// last data: its size is also double based on the previous point.
		next = curr + curr - prev;
	}

	start = curr - (curr - Math.min(prev, next)) / 2 * percent;
	size = Math.abs(next - prev) / 2 * percent;

	return {
		chunk: size / ruler.stackCount,
		ratio: options.barPercentage,
		start: start
	};
}

function parseFloatBar(arr, item, vScale, i) {
	var startValue = vScale._parse(arr[0], i);
	var endValue = vScale._parse(arr[1], i);
	var min = Math.min(startValue, endValue);
	var max = Math.max(startValue, endValue);
	var barStart = min;
	var barEnd = max;

	if (Math.abs(min) > Math.abs(max)) {
		barStart = max;
		barEnd = min;
	}

	// Store `barEnd` (furthest away from origin) as parsed value,
	// to make stacking straight forward
	item[vScale.id] = barEnd;

	item._custom = {
		barStart: barStart,
		barEnd: barEnd,
		start: startValue,
		end: endValue,
		min: min,
		max: max
	};
}

function parseArrayOrPrimitive(meta, data, start, count) {
	var iScale = this._getIndexScale();
	var vScale = this._getValueScale();
	var labels = iScale._getLabels();
	var singleScale = iScale === vScale;
	var parsed = [];
	var i, ilen, item, entry;

	for (i = start, ilen = start + count; i < ilen; ++i) {
		entry = data[i];
		item = {};
		item[iScale.id] = singleScale || iScale._parse(labels[i], i);

		if (helpers.isArray(entry)) {
			parseFloatBar(entry, item, vScale, i);
		} else {
			item[vScale.id] = vScale._parse(entry, i);
		}

		parsed.push(item);
	}
	return parsed;
}

module.exports = DatasetController.extend({

	dataElementType: elements.Rectangle,

	/**
	 * @private
	 */
	_dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderSkipped',
		'borderWidth',
		'barPercentage',
		'barThickness',
		'categoryPercentage',
		'maxBarThickness',
		'minBarLength'
	],

	/**
	 * Overriding primitive data parsing since we support mixed primitive/array
	 * data for float bars
	 * @private
	 */
	_parsePrimitiveData: function() {
		return parseArrayOrPrimitive.apply(this, arguments);
	},

	/**
	 * Overriding array data parsing since we support mixed primitive/array
	 * data for float bars
	 * @private
	 */
	_parseArrayData: function() {
		return parseArrayOrPrimitive.apply(this, arguments);
	},

	/**
	 * Overriding object data parsing since we support mixed primitive/array
	 * value-scale data for float bars
	 * @private
	 */
	_parseObjectData: function(meta, data, start, count) {
		var iScale = this._getIndexScale();
		var vScale = this._getValueScale();
		var vProp = vScale._getAxis();
		var parsed = [];
		var i, ilen, item, obj, value;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			obj = data[i];
			item = {};
			item[iScale.id] = iScale._parseObject(obj, iScale._getAxis(), i);
			value = obj[vProp];
			if (helpers.isArray(value)) {
				parseFloatBar(value, item, vScale, i);
			} else {
				item[vScale.id] = vScale._parseObject(obj, vProp, i);
			}
			parsed.push(item);
		}
		return parsed;
	},

	/**
	 * @private
	 */
	_getLabelAndValue: function(index) {
		const me = this;
		const indexScale = me._getIndexScale();
		const valueScale = me._getValueScale();
		const parsed = me._getParsed(index);
		const custom = parsed._custom;
		const value = custom
			? '[' + custom.start + ', ' + custom.end + ']'
			: '' + valueScale.getLabelForValue(parsed[valueScale.id]);

		return {
			label: '' + indexScale.getLabelForValue(parsed[indexScale.id]),
			value: value
		};
	},

	initialize: function() {
		var me = this;
		var meta;

		DatasetController.prototype.initialize.apply(me, arguments);

		meta = me.getMeta();
		meta.stack = me.getDataset().stack;
		meta.bar = true;
	},

	update: function(reset) {
		var me = this;
		var rects = me.getMeta().data;
		var i, ilen;

		me._ruler = me.getRuler();

		for (i = 0, ilen = rects.length; i < ilen; ++i) {
			me.updateElement(rects[i], i, reset);
		}
	},

	updateElement: function(rectangle, index, reset) {
		var me = this;
		var options = me._resolveDataElementOptions(index);

		rectangle._model = {
			backgroundColor: options.backgroundColor,
			borderColor: options.borderColor,
			borderSkipped: options.borderSkipped,
			borderWidth: options.borderWidth
		};

		// all borders are drawn for floating bar
		if (me._getParsed(index)._custom) {
			rectangle._model.borderSkipped = null;
		}

		me._updateElementGeometry(rectangle, index, reset, options);

		rectangle.pivot(me.chart._animationsDisabled);
	},

	/**
	 * @private
	 */
	_updateElementGeometry: function(rectangle, index, reset, options) {
		var me = this;
		var model = rectangle._model;
		var vscale = me._getValueScale();
		var base = vscale.getBasePixel();
		var horizontal = vscale.isHorizontal();
		var ruler = me._ruler || me.getRuler();
		var vpixels = me.calculateBarValuePixels(index, options);
		var ipixels = me.calculateBarIndexPixels(index, ruler, options);

		model.horizontal = horizontal;
		model.base = reset ? base : vpixels.base;
		model.x = horizontal ? reset ? base : vpixels.head : ipixels.center;
		model.y = horizontal ? ipixels.center : reset ? base : vpixels.head;
		model.height = horizontal ? ipixels.size : undefined;
		model.width = horizontal ? undefined : ipixels.size;
	},

	/**
	 * Returns the stacks based on groups and bar visibility.
	 * @param {number} [last] - The dataset index
	 * @returns {string[]} The list of stack IDs
	 * @private
	 */
	_getStacks: function(last) {
		var me = this;
		var scale = me._getIndexScale();
		var metasets = scale._getMatchingVisibleMetas(me._type);
		var stacked = scale.options.stacked;
		var ilen = metasets.length;
		var stacks = [];
		var i, meta;

		for (i = 0; i < ilen; ++i) {
			meta = metasets[i];
			// stacked   | meta.stack
			//           | found | not found | undefined
			// false     |   x   |     x     |     x
			// true      |       |     x     |
			// undefined |       |     x     |     x
			if (stacked === false || stacks.indexOf(meta.stack) === -1 ||
				(stacked === undefined && meta.stack === undefined)) {
				stacks.push(meta.stack);
			}
			if (meta.index === last) {
				break;
			}
		}

		return stacks;
	},

	/**
	 * Returns the effective number of stacks based on groups and bar visibility.
	 * @private
	 */
	getStackCount: function() {
		return this._getStacks().length;
	},

	/**
	 * Returns the stack index for the given dataset based on groups and bar visibility.
	 * @param {number} [datasetIndex] - The dataset index
	 * @param {string} [name] - The stack name to find
	 * @returns {number} The stack index
	 * @private
	 */
	getStackIndex: function(datasetIndex, name) {
		var stacks = this._getStacks(datasetIndex);
		var index = (name !== undefined)
			? stacks.indexOf(name)
			: -1; // indexOf returns -1 if element is not present

		return (index === -1)
			? stacks.length - 1
			: index;
	},

	/**
	 * @private
	 */
	getRuler: function() {
		var me = this;
		var scale = me._getIndexScale();
		var pixels = [];
		var i, ilen;

		for (i = 0, ilen = me.getMeta().data.length; i < ilen; ++i) {
			pixels.push(scale.getPixelForValue(me._getParsed(i)[scale.id]));
		}

		return {
			pixels: pixels,
			start: scale._startPixel,
			end: scale._endPixel,
			stackCount: me.getStackCount(),
			scale: scale
		};
	},

	/**
	 * Note: pixel values are not clamped to the scale area.
	 * @private
	 */
	calculateBarValuePixels: function(index, options) {
		var me = this;
		var valueScale = me._getValueScale();
		var minBarLength = options.minBarLength;
		var start = 0;
		var parsed = me._getParsed(index);
		var value = parsed[valueScale.id];
		var custom = parsed._custom;
		var length = me._cachedMeta._stacked ? me._applyStack(valueScale, parsed) : parsed[valueScale.id];
		var base, head, size;

		if (length !== value) {
			start = length - value;
			length = value;
		}

		if (custom && custom.barStart !== undefined && custom.barEnd !== undefined) {
			value = custom.barStart;
			length = custom.barEnd - custom.barStart;
			// bars crossing origin are not stacked
			if (value !== 0 && helpers.sign(value) !== helpers.sign(custom.barEnd)) {
				start = 0;
			}
			start += value;
		}

		base = valueScale.getPixelForValue(start);
		head = valueScale.getPixelForValue(start + length);
		size = head - base;

		if (minBarLength !== undefined && Math.abs(size) < minBarLength) {
			size = size < 0 ? -minBarLength : minBarLength;
			head = base + size;
		}

		return {
			size: size,
			base: base,
			head: head,
			center: head + size / 2
		};
	},

	/**
	 * @private
	 */
	calculateBarIndexPixels: function(index, ruler, options) {
		var me = this;
		var range = options.barThickness === 'flex'
			? computeFlexCategoryTraits(index, ruler, options)
			: computeFitCategoryTraits(index, ruler, options);

		var stackIndex = me.getStackIndex(me.index, me.getMeta().stack);
		var center = range.start + (range.chunk * stackIndex) + (range.chunk / 2);
		var size = Math.min(
			valueOrDefault(options.maxBarThickness, Infinity),
			range.chunk * range.ratio);

		return {
			base: center - size / 2,
			head: center + size / 2,
			center: center,
			size: size
		};
	},

	draw: function() {
		var me = this;
		var chart = me.chart;
		var scale = me._getValueScale();
		var rects = me.getMeta().data;
		var ilen = rects.length;
		var i = 0;

		helpers.canvas.clipArea(chart.ctx, chart.chartArea);

		for (; i < ilen; ++i) {
			if (!isNaN(me._getParsed(i)[scale.id])) {
				rects[i].draw();
			}
		}

		helpers.canvas.unclipArea(chart.ctx);
	}

});
