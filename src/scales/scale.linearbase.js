import {isNullOrUndef} from '../helpers/helpers.core';
import {almostEquals, almostWhole, niceNum, _decimalPlaces, _setMinAndMaxByKey, sign, toRadians} from '../helpers/helpers.math';
import Scale from '../core/core.scale';
import {formatNumber} from '../helpers/helpers.intl';

/**
 * Generate a set of linear ticks for an axis
 * 1. If generationOptions.min, generationOptions.max, and generationOptions.step are defined:
 *    if (max - min) / step is an integer, ticks are generated as [min, min + step, ..., max]
 *    Note that the generationOptions.maxCount setting is respected in this scenario
 *
 * 2. If generationOptions.min, generationOptions.max, and generationOptions.count is defined
 *    spacing = (max - min) / count
 *    Ticks are generated as [min, min + spacing, ..., max]
 *
 * 3. If generationOptions.count is defined
 *    spacing = (niceMax - niceMin) / count
 *
 * 4. Compute optimal spacing of ticks using niceNum algorithm
 *
 * @param generationOptions the options used to generate the ticks
 * @param dataRange the range of the data
 * @returns {object[]} array of tick objects
 */
function generateTicks(generationOptions, dataRange) {
  const ticks = [];
  // To get a "nice" value for the tick spacing, we will use the appropriately named
  // "nice number" algorithm. See https://stackoverflow.com/questions/8506881/nice-label-algorithm-for-charts-with-minimum-ticks
  // for details.

  const MIN_SPACING = 1e-14;
  const {bounds, step, min, max, precision, count, maxTicks, maxDigits, includeBounds} = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const {min: rmin, max: rmax} = dataRange;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;

  // Beyond MIN_SPACING floating point numbers being to lose precision
  // such that we can't do the math necessary to generate ticks
  if (spacing < MIN_SPACING && !minDefined && !maxDefined) {
    return [{value: rmin}, {value: rmax}];
  }

  numSpaces = Math.ceil(rmax / spacing) - Math.floor(rmin / spacing);
  if (numSpaces > maxSpaces) {
    // If the calculated num of spaces exceeds maxNumSpaces, recalculate it
    spacing = niceNum(numSpaces * spacing / maxSpaces / unit) * unit;
  }

  if (!isNullOrUndef(precision)) {
    // If the user specified a precision, round to that number of decimal places
    factor = Math.pow(10, precision);
    spacing = Math.ceil(spacing * factor) / factor;
  }

  if (bounds === 'ticks') {
    niceMin = Math.floor(rmin / spacing) * spacing;
    niceMax = Math.ceil(rmax / spacing) * spacing;
  } else {
    niceMin = rmin;
    niceMax = rmax;
  }

  if (minDefined && maxDefined && step && almostWhole((max - min) / step, spacing / 1000)) {
    // Case 1: If min, max and stepSize are set and they make an evenly spaced scale use it.
    // spacing = step;
    // numSpaces = (max - min) / spacing;
    // Note that we round here to handle the case where almostWhole translated an FP error
    numSpaces = Math.round(Math.min((max - min) / spacing, maxTicks));
    spacing = (max - min) / numSpaces;
    niceMin = min;
    niceMax = max;
  } else if (countDefined) {
    // Cases 2 & 3, we have a count specified. Handle optional user defined edges to the range.
    // Sometimes these are no-ops, but it makes the code a lot clearer
    // and when a user defined range is specified, we want the correct ticks
    niceMin = minDefined ? min : niceMin;
    niceMax = maxDefined ? max : niceMax;
    numSpaces = count - 1;
    spacing = (niceMax - niceMin) / numSpaces;
  } else {
    // Case 4
    numSpaces = (niceMax - niceMin) / spacing;

    // If very close to our rounded value, use it.
    if (almostEquals(numSpaces, Math.round(numSpaces), spacing / 1000)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }

  // The spacing will have changed in cases 1, 2, and 3 so the factor cannot be computed
  // until this point
  const decimalPlaces = Math.max(
    _decimalPlaces(spacing),
    _decimalPlaces(niceMin)
  );
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;

  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({value: min});

      if (niceMin < min) {
        j++; // Skip niceMin
      }
      // If the next nice tick is close to min, skip it
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }

  for (; j < numSpaces; ++j) {
    ticks.push({value: Math.round((niceMin + j * spacing) * factor) / factor});
  }

  if (maxDefined && includeBounds && niceMax !== max) {
    // If the previous tick is too close to max, replace it with max, else add max
    if (almostEquals(ticks[ticks.length - 1].value, max, relativeLabelSize(max, minSpacing, generationOptions))) {
      ticks[ticks.length - 1].value = max;
    } else {
      ticks.push({value: max});
    }
  } else if (!maxDefined || niceMax === max) {
    ticks.push({value: niceMax});
  }

  return ticks;
}

