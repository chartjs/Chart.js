/**
 * @namespace Chart.helpers
 */

import type {AnyObject} from '../types/basic.js';
import type {ActiveDataPoint, ChartEvent} from '../types/index.js';

/**
 * An empty function that can be used, for example, for optional callback.
 */
export function noop() {
  /* noop */
}

/**
 * Returns a unique id, sequentially generated from a global variable.
 */
export const uid = (() => {
  let id = 0;
  return () => id++;
})();

/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
export function isNullOrUndef(value: unknown): value is null | undefined {
  return value === null || typeof value === 'undefined';
}

/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param value - The value to test.
 * @function
 */
export function isArray<T = unknown>(value: unknown): value is T[] {
  if (Array.isArray && Array.isArray(value)) {
    return true;
  }
  const type = Object.prototype.toString.call(value);
  if (type.slice(0, 7) === '[object' && type.slice(-6) === 'Array]') {
    return true;
  }
  return false;
}

/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param value - The value to test.
 * @since 2.7.0
 */
export function isObject(value: unknown): value is AnyObject {
  return value !== null && Object.prototype.toString.call(value) === '[object Object]';
}

/**
 * Returns true if `value` is a finite number, else returns false
 * @param value  - The value to test.
 */
function isNumberFinite(value: unknown): value is number {
  return (typeof value === 'number' || value instanceof Number) && isFinite(+value);
}
export {
  isNumberFinite as isFinite,
};

/**
 * Returns `value` if finite, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is not finite.
 */
export function finiteOrDefault(value: unknown, defaultValue: number) {
  return isNumberFinite(value) ? value : defaultValue;
}

/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param value - The value to return if defined.
 * @param defaultValue - The value to return if `value` is undefined.
 */
export function valueOrDefault<T>(value: T | undefined, defaultValue: T) {
  return typeof value === 'undefined' ? defaultValue : value;
}

export const toPercentage = (value: number | string, dimension: number) =>
  typeof value === 'string' && value.endsWith('%') ?
    parseFloat(value) / 100
    : +value / dimension;

export const toDimension = (value: number | string, dimension: number) =>
  typeof value === 'string' && value.endsWith('%') ?
    parseFloat(value) / 100 * dimension
    : +value;

/**
 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
 * @param fn - The function to call.
 * @param args - The arguments with which `fn` should be called.
 * @param [thisArg] - The value of `this` provided for the call to `fn`.
 */
export function callback<T extends (this: TA, ...restArgs: unknown[]) => R, TA, R>(
  fn: T | undefined,
  args: unknown[],
  thisArg?: TA
): R | undefined {
  if (fn && typeof fn.call === 'function') {
    return fn.apply(thisArg, args);
  }
}

/**
 * Note(SB) for performance sake, this method should only be used when loopable type
 * is unknown or in none intensive code (not called often and small loopable). Else
 * it's preferable to use a regular for() loop and save extra function calls.
 * @param loopable - The object or array to be iterated.
 * @param fn - The function to call for each item.
 * @param [thisArg] - The value of `this` provided for the call to `fn`.
 * @param [reverse] - If true, iterates backward on the loopable.
 */
export function each<T, TA>(
  loopable: Record<string, T>,
  fn: (this: TA, v: T, i: string) => void,
  thisArg?: TA,
  reverse?: boolean
): void;
export function each<T, TA>(
  loopable: T[],
  fn: (this: TA, v: T, i: number) => void,
  thisArg?: TA,
  reverse?: boolean
): void;
export function each<T, TA>(
  loopable: T[] | Record<string, T>,
  fn: (this: TA, v: T, i: any) => void,
  thisArg?: TA,
  reverse?: boolean
) {
  let i: number, len: number, keys: string[];
  if (isArray(loopable)) {
    len = loopable.length;
    if (reverse) {
      for (i = len - 1; i >= 0; i--) {
        fn.call(thisArg, loopable[i], i);
      }
    } else {
      for (i = 0; i < len; i++) {
        fn.call(thisArg, loopable[i], i);
      }
    }
  } else if (isObject(loopable)) {
    keys = Object.keys(loopable);
    len = keys.length;
    for (i = 0; i < len; i++) {
      fn.call(thisArg, loopable[keys[i]], keys[i]);
    }
  }
}

/**
 * Returns true if the `a0` and `a1` arrays have the same content, else returns false.
 * @param a0 - The array to compare
 * @param a1 - The array to compare
 * @private
 */
export function _elementsEqual(a0: ActiveDataPoint[], a1: ActiveDataPoint[]) {
  let i: number, ilen: number, v0: ActiveDataPoint, v1: ActiveDataPoint;

  if (!a0 || !a1 || a0.length !== a1.length) {
    return false;
  }

  for (i = 0, ilen = a0.length; i < ilen; ++i) {
    v0 = a0[i];
    v1 = a1[i];

    if (v0.datasetIndex !== v1.datasetIndex || v0.index !== v1.index) {
      return false;
    }
  }

  return true;
}

/**
 * Returns a deep copy of `source` without keeping references on objects and arrays.
 * @param source - The value to clone.
 */
export function clone<T>(source: T): T {
  if (isArray(source)) {
    return source.map(clone) as unknown as T;
  }

  if (isObject(source)) {
    const target = Object.create(null);
    const keys = Object.keys(source);
    const klen = keys.length;
    let k = 0;

    for (; k < klen; ++k) {
      target[keys[k]] = clone(source[keys[k]]);
    }

    return target;
  }

  return source;
}

function isValidKey(key: string) {
  return ['__proto__', 'prototype', 'constructor'].indexOf(key) === -1;
}

/**
 * The default merger when Chart.helpers.merge is called without merger option.
 * Note(SB): also used by mergeConfig and mergeScaleConfig as fallback.
 * @private
 */
