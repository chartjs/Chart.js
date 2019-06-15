'use strict';

var helpers = require('../helpers/index');
var Scale = require('../core/core.scale');

var isNullOrUndef = helpers.isNullOrUndef;

var defaultConfig = {
	position: 'bottom'
};

module.exports = Scale.extend({
	determineDataLimits: function() {
		var me = this;
		var labels = me._getLabels();
		var ticksOpts = me.options.ticks;
		var min = ticksOpts.min;
		var max = ticksOpts.max;
		var minIndex = 0;
		var maxIndex = labels.length - 1;
		var findIndex;

		if (min !== undefined) {
			// user specified min value
			findIndex = labels.indexOf(min);
			if (findIndex >= 0) {
				minIndex = findIndex;
			}
		}

		if (max !== undefined) {
			// user specified max value
			findIndex = labels.indexOf(max);
			if (findIndex >= 0) {
				maxIndex = findIndex;
			}
		}

		me.minIndex = minIndex;
		me.maxIndex = maxIndex;
		me.min = labels[minIndex];
		me.max = labels[maxIndex];
	},

	buildTicks: function() {
		var me = this;
		var labels = me._getLabels();
		var minIndex = me.minIndex;
		var maxIndex = me.maxIndex;

		// If we are viewing some subset of labels, slice the original array
		var ticks = me.ticks = (minIndex === 0 && maxIndex === labels.length - 1) ? labels : labels.slice(minIndex, maxIndex + 1);

		if (me.options.ticks.reverse) {
			me.ticks = ticks.slice().reverse();
		}
	},

	convertTicksToLabels: function() {
		var me = this;

		me._tickValues = me.ticks.slice();
		Scale.prototype.convertTicksToLabels.call(me);
	},

	getLabelForIndex: function(index, datasetIndex) {
		var me = this;
		var chart = me.chart;
		var labels = me._getLabels();

		if (chart.getDatasetMeta(datasetIndex).controller._getValueScaleId() === me.id) {
			return me.getRightValue(chart.data.datasets[datasetIndex].data[index]);
		}

		return labels[index];
	},

	// Used to get data value locations.  Value can either be an index or a numerical value
	getPixelForValue: function(value, index, datasetIndex) {
		var me = this;
		var options = me.options;
		var offset = options.offset;
		var offsetAmt = Math.max(me._ticks.length - (offset ? 0 : 1), 1);
		var range = me._getRange();
		var valueDimension = range.size / offsetAmt;
		var valueCategory, labels, idx, pixel;

		if (!isNullOrUndef(index) && !isNullOrUndef(datasetIndex)) {
			value = me.chart.data.datasets[datasetIndex].data[index];
		}

		// If value is a data object, then index is the index in the data array,
		// not the index of the scale. We need to change that.
		if (!isNullOrUndef(value)) {
			valueCategory = me.isHorizontal() ? value.x : value.y;
		}
		if (valueCategory !== undefined || (value !== undefined && isNaN(index))) {
			labels = me._getLabels();
			value = helpers.valueOrDefault(valueCategory, value);
			idx = labels.indexOf(value);
			index = idx !== -1 ? idx : index;
		}

		pixel = valueDimension * (index - me.minIndex);

		if (offset) {
			pixel += valueDimension / 2;
		}

		return options.ticks.reverse ? range.end - pixel : range.start + pixel;
	},

	getPixelForTick: function(index) {
		var me = this;

		var ticks = me._tickValues;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return me.getPixelForValue(ticks[index]);
	},

	getValueForPixel: function(pixel) {
		var me = this;
		var options = me.options;
		var offset = options.offset;
		var offsetAmt = Math.max(me._ticks.length - (offset ? 0 : 1), 1);
		var range = me._getRange();
		var valueDimension = range.size / offsetAmt;

		pixel = options.ticks.reverse ? range.end - pixel : pixel - range.start;

		if (offset) {
			pixel -= valueDimension / 2;
		}

		return Math.round(pixel / valueDimension) + me.minIndex;
	},

	getBasePixel: function() {
		return this.bottom;
	}
});

// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
