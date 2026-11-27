import {_factorize} from '../helpers/helpers.math.js';


/**
 * @typedef { import('./core.controller.js').default } Chart
 * @typedef {{value:number | string, label?:string, major?:boolean, $context?:any}} Tick
 */

/**
 * Returns a subset of ticks to be plotted to avoid overlapping labels.
 * @param {import('./core.scale.js').default} scale
 * @param {Tick[]} ticks
 * @return {Tick[]}
 * @private
 */
export function autoSkip(scale, ticks) {
  const tickOpts = scale.options.ticks;
  const determinedMaxTicks = determineMaxTicks(scale);
  const ticksLimit = Math.min(tickOpts.maxTicksLimit || determinedMaxTicks, determinedMaxTicks);
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
    skip(ticks, newTicks, step, 0, ticks.length - 1);
    return newTicks;
  }

  // Descending ticks (a reversed axis) are walked in ascending order, so that
  // each step counts from the major its stretch starts with.
  if (isDescending(ticks)) {
    const ascending = ticks.slice().reverse();
    keepFromMajors(ascending, newTicks, getMajorIndices(ascending), step);
    return newTicks.reverse();
  }
  keepFromMajors(ticks, newTicks, majorIndices, step);
  return newTicks;
}

/**
 * Repeats the same whole step from each major, and drops a tick closer than
 * one step to the next major. Before the first and after the last major,
 * majors are assumed at the average major spacing; a single major runs to the
 * first and the last tick.
 * @param {Tick[]} ticks - in ascending order
 * @param {Tick[]} newTicks
 * @param {number[]} majorIndices
 * @param {number} step - a whole number of ticks
 */
function keepFromMajors(ticks, newTicks, majorIndices, step) {
  const numMajorIndices = majorIndices.length;
  const first = majorIndices[0];
  const last = majorIndices[numMajorIndices - 1];
  const avgMajorSpacing = numMajorIndices > 1 ? Math.round((last - first) / (numMajorIndices - 1)) : null;
  const headStart = avgMajorSpacing === null ? 0 : Math.max(first - avgMajorSpacing, 0);
  const tailEnd = avgMajorSpacing === null ? ticks.length - 1 : last + avgMajorSpacing - step;

  skip(ticks, newTicks, step, first - Math.floor((first - headStart) / step) * step, first - step);
  for (let i = 0; i < numMajorIndices; i++) {
    const end = i < numMajorIndices - 1 ? majorIndices[i + 1] - step : tailEnd;
    skip(ticks, newTicks, step, majorIndices[i], Math.max(end, majorIndices[i]));
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

function determineMaxTicks(scale) {
  const offset = scale.options.offset;
  const tickLength = scale._tickSize();
  const maxScale = scale._length / tickLength + (offset ? 0 : 1);
  const maxChart = scale._maxLength / tickLength;
  return Math.floor(Math.min(maxScale, maxChart));
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
 * Keeps the ticks from `start` to `end`, both included, `step` apart.
 * @param {Tick[]} ticks
 * @param {Tick[]} newTicks
 * @param {number} step - a whole number of ticks
 * @param {number} start
 * @param {number} end
 */
function skip(ticks, newTicks, step, start, end) {
  const stop = Math.min(end, ticks.length - 1);
  for (let i = start; i <= stop; i += step) {
    newTicks.push(ticks[i]);
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
