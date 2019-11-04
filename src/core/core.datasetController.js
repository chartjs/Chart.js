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
		if (!isNaN(otherValue) && (value === 0 || Math.sign(value) === Math.sign(otherValue))) {
			value += otherValue;
		}
	}
	return value;
}

function convertObjectDataToArray(data) {
	var keys = Object.keys(data);
	var adata = [];
	var i, ilen, key;
	for (i = 0, ilen = keys.length; i < ilen; ++i) {
		key = keys[i];
		adata.push({
			x: key,
			y: data[key]
		});
	}
	return adata;
}

function isStacked(scale, meta) {
	var stacked = scale && scale.options.stacked;
	return stacked || (stacked === undefined && meta.stack !== undefined);
}

function getStackKey(xScale, yScale, meta) {
	return isStacked(yScale, meta) && xScale.id + '.' + yScale.id + '.' + meta.stack + '.' + meta.type;
}

function arraysEqual(array1, array2) {
	var ilen = array1.length;
	var i;

	if (ilen !== array2.length) {
		return false;
	}

	for (i = 0; i < ilen; i++) {
		if (array1[i] !== array2[i]) {
			return false;
		}
	}
	return true;
}

function getFirstScaleId(chart, axis) {
	var scalesOpts = chart.options.scales;
	var scale = chart.options.scale;
	var scaleId = scale && scale.id;
	var prop = axis + 'Axes';

	return (scalesOpts && scalesOpts[prop] && scalesOpts[prop].length && scalesOpts[prop][0].id) || scaleId;
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
		var me = this;
		var meta;
		me.chart = chart;
		me.index = datasetIndex;
		me._cachedMeta = meta = me.getMeta();
		me._type = meta.type;
		me.linkScales();
		meta._stacked = isStacked(me._getValueScale(), meta);
		me.addElements();
	},

	updateIndex: function(datasetIndex) {
		this.index = datasetIndex;
	},

	linkScales: function() {
		var chart = this.chart;
		var meta = this._cachedMeta;
		var dataset = this.getDataset();

		meta.xAxisID = dataset.xAxisID || getFirstScaleId(chart, 'x');
		meta.yAxisID = dataset.yAxisID || getFirstScaleId(chart, 'y');
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

	createMetaDataset: function() {
		var me = this;
		var type = me.datasetElementType;
		return type && new type({
			_ctx: me.chart.ctx,
			_datasetIndex: me.index
		});
	},

	createMetaData: function(index) {
		var me = this;
		var type = me.dataElementType;
		return type && new type({
			_ctx: me.chart.ctx,
			_datasetIndex: me.index,
			_index: index,
			_parsed: {}
		});
	},

	/**
	 * @private
	 */
	_dataCheck: function() {
		var me = this;
		var dataset = me.getDataset();
		var data = dataset.data || (dataset.data = []);

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
			if (me._data === data && arraysEqual(data, me._dataCopy)) {
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
		var me = this;
		var scale = me._getIndexScale();
		var labels = scale ? scale._getLabels() : me.chart.data.labels;

		if (me._labels === labels) {
			return false;
		}

		me._labels = labels;
		return true;
	},

	addElements: function() {
		var me = this;
		var meta = me._cachedMeta;
		var metaData = meta.data;
		var i, ilen, data;

		me._dataCheck();
		data = me._data;

		for (i = 0, ilen = data.length; i < ilen; ++i) {
			metaData[i] = metaData[i] || me.createMetaData(i);
		}

		meta.dataset = meta.dataset || me.createMetaDataset();
	},

	addElementAndReset: function(index) {
		var element = this.createMetaData(index);
		this._cachedMeta.data.splice(index, 0, element);
		this.updateElement(element, index, true);
	},

	buildOrUpdateElements: function() {
		var me = this;
		var dataChanged = me._dataCheck();
		var labelsChanged = me._labelCheck();
		var scaleChanged = me._scaleCheck();
		var meta = me._cachedMeta;

		// make sure cached _stacked status is current
		meta._stacked = isStacked(me._getValueScale(), meta);

		// Re-sync meta data in case the user replaced the data array or if we missed
		// any updates and so make sure that we handle number of datapoints changing.
		me.resyncElements(dataChanged | labelsChanged | scaleChanged);
	},

	/**
	 * Returns the merged user-supplied and default dataset-level options
	 * @private
	 */
	_configure: function() {
		var me = this;
		me._config = helpers.merge({}, [
			me.chart.options.datasets[me._type],
			me.getDataset(),
		], {
			merger: function(key, target, source) {
				if (key !== '_meta' && key !== 'data') {
					helpers._merger(key, target, source);
				}
			}
		});
	},

	/**
	 * @private
	 */
	_parse: function(start, count) {
		var me = this;
		var chart = me.chart;
		var meta = me._cachedMeta;
		var data = me._data;
		var crossRef = chart._xref || (chart._xref = {});
		var xScale = me._getIndexScale();
		var yScale = me._getValueScale();
		var xId = xScale.id;
		var yId = yScale.id;
		var xKey = getStackKey(xScale, yScale, meta);
		var yKey = getStackKey(yScale, xScale, meta);
		var stacks = xKey || yKey;
		var i, ilen, parsed, stack, item, x, y;

		if (helpers.isArray(data[start])) {
			parsed = me._parseArrayData(meta, data, start, count);
		} else if (helpers.isObject(data[start])) {
			parsed = me._parseObjectData(meta, data, start, count);
		} else {
			parsed = me._parsePrimitiveData(meta, data, start, count);
		}

		function storeStack(stackKey, indexValue, scaleId, value) {
			if (stackKey) {
				stackKey += '.' + indexValue;
				item._stackKeys[scaleId] = stackKey;
				stack = crossRef[stackKey] || (crossRef[stackKey] = {});
				stack[meta.index] = value;
			}
		}

		for (i = 0, ilen = parsed.length; i < ilen; ++i) {
			item = parsed[i];
			meta.data[start + i]._parsed = item;

			if (stacks) {
				item._stackKeys = {};
				x = item[xId];
				y = item[yId];

				storeStack(xKey, x, yId, y);
				storeStack(yKey, y, xId, x);
			}
		}

		xScale._invalidateCaches();
		if (yScale !== xScale) {
			yScale._invalidateCaches();
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
		var iScale = this._getIndexScale();
		var vScale = this._getValueScale();
		var labels = iScale._getLabels();
		var singleScale = iScale === vScale;
		var parsed = [];
		var i, ilen, item;

		for (i = start, ilen = start + count; i < ilen; ++i) {
			item = {};
			item[iScale.id] = singleScale || iScale._parse(labels[i], i);
			item[vScale.id] = vScale._parse(data[i], i);
			parsed.push(item);
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
		var xScale = this.getScaleForId(meta.xAxisID);
		var yScale = this.getScaleForId(meta.yAxisID);
		var parsed = [];
		var i, ilen, item, arr;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			arr = data[i];
			item = {};
			item[xScale.id] = xScale._parse(arr[0], i);
			item[yScale.id] = yScale._parse(arr[1], i);
			parsed.push(item);
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
		var xScale = this.getScaleForId(meta.xAxisID);
		var yScale = this.getScaleForId(meta.yAxisID);
		var parsed = [];
		var i, ilen, item, obj;
		for (i = start, ilen = start + count; i < ilen; ++i) {
			obj = data[i];
			item = {};
			item[xScale.id] = xScale._parseObject(obj, 'x', i);
			item[yScale.id] = yScale._parseObject(obj, 'y', i);
			parsed.push(item);
		}
		return parsed;
	},

	/**
	 * @private
	 */
	_getParsed: function(index) {
		var data = this._cachedMeta.data;
		if (index < 0 || index >= data.length) {
			return;
		}
		return data[index]._parsed;
	},

	/**
	 * @private
	 */
	_applyStack: function(scale, parsed) {
		var chart = this.chart;
		var meta = this._cachedMeta;
		var value = parsed[scale.id];
		var stack = {
			keys: getSortedDatasetIndices(chart, true),
			values: chart._xref[parsed._stackKeys[scale.id]]
		};
		return applyStack(stack, value, meta.index);
	},

	_getMinMax: function(scale, canStack) {
		var chart = this.chart;
		var meta = this._cachedMeta;
		var metaData = meta.data;
		var ilen = metaData.length;
		var crossRef = chart._xref || (chart._xref = {});
		var max = Number.NEGATIVE_INFINITY;
		var stacked = canStack && meta._stacked;
		var indices = getSortedDatasetIndices(chart, true);
		var i, item, value, parsed, stack, min, minPositive;

		min = minPositive = Number.POSITIVE_INFINITY;

		for (i = 0; i < ilen; ++i) {
			item = metaData[i];
			parsed = item._parsed;
			value = parsed[scale.id];
			if (item.hidden || isNaN(value)) {
				continue;
			}
			if (stacked) {
				stack = {
					keys: indices,
					values: crossRef[parsed._stackKeys[scale.id]]
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

	_getAllParsedValues: function(scale) {
		var meta = this._cachedMeta;
		var metaData = meta.data;
		var values = [];
		var i, ilen, value;

		for (i = 0, ilen = metaData.length; i < ilen; ++i) {
			value = metaData[i]._parsed[scale.id];
			if (!isNaN(value)) {
				values.push(value);
			}
		}
		return values;
	},

	_cacheScaleStackStatus: function() {
		var me = this;
		var indexScale = me._getIndexScale();
		var valueScale = me._getValueScale();
		var cache = me._scaleStacked = {};
		if (indexScale && valueScale) {
			cache[indexScale.id] = indexScale.options.stacked;
			cache[valueScale.id] = valueScale.options.stacked;
		}
	},

	_scaleCheck: function() {
		var me = this;
		var indexScale = me._getIndexScale();
		var valueScale = me._getValueScale();
		var cache = me._scaleStacked;
		return !cache ||
			!indexScale ||
			!valueScale ||
			cache[indexScale.id] !== indexScale.options.stacked ||
			cache[valueScale.id] !== valueScale.options.stacked;
	},

	_update: function(reset) {
		var me = this;
		me._configure();
		me._cachedDataOpts = null;
		me.update(reset);
		me._cacheScaleStackStatus();
	},

	update: helpers.noop,

	transition: function(easingValue) {
		var meta = this._cachedMeta;
		var elements = meta.data || [];
		var ilen = elements.length;
		var i = 0;

		for (; i < ilen; ++i) {
			elements[i].transition(easingValue);
		}

		if (meta.dataset) {
			meta.dataset.transition(easingValue);
		}
	},

	draw: function() {
		var meta = this._cachedMeta;
		var elements = meta.data || [];
		var ilen = elements.length;
		var i = 0;

		if (meta.dataset) {
			meta.dataset.draw();
		}

		for (; i < ilen; ++i) {
			elements[i].draw();
		}
	},

	/**
	 * Returns a set of predefined style properties that should be used to represent the dataset
	 * or the data if the index is specified
	 * @param {number} index - data index
	 * @return {IStyleInterface} style object
	 */
	getStyle: function(index) {
		var me = this;
		var meta = me._cachedMeta;
		var dataset = meta.dataset;
		var style;

		me._configure();
		if (dataset && index === undefined) {
			style = me._resolveDatasetElementOptions();
		} else {
			index = index || 0;
			style = me._resolveDataElementOptions(index);
		}

		if (style.fill === false || style.fill === null) {
			style.backgroundColor = 'rgba(0,0,0,0)';
		}

		return style;
	},

	/**
	 * @private
	 */
	_resolveDatasetElementOptions: function(hover) {
		var me = this;
		var chart = me.chart;
		var datasetOpts = me._config;
		var options = chart.options.elements[me.datasetElementType.prototype._type] || {};
		var elementOptions = me._datasetElementOptions;
		var values = {};
		var i, ilen, key, readKey;

		// Scriptable options
		var context = {
			chart: chart,
			dataset: me.getDataset(),
			datasetIndex: me.index,
			hover: hover
		};

		for (i = 0, ilen = elementOptions.length; i < ilen; ++i) {
			key = elementOptions[i];
			readKey = hover ? 'hover' + key.charAt(0).toUpperCase() + key.slice(1) : key;
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
		var me = this;
		var cached = me._cachedDataOpts;
		if (cached) {
			return cached;
		}
		var chart = me.chart;
		var datasetOpts = me._config;
		var options = chart.options.elements[me.dataElementType.prototype._type] || {};
		var elementOptions = me._dataElementOptions;
		var values = {};

		// Scriptable options
		var context = {
			chart: chart,
			dataIndex: index,
			dataset: me.getDataset(),
			datasetIndex: me.index
		};

		// `resolve` sets cacheable to `false` if any option is indexed or scripted
		var info = {cacheable: true};

		var keys, i, ilen, key;

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

	setHoverStyle: function(element) {
		var dataset = this.chart.data.datasets[element._datasetIndex];
		var index = element._index;
		var model = element._model;
		var getHoverColor = helpers.getHoverColor;

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
		var element = this.getMeta().dataset;

		if (element) {
			this.removeHoverStyle(element);
		}
	},

	/**
	 * @private
	 */
	_setDatasetHoverStyle: function() {
		var element = this.getMeta().dataset;
		var prev = {};
		var i, ilen, key, keys, hoverOptions, model;

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
		var me = this;
		var meta = me._cachedMeta;
		var numMeta = meta.data.length;
		var numData = me._data.length;

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
		for (var i = 0; i < count; ++i) {
			this.addElementAndReset(start + i);
		}
		this._parse(start, count);
	},

	/**
	 * @private
	 */
	onDataPush: function() {
		var count = arguments.length;
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
