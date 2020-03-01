import helpers from '../helpers/index';
import Animations from './core.animations';

/**
 * @typedef { import("./core.controller").default } Chart
 * @typedef { import("./core.scale").default } Scale
 */

const resolve = helpers.options.resolve;

const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the '_onData*' callbacks (e.g. _onDataPush, etc.) with same arguments.
 */
function listenArrayEvents(array, listener) {
	if (array._chartjs) {
		array._chartjs.listeners.push(listener);
		return;
	}

	Object.defineProperty(array, '_chartjs', {
		configurable: true,
		enumerable: false,
		value: {
			listeners: [listener]
		}
	});

	arrayEvents.forEach((key) => {
		const method = '_onData' + key.charAt(0).toUpperCase() + key.slice(1);
		const base = array[key];

		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value(...args) {
				const res = base.apply(this, args);

				array._chartjs.listeners.forEach((object) => {
					if (typeof object[method] === 'function') {
						object[method](...args);
					}
				});

				return res;
			}
		});
	});
}

function scaleClip(scale, allowedOverflow) {
	const opts = scale && scale.options || {};
	const reverse = opts.reverse;
	const min = opts.min === undefined ? allowedOverflow : 0;
	const max = opts.max === undefined ? allowedOverflow : 0;
	return {
		start: reverse ? max : min,
		end: reverse ? min : max
	};
}

function defaultClip(xScale, yScale, allowedOverflow) {
	if (allowedOverflow === false) {
		return false;
	}
	const x = scaleClip(xScale, allowedOverflow);
	const y = scaleClip(yScale, allowedOverflow);

	return {
		top: y.end,
		right: x.end,
		bottom: y.start,
		left: x.start
	};
}

function toClip(value) {
	let t, r, b, l;

	if (helpers.isObject(value)) {
		t = value.top;
		r = value.right;
		b = value.bottom;
		l = value.left;
	} else {
		t = r = b = l = value;
	}

	return {
		top: t,
		right: r,
		bottom: b,
		left: l
	};
}

/**
 * Removes the given array event listener and cleanup extra attached properties (such as
 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
 */
function unlistenArrayEvents(array, listener) {
	const stub = array._chartjs;
	if (!stub) {
		return;
	}

	const listeners = stub.listeners;
	const index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}

	if (listeners.length > 0) {
		return;
	}

	arrayEvents.forEach((key) => {
		delete array[key];
	});

	delete array._chartjs;
}

function getSortedDatasetIndices(chart, filterVisible) {
	const keys = [];
	const metasets = chart._getSortedDatasetMetas(filterVisible);
	let i, ilen;

	for (i = 0, ilen = metasets.length; i < ilen; ++i) {
		keys.push(metasets[i].index);
	}
	return keys;
}

function applyStack(stack, value, dsIndex, allOther) {
	const keys = stack.keys;
	let i, ilen, datasetIndex, otherValue;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		datasetIndex = +keys[i];
		if (datasetIndex === dsIndex) {
			if (allOther) {
				continue;
			}
			break;
		}
		otherValue = stack.values[datasetIndex];
		if (!isNaN(otherValue) && (value === 0 || helpers.math.sign(value) === helpers.math.sign(otherValue))) {
			value += otherValue;
		}
	}
	return value;
}

function convertObjectDataToArray(data) {
	const keys = Object.keys(data);
	const adata = new Array(keys.length);
	let i, ilen, key;
	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		key = keys[i];
		adata[i] = {
			x: key,
			y: data[key]
		};
	}
	return adata;
}

function isStacked(scale, meta) {
	const stacked = scale && scale.options.stacked;
	return stacked || (stacked === undefined && meta.stack !== undefined);
}

function getStackKey(indexScale, valueScale, meta) {
	return indexScale.id + '.' + valueScale.id + '.' + meta.stack + '.' + meta.type;
}

function getUserBounds(scale) {
	const {min, max, minDefined, maxDefined} = scale.getUserBounds();
	return {
		min: minDefined ? min : Number.NEGATIVE_INFINITY,
		max: maxDefined ? max : Number.POSITIVE_INFINITY
	};
}

