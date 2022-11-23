import {_capitalize} from './helpers.core.js';

/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param value - value to find
 * @param cmp
 * @private
 */
export function _lookup(
  table: number[],
  value: number,
  cmp?: (value: number) => boolean
): {lo: number, hi: number};
export function _lookup<T>(
  table: T[],
  value: number,
  cmp: (value: number) => boolean
): {lo: number, hi: number};
export function _lookup(
  table: unknown[],
  value: number,
  cmp?: (value: number) => boolean
) {
  cmp = cmp || ((index) => table[index] < value);
  let hi = table.length - 1;
  let lo = 0;
  let mid: number;

  while (hi - lo > 1) {
    mid = (lo + hi) >> 1;
    if (cmp(mid)) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  return {lo, hi};
}

/**
 * Binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @param last - lookup last index
 * @private
 */
export const _lookupByKey = (
  table: Record<string, number>[],
  key: string,
  value: number,
  last?: boolean
) =>
  _lookup(table, value, last
    ? index => {
      const ti = table[index][key];
      return ti < value || ti === value && table[index + 1][key] === value;
    }
    : index => table[index][key] < value);

/**
 * Reverse binary search
 * @param table - the table search. must be sorted!
 * @param key - property name for the value in each entry
 * @param value - value to find
 * @private
 */
export const _rlookupByKey = (
  table: Record<string, number>[],
  key: string,
  value: number
) =>
  _lookup(table, value, index => table[index][key] >= value);

/**
 * Return subset of `values` between `min` and `max` inclusive.
 * Values are assumed to be in sorted order.
 * @param values - sorted array of values
 * @param min - min value
 * @param max - max value
 */
export function _filterBetween(values: number[], min: number, max: number) {
  let start = 0;
  let end = values.length;

  while (start < end && values[start] < min) {
    start++;
  }
  while (end > start && values[end - 1] > max) {
    end--;
  }

  return start > 0 || end < values.length
    ? values.slice(start, end)
    : values;
}

const arrayEvents = ['push', 'pop', 'shift', 'splice', 'unshift'] as const;

export interface ArrayListener<T> {
  _onDataPush?(...item: T[]): void;
  _onDataPop?(): void;
  _onDataShift?(): void;
  _onDataSplice?(index: number, deleteCount: number, ...items: T[]): void;
  _onDataUnshift?(...item: T[]): void;
}

/**
 * Hooks the array methods that add or remove values ('push', pop', 'shift', 'splice',
 * 'unshift') and notify the listener AFTER the array has been altered. Listeners are
 * called on the '_onData*' callbacks (e.g. _onDataPush, etc.) with same arguments.
 */
export function listenArrayEvents<T>(array: T[], listener: ArrayListener<T>): void;
export function listenArrayEvents(array, listener) {
  if (array._chartjs) {
    array._chartjs.listeners.push(listener);
    return;
  }

  Object.defineProperty(array, '_chartjs', {
    configurable: true,
    enumerable: false,
    value: {
      listeners: [listener]
    }
  });

  arrayEvents.forEach((key) => {
    const method = '_onData' + _capitalize(key);
    const base = array[key];

    Object.defineProperty(array, key, {
      configurable: true,
      enumerable: false,
      value(...args) {
        const res = base.apply(this, args);

        array._chartjs.listeners.forEach((object) => {
          if (typeof object[method] === 'function') {
            object[method](...args);
          }
        });

        return res;
      }
    });
  });
}


/**
 * Removes the given array event listener and cleanup extra attached properties (such as
 * the _chartjs stub and overridden methods) if array doesn't have any more listeners.
 */
export function unlistenArrayEvents<T>(array: T[], listener: ArrayListener<T>): void;
export function unlistenArrayEvents(array, listener) {
  const stub = array._chartjs;
  if (!stub) {
    return;
  }

  const listeners = stub.listeners;
  const index = listeners.indexOf(listener);
  if (index !== -1) {
    listeners.splice(index, 1);
  }

  if (listeners.length > 0) {
    return;
  }

  arrayEvents.forEach((key) => {
    delete array[key];
  });

  delete array._chartjs;
}

/**
 * @param items
 */
export function _arrayUnique<T>(items: T[]) {
  const set = new Set<T>();
  let i: number, ilen: number;

  for (i = 0, ilen = items.length; i < ilen; ++i) {
    set.add(items[i]);
  }

  if (set.size === ilen) {
    return items;
  }

  return Array.from(set);
}
