import {isFinite} from '../helpers/helpers.core';
import {_setMinAndMaxByKey, log10} from '../helpers/helpers.math';
import Scale from '../core/core.scale';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';

function isMajor(tickVal) {
	const remain = tickVal / (Math.pow(10, Math.floor(log10(tickVal))));
	return remain === 1;
}

function finiteOrDefault(value, def) {
	return isFinite(value) ? value : def;
}

/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(generationOptions, dataRange) {
	const endExp = Math.floor(log10(dataRange.max));
	const endSignificand = Math.ceil(dataRange.max / Math.pow(10, endExp));
	const ticks = [];
	let tickVal = finiteOrDefault(generationOptions.min, Math.pow(10, Math.floor(log10(dataRange.min))));
	let exp = Math.floor(log10(tickVal));
	let significand = Math.floor(tickVal / Math.pow(10, exp));
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

	const lastTick = finiteOrDefault(generationOptions.max, tickVal);
	ticks.push({value: lastTick, major: isMajor(tickVal)});

	return ticks;
}

const defaultConfig = {
	// label settings
	ticks: {
		callback: Ticks.formatters.numeric,
		major: {
			enabled: true
		}
	}
};

export default class LogarithmicScale extends Scale {

	static id = 'logarithmic';
	// INTERNAL: static default options, registered in src/index.js
	static defaults = defaultConfig;

	constructor(cfg) {
		super(cfg);

		/** @type {number} */
		this.start = undefined;
		/** @type {number} */
		this.end = undefined;
		/** @type {number} */
		this._startValue = undefined;
		this._valueRange = 0;
	}

	parse(raw, index) {
		const value = LinearScaleBase.prototype.parse.apply(this, [raw, index]);
		if (value === 0) {
			return undefined;
		}
		return isFinite(value) && value > 0 ? value : NaN;
	}

	determineDataLimits() {
		const me = this;
		const minmax = me.getMinMax(true);
		const min = minmax.min;
		const max = minmax.max;

		me.min = isFinite(min) ? Math.max(0, min) : null;
		me.max = isFinite(max) ? Math.max(0, max) : null;

		me.handleTickRangeOptions();
	}

	handleTickRangeOptions() {
		const me = this;
		const DEFAULT_MIN = 1;
		const DEFAULT_MAX = 10;
		let min = me.min;
		let max = me.max;

		if (min === max) {
			if (min <= 0) { // includes null
				min = DEFAULT_MIN;
				max = DEFAULT_MAX;
			} else {
				min = Math.pow(10, Math.floor(log10(min)) - 1);
				max = Math.pow(10, Math.floor(log10(max)) + 1);
			}
		}
		if (min <= 0) {
			min = Math.pow(10, Math.floor(log10(max)) - 1);
		}
		if (max <= 0) {
			max = Math.pow(10, Math.floor(log10(min)) + 1);
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

	/**
	 * @param {number} value
	 * @return {string}
	 */
	getLabelForValue(value) {
		return value === undefined ? '0' : new Intl.NumberFormat(this.options.locale).format(value);
	}

	getPixelForTick(index) {
		const ticks = this.ticks;
		if (index < 0 || index > ticks.length - 1) {
			return null;
		}
		return this.getPixelForValue(ticks[index].value);
	}

	/**
	 * @protected
	 */
	configure() {
		const me = this;
		const start = me.min;

		super.configure();

		me._startValue = log10(start);
		me._valueRange = log10(me.max) - log10(start);
	}

	getPixelForValue(value) {
		const me = this;
		if (value === undefined || value === 0) {
			value = me.min;
		}
		return me.getPixelForDecimal(value === me.min
			? 0
			: (log10(value) - me._startValue) / me._valueRange);
	}

	getValueForPixel(pixel) {
		const me = this;
		const decimal = me.getDecimalForPixel(pixel);
		return Math.pow(10, me._startValue + decimal * me._valueRange);
	}
}