export function _merger(key: string, target: AnyObject, source: AnyObject, options: AnyObject) {
  if (!isValidKey(key)) {
    return;
  }

  const tval = target[key];
  const sval = source[key];

  if (isObject(tval) && isObject(sval)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    merge(tval, sval, options);
  } else {
    target[key] = clone(sval);
  }
}

export interface MergeOptions {
  merger?: (key: string, target: AnyObject, source: AnyObject, options?: AnyObject) => void;
}

/**
 * Recursively deep copies `source` properties into `target` with the given `options`.
 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
 * @param target - The target object in which all sources are merged into.
 * @param source - Object(s) to merge into `target`.
 * @param [options] - Merging options:
 * @param [options.merger] - The merge method (key, target, source, options)
 * @returns The `target` object.
 */
export function merge<T>(target: T, source: [], options?: MergeOptions): T;
export function merge<T, S1>(target: T, source: S1, options?: MergeOptions): T & S1;
export function merge<T, S1>(target: T, source: [S1], options?: MergeOptions): T & S1;
export function merge<T, S1, S2>(target: T, source: [S1, S2], options?: MergeOptions): T & S1 & S2;
export function merge<T, S1, S2, S3>(target: T, source: [S1, S2, S3], options?: MergeOptions): T & S1 & S2 & S3;
export function merge<T, S1, S2, S3, S4>(
  target: T,
  source: [S1, S2, S3, S4],
  options?: MergeOptions
): T & S1 & S2 & S3 & S4;
export function merge<T>(target: T, source: AnyObject[], options?: MergeOptions): AnyObject;
export function merge<T>(target: T, source: AnyObject[], options?: MergeOptions): AnyObject {
  const sources = isArray(source) ? source : [source];
  const ilen = sources.length;

  if (!isObject(target)) {
    return target as AnyObject;
  }

  options = options || {};
  const merger = options.merger || _merger;
  let current: AnyObject;

  for (let i = 0; i < ilen; ++i) {
    current = sources[i];
    if (!isObject(current)) {
      continue;
    }

    const keys = Object.keys(current);
    for (let k = 0, klen = keys.length; k < klen; ++k) {
      merger(keys[k], target, current, options as AnyObject);
    }
  }

  return target;
}

/**
 * Recursively deep copies `source` properties into `target` *only* if not defined in target.
 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
 * @param target - The target object in which all sources are merged into.
 * @param source - Object(s) to merge into `target`.
 * @returns The `target` object.
 */
export function mergeIf<T>(target: T, source: []): T;
export function mergeIf<T, S1>(target: T, source: S1): T & S1;
export function mergeIf<T, S1>(target: T, source: [S1]): T & S1;
export function mergeIf<T, S1, S2>(target: T, source: [S1, S2]): T & S1 & S2;
export function mergeIf<T, S1, S2, S3>(target: T, source: [S1, S2, S3]): T & S1 & S2 & S3;
export function mergeIf<T, S1, S2, S3, S4>(target: T, source: [S1, S2, S3, S4]): T & S1 & S2 & S3 & S4;
export function mergeIf<T>(target: T, source: AnyObject[]): AnyObject;
export function mergeIf<T>(target: T, source: AnyObject[]): AnyObject {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return merge<T>(target, source, {merger: _mergerIf});
}

/**
 * Merges source[key] in target[key] only if target[key] is undefined.
 * @private
 */
export function _mergerIf(key: string, target: AnyObject, source: AnyObject) {
  if (!isValidKey(key)) {
    return;
  }

  const tval = target[key];
  const sval = source[key];

  if (isObject(tval) && isObject(sval)) {
    mergeIf(tval, sval);
  } else if (!Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = clone(sval);
  }
}

/**
 * @private
 */
export function _deprecated(scope: string, value: unknown, previous: string, current: string) {
  if (value !== undefined) {
    console.warn(scope + ': "' + previous +
      '" is deprecated. Please use "' + current + '" instead');
  }
}

// resolveObjectKey resolver cache
const keyResolvers = {
  // Chart.helpers.core resolveObjectKey should resolve empty key to root object
  '': v => v,
  // default resolvers
  x: o => o.x,
  y: o => o.y
};

/**
 * @private
 */
export function _splitKey(key: string) {
  const parts = key.split('.');
  const keys: string[] = [];
  let tmp = '';
  for (const part of parts) {
    tmp += part;
    if (tmp.endsWith('\\')) {
      tmp = tmp.slice(0, -1) + '.';
    } else {
      keys.push(tmp);
      tmp = '';
    }
  }
  return keys;
}

function _getKeyResolver(key: string) {
  const keys = _splitKey(key);
  return obj => {
    for (const k of keys) {
      if (k === '') {
        // For backward compatibility:
        // Chart.helpers.core resolveObjectKey should break at empty key
        break;
      }
      obj = obj && obj[k];
    }
    return obj;
  };
}

export function resolveObjectKey(obj: AnyObject, key: string): AnyObject {
  const resolver = keyResolvers[key] || (keyResolvers[key] = _getKeyResolver(key));
  return resolver(obj);
}

/**
 * @private
 */
export function _capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


export const defined = (value: unknown) => typeof value !== 'undefined';

export const isFunction = (value: unknown): value is (...args: any[]) => any => typeof value === 'function';

// Adapted from https://stackoverflow.com/questions/31128855/comparing-ecma6-sets-for-equality#31129384
export const setsEqual = <T>(a: Set<T>, b: Set<T>) => {
  if (a.size !== b.size) {
    return false;
  }

  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }

  return true;
};

/**
 * @param e - The event
 * @private
 */
export function _isClickEvent(e: ChartEvent) {
  return e.type === 'mouseup' || e.type === 'click' || e.type === 'contextmenu';
}
