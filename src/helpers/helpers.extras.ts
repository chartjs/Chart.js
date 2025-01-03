import type {ChartMeta, PointElement} from '../types/index.js';

import {_limitValue} from './helpers.math.js';
import {_lookupByKey} from './helpers.collection.js';
import {isNullOrUndef} from './helpers.core.js';

export function fontString(pixelSize: number, fontStyle: string, fontFamily: string) {
  return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
}

/**
* Request animation polyfill
*/
export const requestAnimFrame = (function() {
  if (typeof window === 'undefined') {
    return function(callback) {
      return callback();
    };
  }
  return window.requestAnimationFrame;
}());

/**
 * Throttles calling `fn` once per animation frame
 * Latest arguments are used on the actual call
 */
export function throttled<TArgs extends Array<any>>(
  fn: (...args: TArgs) => void,
  thisArg: any,
) {
  let argsToUse = [] as TArgs;
  let ticking = false;

  return function(...args: TArgs) {
    // Save the args for use later
    argsToUse = args;
    if (!ticking) {
      ticking = true;
      requestAnimFrame.call(window, () => {
        ticking = false;
        fn.apply(thisArg, argsToUse);
      });
    }
  };
}

/**
 * Debounces calling `fn` for `delay` ms
 */
export function debounce<TArgs extends Array<any>>(fn: (...args: TArgs) => void, delay: number) {
  let timeout;
  return function(...args: TArgs) {
    if (delay) {
      clearTimeout(timeout);
      timeout = setTimeout(fn, delay, args);
    } else {
      fn.apply(this, args);
    }
    return delay;
  };
}

/**
 * Converts 'start' to 'left', 'end' to 'right' and others to 'center'
 * @private
 */
export const _toLeftRightCenter = (align: 'start' | 'end' | 'center') => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';

/**
 * Returns `start`, `end` or `(start + end) / 2` depending on `align`. Defaults to `center`
 * @private
 */
export const _alignStartEnd = (align: 'start' | 'end' | 'center', start: number, end: number) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2;

/**
 * Returns `left`, `right` or `(left + right) / 2` depending on `align`. Defaults to `left`
 * @private
 */
export const _textX = (align: 'left' | 'right' | 'center', left: number, right: number, rtl: boolean) => {
  const check = rtl ? 'left' : 'right';
  return align === check ? right : align === 'center' ? (left + right) / 2 : left;
};

/**
 * Return start and count of visible points.
 * @private
 */
export function _getStartAndCountOfVisiblePoints(meta: ChartMeta<'line' | 'scatter'>, points: PointElement[], animationsDisabled: boolean) {
  const pointCount = points.length;

  let start = 0;
  let count = pointCount;

  if (meta._sorted) {
    const {iScale, vScale, _parsed} = meta;
    const spanGaps = meta.dataset ? meta.dataset.options ? meta.dataset.options.spanGaps : null : null;
    const axis = iScale.axis;
    const {min, max, minDefined, maxDefined} = iScale.getUserBounds();

    if (minDefined) {
      start = Math.min(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, axis, min).lo,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? pointCount : _lookupByKey(points, axis, iScale.getPixelForValue(min)).lo);
      if (spanGaps) {
        const distanceToDefinedLo = (_parsed
          .slice(0, start + 1)
          .reverse()
          .findIndex(
            point => !isNullOrUndef(point[vScale.axis])));
        start -= Math.max(0, distanceToDefinedLo);
      }
      start = _limitValue(start, 0, pointCount - 1);
    }
    if (maxDefined) {
      let end = Math.max(
        // @ts-expect-error Need to type _parsed
        _lookupByKey(_parsed, iScale.axis, max, true).hi + 1,
        // @ts-expect-error Need to fix types on _lookupByKey
        animationsDisabled ? 0 : _lookupByKey(points, axis, iScale.getPixelForValue(max), true).hi + 1);
      if (spanGaps) {
        const distanceToDefinedHi = (_parsed
          .slice(end - 1)
          .findIndex(
            point => !isNullOrUndef(point[vScale.axis])));
        end += Math.max(0, distanceToDefinedHi);
      }
      count = _limitValue(end, start, pointCount) - start;
    } else {
      count = pointCount - start;
    }
  }

  return {start, count};
}

/**
 * Checks if the scale ranges have changed.
 * @param {object} meta - dataset meta.
 * @returns {boolean}
 * @private
 */
export function _scaleRangesChanged(meta) {
  const {xScale, yScale, _scaleRanges} = meta;
  const newRanges = {
    xmin: xScale.min,
    xmax: xScale.max,
    ymin: yScale.min,
    ymax: yScale.max
  };
  if (!_scaleRanges) {
    meta._scaleRanges = newRanges;
    return true;
  }
  const changed = _scaleRanges.xmin !== xScale.min
		|| _scaleRanges.xmax !== xScale.max
		|| _scaleRanges.ymin !== yScale.min
		|| _scaleRanges.ymax !== yScale.max;

  Object.assign(_scaleRanges, newRanges);
  return changed;
}
