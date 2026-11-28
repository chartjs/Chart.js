import {_factorize} from '../helpers/helpers.math.js';


/**
 * @typedef { import('./core.controller.js').default } Chart
 * @typedef {{value:number | string, label?:string, major?:boolean, $context?:any}} Tick
 */

/**
 * Returns a subset of ticks to be plotted to avoid overlapping labels.
 * @param {import('./core.scale.js').default & {_autoSkipAddedLast?: Tick | null}} scale
 * @param {Tick[]} ticks
 * @return {Tick[]}
 * @private
 */
export function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const determinedMaxTicks = determineMaxTicks(scale, ticks);
  const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
  const kept = skipTicks(ticks, tickOpts, ticksLimit);
  // The tick `ticks.autoSkipKeepEnds` added, or null. The bar width and the
  // time offsets read it, and only when it is still the scale's last tick.
  scale._autoSkipAddedLast = tickOpts.autoSkipKeepEnds ? keepLast(scale, ticks, kept, ticksLimit) : null;
  return kept;
}

/**
 * Adds the last tick to the kept ones, and drops the kept tick before it when
 * the two are closer than one label, or when keeping both would exceed the
 * limit. The first kept tick is never dropped: with room for one tick only,
 * the last one is not added.
 * @param {*} scale - the scale, for its pixels and its label size
 * @param {Tick[]} ticks
 * @param {Tick[]} kept - ticks of `ticks`, in order; the last tick is appended in place
 * @param {number} ticksLimit
 * @return {Tick | null} the tick appended, or null
 */
function keepLast(scale, ticks, kept, ticksLimit) {
  const last = ticks[ticks.length - 1];
  const count = kept.length;
  if (!count || kept[count - 1] === last || ticksLimit < 2) {
    return null;
  }
  if (count > 1) {
    const room = Math.abs(scale.getPixelForValue(last.value) - scale.getPixelForValue(kept[count - 1].value));
    if (count + 1 > ticksLimit || room < scale._tickSize()) {
      kept.pop();
    }
  }
  kept.push(last);
  return last;
}

/**
 * @param {Tick[]} ticks
 * @param {object} tickOpts
 * @param {number} ticksLimit
 * @return {Tick[]}
 */
function skipTicks(ticks, tickOpts, ticksLimit) {
  const majorIndices = tickOpts.major.enabled ? getMajorIndices(ticks) : [];
  const numMajorIndices = majorIndices.length;
  const newTicks = [];

  // If there are too many major ticks to display them all
  if (numMajorIndices > ticksLimit) {
    skipMajors(ticks, newTicks, majorIndices, numMajorIndices / ticksLimit);
    return newTicks;
  }

  const step = Math.ceil(calculateSpacing(majorIndices, ticks, ticksLimit));

  if (numMajorIndices === 0) {
    skip((i) => newTicks.push(ticks[i]), step, 0, ticks.length - 1);
    return newTicks;
  }

  // Descending ticks (a reversed axis) are walked as if ascending, so that
  // each step counts from the major its stretch starts with.
  if (isDescending(ticks)) {
    const lastIndex = ticks.length - 1;
    mirror(majorIndices, ticks.length);
    keepFromMajors(ticks.length, majorIndices, step, (i) => newTicks.push(ticks[lastIndex - i]));
    return newTicks.reverse();
  }
  keepFromMajors(ticks.length, majorIndices, step, (i) => newTicks.push(ticks[i]));
  return newTicks;
}

/**
 * Repeats the same whole step from each major, and drops a tick closer than
 * one step to the next major. Before the first and after the last major,
 * majors are assumed at the average major spacing; a single major runs to the
 * first and the last tick.
 * @param {number} count - the number of ticks
 * @param {number[]} majorIndices - ascending
 * @param {number} step - a whole number of ticks
 * @param {(index: number) => void} keep - called with each kept index, ascending
 */
function keepFromMajors(count, majorIndices, step, keep) {
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
  const headStart = avgMajorSpacing === null ? 0 : Math.max(first - avgMajorSpacing, 0);
  const tailEnd = avgMajorSpacing === null ? count - 1 : last + avgMajorSpacing - step;

  skip(keep, step, first - Math.floor((first - headStart) / step) * step, first - step);
  for (let i = 0; i < numMajorIndices; i++) {
    const end = i < numMajorIndices - 1 ? majorIndices[i + 1] - step : tailEnd;
    skip(keep, step, majorIndices[i], Math.min(Math.max(end, majorIndices[i]), count - 1));
  }
}

