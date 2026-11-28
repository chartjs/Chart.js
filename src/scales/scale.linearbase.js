import {finiteOrDefault, isFinite, isNullOrUndef} from '../helpers/helpers.core.js';
import {almostEquals, almostWhole, niceNum, _decimalPlaces, _setMinAndMaxByKey, sign, toRadians} from '../helpers/helpers.math.js';
import Scale from '../core/core.scale.js';
import {formatNumber} from '../helpers/helpers.intl.js';

/**
 * Whether (hi - lo) / step is a whole number within floating point precision.
 * lo, hi and step are each the double nearest to a decimal value, so the count
 * can be off by about (|hi| + |lo|) / step machine epsilons even when the
 * decimal count is whole. A tolerance in value units (such as spacing / 1000)
 * would instead accept a count up to half a step away when the step is large.
 * @param {number} lo
 * @param {number} hi
 * @param {number} step
 * @returns {boolean}
 */
function isWholeStepCount(lo, hi, step) {
  const epsilon = Math.max((Math.abs(hi) + Math.abs(lo)) / step * 2 * Number.EPSILON, 1e-14);
  return almostWhole((hi - lo) / step, epsilon);
}

/**
 * Generate a set of linear ticks for an axis
 * 1. If generationOptions.min, generationOptions.max, and generationOptions.step are defined:
 *    if (max - min) / step is an integer within floating point precision, ticks are
 *    generated as [min, min + step, ..., max]
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
 * With bounds: 'data', the data minimum and maximum stand in for an unset min and max.
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
  const {bounds, step, precision, count, maxTicks, maxDigits, includeBounds} = generationOptions;
  const unit = step || 1;
  const maxSpaces = maxTicks - 1;
  const {min: rmin, max: rmax} = dataRange;
  const userMinDefined = !isNullOrUndef(generationOptions.min);
  const userMaxDefined = !isNullOrUndef(generationOptions.max);
  // With bounds: 'data' the data bounds are bounds: they are handled like a user
  // min and max (includeBounds, a close grid tick dropped), on the same grid. The
  // data range already holds a user min or max in place of the data's.
  const dataBounds = bounds === 'data';
  const min = dataBounds ? rmin : generationOptions.min;
  const max = dataBounds ? rmax : generationOptions.max;
  const minDefined = !isNullOrUndef(min);
  const maxDefined = !isNullOrUndef(max);
  const countDefined = !isNullOrUndef(count);
  const minSpacing = (rmax - rmin) / (maxDigits + 1);
  let spacing = niceNum((rmax - rmin) / maxSpaces / unit) * unit;
  let factor, niceMin, niceMax, numSpaces;

  // Beyond MIN_SPACING floating point numbers begin to lose precision
  // such that we can't do the math necessary to generate ticks. Only bounds the
  // user set keep the ticks going below it.
  if (spacing < MIN_SPACING && !userMinDefined && !userMaxDefined) {
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

  // The nice bounds are whole multiples of spacing, so they never need more decimals
  // than spacing itself. Round the floating point error off here, otherwise
  // _decimalPlaces below reports it as significant and the factor grows large
  // enough that rounding the tick values becomes a no-op.
  // A nice bound beyond the largest number (or one that cannot be rounded) falls
  // back to the data bound.
  const spacingFactor = Math.pow(10, _decimalPlaces(spacing));
  niceMin = finiteOrDefault(Math.round(Math.floor(rmin / spacing) * spacing * spacingFactor) / spacingFactor, rmin);
  niceMax = finiteOrDefault(Math.round(Math.ceil(rmax / spacing) * spacing * spacingFactor) / spacingFactor, rmax);

  if (userMinDefined && userMaxDefined && step && isWholeStepCount(min, max, step)) {
    // Case 1: If min, max and stepSize are set and they make an evenly spaced scale use it.
    // Data bounds do not count: their steps stay on multiples of stepSize.
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

    // If whole within floating point precision, use the rounded value.
    if (isWholeStepCount(niceMin, niceMax, spacing)) {
      numSpaces = Math.round(numSpaces);
    } else {
      numSpaces = Math.ceil(numSpaces);
    }
  }

  if (!isFinite(numSpaces) || !isFinite(spacing)) {
    // The ticks cannot be counted or spaced: the nice range or the range itself is
    // wider than the largest number, or the spacing is 0 because the range is
    // subnormal.
    return [{value: niceMin}, {value: niceMax}];
  }

  // The spacing will have changed in cases 1, 2, and 3 so the factor cannot be computed
  // until this point
  const decimalPlaces = Math.max(
    _decimalPlaces(spacing),
    _decimalPlaces(niceMin)
  );
  factor = Math.pow(10, isNullOrUndef(precision) ? decimalPlaces : precision);
  if (!isFinite(Math.max(Math.abs(niceMin), Math.abs(niceMax)) * factor)) {
    // The ticks cannot be rounded to the factor. Every tick lies between the nice
    // bounds, and these times the factor are beyond the largest number; or the
    // factor is NaN, because the decimals of the spacing or of the minimum cannot
    // be counted (_decimalPlaces returns undefined, for a subnormal value).
    return [{value: niceMin}, {value: niceMax}];
  }
  niceMin = Math.round(niceMin * factor) / factor;
  niceMax = Math.round(niceMax * factor) / factor;
  // A bound label shows at most one decimal more than the ticks.
  const labelFactor = factor * 10;

  let j = 0;
  if (minDefined) {
    if (includeBounds && niceMin !== min) {
      ticks.push({value: min});

      if (niceMin < min) {
        j++; // Skip niceMin
      }
      // If the next nice tick is close to min, skip it
      if (almostEquals(Math.round((niceMin + j * spacing) * factor) / factor, min, relativeLabelSize(min, labelFactor, minSpacing, generationOptions))) {
        j++;
      }
    } else if (niceMin < min) {
      j++;
    }
  }

  for (; j < numSpaces; ++j) {
    const tickValue = Math.round((niceMin + j * spacing) * factor) / factor;
    if (maxDefined && tickValue > max) {
      break;
    }
    ticks.push({value: tickValue});
  }

  if (maxDefined && includeBounds && niceMax !== max) {
    // If the previous tick is too close to max, replace it with max, else add max.
    // The tick at min is never replaced.
    const last = ticks[ticks.length - 1];
    const replaceable = last && last.value !== min;
    if (replaceable && almostEquals(last.value, max, relativeLabelSize(max, labelFactor, minSpacing, generationOptions))) {
      last.value = max;
    } else {
      ticks.push({value: max});
    }
  } else if (!maxDefined || niceMax === max) {
    // Avoid duplicating the last emitted tick when the rounded niceMax
    // coincides with it.
    if (!ticks.length || ticks[ticks.length - 1].value !== niceMax) {
      ticks.push({value: niceMax});
    }
  }

  return ticks;
}

/**
 * The space the label of a bound takes, in value units. The label is sized from
 * the bound rounded to the decimals it can show, so the floating point noise of a
 * data bound (1.8100024990071555) does not make it look longer than it is.
 * @param {number} value - the bound
 * @param {number} labelFactor - 10 to the power of the decimals the label shows
 */
