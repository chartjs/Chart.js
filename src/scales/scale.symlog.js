import {callback as call, isArray, isFinite, isNullOrUndef, toDimension} from '../helpers/helpers.core.js';
import {log10, sign, toRadians} from '../helpers/helpers.math.js';
import LinearScaleBase from './scale.linearbase.js';
import Ticks from '../core/core.ticks.js';

const DEFAULT_LINEAR_THRESHOLD = 1;

/** Guard against pathological option values generating huge numbers of candidates */
const MAX_LINEAR_CANDIDATES = 1000;

/**
 * Bi-symmetric log transform (Webber, 2012): sign(x) * ln(1 + |x| / c).
 * Continuous and strictly monotonic over all reals, ~linear for |x| << c and
 * ~logarithmic for |x| >> c. One decade is ~ln(10) transformed units wide once |x| >> c.
 * Its slope, 1 / (c + |x|), is used to convert distances between value and transformed units.
 */
function transform(value, c) {
  return sign(value) * Math.log1p(Math.abs(value) / c);
}

function inverse(value, c) {
  return sign(value) * c * Math.expm1(Math.abs(value));
}

/**
 * transform(a) - transform(b), computed without cancellation when a and b are close
 * (e.g. 1e15 and 1e15 + 10, whose transforms are a single floating point step apart).
 */
function delta(a, b, c) {
  if (a >= 0 && b >= 0) {
    return Math.log1p((a - b) / (c + b));
  }
  if (a <= 0 && b <= 0) {
    return -Math.log1p((b - a) / (c - b));
  }
  return transform(a, c) - transform(b, c);
}

/**
 * The value `a` for which delta(a, b) === units, i.e. `b` moved by `units` in
 * transformed space, without the precision loss of inverse(transform(b) + units).
 */
function shift(b, units, c) {
  const target = transform(b, c) + units;
  if (b >= 0 && target >= 0) {
    return b + (c + b) * Math.expm1(units);
  }
  if (b <= 0 && target <= 0) {
    return b - (c - b) * Math.expm1(-units);
  }
  return inverse(target, c);
}

/**
 * `significand * 10^exp`, dividing for negative exponents to avoid
 * floating point noise such as 3 * 1e-5 = 0.000030000000000000004
 */
function scaled(significand, exp) {
  return exp < 0 ? significand / Math.pow(10, -exp) : significand * Math.pow(10, exp);
}

/**
 * Splits a positive number into a significand in [1, 10) and exponent,
 * rounding away floating point noise (e.g. 3.0000000000000004)
 */
function decompose(abs) {
  const exp = Math.floor(log10(abs));
  return {exp, significand: Math.round(abs / scaled(1, exp) * 1e9) / 1e9};
}

/**
 * `k * step` for a step of 1, 2 or 5 * 10^n, without floating point noise such as
 * 3 * 0.1 = 0.30000000000000004, and without losing digits at large magnitudes
 * (1e15 + 10 stays 1e15 + 10).
 */
function multipleOf(k, step) {
  const {exp, significand} = decompose(step);
  return scaled(k * significand, exp);
}

/**
 * Smallest 1, 2 or 5 * 10^n that is >= value (> 0)
 */
function niceStep(value) {
  const {exp, significand} = decompose(value);
  const digit = significand <= 1 ? 1 : significand <= 2 ? 2 : significand <= 5 ? 5 : 10;
  return scaled(digit, exp);
}

/**
 * Tick step for linearly spaced ticks where the scale is flattest (largest |value|),
 * so that neighbouring ticks are at least `gap` transformed units apart everywhere.
 * @return {number} the step, or 0 if there is no usable gap
 */
function linearStep(gap, c, flattestAbs) {
  const step = gap * (c + flattestAbs);
  return isFinite(step) && step > 0 ? niceStep(step) : 0;
}

/**
 * Rounds an axis end outward (min down, max up) to the finer of one significant digit
 * and the linear tick step `step`, so wide ranges end on e.g. 2e8 and -5000, and
 * narrow ranges on a multiple of their tick step (e.g. 120..180 stays 120..180).
 */
function roundEnd(value, up, step) {
  if (value === 0 || !isFinite(value)) {
    return value;
  }
  const magnitude = scaled(1, decompose(Math.abs(value)).exp);
  const unit = step > 0 ? Math.min(step, magnitude) : magnitude;
  const units = value / unit;
  // tolerate floating point noise, e.g. 0.7 / 0.1 = 6.999999999999999
  const rounded = multipleOf(up ? Math.ceil(units - 1e-9) : Math.floor(units + 1e-9), unit);
  // e.g. Number.MAX_VALUE would round to Infinity
  return isFinite(rounded) ? rounded : value;
}

