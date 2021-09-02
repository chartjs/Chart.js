import { AnyObject } from '../basic';

/**
 * An empty function that can be used, for example, for optional callback.
 */
export function noop(): void;

/**
 * Returns a unique id, sequentially generated from a global variable.
 * @returns {number}
 * @function
 */
export function uid(): number;
/**
 * Returns true if `value` is neither null nor undefined, else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @since 2.7.0
 */
export function isNullOrUndef(value: unknown): value is null | undefined;
/**
 * Returns true if `value` is an array (including typed arrays), else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @function
 */
export function isArray<T = unknown>(value: unknown): value is ArrayLike<T>;
/**
 * Returns true if `value` is an object (excluding null), else returns false.
 * @param {*} value - The value to test.
 * @returns {boolean}
 * @since 2.7.0
 */
export function isObject(value: unknown): value is AnyObject;
/**
 * Returns true if `value` is a finite number, else returns false
 * @param {*} value - The value to test.
 * @returns {boolean}
 */
export function isFinite(value: unknown): value is number;

/**
 * Returns `value` if finite, else returns `defaultValue`.
 * @param {*} value - The value to return if defined.
 * @param {*} defaultValue - The value to return if `value` is not finite.
 * @returns {*}
 */
export function finiteOrDefault(value: unknown, defaultValue: number): number;

/**
 * Returns `value` if defined, else returns `defaultValue`.
 * @param {*} value - The value to return if defined.
 * @param {*} defaultValue - The value to return if `value` is undefined.
 * @returns {*}
 */
export function valueOrDefault<T>(value: T | undefined, defaultValue: T): T;

export function toPercentage(value: number | string, dimesion: number): number;
export function toDimension(value: number | string, dimension: number): number;

/**
 * Calls `fn` with the given `args` in the scope defined by `thisArg` and returns the
 * value returned by `fn`. If `fn` is not a function, this method returns undefined.
 * @param fn - The function to call.
 * @param args - The arguments with which `fn` should be called.
 * @param [thisArg] - The value of `this` provided for the call to `fn`.
 * @returns {*}
 */
export function callback<T extends (this: TA, ...args: unknown[]) => R, TA, R>(
	fn: T | undefined,
	args: unknown[],
	thisArg?: TA
): R | undefined;

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
	loopable: T[],
	fn: (this: TA, v: T, i: number) => void,
	thisArg?: TA,
	reverse?: boolean
): void;
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
	loopable: { [key: string]: T },
	fn: (this: TA, v: T, k: string) => void,
	thisArg?: TA,
	reverse?: boolean
): void;

/**
 * Returns a deep copy of `source` without keeping references on objects and arrays.
 * @param source - The value to clone.
 */
export function clone<T>(source: T): T;

export interface MergeOptions {
	merger?: (key: string, target: AnyObject, source: AnyObject, options: AnyObject) => AnyObject;
}
/**
 * Recursively deep copies `source` properties into `target` with the given `options`.
 * IMPORTANT: `target` is not cloned and will be updated with `source` properties.
 * @param target - The target object in which all sources are merged into.
 * @param source - Object(s) to merge into `target`.
 * @param {object} [options] - Merging options:
 * @param {function} [options.merger] - The merge method (key, target, source, options)
 * @returns {object} The `target` object.
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

export function resolveObjectKey(obj: AnyObject, key: string): AnyObject;

export function defined(value: unknown): boolean;

export function isFunction(value: unknown): boolean;

export function setsEqual(a: Set<unknown>, b: Set<unknown>): boolean;
