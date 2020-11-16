import {finiteOrDefault, isFinite} from '../helpers/helpers.core';
import {_setMinAndMaxByKey, log10} from '../helpers/helpers.math';
import Scale from '../core/core.scale';
import LinearScaleBase from './scale.linearbase';
import Ticks from '../core/core.ticks';

function isMajor(tickVal) {
	const remain = tickVal / (Math.pow(10, Math.floor(log10(tickVal))));
	return remain === 1;
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

export default class LogarithmicScale extends Scale {

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
			this._zero = true;
			return undefined;
		}
		return isFinite(value) && value > 0 ? value : NaN;
	}

	determineDataLimits() {
		const me = this;
		const {min, max} = me.getMinMax(true);

		me.min = isFinite(min) ? Math.max(0, min) : null;
		me.max = isFinite(max) ? Math.max(0, max) : null;

		if (me.options.beginAtZero) {
			me._zero = true;
		}

		me.handleTickRangeOptions();
	}

	handleTickRangeOptions() {
		const me = this;
		const {minDefined, maxDefined} = me.getUserBounds();
		let min = me.min;
		let max = me.max;

		const setMin = v => (min = minDefined ? min : v);
		const setMax = v => (max = maxDefined ? max : v);
		const exp = (v, m) => Math.pow(10, Math.floor(log10(v)) + m);

		if (min === max) {
			if (min <= 0) { // includes null
				setMin(1);
				setMax(10);
			} else {
				setMin(exp(min, -1));
				setMax(exp(max, +1));
			}
		}
		if (min <= 0) {
			setMin(exp(max, -1));
		}
		if (max <= 0) {
			setMax(exp(min, +1));
		}
		// if data has `0` in it or `beginAtZero` is true, min (non zero) value is at bottom
		// of scale, and it does not equal suggestedMin, lower the min bound by one exp.
		if (me._zero && me.min !== me._suggestedMin && min === exp(me.min, 0)) {
			setMin(exp(min, -1));
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

		// At this point, we need to update our max and min given the tick values,
		// since we probably have expanded the range of the scale
		if (opts.bounds === 'ticks') {
			_setMinAndMaxByKey(ticks, me, 'value');
		}

		if (opts.reverse) {
			ticks.reverse();

			me.start = me.max;
			me.end = me.min;
		} else {
			me.start = me.min;
			me.end = me.max;
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

LogarithmicScale.id = 'logarithmic';

/**
 * @type {any}
 */
LogarithmicScale.defaults = {
	ticks: {
		callback: Ticks.formatters.logarithmic,
		major: {
			enabled: true
		}
	}
};
