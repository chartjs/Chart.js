import {isArray} from '../helpers/helpers.core';
import {log10} from '../helpers/helpers.math';

const intlCache = new Map();
/**
 * Namespace to hold formatters for different types of ticks
 * @namespace Chart.Ticks.formatters
 */
const formatters = {
	/**
	 * Formatter for value labels
	 * @method Chart.Ticks.formatters.values
	 * @param value the value to display
	 * @return {string|string[]} the label to display
	 */
	values(value) {
		return isArray(value) ? value : '' + value;
	},

	/**
	 * Formatter for numeric ticks
	 * @method Chart.Ticks.formatters.numeric
	 * @param tickValue {number} the value to be formatted
	 * @param index {number} the position of the tickValue parameter in the ticks array
	 * @param ticks {object[]} the list of ticks being converted
	 * @return {string} string representation of the tickValue parameter
	 */
	numeric(tickValue, index, ticks) {
		if (tickValue === 0) {
			return '0'; // never show decimal places for 0
		}

		const locale = this.chart.options.locale;

		// all ticks are small or there huge numbers; use scientific notation
		const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
		let notation;
		if (maxTick < 1e-4 || maxTick > 1e+15) {
			notation = 'scientific';
		}

		// Figure out how many digits to show
		// The space between the first two ticks might be smaller than normal spacing
		let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;

		// If we have a number like 2.5 as the delta, figure out how many decimal places we need
		if (Math.abs(delta) > 1 && tickValue !== Math.floor(tickValue)) {
			// not an integer
			delta = tickValue - Math.floor(tickValue);
		}

		const logDelta = log10(Math.abs(delta));
		const numDecimal = Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0); // toFixed has a max of 20 decimal places

		const options = {notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal};
		Object.assign(options, this.options.ticks.format);

		const cacheKey = locale + JSON.stringify(options);
		let formatter = intlCache.get(cacheKey);
		if (!formatter) {
			formatter = new Intl.NumberFormat(locale, options);
			intlCache.set(cacheKey, formatter);
		}

		return formatter.format(tickValue);
	}
};

/**
 * Formatter for logarithmic ticks
 * @method Chart.Ticks.formatters.logarithmic
 * @param tickValue {number} the value to be formatted
 * @param index {number} the position of the tickValue parameter in the ticks array
 * @param ticks {object[]} the list of ticks being converted
 * @return {string} string representation of the tickValue parameter
 */
formatters.logarithmic = function(tickValue, index, ticks) {
	if (tickValue === 0) {
		return '0';
	}
	const remain = tickValue / (Math.pow(10, Math.floor(log10(tickValue))));
	if (remain === 1 || remain === 2 || remain === 5) {
		return formatters.numeric.call(this, tickValue, index, ticks);
	}
	return '';
};

/**
 * Namespace to hold static tick generation functions
 * @namespace Chart.Ticks
 */
export default {formatters};
