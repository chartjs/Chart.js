'use strict';

var helpers = require('../helpers/index');

var resolve = helpers.options.resolve;

var arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'];

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the 'onData*' callbacks (e.g. onDataPush, etc.) with same arguments.
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

	arrayEvents.forEach(function(key) {
		var method = 'onData' + key.charAt(0).toUpperCase() + key.slice(1);
		var base = array[key];

		Object.defineProperty(array, key, {
			configurable: true,
			enumerable: false,
			value: function() {
				var args = Array.prototype.slice.call(arguments);
				var res = base.apply(this, args);

				helpers.each(array._chartjs.listeners, function(object) {
					if (typeof object[method] === 'function') {
						object[method].apply(object, args);
					}
				});

				return res;
			}
		});
	});
}

function scaleClip(scale, allowedOverflow) {
	var opts = scale && scale.options || {};
	var reverse = opts.reverse;
	var min = opts.min === undefined ? allowedOverflow : 0;
	var max = opts.max === undefined ? allowedOverflow : 0;
	return {
		start: reverse ? max : min,
		end: reverse ? min : max
	};
}

function defaultClip(xScale, yScale, allowedOverflow) {
	if (allowedOverflow === false) {
		return false;
	}
	var x = scaleClip(xScale, allowedOverflow);
	var y = scaleClip(yScale, allowedOverflow);

	return {
		top: y.end,
		right: x.end,
		bottom: y.start,
		left: x.start
	};
}

function toClip(value) {
	var t, r, b, l;

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
	var stub = array._chartjs;
	if (!stub) {
		return;
	}

	var listeners = stub.listeners;
	var index = listeners.indexOf(listener);
	if (index !== -1) {
		listeners.splice(index, 1);
	}

	if (listeners.length > 0) {
		return;
	}

	arrayEvents.forEach(function(key) {
		delete array[key];
	});

	delete array._chartjs;
}

function getSortedDatasetIndices(chart, filterVisible) {
	var keys = [];
	var metasets = chart._getSortedDatasetMetas(filterVisible);
	var i, ilen;

	for (i = 0, ilen = metasets.length; i < ilen; ++i) {
		keys.push(metasets[i].index);
	}
	return keys;
}

