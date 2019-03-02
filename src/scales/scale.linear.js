'use strict';

var helpers = require('../helpers/index');
var LinearScaleBase = require('./scale.linearbase');
var Ticks = require('../core/core.ticks');

var defaultConfig = {
	position: 'left',
	ticks: {
		callback: Ticks.formatters.linear
	}
};

module.exports = LinearScaleBase.extend({
	determineDataLimits: function() {
		var me = this;
		var opts = me.options;
		var chart = me.chart;
		var data = chart.data;
		var datasets = data.datasets;
		var isHorizontal = me.isHorizontal();
		var DEFAULT_MIN = 0;
		var DEFAULT_MAX = 1;

		function IDMatches(meta) {
			return isHorizontal ? meta.xAxisID === me.id : meta.yAxisID === me.id;
		}

		// First Calculate the range
		me.min = null;
		me.max = null;

		var hasStacks = opts.stacked;
		if (hasStacks === undefined) {
			helpers.each(datasets, function(dataset, datasetIndex) {
				if (hasStacks) {
					return;
				}

				var meta = chart.getDatasetMeta(datasetIndex);
				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) &&
					meta.stack !== undefined) {
					hasStacks = true;
				}
			});
		}

		if (opts.stacked || hasStacks) {
			var valuesPerStack = {};

			helpers.each(datasets, function(dataset, datasetIndex) {
				var meta = chart.getDatasetMeta(datasetIndex);
				var key = [
					meta.type,
					// we have a separate stack for stack=undefined datasets when the opts.stacked is undefined
					((opts.stacked === undefined && meta.stack === undefined) ? datasetIndex : ''),
					meta.stack
				].join('.');

				if (valuesPerStack[key] === undefined) {
					valuesPerStack[key] = {
						positiveValues: [],
						negativeValues: []
					};
				}

				// Store these per type
				var positiveValues = valuesPerStack[key].positiveValues;
				var negativeValues = valuesPerStack[key].negativeValues;

				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
					helpers.each(dataset.data, function(rawValue, index) {
						var value = me._getParsedValue(index, datasetIndex);
						if (isNaN(value) || meta.data[index].hidden) {
							return;
						}
						var otherScale = meta.controller.getScaleForId(meta.xAxisID === me.id ? meta.yAxisID : meta.xAxisID);
						var ivalue = otherScale._getParsedValue(index, datasetIndex);

						positiveValues[ivalue] = positiveValues[ivalue] || 0;
						negativeValues[ivalue] = negativeValues[ivalue] || 0;

						if (opts.relativePoints) {
							positiveValues[ivalue] = 100;
						} else if (value < 0) {
							negativeValues[ivalue] += value;
						} else {
							positiveValues[ivalue] += value;
						}
					});
				}
			});

			helpers.each(valuesPerStack, function(valuesForType) {
				var values = [];
				var i, ilen, keys;
				keys = Object.keys(valuesForType.positiveValues);
				for (i = 0, ilen = keys.length; i < ilen; ++i) {
					values.push(valuesForType.positiveValues[keys[i]]);
				}
				keys = Object.keys(valuesForType.negativeValues);
				for (i = 0, ilen = keys.length; i < ilen; ++i) {
					values.push(valuesForType.negativeValues[keys[i]]);
				}
				var minVal = helpers.min(values);
				var maxVal = helpers.max(values);
				me.min = me.min === null ? minVal : Math.min(me.min, minVal);
				me.max = me.max === null ? maxVal : Math.max(me.max, maxVal);
			});

		} else {
			helpers.each(datasets, function(dataset, datasetIndex) {
				var meta = chart.getDatasetMeta(datasetIndex);
				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
					helpers.each(meta.data, function(metaData, index) {
						var value = me._getParsedValue(index, datasetIndex);
						if (isNaN(value) || meta.data[index].hidden) {
							return;
						}

						if (me.min === null) {
							me.min = value;
						} else if (value < me.min) {
							me.min = value;
						}

						if (me.max === null) {
							me.max = value;
						} else if (value > me.max) {
							me.max = value;
						}
					});
				}
			});
		}

		me.min = isFinite(me.min) && !isNaN(me.min) ? me.min : DEFAULT_MIN;
		me.max = isFinite(me.max) && !isNaN(me.max) ? me.max : DEFAULT_MAX;

		// Common base implementation to handle ticks.min, ticks.max, ticks.beginAtZero
		this.handleTickRangeOptions();
	},

	// Returns the maximum number of ticks based on the scale dimension
	_computeTickLimit: function() {
		var me = this;
		var tickFont;

		if (me.isHorizontal()) {
			return Math.ceil(me.width / 40);
		}
		tickFont = helpers.options._parseFont(me.options.ticks);
		return Math.ceil(me.height / tickFont.lineHeight);
	},

	// Called after the ticks are built. We need
	handleDirectionalChanges: function() {
		if (!this.isHorizontal()) {
			// We are in a vertical orientation. The top value is the highest. So reverse the array
			this.ticks.reverse();
		}
	},

	getLabelForIndex: function(index, datasetIndex) {
		return this._getParsedValue(index, datasetIndex);
	},

	_getPixel: function(value) {
		// This must be called after fit has been run so that
		// this.left, this.top, this.right, and this.bottom have been defined
		var me = this;
		var start = me.start;

		var pixel;
		var range = me.end - start;

		if (me.isHorizontal()) {
			pixel = me.left + (me.width / range * (value - start));
		} else {
			pixel = me.bottom - (me.height / range * (value - start));
		}
		return pixel;
	},

	getPixelForValue: function(value) {
		return this._getPixel(value);
	},

	getValueForPixel: function(pixel) {
		var me = this;
		var isHorizontal = me.isHorizontal();
		var innerDimension = isHorizontal ? me.width : me.height;
		var offset = (isHorizontal ? pixel - me.left : me.bottom - pixel) / innerDimension;
		return me.start + ((me.end - me.start) * offset);
	},

	getPixelForTick: function(index) {
		return this.getPixelForValue(this.ticksAsNumbers[index]);
	}
});

// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