/**
 * Counts the indexes from the other end, in place, and keeps them ascending.
 * @param {number[]} indices
 * @param {number} length
 */
function mirror(indices, length) {
  indices.reverse();
  for (let i = 0; i < indices.length; i++) {
    indices[i] = length - 1 - indices[i];
  }
}

/**
 * Whether the ticks run from the largest value to the smallest, as a reversed
 * axis builds them.
 * @param {Tick[]} ticks
 */
function isDescending(ticks) {
  const first = ticks[0].value;
  const last = ticks[ticks.length - 1].value;
  return typeof first === 'number' && typeof last === 'number' && first > last;
}

/**
 * @typedef {object} ValueRange
 * @property {number} [_startValue]
 * @property {number} [_valueRange]
 * @property {number} _length
 * @property {(value: number | string) => number} [_valueToAxis]
 */

/**
 * The number of labels that fit: over the part of the axis the ticks cover,
 * and never more than over the whole axis. The part is read from
 * `_startValue` and `_valueRange`, which the scale's `configure` sets before
 * autoSkip runs.
 * @param {Tick[]} ticks
 */
function determineMaxTicks(scale, ticks) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  const maxTicks = Math.floor(Math.min(maxScale, maxChart));
  const fromValues = countFromValues(scale, ticks, tickLength);
  return Number.isFinite(fromValues) ? Math.min(maxTicks, fromValues) : maxTicks;
}

/**
 * The number of labels that fit from the first to the last tick value. A
 * scale whose tick values are in another space than `_startValue` and
 * `_valueRange` maps them with `_valueToAxis` (the logarithmic scale counts
 * decades). Without a value range (the time scale) the result is not finite.
 * @param {ValueRange} scale
 * @param {Tick[]} ticks
 * @param {number} tickLength
 */
function countFromValues(scale, ticks, tickLength) {
  if (!ticks.length) {
    return NaN;
  }
  const first = toAxis(scale, ticks[0].value);
  const last = toAxis(scale, ticks[ticks.length - 1].value);
  const room = Math.abs(last - first) / scale._valueRange * scale._length / tickLength;
  // A span that should fill the room exactly can come out a hair short.
  return Math.floor(room * (1 + 1e-9)) + 1;
}

/**
 * @param {ValueRange} scale
 * @param {number | string} value
 */
function toAxis(scale, value) {
  return scale._valueToAxis ? scale._valueToAxis(value) : +value;
}

/**
 * @param {number[]} majorIndices
 * @param {Tick[]} ticks
 * @param {number} ticksLimit
 */
function calculateSpacing(majorIndices, ticks, ticksLimit) {
  const evenMajorSpacing = getEvenSpacing(majorIndices);
  const spacing = ticks.length / ticksLimit;

  // If the major ticks are evenly spaced apart, place the minor ticks
  // so that they divide the major ticks into even chunks
  if (!evenMajorSpacing) {
    return Math.max(spacing, 1);
  }

  for (const factor of _factorize(evenMajorSpacing)) {
    if (factor > spacing) {
      return factor;
    }
  }
  return Math.max(spacing, 1);
}

/**
 * @param {Tick[]} ticks
 */
function getMajorIndices(ticks) {
  const result = [];
  let i, ilen;
  for (i = 0, ilen = ticks.length; i < ilen; i++) {
    if (ticks[i].major) {
      result.push(i);
    }
  }
  return result;
}

/**
 * @param {Tick[]} ticks
 * @param {Tick[]} newTicks
 * @param {number[]} majorIndices
 * @param {number} spacing
 */
function skipMajors(ticks, newTicks, majorIndices, spacing) {
  let count = 0;
  let next = majorIndices[0];
  let i;

  spacing = Math.ceil(spacing);
  for (i = 0; i < ticks.length; i++) {
    if (i === next) {
      newTicks.push(ticks[i]);
      count++;
      next = majorIndices[count * spacing];
    }
  }
}

/**
 * Keeps the indexes from `start` to `end`, both included, `step` apart.
 * @param {(index: number) => void} keep
 * @param {number} step - a whole number of ticks
 * @param {number} start
 * @param {number} end
 */
function skip(keep, step, start, end) {
  for (let i = start; i <= end; i += step) {
    keep(i);
  }
}

/**
 * @param {number[]} arr
 */
function getEvenSpacing(arr) {
  const len = arr.length;
  let i, diff;

  if (len < 2) {
    return false;
  }

  for (diff = arr[1] - arr[0], i = 2; i < len; ++i) {
    if (arr[i] - arr[i - 1] !== diff) {
      return false;
    }
  }
  return diff;
}
