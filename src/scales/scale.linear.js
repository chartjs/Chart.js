'use strict';

const helpers = require('../helpers/index');
const LinearScaleBase = require('./scale.linearbase');
const Ticks = require('../core/core.ticks');

const defaultConfig = {
	position: 'left',
	ticks: {
		callback: Ticks.formatters.linear
	}
};

class LinearScale extends LinearScaleBase {
	determineDataLimits() {
		var me = this;
		var DEFAULT_MIN = 0;
		var DEFAULT_MAX = 1;
		var minmax = me._getMinMax(true);
		var min = minmax.min;
		var max = minmax.max;

		me.min = helpers.isFinite(min) && !isNaN(min) ? min : DEFAULT_MIN;
		me.max = helpers.isFinite(max) && !isNaN(max) ? max : DEFAULT_MAX;

		// Backward compatible inconsistent min for stacked
		if (me.options.stacked && min > 0) {
			me.min = 0;
		}

		// Common base implementation to handle min, max, beginAtZero
		me.handleTickRangeOptions();
	}

	// Returns the maximum number of ticks based on the scale dimension
	_computeTickLimit() {
		var me = this;
		var tickFont;

		if (me.isHorizontal()) {
			return Math.ceil(me.width / 40);
		}
		tickFont = helpers.options._parseFont(me.options.ticks);
		return Math.ceil(me.height / tickFont.lineHeight);
	}

	/**
	 * Called after the ticks are built
	 * @private
	 */
	_handleDirectionalChanges(ticks) {
		// If we are in a vertical orientation the top value is the highest so reverse the array
		return this.isHorizontal() ? ticks : ticks.reverse();
	}

	// Utils
	getPixelForValue(value) {
		var me = this;
		return me.getPixelForDecimal((value - me._startValue) / me._valueRange);
	}

	getValueForPixel(pixel) {
		return this._startValue + this.getDecimalForPixel(pixel) * this._valueRange;
	}

	getPixelForTick(index) {
		var ticks = this._tickValues;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index]);
	}
}

module.exports = LinearScale;
// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
