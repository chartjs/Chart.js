import DatasetController from '../core/core.datasetController';
import {
	clipArea, unclipArea, _arrayUnique, isArray, isNullOrUndef,
	valueOrDefault, resolveObjectKey, sign
} from '../helpers';

function getAllScaleValues(scale) {
	if (!scale._cache.$bar) {
		const metas = scale.getMatchingVisibleMetas('bar');
		let values = [];

		for (let i = 0, ilen = metas.length; i < ilen; i++) {
			values = values.concat(metas[i].controller.getAllParsedValues(scale));
		}
		scale._cache.$bar = _arrayUnique(values.sort((a, b) => a - b));
	}
	return scale._cache.$bar;
}

/**
 * Computes the "optimal" sample size to maintain bars equally sized while preventing overlap.
 * @private
 */
function computeMinSampleSize(scale) {
	const values = getAllScaleValues(scale);
	let min = scale._length;
	let i, ilen, curr, prev;
	const updateMinAndPrev = () => {
		min = Math.min(min, i && Math.abs(curr - prev) || min);
		prev = curr;
	};

	for (i = 0, ilen = values.length; i < ilen; ++i) {
		curr = scale.getPixelForValue(values[i]);
		updateMinAndPrev();
	}

	for (i = 0, ilen = scale.ticks.length; i < ilen; ++i) {
		curr = scale.getPixelForTick(i);
		updateMinAndPrev();
	}

	return min;
}

/**
 * Computes an "ideal" category based on the absolute bar thickness or, if undefined or null,
 * uses the smallest interval (see computeMinSampleSize) that prevents bar overlapping. This
 * mode currently always generates bars equally sized (until we introduce scriptable options?).
 * @private
 */
function computeFitCategoryTraits(index, ruler, options, stackCount) {
	const thickness = options.barThickness;
	let size, ratio;

	if (isNullOrUndef(thickness)) {
		size = ruler.min * options.categoryPercentage;
		ratio = options.barPercentage;
	} else {
		// When bar thickness is enforced, category and bar percentages are ignored.
		// Note(SB): we could add support for relative bar thickness (e.g. barThickness: '50%')
		// and deprecate barPercentage since this value is ignored when thickness is absolute.
		size = thickness * stackCount;
		ratio = 1;
	}

	return {
		chunk: size / stackCount,
		ratio,
		start: ruler.pixels[index] - (size / 2)
	};
}

/**
 * Computes an "optimal" category that globally arranges bars side by side (no gap when
 * percentage options are 1), based on the previous and following categories. This mode
 * generates bars with different widths when data are not evenly spaced.
 * @private
 */
function computeFlexCategoryTraits(index, ruler, options, stackCount) {
	const pixels = ruler.pixels;
	const curr = pixels[index];
	let prev = index > 0 ? pixels[index - 1] : null;
	let next = index < pixels.length - 1 ? pixels[index + 1] : null;
	const percent = options.categoryPercentage;

	if (prev === null) {
		// first data: its size is double based on the next point or,
		// if it's also the last data, we use the scale size.
		prev = curr - (next === null ? ruler.end - ruler.start : next - curr);
	}

	if (next === null) {
		// last data: its size is also double based on the previous point.
		next = curr + curr - prev;
	}

	const start = curr - (curr - Math.min(prev, next)) / 2 * percent;
	const size = Math.abs(next - prev) / 2 * percent;

	return {
		chunk: size / stackCount,
		ratio: options.barPercentage,
		start
	};
}

function parseFloatBar(entry, item, vScale, i) {
	const startValue = vScale.parse(entry[0], i);
	const endValue = vScale.parse(entry[1], i);
	const min = Math.min(startValue, endValue);
	const max = Math.max(startValue, endValue);
	let barStart = min;
	let barEnd = max;

	if (Math.abs(min) > Math.abs(max)) {
		barStart = max;
		barEnd = min;
	}

	// Store `barEnd` (furthest away from origin) as parsed value,
	// to make stacking straight forward
	item[vScale.axis] = barEnd;

	item._custom = {
		barStart,
		barEnd,
		start: startValue,
		end: endValue,
		min,
		max
	};
}

function parseValue(entry, item, vScale, i) {
	if (isArray(entry)) {
		parseFloatBar(entry, item, vScale, i);
	} else {
		item[vScale.axis] = vScale.parse(entry, i);
	}
	return item;
}

function parseArrayOrPrimitive(meta, data, start, count) {
	const iScale = meta.iScale;
	const vScale = meta.vScale;
	const labels = iScale.getLabels();
	const singleScale = iScale === vScale;
	const parsed = [];
	let i, ilen, item, entry;

	for (i = start, ilen = start + count; i < ilen; ++i) {
		entry = data[i];
		item = {};
		item[iScale.axis] = singleScale || iScale.parse(labels[i], i);
		parsed.push(parseValue(entry, item, vScale, i));
	}
	return parsed;
}

