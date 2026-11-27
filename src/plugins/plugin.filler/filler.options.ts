import {isObject, isFinite, valueOrDefault} from '../../helpers/helpers.core.js';
import type Scale from '../../core/core.scale.js';
import type LineElement from '../../elements/element.line.js';
import type {FillTarget, ComplexFillTarget} from '../../types/index.js';
import type {AnyObject} from '../../types/basic.js';

export type {Scale, LineElement, FillTarget, ComplexFillTarget};

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

export function _decodeFill(line: LineElement, index: number, count: number) {
  const fill: string | {value: number} = parseFillOption(line);

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

export function _getTargetPixel(fill: FillTarget | ComplexFillTarget, scale: Scale): number | null {
  let pixel = null;
  if (fill === 'start') {
    pixel = scale.bottom;
  } else if (fill === 'end') {
    pixel = scale.top;
  } else if (isObject(fill)) {
    pixel = scale.getPixelForValue((fill as {value: number}).value);
  } else if (scale.getBasePixel) {
    pixel = scale.getBasePixel();
  }
  return pixel;
}

export function _getTargetValue(
  fill: FillTarget | ComplexFillTarget,
  scale: Scale,
  startValue: number
): number | undefined {
  let value: number | undefined;

  if (fill === 'start') {
    value = startValue;
  } else if (fill === 'end') {
    value = scale.options.reverse ? scale.min : scale.max;
  } else if (isObject(fill)) {
    value = (fill as {value: number}).value;
  } else {
    value = scale.getBaseValue();
  }
  return value;
}

function parseFillOption(line: LineElement) {
  // `fill` is a number, a string, a boolean or an object, told apart at runtime here and in `_decodeFill`
  const options: AnyObject = line.options;
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