function getOrCreateStack(stacks, stackKey, indexValue) {
	const subStack = stacks[stackKey] || (stacks[stackKey] = {});
	return subStack[indexValue] || (subStack[indexValue] = {});
}

function updateStacks(controller, parsed) {
	const {chart, _cachedMeta: meta} = controller;
	const stacks = chart._stacks || (chart._stacks = {}); // map structure is {stackKey: {datasetIndex: value}}
	const {iScale, vScale, index: datasetIndex} = meta;
	const iAxis = iScale.axis;
	const vAxis = vScale.axis;
	const key = getStackKey(iScale, vScale, meta);
	const ilen = parsed.length;
	let stack;

	for (let i = 0; i < ilen; ++i) {
		const item = parsed[i];
		const {[iAxis]: index, [vAxis]: value} = item;
		const itemStacks = item._stacks || (item._stacks = {});
		stack = itemStacks[vAxis] = getOrCreateStack(stacks, key, index);
		stack[datasetIndex] = value;
	}
}

function getFirstScaleId(chart, axis) {
	const scales = chart.scales;
	return Object.keys(scales).filter(key => scales[key].axis === axis).shift();
}

export default class DatasetController {

	static extend = helpers.inherits;

	/**
	 * @param {Chart} chart
	 * @param {number} datasetIndex
	 */
	constructor(chart, datasetIndex) {
		this.chart = chart;
		this._ctx = chart.ctx;
		this.index = datasetIndex;
		this._cachedAnimations = {};
		this._cachedDataOpts = {};
		this._cachedMeta = this.getMeta();
		this._type = this._cachedMeta.type;
		this._config = undefined;
		this._parsing = false;
		this._data = undefined;
		this._dataCopy = undefined;
		this._objectData = undefined;
		this._labels = undefined;
		this._scaleStacked = {};

		this.initialize();
	}

	initialize() {
		const me = this;
		const meta = me._cachedMeta;
		me.configure();
		me.linkScales();
		meta._stacked = isStacked(meta.vScale, meta);
		me.addElements();
	}

	updateIndex(datasetIndex) {
		this.index = datasetIndex;
	}

	linkScales() {
		const me = this;
		const chart = me.chart;
		const meta = me._cachedMeta;
		const dataset = me.getDataset();

		const xid = meta.xAxisID = dataset.xAxisID || getFirstScaleId(chart, 'x');
		const yid = meta.yAxisID = dataset.yAxisID || getFirstScaleId(chart, 'y');
		const rid = meta.rAxisID = dataset.rAxisID || getFirstScaleId(chart, 'r');
		meta.xScale = me.getScaleForId(xid);
		meta.yScale = me.getScaleForId(yid);
		meta.rScale = me.getScaleForId(rid);
		meta.iScale = me._getIndexScale();
		meta.vScale = me._getValueScale();
	}

	getDataset() {
		return this.chart.data.datasets[this.index];
	}

	getMeta() {
		return this.chart.getDatasetMeta(this.index);
	}

	/**
	 * @param {string} scaleID
	 * @return {Scale}
	 */
	getScaleForId(scaleID) {
		return this.chart.scales[scaleID];
	}

	/**
	 * @protected
	 */
	getValueScaleId() {
		return this._cachedMeta.yAxisID;
	}

	/**
	 * @protected
	 */
	getIndexScaleId() {
		return this._cachedMeta.xAxisID;
	}

	/**
	 * @private
	 */
	_getValueScale() {
		return this.getScaleForId(this.getValueScaleId());
	}

	/**
	 * @private
	 */
	_getIndexScale() {
		return this.getScaleForId(this.getIndexScaleId());
	}

	/**
	 * @private
	 */
	_getOtherScale(scale) {
		const meta = this._cachedMeta;
		return scale === meta.iScale
			? meta.vScale
			: meta.iScale;
	}

	reset() {
		this._update('reset');
	}

	/**
	 * @private
	 */
	_destroy() {
		if (this._data) {
			unlistenArrayEvents(this._data, this);
		}
	}