function relativeLabelSize(value, labelFactor, minSpacing, {horizontal, minRotation}) {
  const rad = toRadians(minRotation);
  const ratio = (horizontal ? Math.sin(rad) : Math.cos(rad)) || 0.001;
  // Near the largest number the scaled bound overflows to Infinity, which still
  // counts as a label of 8 characters, about as long as "1.8e+308".
  const rounded = Math.round(value * labelFactor) / labelFactor;
  const length = 0.75 * minSpacing * String(rounded).length;
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
    const {beginAtZero} = this.options;
    const {minDefined, maxDefined} = this.getUserBounds();
    let {min, max} = this;

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
      let offset = max === 0 ? 1 : Math.abs(max * 0.05);

      setMax(max + offset);

      if (!beginAtZero) {
        setMin(min - offset);
      }
    }
    this.min = min;
    this.max = max;
  }

  getTickLimit() {
    const tickOpts = this.options.ticks;
    // eslint-disable-next-line prefer-const
    let {maxTicksLimit, stepSize} = tickOpts;
    let maxTicks;

    if (stepSize) {
      // Count the steps on the range the ticks are generated for (grace included),
      // which is the same in every layout pass. this.min and this.max are the data
      // bounds in the first pass and the widened tick bounds in the next.
      const {min, max} = this._range || this;
      maxTicks = Math.ceil(max / stepSize) - Math.floor(min / stepSize) + 1;
      if (maxTicks > 1000) {
        console.warn(`scales.${this.id}.ticks.stepSize: ${stepSize} would result generating up to ${maxTicks} ticks. Limiting to 1000.`);
        maxTicks = 1000;
      }
    } else {
      maxTicks = this.computeTickLimit();
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
    const opts = this.options;
    const tickOpts = opts.ticks;

    // Figure out what the max number of ticks we can support it is based on the size of
    // the axis area. For now, we say that the minimum tick spacing in pixels must be 40
    // We also limit the maximum number of ticks to 11 which gives a nice 10 squares on
    // the graph. Make sure we always have at least 2 ticks
    let maxTicks = this.getTickLimit();
    maxTicks = Math.max(2, maxTicks);

    const numericGeneratorOptions = {
      maxTicks,
      bounds: opts.bounds,
      min: opts.min,
      max: opts.max,
      precision: tickOpts.precision,
      step: tickOpts.stepSize,
      count: tickOpts.count,
      maxDigits: this._maxDigits(),
      horizontal: this.isHorizontal(),
      minRotation: tickOpts.minRotation || 0,
      includeBounds: tickOpts.includeBounds !== false
    };
    const dataRange = this._range || this;
    const ticks = generateTicks(numericGeneratorOptions, dataRange);

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
	 * @protected
	 */
  configure() {
    const ticks = this.ticks;
    let start = this.min;
    let end = this.max;

    super.configure();

    if (this.options.offset && ticks.length) {
      const offset = (end - start) / Math.max(ticks.length - 1, 1) / 2;
      start -= offset;
      end += offset;
    }
    this._startValue = start;
    this._endValue = end;
    this._valueRange = end - start;
  }

  getLabelForValue(value) {
    return formatNumber(value, this.chart.options.locale, this.options.ticks.format);
  }
}
