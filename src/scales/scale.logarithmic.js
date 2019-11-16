'use strict';

const defaults = require('../core/core.defaults');
const helpers = require('../helpers/index');
const Scale = require('../core/core.scale');
const LinearScaleBase = require('./scale.linearbase');
const Ticks = require('../core/core.ticks');

const valueOrDefault = helpers.valueOrDefault;
const log10 = helpers.math.log10;

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {number[]} array of tick values
 */
function generateTicks(generationOptions, dataRange) {
	var ticks = [];

	var tickVal = valueOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));

	var endExp = Math.floor(log10(dataRange.max));
	var endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
	var exp, significand;

	if (tickVal === 0) {
		exp = Math.floor(log10(dataRange.minNotZero));
		significand = Math.floor(dataRange.minNotZero / Math.pow(10, exp));

		ticks.push({value: tickVal});
		tickVal = significand * Math.pow(10, exp);
	} else {
		exp = Math.floor(log10(tickVal));
		significand = Math.floor(tickVal / Math.pow(10, exp));
	}
	var precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;

	do {
		ticks.push({value: tickVal});

		++significand;
		if (significand === 10) {
			significand = 1;
			++exp;
			precision = exp >= 0 ? 1 : precision;
		}

		tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
	} while (exp < endExp || (exp === endExp && significand < endSignificand));

	var lastTick = valueOrDefault(generationOptions.max, tickVal);
	ticks.push({value: lastTick});

	return ticks;
}

const defaultConfig = {
	position: 'left',

	// label settings
	ticks: {
		callback: Ticks.formatters.logarithmic
	}
};

class LogarithmicScale extends Scale {
	_parse(raw, index) { // eslint-disable-line no-unused-vars
		const value = LinearScaleBase.prototype._parse.apply(this, arguments);
		return helpers.isFinite(value) && value >= 0 ? value : undefined;
	}

	determineDataLimits() {
		var me = this;
		var minmax = me._getMinMax(true);
		var min = minmax.min;
		var max = minmax.max;
		var minPositive = minmax.minPositive;

		me.min = helpers.isFinite(min) ? Math.max(0, min) : null;
		me.max = helpers.isFinite(max) ? Math.max(0, max) : null;
		me.minNotZero = helpers.isFinite(minPositive) ? minPositive : null;

		me.handleTickRangeOptions();
	}

	handleTickRangeOptions() {
		var me = this;
		var DEFAULT_MIN = 1;
		var DEFAULT_MAX = 10;
		var min = me.min;
		var max = me.max;

		if (min === max) {
			if (min !== 0 && min !== null) {
				min = Math.pow(10, Math.floor(log10(min)) - 1);
				max = Math.pow(10, Math.floor(log10(max)) + 1);
			} else {
				min = DEFAULT_MIN;
				max = DEFAULT_MAX;
			}
		}
		if (min === null) {
			min = Math.pow(10, Math.floor(log10(max)) - 1);
		}
		if (max === null) {
			max = min !== 0
				? Math.pow(10, Math.floor(log10(min)) + 1)
				: DEFAULT_MAX;
		}
		if (me.minNotZero === null) {
			if (min > 0) {
				me.minNotZero = min;
			} else if (max < 1) {
				me.minNotZero = Math.pow(10, Math.floor(log10(max)));
			} else {
				me.minNotZero = DEFAULT_MIN;
			}
		}
		me.min = min;
		me.max = max;
	}

	buildTicks() {
		var me = this;
		var opts = me.options;
		var reverse = !me.isHorizontal();

		var generationOptions = {
			min: me._userMin,
			max: me._userMax
		};
		var ticks = generateTicks(generationOptions, me);

		// At this point, we need to update our max and min given the tick values since we have expanded the
		// range of the scale
		helpers._setMinAndMaxByKey(ticks, me, 'value');

		if (opts.reverse) {
			reverse = !reverse;
			me.start = me.max;
			me.end = me.min;
		} else {
			me.start = me.min;
			me.end = me.max;
		}
		if (reverse) {
			ticks.reverse();
		}
		return ticks;
	}

	generateTickLabels(ticks) {
		this._tickValues = ticks.map(t => t.value);

		return Scale.prototype.generateTickLabels.call(this, ticks);
	}

	getPixelForTick(index) {
		var ticks = this._tickValues;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index]);
	}

	/**
	 * Returns the value of the first tick.
	 * @param {number} value - The minimum not zero value.
	 * @return {number} The first tick value.
	 * @private
	 */
	_getFirstTickValue(value) {
		var exp = Math.floor(log10(value));
		var significand = Math.floor(value / Math.pow(10, exp));

		return significand * Math.pow(10, exp);
	}

	_configure() {
		var me = this;
		var start = me.min;
		var offset = 0;

		Scale.prototype._configure.call(me);

		if (start === 0) {
			start = me._getFirstTickValue(me.minNotZero);
			offset = valueOrDefault(me.options.ticks.fontSize, defaults.global.defaultFontSize) / me._length;
		}

		me._startValue = log10(start);
		me._valueOffset = offset;
		me._valueRange = (log10(me.max) - log10(start)) / (1 - offset);
	}

	getPixelForValue(value) {
		var me = this;
		var decimal = 0;

		if (value > me.min && value > 0) {
			decimal = (log10(value) - me._startValue) / me._valueRange + me._valueOffset;
		}
		return me.getPixelForDecimal(decimal);
	}

	getValueForPixel(pixel) {
		var me = this;
		var decimal = me.getDecimalForPixel(pixel);
		return decimal === 0 && me.min === 0
			? 0
			: Math.pow(10, me._startValue + (decimal - me._valueOffset) * me._valueRange);
	}
}

module.exports = LogarithmicScale;
// INTERNAL: static default options, registered in src/index.js
module.exports._defaults = defaultConfig;
