import {isObject, isFinite, valueOrDefault} from '../../helpers/helpers.core.js';

/**
 * @typedef { import('../../core/core.scale.js').default } Scale
 * @typedef { import('../../elements/element.line.js').default } LineElement
 * @typedef { import('../../types/index.js').FillTarget } FillTarget
 * @typedef { import('../../types/index.js').ComplexFillTarget } ComplexFillTarget
 */

export function _resolveTarget(sources, index, propagate) {
  const source = sources[index];
  let fill = source.fill;
  const visited = [index];
  let target;

  if (!propagate) {
    return fill;
  }

  while (fill !== false && visited.indexOf(fill) === -1) {
    if (!isFinite(fill)) {
      return fill;
    }

    target = sources[fill];
    if (!target) {
      return false;
    }

    if (target.visible) {
      return fill;
    }

    visited.push(fill);
    fill = target.fill;
  }

  return false;
}

/**
 * @param {LineElement} line
 * @param {number} index
 * @param {number} count
 */
export function _decodeFill(line, index, count) {
  /** @type {string | {value: number}} */
  const fill = parseFillOption(line);

  if (isObject(fill)) {
    return isNaN(fill.value) ? false : fill;
  }

  let target = parseFloat(fill);

  if (isFinite(target) && Math.floor(target) === target) {
    return decodeTargetIndex(fill[0], index, target, count);
  }

  return ['origin', 'start', 'end', 'stack', 'shape'].indexOf(fill) >= 0 && fill;
}

function decodeTargetIndex(firstCh, index, target, count) {
  if (firstCh === '-' || firstCh === '+') {
    target = index + target;
  }

  if (target === index || target < 0 || target >= count) {
    return false;
  }

  return target;
}

/**
 * @param {FillTarget | ComplexFillTarget} fill
 * @param {Scale} scale
 * @returns {number | null}
 */
export function _getTargetPixel(fill, scale) {
  let pixel = null;
  if (fill === 'start') {
    pixel = scale.bottom;
  } else if (fill === 'end') {
    pixel = scale.top;
  } else if (isObject(fill)) {
    // @ts-ignore
    pixel = scale.getPixelForValue(fill.value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}

/**
 * @param {FillTarget | ComplexFillTarget} fill
 * @param {Scale} scale
 * @param {number} startValue
 * @returns {number | undefined}
 */
export function _getTargetValue(fill, scale, startValue) {
  let value;

  if (fill === 'start') {
    value = startValue;
  } else if (fill === 'end') {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if (isObject(fill)) {
    // @ts-ignore
    value = fill.value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}

/**
 * @param {LineElement} line
 */
function parseFillOption(line) {
  const options = line.options;
  const fillOption = options.fill;
  let fill = valueOrDefault(fillOption && fillOption.target, fillOption);

  if (fill === undefined) {
    fill = !!options.backgroundColor;
  }

  if (fill === false || fill === null) {
    return false;
  }

  if (fill === true) {
    return 'origin';
  }
  return fill;
}
