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
		me.ticks = (minIndex === 0 && maxIndex === labels.length - 1) ? labels : labels.slice(minIndex, maxIndex + 1);
	},

	getLabelForIndex: function(index, datasetIndex) {
		var me = this;
		var chart = me.chart;

		if (chart.getDatasetMeta(datasetIndex).controller._getValueScaleId() === me.id) {
			return me.getRightValue(chart.data.datasets[datasetIndex].data[index]);
		}

		return me._getLabels()[index];
	},

	_configure: function() {
		var me = this;
		var offset = me.options.offset;
		var ticks = me.ticks;

		Scale.prototype._configure.call(me);

		if (!me.isHorizontal()) {
			// For backward compatibility, vertical category scale reverse is inverted.
			me._reversePixels = !me._reversePixels;
		}

		if (!ticks) {
			return;
		}

		me._startValue = me.minIndex - (offset ? 0.5 : 0);
		me._valueRange = Math.max(ticks.length - (offset ? 0 : 1), 1);
	},

	// Used to get data value locations.  Value can either be an index or a numerical value
	getPixelForValue: function(value, index, datasetIndex) {
		var me = this;
		var valueCategory, labels, idx;

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
			if (isNaN(index)) {
				index = value;
			}
		}
		return me.getPixelForDecimal((index - me._startValue) / me._valueRange);
	},

	getPixelForTick: function(index) {
		var ticks = this.ticks;
		return index < 0 || index > ticks.length - 1
			? null
			: this.getPixelForValue(ticks[index], index + this.minIndex);
	},

	getValueForPixel: function(pixel) {
		var me = this;
		var value = Math.round(me._startValue + me.getDecimalForPixel(pixel) * me._valueRange);
		return Math.min(Math.max(value, 0), me.ticks.length - 1);
	},

	getBasePixel: function() {
		return this.bottom;
	}
});

// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
