'use strict';

import DatasetController from '../core/core.datasetController';
import defaults from '../core/core.defaults';
import Rectangle from '../elements/element.rectangle';
import {clipArea, unclipArea} from '../helpers/helpers.canvas';
import {isArray, isNullOrUndef, valueOrDefault} from '../helpers/helpers.core';
import {_limitValue, sign} from '../helpers/helpers.math';

defaults.set('bar', {
	hover: {
		mode: 'index'
	},

	datasets: {
		categoryPercentage: 0.8,
		barPercentage: 0.9,
		animation: {
			numbers: {
				type: 'number',
				properties: ['x', 'y', 'base', 'width', 'height']
			}
		}
	},

	scales: {
		x: {
			type: 'category',
			offset: true,
			gridLines: {
				offsetGridLines: true
			}
		},
		y: {
			type: 'linear',
			beginAtZero: true,
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

	for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
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
	var min = isNullOrUndef(thickness)
		? computeMinSampleSize(ruler.scale, ruler.pixels)
		: -1;
	var size, ratio;

	if (isNullOrUndef(thickness)) {
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
	item[vScale.axis] = barEnd;

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
	const iScale = meta.iScale;
	const vScale = meta.vScale;
	const labels = iScale._getLabels();
	const singleScale = iScale === vScale;
	const parsed = [];
	let i, ilen, item, entry;

	for (i = start, ilen = start + count; i < ilen; ++i) {
		entry = data[i];
		item = {};
		item[iScale.axis] = singleScale || iScale._parse(labels[i], i);

		if (isArray(entry)) {
			parseFloatBar(entry, item, vScale, i);
		} else {
			item[vScale.axis] = vScale._parse(entry, i);
		}

		parsed.push(item);
	}
	return parsed;
}

function isFloatBar(custom) {
	return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
}

class BarController extends DatasetController {

	constructor(chart, datasetIndex) {
		super(chart, datasetIndex);
	}

	/**
	 * Overriding primitive data parsing since we support mixed primitive/array
	 * data for float bars
	 * @private
	 */
	_parsePrimitiveData() {
		return parseArrayOrPrimitive.apply(this, arguments);
	}

	/**
	 * Overriding array data parsing since we support mixed primitive/array
	 * data for float bars
	 * @private
	 */
	_parseArrayData() {
		return parseArrayOrPrimitive.apply(this, arguments);
	}

	/**
	 * Overriding object data parsing since we support mixed primitive/array
	 * value-scale data for float bars
	 * @private
	 */
	_parseObjectData(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const vProp = vScale.axis;
		const parsed = [];
		let i, ilen, item, obj, value;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			obj = data[i];
			item = {};
			item[iScale.axis] = iScale._parseObject(obj, iScale.axis, i);
			value = obj[vProp];
			if (isArray(value)) {
				parseFloatBar(value, item, vScale, i);
			} else {
				item[vScale.axis] = vScale._parseObject(obj, vProp, i);
			}
			parsed.push(item);
		}
		return parsed;
	}

	/**
	 * @private
	 */
	_getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {iScale, vScale} = meta;
		const parsed = me._getParsed(index);
		const custom = parsed._custom;
		const value = isFloatBar(custom)
			? '[' + custom.start + ', ' + custom.end + ']'
			: '' + vScale.getLabelForValue(parsed[vScale.axis]);

		return {
			label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
			value: value
		};
	}

	initialize() {
		var me = this;
		var meta;

		DatasetController.prototype.initialize.apply(me, arguments);

		meta = me._cachedMeta;
		meta.stack = me.getDataset().stack;
		meta.bar = true;
	}

	update(mode) {
		const me = this;
		const meta = me._cachedMeta;

		me.updateElements(meta.data, 0, mode);
	}

	updateElements(rectangles, start, mode) {
		const me = this;
		const reset = mode === 'reset';
		const vscale = me._cachedMeta.vScale;
		const base = vscale.getBasePixel();
		const horizontal = vscale.isHorizontal();
		const ruler = me.getRuler();
		const firstOpts = me._resolveDataElementOptions(start, mode);
		const sharedOptions = me._getSharedOptions(mode, rectangles[start], firstOpts);
		const includeOptions = me._includeOptions(mode, sharedOptions);

		let i;

		for (i = 0; i < rectangles.length; i++) {
			const index = start + i;
			const options = me._resolveDataElementOptions(index, mode);
			const vpixels = me.calculateBarValuePixels(index, options);
			const ipixels = me.calculateBarIndexPixels(index, ruler, options);

			const properties = {
				horizontal,
				base: reset ? base : vpixels.base,
				x: horizontal ? reset ? base : vpixels.head : ipixels.center,
				y: horizontal ? ipixels.center : reset ? base : vpixels.head,
				height: horizontal ? ipixels.size : undefined,
				width: horizontal ? undefined : ipixels.size
			};

			// all borders are drawn for floating bar
			/* TODO: float bars border skipping magic
			if (me._getParsed(i)._custom) {
				model.borderSkipped = null;
			}
			*/
			if (includeOptions) {
				properties.options = options;
			}
			me._updateElement(rectangles[i], index, properties, mode);
		}

		me._updateSharedOptions(sharedOptions, mode);
	}

	/**
	 * Returns the stacks based on groups and bar visibility.
	 * @param {number} [last] - The dataset index
	 * @returns {string[]} The list of stack IDs
	 * @private
	 */
	_getStacks(last) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const metasets = iScale._getMatchingVisibleMetas(me._type);
		const stacked = iScale.options.stacked;
		const ilen = metasets.length;
		const stacks = [];
		let i, item;

		for (i = 0; i < ilen; ++i) {
			item = metasets[i];
			// stacked   | meta.stack
			//           | found | not found | undefined
			// false     |   x   |     x     |     x
			// true      |       |     x     |
			// undefined |       |     x     |     x
			if (stacked === false || stacks.indexOf(item.stack) === -1 ||
				(stacked === undefined && item.stack === undefined)) {
				stacks.push(item.stack);
			}
			if (item.index === last) {
				break;
			}
		}

		// No stacks? that means there is no visible data. Let's still initialize an `undefined`
		// stack where possible invisible bars will be located.
		// https://github.com/chartjs/Chart.js/issues/6368
		if (!stacks.length) {
			stacks.push(undefined);
		}

		return stacks;
	}

	/**
	 * Returns the effective number of stacks based on groups and bar visibility.
	 * @private
	 */
	getStackCount() {
		return this._getStacks().length;
	}

	/**
	 * Returns the stack index for the given dataset based on groups and bar visibility.
	 * @param {number} [datasetIndex] - The dataset index
	 * @param {string} [name] - The stack name to find
	 * @returns {number} The stack index
	 * @private
	 */
	getStackIndex(datasetIndex, name) {
		var stacks = this._getStacks(datasetIndex);
		var index = (name !== undefined)
			? stacks.indexOf(name)
			: -1; // indexOf returns -1 if element is not present

		return (index === -1)
			? stacks.length - 1
			: index;
	}

	/**
	 * @private
	 */
	getRuler() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const pixels = [];
		let i, ilen;

		for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
			pixels.push(iScale.getPixelForValue(me._getParsed(i)[iScale.axis]));
		}

		return {
			pixels,
			start: iScale._startPixel,
			end: iScale._endPixel,
			stackCount: me.getStackCount(),
			scale: iScale
		};
	}

	/**
	 * Note: pixel values are not clamped to the scale area.
	 * @private
	 */
	calculateBarValuePixels(index, options) {
		const me = this;
		const meta = me._cachedMeta;
		const vScale = meta.vScale;
		const minBarLength = options.minBarLength;
		const parsed = me._getParsed(index);
		const custom = parsed._custom;
		let value = parsed[vScale.axis];
		let start = 0;
		let length = meta._stacked ? me._applyStack(vScale, parsed) : value;
		let base, head, size;

		if (length !== value) {
			start = length - value;
			length = value;
		}

		if (isFloatBar(custom)) {
			value = custom.barStart;
			length = custom.barEnd - custom.barStart;
			// bars crossing origin are not stacked
			if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
				start = 0;
			}
			start += value;
		}

		// Limit the bar to only extend up to 10 pixels past scale bounds (chartArea)
		// So we don't try to draw so huge rectangles.
		// https://github.com/chartjs/Chart.js/issues/5247
		// TODO: use borderWidth instead (need to move the parsing from rectangle)
		base = _limitValue(vScale.getPixelForValue(start),
			vScale._startPixel - 10,
			vScale._endPixel + 10);

		head = vScale.getPixelForValue(start + length);
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
	}

	/**
	 * @private
	 */
	calculateBarIndexPixels(index, ruler, options) {
		var me = this;
		var range = options.barThickness === 'flex'
			? computeFlexCategoryTraits(index, ruler, options)
			: computeFitCategoryTraits(index, ruler, options);

		var stackIndex = me.getStackIndex(me.index, me._cachedMeta.stack);
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
	}

	draw() {
		const me = this;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const vScale = meta.vScale;
		const rects = meta.data;
		const ilen = rects.length;
		let i = 0;

		clipArea(chart.ctx, chart.chartArea);

		for (; i < ilen; ++i) {
			if (!isNaN(me._getParsed(i)[vScale.axis])) {
				rects[i].draw(me._ctx);
			}
		}

		unclipArea(chart.ctx);
	}

}

BarController.prototype.dataElementType = Rectangle;

/**
 * @private
 */
BarController.prototype._dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderSkipped',
	'borderWidth',
	'barPercentage',
	'barThickness',
	'categoryPercentage',
	'maxBarThickness',
	'minBarLength'
];

export default BarController;