function applyStack(stack, value, dsIndex, allOther) {
	var keys = stack.keys;
	var i, ilen, datasetIndex, otherValue;

	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		datasetIndex = +keys[i];
		if (datasetIndex === dsIndex) {
			if (allOther) {
				continue;
			}
			break;
		}
		otherValue = stack.values[datasetIndex];
		if (!isNaN(otherValue) && (value === 0 || helpers.sign(value) === helpers.sign(otherValue))) {
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
	var stacked = scale && scale.options.stacked;
	return stacked || (stacked === undefined && meta.stack !== undefined);
}

function getStackKey(indexScale, valueScale, meta) {
	return indexScale.id + '.' + valueScale.id + '.' + meta.stack + '.' + meta.type;
}

function getUserBounds(scale) {
	var {min, max, minDefined, maxDefined} = scale._getUserBounds();
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
	const iId = iScale.id;
	const vId = vScale.id;
	const key = getStackKey(iScale, vScale, meta);
	const ilen = parsed.length;
	let stack;

	for (let i = 0; i < ilen; ++i) {
		const item = parsed[i];
		const {[iId]: index, [vId]: value} = item;
		const itemStacks = item._stacks || (item._stacks = {});
		stack = itemStacks[vId] = getOrCreateStack(stacks, key, index);
		stack[datasetIndex] = value;
	}
}

function getFirstScaleId(chart, axis) {
	const scales = chart.scales;
	return Object.keys(scales).filter(key => {
		return scales[key].axis === axis;
	}).shift();
}

// Base class for all dataset controllers (line, bar, etc)
var DatasetController = function(chart, datasetIndex) {
	this.initialize(chart, datasetIndex);
};

helpers.extend(DatasetController.prototype, {

	/**
	 * Element type used to generate a meta dataset (e.g. Chart.element.Line).
	 * @type {Chart.core.element}
	 */
	datasetElementType: null,

	/**
	 * Element type used to generate a meta data (e.g. Chart.element.Point).
	 * @type {Chart.core.element}
	 */
	dataElementType: null,

	/**
	 * Dataset element option keys to be resolved in _resolveDatasetElementOptions.
	 * A derived controller may override this to resolve controller-specific options.
	 * The keys defined here are for backward compatibility for legend styles.
	 * @private
	 */
	_datasetElementOptions: [
		'backgroundColor',
		'borderCapStyle',
		'borderColor',
		'borderDash',
		'borderDashOffset',
		'borderJoinStyle',
		'borderWidth'
	],

	/**
	 * Data element option keys to be resolved in _resolveDataElementOptions.
	 * A derived controller may override this to resolve controller-specific options.
	 * The keys defined here are for backward compatibility for legend styles.
	 * @private
	 */
	_dataElementOptions: [
		'backgroundColor',
		'borderColor',
		'borderWidth',
		'pointStyle'
	],

	initialize: function(chart, datasetIndex) {
		const me = this;
		let meta;
		me.chart = chart;
		me._ctx = chart.ctx;
		me.index = datasetIndex;
		me._cachedMeta = meta = me.getMeta();
		me._type = meta.type;
		me.linkScales();
		meta._stacked = isStacked(meta.vScale, meta);
		me.addElements();
	},

	updateIndex: function(datasetIndex) {
		this.index = datasetIndex;
	},

	linkScales: function() {
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
	},

	getDataset: function() {
		return this.chart.data.datasets[this.index];
	},

	getMeta: function() {
		return this.chart.getDatasetMeta(this.index);
	},

	getScaleForId: function(scaleID) {
		return this.chart.scales[scaleID];
	},

	/**
	 * @private
	 */
	_getValueScaleId: function() {
		return this._cachedMeta.yAxisID;
	},

	/**
	 * @private
	 */
	_getIndexScaleId: function() {
		return this._cachedMeta.xAxisID;
	},

	/**
	 * @private
	 */
	_getValueScale: function() {
		return this.getScaleForId(this._getValueScaleId());
	},

	/**
	 * @private
	 */
	_getIndexScale: function() {
		return this.getScaleForId(this._getIndexScaleId());
	},

	/**
	 * @private
	 */
	_getOtherScale: function(scale) {
		const meta = this._cachedMeta;
		return scale === meta.iScale
			? meta.vScale
			: meta.iScale;
	},

	reset: function() {
		this._update(true);
	},

	/**
	 * @private
	 */
	destroy: function() {
		if (this._data) {
			unlistenArrayEvents(this._data, this);
		}
	},

	/**
	 * @private
	 */
	_dataCheck: function() {
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
	},

	/**
	 * @private
	 */
	_labelCheck: function() {
		const me = this;
		const iScale = me._cachedMeta.iScale;
		const labels = iScale ? iScale._getLabels() : me.chart.data.labels;

		if (me._labels === labels) {
			return false;
		}

		me._labels = labels;
		return true;
	},

	addElements: function() {
		const me = this;
		const meta = me._cachedMeta;
		let i, ilen, data;

		me._dataCheck();
		data = me._data;
		const metaData = meta.data = new Array(data.length);

		for (i = 0, ilen = data.length; i < ilen; ++i) {
			metaData[i] = new me.dataElementType();
		}

		if (me.datasetElementType) {
			meta.dataset = new me.datasetElementType();
		}
	},

	buildOrUpdateElements: function() {
		const me = this;
		const dataChanged = me._dataCheck();
		const labelsChanged = me._labelCheck();
		const scaleChanged = me._scaleCheck();
		const meta = me._cachedMeta;

		// make sure cached _stacked status is current
		meta._stacked = isStacked(meta.vScale, meta);

		// Re-sync meta data in case the user replaced the data array or if we missed
		// any updates and so make sure that we handle number of datapoints changing.
		me.resyncElements(dataChanged | labelsChanged | scaleChanged);
	},

	/**
	 * Returns the merged user-supplied and default dataset-level options
	 * @private
	 */
	_configure: function() {
		const me = this;
		me._config = helpers.merge({}, [
			me.chart.options.datasets[me._type],
			me.getDataset(),
		], {
			merger: function(key, target, source) {
				if (key !== 'data') {
					helpers._merger(key, target, source);
				}
			}
		});
	},

	/**
	 * @private
	 */
	_parse: function(start, count) {
		const me = this;
		const {_cachedMeta: meta, _data: data} = me;
		const {iScale, vScale, _stacked} = meta;
		const parsing = resolve([me.getDataset().parsing, me.chart.options.parsing, true]);
		let offset = 0;
		let i, parsed;

		if (parsing === false) {
			meta._parsed = data;
		} else {
			if (helpers.isArray(data[start])) {
				parsed = me._parseArrayData(meta, data, start, count);
			} else if (helpers.isObject(data[start])) {
				parsed = me._parseObjectData(meta, data, start, count);
			} else {
				parsed = me._parsePrimitiveData(meta, data, start, count);
			}

			for (i = 0; i < count; ++i) {
				meta._parsed[i + start] = parsed[i + offset];
			}
		}

		if (_stacked) {
			updateStacks(me, parsed);
		}

		iScale._invalidateCaches();
		if (vScale !== iScale) {
			vScale._invalidateCaches();
		}
	},

	/**
	 * Parse array of primitive values
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [1,3,4]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {xScale0: 0, yScale0: 1}
	 * @private
	 */
	_parsePrimitiveData: function(meta, data, start, count) {
		const {iScale, vScale} = meta;
		const iId = iScale.id;
		const vId = vScale.id;
		const labels = iScale._getLabels();
		const singleScale = iScale === vScale;
		const parsed = new Array(count);
		let i, ilen, index;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			parsed[i] = {
				[iId]: singleScale || iScale._parse(labels[index], index),
				[vId]: vScale._parse(data[index], index)
			};
		}
		return parsed;
	},

	/**
	 * Parse array of arrays
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [[1,2],[3,4]]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id.
	 * Example: {xScale0: 0, yScale0: 1}
	 * @private
	 */
	_parseArrayData: function(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const xId = xScale.id;
		const yId = yScale.id;
		const parsed = new Array(count);
		let i, ilen, index, item;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				[xId]: xScale._parse(item[0], index),
				[yId]: yScale._parse(item[1], index)
			};
		}
		return parsed;
	},

	/**
	 * Parse array of objects
	 * @param {object} meta - dataset meta
	 * @param {array} data - data array. Example [{x:1, y:5}, {x:2, y:10}]
	 * @param {number} start - start index
	 * @param {number} count - number of items to parse
	 * @returns {object} parsed item - item containing index and a parsed value
	 * for each scale id. _custom is optional
	 * Example: {xScale0: 0, yScale0: 1, _custom: {r: 10, foo: 'bar'}}
	 * @private
	 */
	_parseObjectData: function(meta, data, start, count) {
		const {xScale, yScale} = meta;
		const xId = xScale.id;
		const yId = yScale.id;
		const parsed = new Array(count);
		let i, ilen, index, item;

		for (i = 0, ilen = count; i < ilen; ++i) {
			index = i + start;
			item = data[index];
			parsed[i] = {
				[xId]: xScale._parseObject(item, 'x', index),
				[yId]: yScale._parseObject(item, 'y', index)
			};
		}
		return parsed;
	},

	/**
	 * @private
	 */
	_getParsed: function(index) {
		const data = this._cachedMeta._parsed;
		if (index < 0 || index >= data.length) {
			return;
		}
		return data[index];
	},

	/**
	 * @private
	 */
	_applyStack: function(scale, parsed) {
		const chart = this.chart;
		const meta = this._cachedMeta;
		const value = parsed[scale.id];
		const stack = {
			keys: getSortedDatasetIndices(chart, true),
			values: parsed._stacks[scale.id]
		};
		return applyStack(stack, value, meta.index);
	},

	/**
	 * @private
	 */
	_getMinMax: function(scale, canStack) {
		const chart = this.chart;
		const meta = this._cachedMeta;
		const metaData = meta.data;
		const ilen = metaData.length;
		const stacked = canStack && meta._stacked;
		const indices = getSortedDatasetIndices(chart, true);
		const otherScale = this._getOtherScale(scale);
		let max = Number.NEGATIVE_INFINITY;
		let {min: otherMin, max: otherMax} = getUserBounds(otherScale);
		let i, item, value, parsed, stack, min, minPositive, otherValue;

		min = minPositive = Number.POSITIVE_INFINITY;

		for (i = 0; i < ilen; ++i) {
			item = metaData[i];
			parsed = meta._parsed[i];
			value = parsed[scale.id];
			otherValue = parsed[otherScale.id];
			if (item.hidden || isNaN(value) ||
				otherMin > otherValue || otherMax < otherValue) {
				continue;
			}
			if (stacked) {
				stack = {
					keys: indices,
					values: parsed._stacks[scale.id]
				};
				value = applyStack(stack, value, meta.index, true);
			}
			min = Math.min(min, value);
			max = Math.max(max, value);
			if (value > 0) {
				minPositive = Math.min(minPositive, value);
			}
		}
		return {
			min: min,
			max: max,
			minPositive: minPositive
		};
	},

	/**
	 * @private
	 */
	_getAllParsedValues: function(scale) {
		const parsed = this._cachedMeta._parsed;
		const values = [];
		let i, ilen, value;

		for (i = 0, ilen = parsed.length; i < ilen; ++i) {
			value = parsed[i][scale.id];
			if (!isNaN(value)) {
				values.push(value);
			}
		}
		return values;
	},

	/**
	 * @private
	 */
	_cacheScaleStackStatus: function() {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const cache = me._scaleStacked = {};
		if (iScale && vScale) {
			cache[iScale.id] = iScale.options.stacked;
			cache[vScale.id] = vScale.options.stacked;
		}
	},

	/**
	 * @private
	 */
	_scaleCheck: function() {
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
	},

	/**
	 * @private
	 */
	_getMaxOverflow: function() {
		return false;
	},

	/**
	 * @private
	 */
	_getLabelAndValue: function(index) {
		const me = this;
		const meta = me._cachedMeta;
		const iScale = meta.iScale;
		const vScale = meta.vScale;
		const parsed = me._getParsed(index);
		return {
			label: iScale ? '' + iScale.getLabelForValue(parsed[iScale.id]) : '',
			value: vScale ? '' + vScale.getLabelForValue(parsed[vScale.id]) : ''
		};
	},

	/**
	 * @private
	 */
	_update: function(reset) {
		const me = this;
		const meta = me._cachedMeta;
		me._configure();
		me._cachedDataOpts = null;
		me.update(reset);
		meta._clip = toClip(helpers.valueOrDefault(me._config.clip, defaultClip(meta.xScale, meta.yScale, me._getMaxOverflow())));
		me._cacheScaleStackStatus();
	},

	update: helpers.noop,

	transition: function(easingValue) {
		const meta = this._cachedMeta;
		const elements = meta.data || [];
		const ilen = elements.length;
		let i = 0;

		for (; i < ilen; ++i) {
			elements[i].transition(easingValue);
		}

		if (meta.dataset) {
			meta.dataset.transition(easingValue);
		}
	},

	draw: function() {
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
	},

	/**
	 * Returns a set of predefined style properties that should be used to represent the dataset
	 * or the data if the index is specified
	 * @param {number} index - data index
	 * @return {IStyleInterface} style object
	 */
	getStyle: function(index) {
		const me = this;
		const meta = me._cachedMeta;
		const dataset = meta.dataset;
		let style;

		me._configure();
		if (dataset && index === undefined) {
			style = me._resolveDatasetElementOptions();
		} else {
			index = index || 0;
			style = me._resolveDataElementOptions(index);
		}

		if (style.fill === false || style.fill === null) {
			style.backgroundColor = style.borderColor;
		}

		return style;
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function(active) {
		const me = this;
		const chart = me.chart;
		const datasetOpts = me._config;
		const options = chart.options.elements[me.datasetElementType.prototype._type] || {};
		const elementOptions = me._datasetElementOptions;
		const values = {};
		const context = {
			chart,
			dataset: me.getDataset(),
			datasetIndex: me.index,
			active
		};
		let i, ilen, key, readKey;

		for (i = 0, ilen = elementOptions.length; i < ilen; ++i) {
			key = elementOptions[i];
			readKey = active ? 'hover' + key.charAt(0).toUpperCase() + key.slice(1) : key;
			values[key] = resolve([
				datasetOpts[readKey],
				options[readKey]
			], context);
		}

		return values;
	},

	/**
	 * @private
	 */
	_resolveDataElementOptions: function(index) {
		const me = this;
		const cached = me._cachedDataOpts;
		if (cached) {
			return cached;
		}
		const chart = me.chart;
		const datasetOpts = me._config;
		const options = chart.options.elements[me.dataElementType.prototype._type] || {};
		const elementOptions = me._dataElementOptions;
		const values = {};
		const context = {
			chart: chart,
			dataIndex: index,
			dataset: me.getDataset(),
			datasetIndex: me.index
		};
		const info = {cacheable: true};
		let keys, i, ilen, key;

		if (helpers.isArray(elementOptions)) {
			for (i = 0, ilen = elementOptions.length; i < ilen; ++i) {
				key = elementOptions[i];
				values[key] = resolve([
					datasetOpts[key],
					options[key]
				], context, index, info);
			}
		} else {
			keys = Object.keys(elementOptions);
			for (i = 0, ilen = keys.length; i < ilen; ++i) {
				key = keys[i];
				values[key] = resolve([
					datasetOpts[elementOptions[key]],
					datasetOpts[key],
					options[key]
				], context, index, info);
			}
		}

		if (info.cacheable) {
			me._cachedDataOpts = Object.freeze(values);
		}

		return values;
	},

	removeHoverStyle: function(element) {
		helpers.merge(element._model, element.$previousStyle || {});
		delete element.$previousStyle;
	},

	setHoverStyle: function(element, datasetIndex, index) {
		const dataset = this.chart.data.datasets[datasetIndex];
		const model = element._model;
		const getHoverColor = helpers.getHoverColor;

		element.$previousStyle = {
			backgroundColor: model.backgroundColor,
			borderColor: model.borderColor,
			borderWidth: model.borderWidth
		};

		model.backgroundColor = resolve([dataset.hoverBackgroundColor, getHoverColor(model.backgroundColor)], undefined, index);
		model.borderColor = resolve([dataset.hoverBorderColor, getHoverColor(model.borderColor)], undefined, index);
		model.borderWidth = resolve([dataset.hoverBorderWidth, model.borderWidth], undefined, index);
	},

	/**
	 * @private
	 */
	_removeDatasetHoverStyle: function() {
		const element = this._cachedMeta.dataset;

		if (element) {
			this.removeHoverStyle(element);
		}
	},

	/**
	 * @private
	 */
	_setDatasetHoverStyle: function() {
		const element = this._cachedMeta.dataset;
		const prev = {};
		let i, ilen, key, keys, hoverOptions, model;

		if (!element) {
			return;
		}

		model = element._model;
		hoverOptions = this._resolveDatasetElementOptions(true);

		keys = Object.keys(hoverOptions);
		for (i = 0, ilen = keys.length; i < ilen; ++i) {
			key = keys[i];
			prev[key] = model[key];
			model[key] = hoverOptions[key];
		}

		element.$previousStyle = prev;
	},

	/**
	 * @private
	 */
	resyncElements: function(changed) {
		const me = this;
		const meta = me._cachedMeta;
		const numMeta = meta.data.length;
		const numData = me._data.length;

		if (numData > numMeta) {
			me.insertElements(numMeta, numData - numMeta);
		} else if (numData < numMeta) {
			meta.data.splice(numData, numMeta - numData);
			me._parse(0, numData);
		} else if (changed) {
			me._parse(0, numData);
		}
	},

	/**
	 * @private
	 */
	insertElements: function(start, count) {
		const me = this;
		const elements = new Array(count);
		const data = me._cachedMeta.data;
		let i;

		for (i = 0; i < count; ++i) {
			elements[i] = new me.dataElementType();
		}
		data.splice(start, 0, ...elements);

		me._parse(start, count);
		me.updateElements(data, start, count);
	},

	/**
	 * @private
	 */
	onDataPush: function() {
		const count = arguments.length;
		this.insertElements(this.getDataset().data.length - count, count);
	},

	/**
	 * @private
	 */
	onDataPop: function() {
		this._cachedMeta.data.pop();
	},

	/**
	 * @private
	 */
	onDataShift: function() {
		this._cachedMeta.data.shift();
	},

	/**
	 * @private
	 */
	onDataSplice: function(start, count) {
		this._cachedMeta.data.splice(start, count);
		this.insertElements(start, arguments.length - 2);
	},

	/**
	 * @private
	 */
	onDataUnshift: function() {
		this.insertElements(0, arguments.length);
	}
});

DatasetController.extend = helpers.inherits;

module.exports = DatasetController;
