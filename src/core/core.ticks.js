import {isArray, isFinite} from '../helpers/helpers.core.js';
import {formatNumber} from '../helpers/helpers.intl.js';
import {log10} from '../helpers/helpers.math.js';

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
    if (tickValue === 0) {
      return '0'; // never show decimal places for 0
    }

    const locale = this.chart.options.locale;
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
    Object.assign(options, this.options.ticks.format);

    return formatNumber(tickValue, locale, options);
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
  },

  /**
   * Formatter for symlog ticks. One style per axis: compact notation (e.g. `-10K`, `100M`)
   * unless that short form cannot tell neighbouring ticks apart, in which case plain
   * grouped numbers like the numeric formatter (e.g. `4,000 4,002 ... 4,010`), and
   * scientific notation for extreme magnitudes. Each value keeps the digits it needs,
   * so a bound like 3999.5 is not shown as `4,000`.
   * @method Chart.Ticks.formatters.symlog
   * @param tickValue {number} the value to be formatted
   * @param index {number} the position of the tickValue parameter in the ticks array
   * @param ticks {object[]} the list of ticks being converted
   * @return {string} string representation of the tickValue parameter
   */
  symlog(tickValue, index, ticks) {
    if (tickValue === 0) {
      return '0';
    }
    const {notation, decimals} = symlogStyle(ticks);
    let maximumSignificantDigits, minimumFractionDigits, maximumFractionDigits;
    if (notation === 'standard') {
      minimumFractionDigits = decimals;
      maximumFractionDigits = Math.max(decimals, decimalsOf(tickValue));
    } else {
      maximumSignificantDigits = significantDigitsOf(tickValue);
    }
    const options = {notation, maximumSignificantDigits, minimumFractionDigits, maximumFractionDigits};
    Object.assign(options, this.options.ticks.format);

    return formatNumber(tickValue, this.chart.options.locale, options);
  }

};


function calculateDelta(tickValue, ticks) {
  // Figure out how many digits to show
  // The space between the first two ticks might be smaller than normal spacing
  let delta = ticks.length > 3 ? ticks[2].value - ticks[1].value : ticks[1].value - ticks[0].value;

  // If we have a number like 2.5 as the delta, figure out how many decimal places we need
  if (Math.abs(delta) >= 1 && tickValue !== Math.floor(tickValue)) {
    // not an integer
    delta = tickValue - Math.floor(tickValue);
  }
  return delta;
}

/**
 * Significant digits of a value, ignoring floating point noise beyond 15 digits
 * (4000 -> 1, 3999.5 -> 5, 0.0005 -> 1)
 * @param {number} value
 * @return {number}
 */
function significantDigitsOf(value) {
  const digits = Math.abs(value).toPrecision(15)
    .replace(/e.*$/, '')
    .replace('.', '')
    .replace(/^0+/, '')
    .replace(/0+$/, '');
  return Math.min(Math.max(digits.length, 1), 21);
}

/**
 * Decimal places a value needs (3999.5 -> 1, 4000 -> 0, 0.0005 -> 4)
 * @param {number} value
 * @return {number}
 */
function decimalsOf(value) {
  if (value === 0) {
    return 0;
  }
  const places = significantDigitsOf(value) - 1 - Math.floor(log10(Math.abs(value)));
  return Math.min(Math.max(places, 0), 20);
}

/** @type {WeakMap<object[], {notation: string, decimals: number}>} */
const symlogStyles = new WeakMap();

/**
 * Significant digits needed to tell two neighbouring values apart (100 vs 1000 -> 2,
 * 4000 vs 4002 -> 4)
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function digitsToSeparate(a, b) {
  const magnitude = Math.max(Math.abs(a), Math.abs(b));
  return Math.floor(log10(magnitude)) - Math.floor(log10(Math.abs(b - a))) + 1;
}

/**
 * Notation for an axis: scientific for extreme magnitudes, plain numbers when the short
 * (compact, up to 3 significant digits) form cannot tell neighbouring ticks apart
 * (e.g. 4000 ... 4010), compact otherwise (e.g. 2M ... 70M, 0 10 100 1K).
 * @param {number[]} values sorted tick values
 * @return {string}
 */
function symlogNotation(values) {
  const hi = Math.max(Math.abs(values[0]), Math.abs(values[values.length - 1]));
  if (hi >= 1e15 || hi < 1e-4) {
    return 'scientific';
  }
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1] && digitsToSeparate(values[i - 1], values[i]) > 3) {
      return 'standard';
    }
  }
  return 'compact';
}

/**
 * Decimals of the typical (median) step between sorted values, like the numeric formatter
 * @param {number[]} values
 * @return {number}
 */
function stepDecimals(values) {
  const steps = [];
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) {
      steps.push(values[i] - values[i - 1]);
    }
  }
  steps.sort((a, b) => a - b);
  const step = steps[Math.floor(steps.length / 2)];
  return step ? Math.min(Math.max(-Math.floor(log10(step)), 0), 20) : 0;
}

/**
 * Label style shared by all ticks of an axis, so labels do not switch style partway
 * (e.g. `99.5K` followed by `100,000`).
 * @param {{value: number}[]} ticks
 * @return {{notation: string, decimals: number}}
 */
function symlogStyle(ticks) {
  const list = isArray(ticks) ? ticks : [];
  let style = symlogStyles.get(list);
  if (!style) {
    const values = list.map(tick => tick.value).filter(value => isFinite(value)).sort((a, b) => a - b);
    style = values.length
      ? {notation: symlogNotation(values), decimals: stepDecimals(values)}
      : {notation: 'compact', decimals: 0};
    symlogStyles.set(list, style);
  }
  return style;
}

/**
 * Namespace to hold static tick generation functions
 * @namespace Chart.Ticks
 */
export default {formatters};
