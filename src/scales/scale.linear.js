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
		var datasets = chart.data.datasets;
		var isHorizontal = me.isHorizontal();
		var DEFAULT_MIN = 0;
		var DEFAULT_MAX = 1;
		var datasetIndex, meta, value, data, i, ilen;

		function IDMatches(datasetMeta) {
			return isHorizontal ? datasetMeta.xAxisID === me.id : datasetMeta.yAxisID === me.id;
		}

		// First Calculate the range
		me.min = Number.POSITIVE_INFINITY;
		me.max = Number.NEGATIVE_INFINITY;

		var hasStacks = opts.stacked;
		if (hasStacks === undefined) {
			for (datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
				meta = chart.getDatasetMeta(datasetIndex);
				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta) && meta.stack !== undefined) {
					hasStacks = true;
					break;
				}
			}
		}

		if (opts.stacked || hasStacks) {
			var valuesPerStack = {};

			for (datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
				meta = chart.getDatasetMeta(datasetIndex);
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
					data = datasets[datasetIndex].data;
					for (i = 0, ilen = data.length; i < ilen; i++) {
						value = me._parseValue(data[i]);

						if (isNaN(value.min) || isNaN(value.max) || meta.data[i].hidden) {
							continue;
						}

						positiveValues[i] = positiveValues[i] || 0;
						negativeValues[i] = negativeValues[i] || 0;

						if (value.min === 0 && !opts.ticks.beginAtZero) {
							value.min = value.max;
						}

						if (opts.relativePoints) {
							positiveValues[i] = 100;
						} else if (value.min < 0 || value.max < 0) {
							negativeValues[i] += value.min;
						} else {
							positiveValues[i] += value.max;
						}
					}
				}
			}

			helpers.each(valuesPerStack, function(valuesForType) {
				var values = valuesForType.positiveValues.concat(valuesForType.negativeValues);
				me.min = Math.min(me.min, helpers.min(values));
				me.max = Math.max(me.max, helpers.max(values));
			});

		} else {
			for (datasetIndex = 0; datasetIndex < datasets.length; datasetIndex++) {
				meta = chart.getDatasetMeta(datasetIndex);
				if (chart.isDatasetVisible(datasetIndex) && IDMatches(meta)) {
					data = datasets[datasetIndex].data;
					for (i = 0, ilen = data.length; i < ilen; i++) {
						value = me._parseValue(data[i]);

						if (isNaN(value.min) || isNaN(value.max) || meta.data[i].hidden) {
							continue;
						}

						me.min = Math.min(value.min, me.min);
						me.max = Math.max(value.max, me.max);
					}
				}
			}
		}

		me.min = helpers.isFinite(me.min) && !isNaN(me.min) ? me.min : DEFAULT_MIN;
		me.max = helpers.isFinite(me.max) && !isNaN(me.max) ? me.max : DEFAULT_MAX;

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
		return this._getScaleLabel(this.chart.data.datasets[datasetIndex].data[index]);
	},

	// Utils
	getPixelForValue: function(value) {
		var me = this;
		return me.getPixelForDecimal((+me.getRightValue(value) - me._startValue) / me._valueRange);
	},

	getValueForPixel: function(pixel) {
		return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	},

	getPixelForTick: function(index) {
		var ticks = this.ticksAsNumbers;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index]);
	}
});

// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