	/**
	 * @private
	 */
	_dataCheck() {
		const me = this;
		const dataset = me.getDataset();
		const data = dataset.data || (dataset.data = []);

		// In order to correctly handle data addition/deletion animation (an thus simulate
		// real-time charts), we need to monitor these data modifications and synchronize
		// the internal meta data accordingly.

		if (helpers.isObject(data)) {
			// Object data is currently monitored for replacement only
			if (me._objectData === data) {
				return false;
			}
			me._data = convertObjectDataToArray(data);
			me._objectData = data;
		} else {
			if (me._data === data && helpers.arrayEquals(data, me._dataCopy)) {
				return false;
			}

			if (me._data) {
				// This case happens when the user replaced the data array instance.
				unlistenArrayEvents(me._data, me);
			}

			// Store a copy to detect direct modifications.
			// Note: This is suboptimal, but better than always parsing the data
			me._dataCopy = data.slice(0);

			if (data && Object.isExtensible(data)) {
				listenArrayEvents(data, me);
			}
			me._data = data;
		}
		return true;
	}

	/**
	 * @private
	 */
	_labelCheck() {
		const me = this;
		const iScale = me._cachedMeta.iScale;
		const labels = iScale ? iScale.getLabels() : me.chart.data.labels;

		if (me._labels === labels) {
			return false;
		}

		me._labels = labels;
		return true;
	}

	addElements() {
		const me = this;
		const meta = me._cachedMeta;

		me._dataCheck();

		const data = me._data;
		const metaData = meta.data = new Array(data.length);

		for (let i = 0, ilen = data.length; i < ilen; ++i) {
			metaData[i] = new me.dataElementType();
		}

		if (me.datasetElementType) {
			meta.dataset = new me.datasetElementType();
		}
	}

	buildOrUpdateElements() {
		const me = this;
		const dataChanged = me._dataCheck();
		const labelsChanged = me._labelCheck();
		const scaleChanged = me._scaleCheck();
		const meta = me._cachedMeta;
		const dataset = me.getDataset();
		let stackChanged = false;

		// make sure cached _stacked status is current
		meta._stacked = isStacked(meta.vScale, meta);

		// detect change in stack option
		if (meta.stack !== dataset.stack) {
			stackChanged = true;
			// remove values from old stack
			meta._parsed.forEach((parsed) => {
				delete parsed._stacks[meta.vScale.id][meta.index];
			});
			meta.stack = dataset.stack;
		}

		// Re-sync meta data in case the user replaced the data array or if we missed
		// any updates and so make sure that we handle number of datapoints changing.
		me._resyncElements(dataChanged || labelsChanged || scaleChanged || stackChanged);

		// if stack changed, update stack values for the whole dataset
		if (stackChanged) {
			updateStacks(me, meta._parsed);
		}
	}

	/**
	 * Merges user-supplied and default dataset-level options
	 * @private
	 */
	configure() {
		const me = this;
		me._config = helpers.merge({}, [
			me.chart.options[me._type].datasets,
			me.getDataset(),
		], {
			merger(key, target, source) {
				if (key !== 'data') {
					helpers._merger(key, target, source);
				}
			}
		});
		me._parsing = resolve([me._config.parsing, me.chart.options.parsing, true]);
	}

	/**
	 * @param {number} start
	 * @param {number} count
	 */
	parse(start, count) {
		const me = this;
		const {_cachedMeta: meta, _data: data} = me;
		const {iScale, vScale, _stacked} = meta;
		const iAxis = iScale.axis;
		let sorted = true;
		let i, parsed, cur, prev;

		if (start > 0) {
			sorted = meta._sorted;
			prev = meta._parsed[start - 1];
		}

		if (me._parsing === false) {
			meta._parsed = data;
			meta._sorted = true;
		} else {
			if (helpers.isArray(data[start])) {
				parsed = me.parseArrayData(meta, data, start, count);
			} else if (helpers.isObject(data[start])) {
				parsed = me.parseObjectData(meta, data, start, count);
			} else {
				parsed = me.parsePrimitiveData(meta, data, start, count);
			}


			for (i = 0; i < count; ++i) {
				meta._parsed[i + start] = cur = parsed[i];
				if (sorted) {
					if (prev && cur[iAxis] < prev[iAxis]) {
						sorted = false;
					}
					prev = cur;
				}
			}
			meta._sorted = sorted;
		}

		if (_stacked) {
			updateStacks(me, parsed);
		}

		iScale.invalidateCaches();
		vScale.invalidateCaches();
	}

