import {isArray} from '../helpers/helpers.core.js';
import {formatNumber} from '../helpers/helpers.intl.js';
import {log10} from '../helpers/helpers.math.js';

/**
 * Merges the user's number format over the defaults. When the format sets only one of
 * the fraction digit bounds, the other one follows it instead of contradicting it.
 * @param {Intl.NumberFormatOptions} options - the defaults, modified in place
 * @param {Intl.NumberFormatOptions} [format] - the `ticks.format` option
 * @return {Intl.NumberFormatOptions}
 */
function applyNumberFormat(options, format) {
  Object.assign(options, format);

  if (options.minimumFractionDigits > options.maximumFractionDigits) {
    if (format.minimumFractionDigits === undefined) {
      options.minimumFractionDigits = options.maximumFractionDigits;
    } else if (format.maximumFractionDigits === undefined) {
      options.maximumFractionDigits = options.minimumFractionDigits;
    }
  }

  return options;
}

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
    return isArray(value) ? /** @type {string[]} */ (value) : '' + value;
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
    const locale = this.chart.options.locale;
    if (tickValue === 0) {
      return formatNumber(0, locale, applyNumberFormat({
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }, this.options.ticks.format));
    }

    let notation;
    let delta = tickValue; // This is used when there are less than 2 ticks as the tick interval.

    if (ticks.length > 1) {
      // all ticks are small or there huge numbers; use scientific notation
      const maxTick = Math.max(Math.abs(ticks[0].value), Math.abs(ticks[ticks.length - 1].value));
      if (maxTick < 1e-4 || maxTick > 1e+15) {
        notation = 'scientific';
      }

      delta = calculateDelta(tickValue, ticks);
    }

    const logDelta = log10(Math.abs(delta));

    // When datasets have values approaching Number.MAX_VALUE, the tick calculations might result in
    // infinity and eventually NaN. Passing NaN for minimumFractionDigits or maximumFractionDigits
    // will make the number formatter throw. So instead we check for isNaN and use a fallback value.
    //
    // toFixed has a max of 20 decimal places
    const numDecimal = isNaN(logDelta) ? 1 : Math.max(Math.min(-1 * Math.floor(logDelta), 20), 0);

    const options = {notation, minimumFractionDigits: numDecimal, maximumFractionDigits: numDecimal};

    return formatNumber(tickValue, locale, applyNumberFormat(options, this.options.ticks.format));
  },


  /**
   * Formatter for logarithmic ticks
   * @method Chart.Ticks.formatters.logarithmic
   * @param tickValue {number} the value to be formatted
   * @param index {number} the position of the tickValue parameter in the ticks array
   * @param ticks {object[]} the list of ticks being converted
   * @return {string} string representation of the tickValue parameter
   */
  logarithmic(tickValue, index, ticks) {
    if (tickValue === 0) {
      return '0';
    }
    const remain = ticks[index].significand || (tickValue / (Math.pow(10, Math.floor(log10(tickValue)))));
    if ([1, 2, 3, 5, 10, 15].includes(remain) || index > 0.8 * ticks.length) {
      return formatters.numeric.call(this, tickValue, index, ticks);
    }
    return '';
  }

};


function calculateDelta(tickValue, ticks) {
  // Figure out how many digits to show
  // The space between the first two ticks might be smaller than normal spacing
  let delta = ticks.length > 3 ? difference(ticks[2].value, ticks[1].value) : difference(ticks[1].value, ticks[0].value);

  // If we have a number like 2.5 as the delta, figure out how many decimal places we need
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    // not an integer
    delta = difference(tickValue, Math.floor(tickValue));
  }
  return delta;
}

/**
 * Returns a - b without the floating point error of the subtraction. The difference of two numbers
 * with at most n decimal places has at most n decimal places, so 1.4 - 1.3 is 0.1 here, not
 * 0.09999999999999987, which would ask for one more decimal than the ticks have.
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function difference(a, b) {
  // 20 is the most decimals the numeric formatter shows
  for (let places = 0, factor = 1; places <= 20; places++, factor *= 10) {
    if (Math.round(a * factor) / factor === a && Math.round(b * factor) / factor === b) {
      return Math.round((a - b) * factor) / factor;
    }
  }
  return a - b;
}

/**
 * Namespace to hold static tick generation functions
 * @namespace Chart.Ticks
 */
export default {formatters};