const mod = (a, b) => ((a % b) + b) % b;

/** Lower value = more important tick */
const PRIORITY = {zero: 0, bound: 1, decade: 2, linear: 3, band: 4, five: 5, two: 6};

/**
 * Exponents of the powers of ten worth considering as ticks, largest first.
 * Decades far below c are squashed against zero, so a few of them are enough.
 */
function decadeExponents(min, max, c) {
  const absMax = Math.max(Math.abs(min), Math.abs(max));
  const absMin = min > 0 ? min : max < 0 ? -max : 0;
  const maxExp = Math.floor(log10(absMax));
  const minExp = absMin > 0
    ? Math.floor(log10(absMin))
    : Math.min(maxExp, Math.floor(log10(c))) - 3;
  const exponents = [];
  if (!isFinite(maxExp) || !isFinite(minExp)) {
    return exponents;
  }
  for (let exp = maxExp; exp >= minExp; exp--) {
    exponents.push(exp);
  }
  return exponents;
}

/**
 * +/- significand * 10^exp for each exponent, as tick candidates
 */
function multiples(exponents, significand, priority) {
  const result = [];
  for (const exp of exponents) {
    const value = scaled(significand, exp);
    result.push({value, priority}, {value: -value, priority});
  }
  return result;
}

/**
 * Multiples of `step` within [from, to], as tick candidates
 */
function linearTicks(from, to, step, priority) {
  const result = [];
  const count = (to - from) / step;
  if (!(step > 0) || !(count <= MAX_LINEAR_CANDIDATES)) {
    return result;
  }
  // Bounded by count: for values beyond 2^53 steps, k + 1 can equal k in floating point
  const first = Math.ceil(from / step - 1e-9);
  for (let i = 0; i <= count + 1; i++) {
    const value = multipleOf(first + i, step);
    if (value > to + step * 1e-9) {
      break;
    }
    result.push({value, priority});
  }
  return result;
}

/**
 * Linearly spaced candidates over the whole range, with the step chosen where the scale is
 * flattest. On ranges that are narrow next to their values (e.g. 4000..4010) the scale is
 * close to linear and these are the ticks that matter; on wide ranges the step is so large
 * that they rarely add anything.
 */
function rangeTicks(min, max, c, gap) {
  const step = linearStep(gap, c, Math.max(Math.abs(min), Math.abs(max)));
  return linearTicks(min, max, step, PRIORITY.linear);
}

/**
 * Linearly spaced candidates inside the linear band (|value| <= c), where powers of ten
 * would bunch up. The step is chosen for the flattest part of the band that is on screen.
 */
function bandTicks(min, max, c, gap) {
  const edge = Math.min(c, Math.max(Math.abs(min), Math.abs(max)));
  const step = linearStep(gap, c, edge);
  return linearTicks(Math.max(min, -edge), Math.min(max, edge), step, PRIORITY.band);
}

const isAnchor = ({priority}) => priority <= PRIORITY.bound;
const isMinor = ({priority}) => priority >= PRIORITY.five;

/**
 * Greedily accepts candidates by priority (then larger magnitude first), skipping any
 * candidate too close (in transformed units) to an already accepted tick, up to maxCount.
 * Ticks on the regular grids (powers of ten, linear and band ticks) and the optional 2x/5x
 * fill-ins keep `gap`, the density limit. Zero and the axis ends only push a regular tick
 * away if those two labels would not fit next to each other (`labelGap(a, b)`, the label
 * sizes plus `autoSkipPadding`): otherwise an end at 30 would drop the 100 next to it.
 * @return {object[]} ticks sorted by value
 */
function spaceOut(candidates, {gap, labelGap, maxCount}, c) {
  const sorted = candidates.slice().sort((a, b) => a.priority - b.priority || Math.abs(b.value) - Math.abs(a.value));
  // niceStep tolerates floating point noise, so a step can be a hair under the gap
  const tolerance = 1 - 1e-6;
  const required = (a, b) => isAnchor(a) !== isAnchor(b) && !isMinor(a) && !isMinor(b) ? labelGap(a.value, b.value) : gap;
  const accepted = [];
  for (const candidate of sorted) {
    if (accepted.length >= maxCount) {
      break;
    }
    const {value} = candidate;
    if (accepted.every(tick => tick.value !== value && Math.abs(delta(value, tick.value, c)) >= required(candidate, tick) * tolerance)) {
      accepted.push(candidate);
    }
  }
  return accepted
    .sort((a, b) => a.value - b.value)
    .map(({value}) => ({value}));
}