	/**
	 * Parse array of primitive values
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [1,3,4]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {xScale0: 0, yScale0: 1}
	 * @protected
	 */
	parsePrimitiveData(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const iAxis = iScale.axis;
		const vAxis = vScale.axis;
		const labels = iScale.getLabels();
		const singleScale = iScale === vScale;
		const parsed = new Array(count);
		let i, ilen, index;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			parsed[i] = {
				[iAxis]: singleScale || iScale.parse(labels[index], index),
				[vAxis]: vScale.parse(data[index], index)
			};
		}
		return parsed;
	}

	/**
	 * Parse array of arrays
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [[1,2],[3,4]]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {x: 0, y: 1}
	 * @protected
	 */
	parseArrayData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const parsed = new Array(count);
		let i, ilen, index, item;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				x: xScale.parse(item[0], index),
				y: yScale.parse(item[1], index)
			};
		}
		return parsed;
	}

	/**
	 * Parse array of objects
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [{x:1, y:5}, {x:2, y:10}]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id. _custom is optional
	 * Example: {xScale0: 0, yScale0: 1, _custom: {r: 10, foo: 'bar'}}
	 * @protected
	 */
	parseObjectData(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const parsed = new Array(count);
		let i, ilen, index, item;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				x: xScale.parseObject(item, 'x', index),
				y: yScale.parseObject(item, 'y', index)
			};
		}
		return parsed;
	}

	/**
	 * @protected
	 */
	getParsed(index) {
		return this._cachedMeta._parsed[index];
	}

	/**
	 * @protected
	 */
	applyStack(scale, parsed) {
		const chart = this.chart;
		const meta = this._cachedMeta;
		const value = parsed[scale.axis];
		const stack = {
			keys: getSortedDatasetIndices(chart, true),
			values: parsed._stacks[scale.axis]
		};
		return applyStack(stack, value, meta.index);
	}

	/**
	 * @protected
	 */
	getMinMax(scale, canStack) {
		const meta = this._cachedMeta;
		const _parsed = meta._parsed;
		const sorted = meta._sorted && scale === meta.iScale;
		const ilen = _parsed.length;
		const otherScale = this._getOtherScale(scale);
		const stack = canStack && meta._stacked && {keys: getSortedDatasetIndices(this.chart, true), values: null};
		let min = Number.POSITIVE_INFINITY;
		let max = Number.NEGATIVE_INFINITY;
		const {min: otherMin, max: otherMax} = getUserBounds(otherScale);
		let i, value, parsed, otherValue;

		function _compute() {
			if (stack) {
				stack.values = parsed._stacks[scale.axis];
				// Need to consider individual stack values for data range,
				// in addition to the stacked value
				min = Math.min(min, value);
				max = Math.max(max, value);
				value = applyStack(stack, value, meta.index, true);
			}
			min = Math.min(min, value);
			max = Math.max(max, value);
		}

		function _skip() {
			parsed = _parsed[i];
			value = parsed[scale.axis];
			otherValue = parsed[otherScale.axis];
			return (isNaN(value) || otherMin > otherValue || otherMax < otherValue);
		}

		for (i = 0; i < ilen; ++i) {
			if (_skip()) {
				continue;
			}
			_compute();
			if (sorted) {
				break;
			}
		}
		if (sorted) {
			for (i = ilen - 1; i >= 0; --i) {
				if (_skip()) {
					continue;
				}
				_compute();
				break;
			}
		}
		return {min, max};
	}

	getAllParsedValues(scale) {
		const parsed = this._cachedMeta._parsed;
		const values = [];
		let i, ilen, value;

		for (i = 0, ilen = parsed.length; i < ilen; ++i) {
			value = parsed[i][scale.axis];
			if (!isNaN(value)) {
				values.push(value);
			}
		}
		return values;
	}

	/**
	 * @private
	 */
	_cacheScaleStackStatus() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const cache = me._scaleStacked = {};
		if (iScale && vScale) {
			cache[iScale.id] = iScale.options.stacked;
			cache[vScale.id] = vScale.options.stacked;
		}
	}

	/**
	 * @private
	 */
	_scaleCheck() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const cache = me._scaleStacked;
		return !cache ||
			!iScale ||
			!vScale ||
			cache[iScale.id] !== iScale.options.stacked ||
			cache[vScale.id] !== vScale.options.stacked;
	}

	/**
	 * @return {number|boolean}
	 * @protected
	 */
	getMaxOverflow() {
		return false;
	}

	/**
	 * @protected
	 */
	getLabelAndValue(index) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const parsed = me.getParsed(index);
		return {
			label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.axis]) : '',
			value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.axis]) : ''
		};
	}

	/**
	 * @private
	 */
	_update(mode) {
		const me = this;
		const meta = me._cachedMeta;
		me.configure();
		me._cachedAnimations = {};
		me._cachedDataOpts = {};
		me.update(mode);
		meta._clip = toClip(helpers.valueOrDefault(me._config.clip, defaultClip(meta.xScale, meta.yScale, me.getMaxOverflow())));
		me._cacheScaleStackStatus();
	}

	/**
	 * @param {string} mode
	 */
	update(mode) {} // eslint-disable-line no-unused-vars

	draw() {
		const ctx = this._ctx;
		const meta = this._cachedMeta;
		const elements = meta.data || [];
		const ilen = elements.length;
		let i = 0;

		if (meta.dataset) {
			meta.dataset.draw(ctx);
		}

		for (; i < ilen; ++i) {
			elements[i].draw(ctx);
		}
	}

	/**
	 * @private
	 */
	_addAutomaticHoverColors(index, options) {
		const me = this;
		const getHoverColor = helpers.getHoverColor;
		const normalOptions = me.getStyle(index);
		const missingColors = Object.keys(normalOptions).filter(key => key.indexOf('Color') !== -1 && !(key in options));
		let i = missingColors.length - 1;
		let color;
		for (; i >= 0; i--) {
			color = missingColors[i];
			options[color] = getHoverColor(normalOptions[color]);
		}
	}

	/**
	 * Returns a set of predefined style properties that should be used to represent the dataset
	 * or the data if the index is specified
	 * @param {number} index - data index
	 * @param {boolean} [active] - true if hover
	 * @return {object} style object
	 */
	getStyle(index, active) {
		const me = this;
		const meta = me._cachedMeta;
		const dataset = meta.dataset;

		if (!me._config) {
			me.configure();
		}

		const options = dataset && index === undefined
			? me.resolveDatasetElementOptions(active)
			: me.resolveDataElementOptions(index || 0, active && 'active');
		if (active) {
			me._addAutomaticHoverColors(index, options);
		}
		return options;
	}

	/**
	 * @private
	 */
	_getContext(index, active) {
		return {
			chart: this.chart,
			dataIndex: index,
			dataset: this.getDataset(),
			datasetIndex: this.index,
			active
		};

	}

	/**
	 * @protected
	 */
	resolveDatasetElementOptions(active) {
		const me = this;
		const chart = me.chart;
		const datasetOpts = me._config;
		// @ts-ignore
		const options = chart.options.elements[me.datasetElementType._type] || {};
		const elementOptions = me.datasetElementOptions;
		const values = {};
		const context = me._getContext(undefined, active);
		let i, ilen, key, readKey, value;

		for (i = 0, ilen = elementOptions.length; i < ilen; ++i) {
			key = elementOptions[i];
			readKey = active ? 'hover' + key.charAt(0).toUpperCase() + key.slice(1) : key;
			value = resolve([
				datasetOpts[readKey],
				options[readKey]
			], context);
			if (value !== undefined) {
				values[key] = value;
			}
		}

		return values;
	}

	/**
	 * @protected
	 */
	resolveDataElementOptions(index, mode) {
		const me = this;
		const active = mode === 'active';
		const cached = me._cachedDataOpts;
		if (cached[mode]) {
			return cached[mode];
		}
		const chart = me.chart;
		const datasetOpts = me._config;
		// @ts-ignore
		const options = chart.options.elements[me.dataElementType._type] || {};
		const elementOptions = me.dataElementOptions;
		const values = {};
		const context = me._getContext(index, active);
		const info = {cacheable: !active};
		let keys, i, ilen, key, value, readKey;

		if (helpers.isArray(elementOptions)) {
			for (i = 0, ilen = elementOptions.length; i < ilen; ++i) {
				key = elementOptions[i];
				readKey = active ? 'hover' + key.charAt(0).toUpperCase() + key.slice(1) : key;
				value = resolve([
					datasetOpts[readKey],
					options[readKey]
				], context, index, info);
				if (value !== undefined) {
					values[key] = value;
				}
			}
		} else {
			keys = Object.keys(elementOptions);
			for (i = 0, ilen = keys.length; i < ilen; ++i) {
				key = keys[i];
				readKey = active ? 'hover' + key.charAt(0).toUpperCase() + key.slice(1) : key;
				value = resolve([
					datasetOpts[elementOptions[readKey]],
					datasetOpts[readKey],
					options[readKey]
				], context, index, info);
				if (value !== undefined) {
					values[key] = value;
				}
			}
		}

		if (info.cacheable) {
			// `$shared` indicades this set of options can be shared between multiple elements.
			// Sharing is used to reduce number of properties to change during animation.
			values.$shared = true;

			// We cache options by `mode`, which can be 'active' for example. This enables us
			// to have the 'active' element options and 'default' options to switch between
			// when interacting.
			cached[mode] = values;
		}

		return values;
	}

	/**
	 * @private
	 */
	_resolveAnimations(index, mode, active) {
		const me = this;
		const chart = me.chart;
		const cached = me._cachedAnimations;
		mode = mode || 'default';

		if (cached[mode]) {
			return cached[mode];
		}

		const info = {cacheable: true};
		const context = me._getContext(index, active);
		const datasetAnim = resolve([me._config.animation], context, index, info);
		const chartAnim = resolve([chart.options.animation], context, index, info);
		let config = helpers.mergeIf({}, [datasetAnim, chartAnim]);

		if (config[mode]) {
			config = Object.assign({}, config, config[mode]);
		}

		const animations = new Animations(chart, config);

		if (info.cacheable) {
			cached[mode] = animations && Object.freeze(animations);
		}

		return animations;
	}

	/**
	 * Utility for checking if the options are shared and should be animated separately.
	 * @protected
	 */
	getSharedOptions(mode, el, options) {
		if (!mode) {
			// store element option sharing status for usage in interactions
			this._sharedOptions = options && options.$shared;
		}
		if (mode !== 'reset' && options && options.$shared && el && el.options && el.options.$shared) {
			return {target: el.options, options};
		}
	}

	/**
	 * Utility for determining if `options` should be included in the updated properties
	 * @protected
	 */
	includeOptions(mode, sharedOptions) {
		if (mode === 'hide' || mode === 'show') {
			return true;
		}
		return mode !== 'resize' && !sharedOptions;
	}

	/**
	 * Utility for updating a element with new properties, using animations when appropriate.
	 * @protected
	 */
	updateElement(element, index, properties, mode) {
		if (mode === 'reset' || mode === 'none') {
			Object.assign(element, properties);
		} else {
			this._resolveAnimations(index, mode).update(element, properties);
		}
	}

	/**
	 * Utility to animate the shared options, that are potentially affecting multiple elements.
	 * @protected
	 */
	updateSharedOptions(sharedOptions, mode) {
		if (sharedOptions) {
			this._resolveAnimations(undefined, mode).update(sharedOptions.target, sharedOptions.options);
		}
	}

	/**
	 * @private
	 */
	_setStyle(element, index, mode, active) {
		element.active = active;
		this._resolveAnimations(index, mode, active).update(element, {options: this.getStyle(index, active)});
	}

	removeHoverStyle(element, datasetIndex, index) {
		this._setStyle(element, index, 'active', false);
	}

	setHoverStyle(element, datasetIndex, index) {
		this._setStyle(element, index, 'active', true);
	}

	/**
	 * @private
	 */
	_removeDatasetHoverStyle() {
		const element = this._cachedMeta.dataset;

		if (element) {
			this._setStyle(element, undefined, 'active', false);
		}
	}

	/**
	 * @private
	 */
	_setDatasetHoverStyle() {
		const element = this._cachedMeta.dataset;

		if (element) {
			this._setStyle(element, undefined, 'active', true);
		}
	}

	/**
	 * @private
	 */
	_resyncElements(changed) {
		const me = this;
		const meta = me._cachedMeta;
		const numMeta = meta.data.length;
		const numData = me._data.length;

		if (numData > numMeta) {
			me._insertElements(numMeta, numData - numMeta);
			if (changed && numMeta) {
				// _insertElements parses the new elements. The old ones might need parsing too.
				me.parse(0, numMeta);
			}
		} else if (numData < numMeta) {
			meta.data.splice(numData, numMeta - numData);
			meta._parsed.splice(numData, numMeta - numData);
			me.parse(0, numData);
		} else if (changed) {
			me.parse(0, numData);
		}
	}

	/**
	 * @private
	 */
	_insertElements(start, count) {
		const me = this;
		const elements = new Array(count);
		const meta = me._cachedMeta;
		const data = meta.data;
		let i;

		for (i = 0; i < count; ++i) {
			elements[i] = new me.dataElementType();
		}
		data.splice(start, 0, ...elements);

		if (me._parsing) {
			meta._parsed.splice(start, 0, ...new Array(count));
		}
		me.parse(start, count);

		me.updateElements(elements, start, 'reset');
	}

	updateElements(element, start, mode) {} // eslint-disable-line no-unused-vars

	/**
	 * @private
	 */
	_removeElements(start, count) {
		const me = this;
		if (me._parsing) {
			me._cachedMeta._parsed.splice(start, count);
		}
		me._cachedMeta.data.splice(start, count);
	}


	/**
	 * @private
	 */
	_onDataPush() {
		const count = arguments.length;
		this._insertElements(this.getDataset().data.length - count, count);
	}

	/**
	 * @private
	 */
	_onDataPop() {
		this._removeElements(this._cachedMeta.data.length - 1, 1);
	}

	/**
	 * @private
	 */
	_onDataShift() {
		this._removeElements(0, 1);
	}

	/**
	 * @private
	 */
	_onDataSplice(start, count) {
		this._removeElements(start, count);
		this._insertElements(start, arguments.length - 2);
	}

	/**
	 * @private
	 */
	_onDataUnshift() {
		this._insertElements(0, arguments.length);
	}
}

/**
 * Element type used to generate a meta dataset (e.g. Chart.element.Line).
 */
DatasetController.prototype.datasetElementType = null;

/**
 * Element type used to generate a meta data (e.g. Chart.element.Point).
 */
DatasetController.prototype.dataElementType = null;

/**
 * Dataset element option keys to be resolved in resolveDatasetElementOptions.
 * A derived controller may override this to resolve controller-specific options.
 * The keys defined here are for backward compatibility for legend styles.
 * @type {string[]}
 */
DatasetController.prototype.datasetElementOptions = [
	'backgroundColor',
	'borderCapStyle',
	'borderColor',
	'borderDash',
	'borderDashOffset',
	'borderJoinStyle',
	'borderWidth'
];

/**
 * Data element option keys to be resolved in resolveDataElementOptions.
 * A derived controller may override this to resolve controller-specific options.
 * The keys defined here are for backward compatibility for legend styles.
 * @type {string[]|object}
 */
DatasetController.prototype.dataElementOptions = [
	'backgroundColor',
	'borderColor',
	'borderWidth',
	'pointStyle'
];