function isFloatBar(custom) {
	return custom && custom.barStart !== undefined && custom.barEnd !== undefined;
}

export default class BarController extends DatasetController {

	/**
	 * Overriding primitive data parsing since we support mixed primitive/array
	 * data for float bars
	 * @protected
	 */
	parsePrimitiveData(meta, data, start, count) {
		return parseArrayOrPrimitive(meta, data, start, count);
	}

	/**
	 * Overriding array data parsing since we support mixed primitive/array
	 * data for float bars
	 * @protected
	 */
	parseArrayData(meta, data, start, count) {
		return parseArrayOrPrimitive(meta, data, start, count);
	}

	/**
	 * Overriding object data parsing since we support mixed primitive/array
	 * value-scale data for float bars
	 * @protected
	 */
	parseObjectData(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const {xAxisKey = 'x', yAxisKey = 'y'} = this._parsing;
		const iAxisKey = iScale.axis === 'x' ? xAxisKey : yAxisKey;
		const vAxisKey = vScale.axis === 'x' ? xAxisKey : yAxisKey;
		const parsed = [];
		let i, ilen, item, obj;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			obj = data[i];
			item = {};
			item[iScale.axis] = iScale.parse(resolveObjectKey(obj, iAxisKey), i);
			parsed.push(parseValue(resolveObjectKey(obj, vAxisKey), item, vScale, i));
		}
		return parsed;
	}

	/**
	 * @protected
	 */
	updateRangeFromParsed(range, scale, parsed, stack) {
		super.updateRangeFromParsed(range, scale, parsed, stack);
		const custom = parsed._custom;
		if (custom && scale === this._cachedMeta.vScale) {
			// float bar: only one end of the bar is considered by `super`
			range.min = Math.min(range.min, custom.min);
			range.max = Math.max(range.max, custom.max);
		}
	}

	/**
	 * @protected
	 */
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const {iScale, vScale} = meta;
		const parsed = me.getParsed(index);
		const custom = parsed._custom;
		const value = isFloatBar(custom)
			? '[' + custom.start + ', ' + custom.end + ']'
			: '' + vScale.getLabelForValue(parsed[vScale.axis]);

		return {
			label: '' + iScale.getLabelForValue(parsed[iScale.axis]),
			value
		};
	}

	initialize() {
		const me = this;
		me.enableOptionSharing = true;

		super.initialize();

		const meta = me._cachedMeta;
		meta.stack = me.getDataset().stack;
	}

	update(mode) {
		const me = this;
		const meta = me._cachedMeta;

		me.updateElements(meta.data, 0, meta.data.length, mode);
	}

	updateElements(bars, start, count, mode) {
		const me = this;
		const reset = mode === 'reset';
		const vscale = me._cachedMeta.vScale;
		const base = vscale.getBasePixel();
		const horizontal = vscale.isHorizontal();
		const ruler = me._getRuler();
		const firstOpts = me.resolveDataElementOptions(start, mode);
		const sharedOptions = me.getSharedOptions(firstOpts);
		const includeOptions = me.includeOptions(mode, sharedOptions);

		me.updateSharedOptions(sharedOptions, mode, firstOpts);

		for (let i = start; i < start + count; i++) {
			const options = sharedOptions || me.resolveDataElementOptions(i, mode);
			const vpixels = me._calculateBarValuePixels(i, options);
			const ipixels = me._calculateBarIndexPixels(i, ruler, options);

			const properties = {
				horizontal,
				base: reset ? base : vpixels.base,
				x: horizontal ? reset ? base : vpixels.head : ipixels.center,
				y: horizontal ? ipixels.center : reset ? base : vpixels.head,
				height: horizontal ? ipixels.size : undefined,
				width: horizontal ? undefined : ipixels.size
			};

			if (includeOptions) {
				properties.options = options;
			}
			me.updateElement(bars[i], i, properties, mode);
		}
	}

	/**
	 * Returns the stacks based on groups and bar visibility.
	 * @param {number} [last] - The dataset index
	 * @param {number} [dataIndex] - The data index of the ruler
	 * @returns {string[]} The list of stack IDs
	 * @private
	 */
	_getStacks(last, dataIndex) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const metasets = iScale.getMatchingVisibleMetas(me._type);
		const stacked = iScale.options.stacked;
		const ilen = metasets.length;
		const stacks = [];
		let i, item;

		for (i = 0; i < ilen; ++i) {
			item = metasets[i];

			if (typeof dataIndex !== 'undefined') {
				const val = item.controller.getParsed(dataIndex)[
					item.controller._cachedMeta.vScale.axis
				];

				if (isNullOrUndef(val) || isNaN(val)) {
					continue;
				}
			}

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
	_getStackCount(index) {
		return this._getStacks(undefined, index).length;
	}

	/**
	 * Returns the stack index for the given dataset based on groups and bar visibility.
	 * @param {number} [datasetIndex] - The dataset index
	 * @param {string} [name] - The stack name to find
	 * @returns {number} The stack index
	 * @private
	 */
	_getStackIndex(datasetIndex, name) {
		const stacks = this._getStacks(datasetIndex);
		const index = (name !== undefined)
			? stacks.indexOf(name)
			: -1; // indexOf returns -1 if element is not present

		return (index === -1)
			? stacks.length - 1
			: index;
	}

	/**
	 * @private
	 */
	_getRuler() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const pixels = [];
		let i, ilen;

		for (i = 0, ilen = meta.data.length; i < ilen; ++i) {
			pixels.push(iScale.getPixelForValue(me.getParsed(i)[iScale.axis], i));
		}

		// Note: a potential optimization would be to skip computing this
		// only if the barThickness option is defined
		// Since a scriptable option may return null or undefined that
		// means the option would have to be of type number
		const min = computeMinSampleSize(iScale);

		return {
			min,
			pixels,
			start: iScale._startPixel,
			end: iScale._endPixel,
			stackCount: me._getStackCount(),
			scale: iScale
		};
	}

	/**
	 * Note: pixel values are not clamped to the scale area.
	 * @private
	 */
	_calculateBarValuePixels(index, options) {
		const me = this;
		const meta = me._cachedMeta;
		const vScale = meta.vScale;
		const {base: baseValue, minBarLength} = options;
		const parsed = me.getParsed(index);
		const custom = parsed._custom;
		const floating = isFloatBar(custom);
		let value = parsed[vScale.axis];
		let start = 0;
		let length = meta._stacked ? me.applyStack(vScale, parsed) : value;
		let head, size;

		if (length !== value) {
			start = length - value;
			length = value;
		}

		if (floating) {
			value = custom.barStart;
			length = custom.barEnd - custom.barStart;
			// bars crossing origin are not stacked
			if (value !== 0 && sign(value) !== sign(custom.barEnd)) {
				start = 0;
			}
			start += value;
		}

		const startValue = !isNullOrUndef(baseValue) && !floating ? baseValue : start;
		let base = vScale.getPixelForValue(startValue);

		if (this.chart.getDataVisibility(index)) {
			head = vScale.getPixelForValue(start + length);
		} else {
			// When not visible, no height
			head = base;
		}

		size = head - base;

		if (minBarLength !== undefined && Math.abs(size) < minBarLength) {
			size = size < 0 ? -minBarLength : minBarLength;
			if (value === 0) {
				base -= size / 2;
			}
			head = base + size;
		}

		return {
			size,
			base,
			head,
			center: head + size / 2
		};
	}

	/**
	 * @private
	 */
	_calculateBarIndexPixels(index, ruler, options) {
		const me = this;
		const stackCount = me.chart.options.skipNull ? me._getStackCount(index) : ruler.stackCount;
		const range = options.barThickness === 'flex'
			? computeFlexCategoryTraits(index, ruler, options, stackCount)
			: computeFitCategoryTraits(index, ruler, options, stackCount);

		const stackIndex = me._getStackIndex(me.index, me._cachedMeta.stack);
		const center = range.start + (range.chunk * stackIndex) + (range.chunk / 2);
		const size = Math.min(
			valueOrDefault(options.maxBarThickness, Infinity),
			range.chunk * range.ratio);

		return {
			base: center - size / 2,
			head: center + size / 2,
			center,
			size
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
			if (!isNaN(me.getParsed(i)[vScale.axis])) {
				rects[i].draw(me._ctx);
			}
		}

		unclipArea(chart.ctx);
	}

}

BarController.id = 'bar';

/**
 * @type {any}
 */
BarController.defaults = {
	datasetElementType: false,
	dataElementType: 'bar',
	dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderSkipped',
		'borderWidth',
		'borderRadius',
		'barPercentage',
		'barThickness',
		'base',
		'categoryPercentage',
		'maxBarThickness',
		'minBarLength',
	],
	interaction: {
		mode: 'index'
	},

	hover: {},

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
		_index_: {
			type: 'category',
			offset: true,
			gridLines: {
				offsetGridLines: true
			}
		},
		_value_: {
			type: 'linear',
			beginAtZero: true,
		}
	}
};