/**
 * The roundest value (a power of ten, then 5x, then 2x) accepted by `fits`, the one
 * furthest in `side`'s direction among equally round values, or undefined
 */
function roundestValue(exponents, fits, side) {
  for (const significand of [1, 5, 2]) {
    const values = multiples(exponents, significand, 0).map(({value}) => value).filter(fits);
    if (values.length) {
      return side > 0 ? Math.max(...values) : Math.min(...values);
    }
  }
  return undefined;
}

/**
 * When an axis end is not a tick itself (`bounds: 'data'`, or `min` / `max` with
 * `includeBounds: false`), the stretch between the outermost tick and that end can be
 * left empty (e.g. 0 1 10 100 1K on an axis up to 9000). Adds the roundest value that
 * fits there, as close to the end as possible (e.g. 5K). It only ever goes beyond the
 * outermost tick, never between ticks.
 * @return {object[]} ticks sorted by value
 */
function extendToEnds(ticks, exponents, {min, max, gap, maxCount}, c) {
  const result = ticks.slice();
  for (const side of [1, -1]) {
    const outer = side > 0 ? result[result.length - 1] : result[0];
    const end = side > 0 ? max : min;
    if (!outer || outer.value === end || result.length >= maxCount) {
      continue;
    }
    const beyond = value => side > 0 ? value > outer.value && value <= end : value < outer.value && value >= end;
    const fits = value => beyond(value) && Math.abs(delta(value, outer.value, c)) >= gap * (1 - 1e-6);
    const value = roundestValue(exponents, fits, side);
    if (value !== undefined) {
      result.splice(side > 0 ? result.length : 0, 0, {value});
    }
  }
  return result;
}

export default class SymLogScale extends LinearScaleBase {

  static id = 'symlog';

  /**
   * @type {any}
   */
  static defaults = {
    /**
     * How far from zero the scale stays close to linear. There is no cutoff: values much
     * smaller than this are spaced almost linearly, much larger ones almost logarithmically.
     */
    linearThreshold: DEFAULT_LINEAR_THRESHOLD,

    ticks: {
      callback: Ticks.formatters.symlog
    }
  };

  constructor(cfg) {
    super(cfg);

    /** @type {number} */
    this._linearThreshold = DEFAULT_LINEAR_THRESHOLD;
    /** @type {{min: number, max: number}} data limits including grace, before rounding */
    this._limits = {min: 0, max: 1};
    /** @type {number} offset in transformed units, see configure */
    this._offset = 0;
    /** @type {*} last invalid linearThreshold that was warned about */
    this._warnedThreshold = undefined;
  }

  determineDataLimits() {
    const threshold = this.options.linearThreshold;
    if (isFinite(threshold) && threshold > 0) {
      this._linearThreshold = threshold;
      this._warnedThreshold = undefined;
    } else {
      // Warn once per bad value, not on every update / resize
      if (!Object.is(threshold, this._warnedThreshold)) {
        const shown = typeof threshold === 'string' ? `'${threshold}'` : threshold;
        console.warn(`scales.${this.id}.linearThreshold: ${shown} is not a positive number, using ${DEFAULT_LINEAR_THRESHOLD}.`);
        this._warnedThreshold = threshold;
      }
      this._linearThreshold = DEFAULT_LINEAR_THRESHOLD;
    }

    const {min, max} = this.getMinMax(true);

    this.min = isFinite(min) ? min : 0;
    this.max = isFinite(max) ? max : 1;

    // Common base implementation to handle min, max, beginAtZero
    this.handleTickRangeOptions();
  }

  /**
   * Runs once per data limits computation, after the user's `afterDataLimits` hook (which
   * is also when the core computes grace for linear scales). buildTicks runs several times
   * per update during layout, so it starts from these limits every time.
   */
  afterDataLimits() {
    super.afterDataLimits();

    const {minDefined, maxDefined} = this.getUserBounds();
    this._limits = this._withGrace(minDefined, maxDefined);
  }

