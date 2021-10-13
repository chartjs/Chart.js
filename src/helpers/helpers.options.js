import defaults from '../core/core.defaults';
import {isArray, isObject, toDimension, valueOrDefault} from './helpers.core';
import {toFontString} from './helpers.canvas';

const LINE_HEIGHT = new RegExp(/^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/);
const FONT_STYLE = new RegExp(/^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/);

/**
 * @alias Chart.helpers.options
 * @namespace
 */
/**
 * Converts the given line height `value` in pixels for a specific font `size`.
 * @param {number|string} value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
 * @param {number} size - The font size (in pixels) used to resolve relative `value`.
 * @returns {number} The effective line height in pixels (size * 1.2 if value is invalid).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
 * @since 2.7.0
 */
export function toLineHeight(value, size) {
  const matches = ('' + value).match(LINE_HEIGHT);
  if (!matches || matches[1] === 'normal') {
    return size * 1.2;
  }

  value = +matches[2];

  switch (matches[3]) {
  case 'px':
    return value;
  case '%':
    value /= 100;
    break;
  default:
    break;
  }

  return size * value;
}

const numberOrZero = v => +v || 0;

export function _readValueToProps(value, props) {
  const ret = {};
  const objProps = isObject(props);
  const keys = objProps ? Object.keys(props) : props;
  const read = isObject(value)
    ? objProps
      ? prop => valueOrDefault(value[prop], value[props[prop]])
      : prop => value[prop]
    : () => value;

  for (const prop of keys) {
    ret[prop] = numberOrZero(read(prop));
  }
  return ret;
}

/**
 * Converts the given value into a TRBL object.
 * @param {number|object} value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns {object} The padding values (top, right, bottom, left)
 * @since 3.0.0
 */
export function toTRBL(value) {
  return _readValueToProps(value, {top: 'y', right: 'x', bottom: 'y', left: 'x'});
}

/**
 * Converts the given value into a TRBL corners object (similar with css border-radius).
 * @param {number|object} value - If a number, set the value to all TRBL corner components,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 * @returns {object} The TRBL corner values (topLeft, topRight, bottomLeft, bottomRight)
 * @since 3.0.0
 */
export function toTRBLCorners(value) {
  return _readValueToProps(value, ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']);
}

/**
 * Converts the given value into a padding object with pre-computed width/height.
 * @param {number|object} value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns {object} The padding values (top, right, bottom, left, width, height)
 * @since 2.7.0
 */
export function toPadding(value) {
  const obj = toTRBL(value);

  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;

  return obj;
}


/**
 * Parses font options and returns the font object.
 * @param {object} options - A object that contains font options to be parsed.
 * @param {object} [fallback] - A object that contains fallback font options.
 * @return {object} The font object.
 * @private
 */
export function toFont(options, fallback) {
  options = options || {};
  fallback = fallback || defaults.font;

  let size = valueOrDefault(options.size, fallback.size);

  if (typeof size === 'string') {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options.style, fallback.style);
  if (style && !('' + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = '';
  }

  const font = {
    family: valueOrDefault(options.family, fallback.family),
    lineHeight: toLineHeight(valueOrDefault(options.lineHeight, fallback.lineHeight), size),
    size,
    style,
    weight: valueOrDefault(options.weight, fallback.weight),
    string: ''
  };

  font.string = toFontString(font);
  return font;
}

/**
 * Evaluates the given `inputs` sequentially and returns the first defined value.
 * @param {Array} inputs - An array of values, falling back to the last value.
 * @param {object} [context] - If defined and the current value is a function, the value
 * is called with `context` as first argument and the result becomes the new input.
 * @param {number} [index] - If defined and the current value is an array, the value
 * at `index` become the new input.
 * @param {object} [info] - object to return information about resolution in
 * @param {boolean} [info.cacheable] - Will be set to `false` if option is not cacheable.
 * @since 2.7.0
 */
export function resolve(inputs, context, index, info) {
  let cacheable = true;
  let i, ilen, value;

  for (i = 0, ilen = inputs.length; i < ilen; ++i) {
    value = inputs[i];
    if (value === undefined) {
      continue;
    }
    if (context !== undefined && typeof value === 'function') {
      value = value(context);
      cacheable = false;
    }
    if (index !== undefined && isArray(value)) {
      value = value[index % value.length];
      cacheable = false;
    }
    if (value !== undefined) {
      if (info && !cacheable) {
        info.cacheable = false;
      }
      return value;
    }
  }
}

/**
 * @param {{min: number, max: number}} minmax
 * @param {number|string} grace
 * @param {boolean} beginAtZero
 * @private
 */
export function _addGrace(minmax, grace, beginAtZero) {
  const {min, max} = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = (value, add) => beginAtZero && value === 0 ? 0 : value + add;
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}

/**
 * Create a context inheriting parentContext
 * @param {object|null} parentContext
 * @param {object} context
 * @returns {object}
 */
export function createContext(parentContext, context) {
  return Object.assign(Object.create(parentContext), context);
}
