import {finiteOrDefault, isFinite} from '../helpers/helpers.core';
import {formatNumber} from '../helpers/helpers.intl';
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
    return isFinite(value) && value > 0 ? value : null;
  }

  determineDataLimits() {
    const {min, max} = this.getMinMax(true);

    this.min = isFinite(min) ? Math.max(0, min) : null;
    this.max = isFinite(max) ? Math.max(0, max) : null;

    if (this.options.beginAtZero) {
      this._zero = true;
    }

    this.handleTickRangeOptions();
  }

  handleTickRangeOptions() {
    const {minDefined, maxDefined} = this.getUserBounds();
    let min = this.min;
    let max = this.max;

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
    if (this._zero && this.min !== this._suggestedMin && min === exp(this.min, 0)) {
      setMin(exp(min, -1));
    }
    this.min = min;
    this.max = max;
  }

  buildTicks() {
    const opts = this.options;

    const generationOptions = {
      min: this._userMin,
      max: this._userMax
    };
    const ticks = generateTicks(generationOptions, this);

    // At this point, we need to update our max and min given the tick values,
    // since we probably have expanded the range of the scale
    if (opts.bounds === 'ticks') {
      _setMinAndMaxByKey(ticks, this, 'value');
    }

    if (opts.reverse) {
      ticks.reverse();

      this.start = this.max;
      this.end = this.min;
    } else {
      this.start = this.min;
      this.end = this.max;
    }

    return ticks;
  }

  /**
	 * @param {number} value
	 * @return {string}
	 */
  getLabelForValue(value) {
    return value === undefined
      ? '0'
      : formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }

  /**
	 * @protected
	 */
  configure() {
    const start = this.min;

    super.configure();

    this._startValue = log10(start);
    this._valueRange = log10(this.max) - log10(start);
  }

  getPixelForValue(value) {
    if (value === undefined || value === 0) {
      value = this.min;
    }
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal(value === this.min
      ? 0
      : (log10(value) - this._startValue) / this._valueRange);
  }

  getValueForPixel(pixel) {
    const decimal = this.getDecimalForPixel(pixel);
    return Math.pow(10, this._startValue + decimal * this._valueRange);
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