function relativeLabelSize(value, minSpacing, {horizontal, minRotation}) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
  const length = 0.75 * minSpacing * ('' + value).length;
  return Math.min(minSpacing / ratio, length);
}

export default class LinearScaleBase extends Scale {

  constructor(cfg) {
    super(cfg);

    /** @type {number} */
    this.start = undefined;
    /** @type {number} */
    this.end = undefined;
    /** @type {number} */
    this._startValue = undefined;
    /** @type {number} */
    this._endValue = undefined;
    this._valueRange = 0;
  }

  parse(raw, index) { // eslint-disable-line no-unused-vars
    if (isNullOrUndef(raw)) {
      return null;
    }
    if ((typeof raw === 'number' || raw instanceof Number) && !isFinite(+raw)) {
      return null;
    }

    return +raw;
  }

  handleTickRangeOptions() {
    const me = this;
    const {beginAtZero} = me.options;
    const {minDefined, maxDefined} = me.getUserBounds();
    let {min, max} = me;

    const setMin = v => (min = minDefined ? min : v);
    const setMax = v => (max = maxDefined ? max : v);

    if (beginAtZero) {
      const minSign = sign(min);
      const maxSign = sign(max);

      if (minSign < 0 && maxSign < 0) {
        setMax(0);
      } else if (minSign > 0 && maxSign > 0) {
        setMin(0);
      }
    }

    if (min === max) {
      setMax(max + 1);

      if (!beginAtZero) {
        setMin(min - 1);
      }
    }
    me.min = min;
    me.max = max;
  }

  getTickLimit() {
    const me = this;
    const tickOpts = me.options.ticks;
    // eslint-disable-next-line prefer-const
    let {maxTicksLimit, stepSize} = tickOpts;
    let maxTicks;

    if (stepSize) {
      maxTicks = Math.ceil(me.max / stepSize) - Math.floor(me.min / stepSize) + 1;
    } else {
      maxTicks = me.computeTickLimit();
      maxTicksLimit = maxTicksLimit || 11;
    }

    if (maxTicksLimit) {
      maxTicks = Math.min(maxTicksLimit, maxTicks);
    }

    return maxTicks;
  }

  /**
	 * @protected
	 */
  computeTickLimit() {
    return Number.POSITIVE_INFINITY;
  }

  buildTicks() {
    const me = this;
    const opts = me.options;
    const tickOpts = opts.ticks;

    // Figure out what the max number of ticks we can support it is based on the size of
    // the axis area. For now, we say that the minimum tick spacing in pixels must be 40
    // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
    // the graph. Make sure we always have at least 2 ticks
    let maxTicks = me.getTickLimit();
    maxTicks = Math.max(2, maxTicks);

    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: me._maxDigits(),
      horizontal: me.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = me._range || me;
    const ticks = generateTicks(numericGeneratorOptions, dataRange);

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
	 * @protected
	 */
  configure() {
    const me = this;
    const ticks = me.ticks;
    let start = me.min;
    let end = me.max;

    super.configure();

    if (me.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    me._startValue = start;
    me._endValue = end;
    me._valueRange = end - start;
  }

  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale);
  }
}