  buildTicks() {
    const opts = this.options;
    const includeBounds = opts.ticks.includeBounds !== false;
    const {minDefined, maxDefined} = this.getUserBounds();
    const boundsTicks = opts.bounds === 'ticks';
    const length = this.isHorizontal() ? this.width : this.height;

    const limits = this._limits;
    this.min = limits.min;
    this.max = limits.max;

    // With `bounds: 'ticks'` the axis ends on round numbers, unless the user fixed that
    // end with `min` / `max`. Rounding widens the range, which can call for a larger
    // tick step, so re-round with the step of the rounded range until it settles.
    if (boundsTicks) {
      let step = this._linearStep(length);
      for (let i = 0; i < 3; i++) {
        this.min = minDefined ? limits.min : roundEnd(limits.min, false, step);
        this.max = maxDefined ? limits.max : roundEnd(limits.max, true, step);
        const next = this._linearStep(length);
        if (next === step) {
          break;
        }
        step = next;
      }
    }

    const ticks = this._generateTicks(
      length,
      minDefined ? includeBounds : boundsTicks,
      maxDefined ? includeBounds : boundsTicks
    );

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
   * `grace` as a percentage is applied in transformed space, i.e. as a share of the
   * axis length like on a linear scale, instead of a share of the value range (which
   * would add several decades at the low end). A numeric `grace` is an amount in data
   * units, as on a linear scale. Ends set with `min` / `max` are not padded, and with
   * `beginAtZero` an end at 0 stays at 0. Unlike linear, grace also widens the axis
   * with `bounds: 'data'`.
   * @private
   */
  _withGrace(minDefined, maxDefined) {
    const {grace, beginAtZero} = this.options;
    const c = this._linearThreshold;
    const {min, max} = this;
    if (!grace) {
      return {min, max};
    }
    const percentage = typeof grace === 'string' && grace.endsWith('%');
    const change = Math.abs(percentage
      ? toDimension(grace, delta(max, min, c) / 2)
      : +grace);
    const pad = (value, defined, direction) => {
      if (defined || (beginAtZero && value === 0)) {
        return value;
      }
      return percentage
        ? shift(value, direction * change, c)
        : value + direction * change;
    };
    const result = {min: pad(min, minDefined, -1), max: pad(max, maxDefined, 1)};
    return isFinite(result.min) && isFinite(result.max) ? result : {min, max};
  }

  /**
   * Step of linearly spaced ticks over the current min/max at the default density
   * @private
   */
  _linearStep(length) {
    const gap = this._densitySpacing(length) * this._unitsPerPixel(length);
    return linearStep(gap, this._linearThreshold, Math.max(Math.abs(this.min), Math.abs(this.max)));
  }

  /**
   * Transformed units per pixel for the current min/max
   * @private
   */
  _unitsPerPixel(length) {
    const range = delta(this.max, this.min, this._linearThreshold);
    return length > 0 && range > 0 ? range / length : 0;
  }

  /**
   * Picks ticks so that adjacent labels never overlap along the axis.
   * Candidates are 0, the axis ends, every `step`-th power of ten (both signs) outside the
   * linear band, linearly spaced ticks over the range and inside the band and, when there
   * is room, 2x and 5x multiples of powers of ten. They are accepted in priority order
   * (zero > ends > powers of ten > linear > band > 5x > 2x) if they keep a minimum pixel
   * gap to all ticks accepted before them, so crowding around zero or near an end drops
   * the less important tick instead of overlapping labels.
   * @private
   */
  _generateTicks(length, includeMin, includeMax) {
    const {min, max} = this;
    const c = this._linearThreshold;
    const exponents = decadeExponents(min, max, c);
    const inRange = ({value}) => value >= min && value <= max;
    // Inside the linear band powers of ten bunch up; band ticks are used there instead
    const outsideBand = ({value}) => Math.abs(value) >= c;
    const bounds = [];
    if (includeMin) {
      bounds.push({value: min, priority: PRIORITY.bound});
    }
    if (includeMax) {
      bounds.push({value: max, priority: PRIORITY.bound});
    }
    const candidates = [
      {value: 0, priority: PRIORITY.zero},
      ...bounds,
      ...multiples(exponents, 1, PRIORITY.decade).filter(outsideBand)
    ].filter(inRange);

    // Minimum gap between ticks in transformed units. Linear and band ticks depend on the
    // gap, so their labels are measured at the densest step they could get.
    const unitsPerPixel = this._unitsPerPixel(length);
    const densityGap = this._densitySpacing(length) * unitsPerPixel;
    const measured = candidates.concat(rangeTicks(min, max, c, densityGap), bandTicks(min, max, c, densityGap));
    const extents = this._labelExtents(measured);
    const largest = Math.max(0, ...extents.values());
    // Horizontal: Scale#calculateLabelRotation rotates labels unless they have 6px to spare
    const spare = this.isHorizontal() ? 6 : 0;
    const gap = Math.max(densityGap, (largest + spare) * unitsPerPixel);
    // Zero and the ends may sit closer to a regular tick than the density limit, as long
    // as those two labels do not overlap
    const extent = value => extents.has(value) ? extents.get(value) : largest;
    // Per pair only the labels themselves need to fit; the 6px for the rotation check is about
    // the average spacing, which maxCount below takes care of
    const labelGap = (a, b) => Math.min(gap, Math.max((extent(a) + extent(b)) / 2 * unitsPerPixel, gap / 2));
    // Never more ticks than fit at the largest label size, or the core would rotate or skip labels
    const maxCount = largest > 0 && length > 0 ? Math.floor(length / (largest + spare)) + 1 : Infinity;

    // Show every `step`-th decade, so decades (~ln(10) units apart) stay gap apart
    const step = Math.max(1, Math.ceil(gap / Math.LN10));
    const selected = candidates.filter(({value, priority}) =>
      priority !== PRIORITY.decade || mod(Math.round(log10(Math.abs(value))), step) === 0);
    selected.push(...rangeTicks(min, max, c, gap), ...bandTicks(min, max, c, gap));
    // 2x/5x ticks only when every decade has room for them (1 -> 2 and 5 -> 10 are
    // ln(2) apart), never as a one-off stand-in for a power of ten that did not fit
    if (gap <= Math.LN2) {
      selected.push(
        ...multiples(exponents, 5, PRIORITY.five).filter(outsideBand).filter(inRange),
        ...multiples(exponents, 2, PRIORITY.two).filter(outsideBand).filter(inRange)
      );
    }

    const ticks = spaceOut(selected, {gap, labelGap, maxCount}, c);
    return extendToEnds(ticks, exponents, {min, max, gap, maxCount}, c);
  }

  /**
   * Distance in pixels between ticks if `maxTicksLimit` (default 11) were spread evenly
   * @private
   */
  _densitySpacing(length) {
    const maxTicks = Math.max(2, this.options.ticks.maxTicksLimit || 11);
    return length > 0 ? length / (maxTicks - 1) : 0;
  }

  /**
   * Size in pixels each candidate label takes up along the axis, at `minRotation` and
   * including `autoSkipPadding` (same projection as Scale#_tickSize), using the
   * configured callback. Empty when tick labels are not displayed.
   * @return {Map<number, number>}
   * @private
   */
  _labelExtents(candidates) {
    const tickOpts = this.options.ticks;
    const extents = new Map();
    if (!tickOpts.display || !candidates.length) {
      return extents;
    }
    const ctx = this.ctx;
    const font = this._resolveTickFontOptions(0);
    const padding = tickOpts.autoSkipPadding || 0;
    const rot = toRadians(tickOpts.minRotation || 0);
    const cos = Math.abs(Math.cos(rot));
    const sin = Math.abs(Math.sin(rot));
    const horizontal = this.isHorizontal();
    const values = [...new Set(candidates.map(({value}) => value))].sort((a, b) => a - b);
    const ticks = values.map(value => ({value}));

    ctx.save();
    ctx.font = font.string;
    ticks.forEach((tick, i) => {
      const label = call(tickOpts.callback, [tick.value, i, ticks], this);
      const parts = isArray(label) ? label : [label];
      let width = 0;
      for (const part of parts) {
        if (!isNullOrUndef(part)) {
          width = Math.max(width, ctx.measureText('' + part).width);
        }
      }
      const w = width + padding;
      const h = parts.length * font.lineHeight + padding;
      extents.set(tick.value, horizontal
        ? h * cos > w * sin ? w / cos : h / sin
        : h * sin < w * cos ? h / cos : w / sin);
    });
    ctx.restore();

    return extents;
  }

  /**
	 * @protected
	 */
  configure() {
    const ticks = this.ticks;
    const c = this._linearThreshold;
    const range = delta(this.max, this.min, c);

    super.configure();

    // Same as LinearScaleBase, but the offset is applied in transformed space
    const offset = this.options.offset && ticks.length
      ? range / Math.max(ticks.length - 1, 1) / 2
      : 0;
    // Positions are computed relative to min (see delta), these are informational
    this._startValue = transform(this.min, c) - offset;
    this._endValue = transform(this.max, c) + offset;
    this._offset = offset;
    this._valueRange = range + 2 * offset;
  }

  getPixelForValue(value) {
    if (value === null || isNaN(value)) {
      return NaN;
    }
    return this.getPixelForDecimal((delta(value, this.min, this._linearThreshold) + this._offset) / this._valueRange);
  }

  getValueForPixel(pixel) {
    return shift(this.min, this.getDecimalForPixel(pixel) * this._valueRange - this._offset, this._linearThreshold);
  }
}
