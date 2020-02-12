import {isArray} from '../helpers/helpers.core';
import {log10} from '../helpers/helpers.math';

/**
 * Namespace to hold static tick generation functions
 * @namespace Chart.Ticks
 */
export default {
	/**
	 * Namespace to hold formatters for different types of ticks
	 * @namespace Chart.Ticks.formatters
	 */
	formatters: {
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

			// If we have lots of ticks, don't use the ones
			let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;

			// If we have a number like 2.5 as the delta, figure out how many decimal places we need
			if (Math.abs(delta) > 1 && tickValue !== Math.floor(tickValue)) {
				// not an integer
				delta = tickValue - Math.floor(tickValue);
			}

			const logDelta = log10(Math.abs(delta));

			const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
			const minTick = Math.min(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
			const locale = this.chart.options.locale;
			if (maxTick < 1e-4 || minTick > 1e+7) { // all ticks are small or big numbers; use scientific notation
				const logTick = log10(Math.abs(tickValue));
				let numExponential = Math.floor(logTick) - Math.floor(logDelta);
				numExponential = Math.max(Math.min(numExponential, 20), 0);
				return tickValue.toExponential(numExponential);
			}

			let numDecimal = -1 * Math.floor(logDelta);
			numDecimal = Math.max(Math.min(numDecimal, 20), 0); // toFixed has a max of 20 decimal places
			return new Intl.NumberFormat(locale, {minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal}).format(tickValue);
		}
	}
};
