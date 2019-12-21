'use strict';

import defaults from '../core/core.defaults';
import helpers from '../helpers/index';
import {_setMinAndMaxByKey} from '../helpers/helpers.math';
import Scale from '../core/core.scale';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';

const valueOrDefault = helpers.valueOrDefault;
const log10 = helpers.math.log10;

function isMajor(tickVal) {
	const remain = tickVal / (Math.pow(10, Math.floor(log10(tickVal))));
	return remain === 1;
}

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {number[]} array of tick values
 */
function generateTicks(generationOptions, dataRange) {
	const endExp = Math.floor(log10(dataRange.max));
	const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
	const ticks = [];
	let tickVal = valueOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));
	let exp, significand;

	if (tickVal === 0) {
		exp = 0;
		significand = 0;
	} else {
		exp = Math.floor(log10(tickVal));
		significand = Math.floor(tickVal / Math.pow(10, exp));
	}
	let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;

	do {
		ticks.push({value: tickVal, major: isMajor(tickVal)});

		++significand;
		if (significand === 10) {
			significand = 1;
			++exp;
			precision = exp >= 0 ? 1 : precision;
		}

		tickVal = Math.round(significand * Math.pow(10, exp) * precision) / precision;
	} while (exp < endExp || (exp === endExp && significand < endSignificand));

	const lastTick = valueOrDefault(generationOptions.max, tickVal);
	ticks.push({value: lastTick, major: isMajor(tickVal)});

	return ticks;
}

const defaultConfig = {
	// label settings
	ticks: {
		callback: Ticks.formatters.logarithmic,
		major: {
			enabled: true
		}
	}
};

class LogarithmicScale extends Scale {
	_parse(raw, index) { // eslint-disable-line no-unused-vars
		const value = LinearScaleBase.prototype._parse.apply(this, arguments);
		return helpers.isFinite(value) && value >= 0 ? value : undefined;
	}

	determineDataLimits() {
		const me = this;
		const minmax = me._getMinMax(true);
		const min = minmax.min;
		const max = minmax.max;
		const minPositive = minmax.minPositive;

		me.min = helpers.isFinite(min) ? Math.max(0, min) : null;
		me.max = helpers.isFinite(max) ? Math.max(0, max) : null;
		me.minNotZero = helpers.isFinite(minPositive) ? minPositive : null;

		me.handleTickRangeOptions();
	}

	handleTickRangeOptions() {
		const me = this;
		const DEFAULT_MIN = 1;
		const DEFAULT_MAX = 10;
		let min = me.min;
		let max = me.max;

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
		const me = this;
		const opts = me.options;

		const generationOptions = {
			min: me._userMin,
			max: me._userMax
		};
		const ticks = generateTicks(generationOptions, me);
		let reverse = !me.isHorizontal();

		// At this point, we need to update our max and min given the tick values since we have expanded the
		// range of the scale
		_setMinAndMaxByKey(ticks, me, 'value');

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

	getPixelForTick(index) {
		const ticks = this.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index].value);
	}

	/**
	 * Returns the value of the first tick.
	 * @param {number} value - The minimum not zero value.
	 * @return {number} The first tick value.
	 * @private
	 */
	_getFirstTickValue(value) {
		const exp = Math.floor(log10(value));
		const significand = Math.floor(value / Math.pow(10, exp));

		return significand * Math.pow(10, exp);
	}

	_configure() {
		const me = this;
		let start = me.min;
		let offset = 0;

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
		const me = this;
		let decimal = 0;

		if (value > me.min && value > 0) {
			decimal = (log10(value) - me._startValue) / me._valueRange + me._valueOffset;
		}
		return me.getPixelForDecimal(decimal);
	}

	getValueForPixel(pixel) {
		const me = this;
		const decimal = me.getDecimalForPixel(pixel);
		return decimal === 0 && me.min === 0
			? 0
			: Math.pow(10, me._startValue + (decimal - me._valueOffset) * me._valueRange);
	}
}

// INTERNAL: static default options, registered in src/index.js
LogarithmicScale._defaults = defaultConfig;
export default LogarithmicScale;
