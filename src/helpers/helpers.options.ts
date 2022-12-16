import defaults from '../core/core.defaults.js';
import {isArray, isObject, toDimension, valueOrDefault} from './helpers.core.js';
import {Point, toFontString} from './helpers.canvas.js';
import type {ChartArea, FontSpec} from '../types/index.js';
import type {TRBL, TRBLCorners} from '../types/geometric.js';

const LINE_HEIGHT = /^(normal|(\d+(?:\.\d+)?)(px|em|%)?)$/;
const FONT_STYLE = /^(normal|italic|initial|inherit|unset|(oblique( -?[0-9]?[0-9]deg)?))$/;

/**
 * @alias Chart.helpers.options
 * @namespace
 */
/**
 * Converts the given line height `value` in pixels for a specific font `size`.
 * @param value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
 * @param size - The font size (in pixels) used to resolve relative `value`.
 * @returns The effective line height in pixels (size * 1.2 if value is invalid).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
 * @since 2.7.0
 */
export function toLineHeight(value: number | string, size: number): number {
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

const numberOrZero = (v: unknown) => +v || 0;

/**
 * @param value
 * @param props
 */
export function _readValueToProps<K extends string>(value: number | Record<K, number>, props: K[]): Record<K, number>;
export function _readValueToProps<K extends string, T extends string>(value: number | Record<K & T, number>, props: Record<T, K>): Record<T, number>;
export function _readValueToProps(value: number | Record<string, number>, props: string[] | Record<string, string>) {
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
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left)
 * @since 3.0.0
 */
export function toTRBL(value: number | TRBL | Point) {
  return _readValueToProps(value, {top: 'y', right: 'x', bottom: 'y', left: 'x'});
}

/**
 * Converts the given value into a TRBL corners object (similar with css border-radius).
 * @param value - If a number, set the value to all TRBL corner components,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 * @returns The TRBL corner values (topLeft, topRight, bottomLeft, bottomRight)
 * @since 3.0.0
 */
export function toTRBLCorners(value: number | TRBLCorners) {
  return _readValueToProps(value, ['topLeft', 'topRight', 'bottomLeft', 'bottomRight']);
}

/**
 * Converts the given value into a padding object with pre-computed width/height.
 * @param value - If a number, set the value to all TRBL component,
 *  else, if an object, use defined properties and sets undefined ones to 0.
 *  x / y are shorthands for same value for left/right and top/bottom.
 * @returns The padding values (top, right, bottom, left, width, height)
 * @since 2.7.0
 */
export function toPadding(value?: number | TRBL): ChartArea {
  const obj = toTRBL(value) as ChartArea;

  obj.width = obj.left + obj.right;
  obj.height = obj.top + obj.bottom;

  return obj;
}

export interface CanvasFontSpec extends FontSpec {
  string: string;
}

/**
 * Parses font options and returns the font object.
 * @param options - A object that contains font options to be parsed.
 * @param fallback - A object that contains fallback font options.
 * @return The font object.
 * @private
 */

export function toFont(options: Partial<FontSpec>, fallback?: Partial<FontSpec>) {
  options = options || {};
  fallback = fallback || defaults.font as FontSpec;

  let size = valueOrDefault(options.size, fallback.size);

  if (typeof size === 'string') {
    size = parseInt(size, 10);
  }
  let style = valueOrDefault(options.style, fallback.style);
  if (style && !('' + style).match(FONT_STYLE)) {
    console.warn('Invalid font style specified: "' + style + '"');
    style = undefined;
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
 * @param inputs - An array of values, falling back to the last value.
 * @param context - If defined and the current value is a function, the value
 * is called with `context` as first argument and the result becomes the new input.
 * @param index - If defined and the current value is an array, the value
 * at `index` become the new input.
 * @param info - object to return information about resolution in
 * @param info.cacheable - Will be set to `false` if option is not cacheable.
 * @since 2.7.0
 */
export function resolve(inputs: Array<unknown>, context?: object, index?: number, info?: { cacheable: boolean }) {
  let cacheable = true;
  let i: number, ilen: number, value: unknown;

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
 * @param minmax
 * @param grace
 * @param beginAtZero
 * @private
 */
export function _addGrace(minmax: { min: number; max: number; }, grace: number | string, beginAtZero: boolean) {
  const {min, max} = minmax;
  const change = toDimension(grace, (max - min) / 2);
  const keepZero = (value: number, add: number) => beginAtZero && value === 0 ? 0 : value + add;
  return {
    min: keepZero(min, -Math.abs(change)),
    max: keepZero(max, change)
  };
}

/**
 * Create a context inheriting parentContext
 * @param parentContext
 * @param context
 * @returns
 */
export function createContext<T extends object>(parentContext: null, context: T): T;
export function createContext<T extends object, P extends T>(parentContext: P, context: T): P & T;
export function createContext(parentContext: object, context: object) {
  return Object.assign(Object.create(parentContext), context);
}
