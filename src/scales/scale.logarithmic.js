import {finiteOrDefault, isFinite} from '../helpers/helpers.core.js';
import {formatNumber} from '../helpers/helpers.intl.js';
import {_setMinAndMaxByKey, log10} from '../helpers/helpers.math.js';
import Scale from '../core/core.scale.js';
import LinearScaleBase from './scale.linearbase.js';
import Ticks from '../core/core.ticks.js';

const log10Floor = v => Math.floor(log10(v));
const changeExponent = (v, m) => Math.pow(10, log10Floor(v) + m);

function isMajor(tickVal) {
  const remain = tickVal / (Math.pow(10, log10Floor(tickVal)));
  return remain === 1;
}

function steps(min, max, rangeExp) {
  const rangeStep = Math.pow(10, rangeExp);
  const start = Math.floor(min / rangeStep);
  const end = Math.ceil(max / rangeStep);
  return end - start;
}

function startExp(min, max) {
  const range = max - min;
  let rangeExp = log10Floor(range);
  while (steps(min, max, rangeExp) > 10) {
    rangeExp++;
  }
  while (steps(min, max, rangeExp) < 10) {
    rangeExp--;
  }
  return Math.min(rangeExp, log10Floor(min));
}


/**
 * Generate a set of logarithmic ticks
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(generationOptions, {min, max}) {
  min = finiteOrDefault(generationOptions.min, min);
  const ticks = [];
  const minExp = log10Floor(min);
  let exp = startExp(min, max);
  let precision = exp < 0 ? Math.pow(10, Math.abs(exp)) : 1;
  const stepSize = Math.pow(10, exp);
  const base = minExp > exp ? Math.pow(10, minExp) : 0;
  const start = Math.round((min - base) * precision) / precision;
  const offset = Math.floor((min - base) / stepSize / 10) * stepSize * 10;
  let significand = Math.floor((start - offset) / Math.pow(10, exp));
  let value = finiteOrDefault(generationOptions.min, Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision);
  while (value < max) {
    ticks.push({value, major: isMajor(value), significand});
    if (significand >= 10) {
      significand = significand < 15 ? 15 : 20;
    } else {
      significand++;
    }
    if (significand >= 20) {
      exp++;
      significand = 2;
      precision = exp >= 0 ? 1 : precision;
    }
    value = Math.round((base + offset + significand * Math.pow(10, exp)) * precision) / precision;
  }
  const lastTick = finiteOrDefault(generationOptions.max, value);
  ticks.push({value: lastTick, major: isMajor(lastTick), significand});

  return ticks;
}

export default class LogarithmicScale extends Scale {

  static id = 'logarithmic';

  /**
   * @type {any}
   */
  static defaults = {
    ticks: {
      callback: Ticks.formatters.logarithmic,
      major: {
        enabled: true
      }
    }
  };


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

    // if data has `0` in it or `beginAtZero` is true, min (non zero) value is at bottom
    // of scale, and it does not equal suggestedMin, lower the min bound by one exp.
    if (this._zero && this.min !== this._suggestedMin && !isFinite(this._userMin)) {
      this.min = min === changeExponent(this.min, 0) ? changeExponent(this.min, -1) : changeExponent(this.min, 0);
    }

    this.handleTickRangeOptions();
  }

  handleTickRangeOptions() {
    const {minDefined, maxDefined} = this.getUserBounds();
    let min = this.min;
    let max = this.max;

    const setMin = v => (min = minDefined ? min : v);
    const setMax = v => (max = maxDefined ? max : v);

    if (min === max) {
      if (min <= 0) { // includes null
        setMin(1);
        setMax(10);
      } else {
        setMin(changeExponent(min, -1));
        setMax(changeExponent(max, +1));
      }
    }
    if (min <= 0) {
      setMin(changeExponent(max, -1));
    }
    if (max <= 0) {

      setMax(changeExponent(min, +1));
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
