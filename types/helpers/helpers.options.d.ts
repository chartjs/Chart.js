import { TRBL, TRBLCorners } from '../geometric';
import { FontSpec } from '../index.esm';

export interface CanvasFontSpec extends FontSpec {
	string: string;
}
/**
 * Parses font options and returns the font object.
 * @param {object} options - A object that contains font options to be parsed.
 * @return {object} The font object.
 */
export function toFont(options: Partial<FontSpec>): CanvasFontSpec;

/**
 * Converts the given line height `value` in pixels for a specific font `size`.
 * @param {number|string} value - The lineHeight to parse (eg. 1.6, '14px', '75%', '1.6em').
 * @param {number} size - The font size (in pixels) used to resolve relative `value`.
 * @returns {number} The effective line height in pixels (size * 1.2 if value is invalid).
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
 * @since 2.7.0
 */
export function toLineHeight(value: string, size: number): number;

export function toTRBL(value: number | Partial<TRBL>): TRBL;
export function toTRBLCorners(value: number | Partial<TRBLCorners>): TRBLCorners;

/**
 * Converts the given value into a padding object with pre-computed width/height.
 * @param {number|object} value - If a number, set the value to all TRBL component;
 *  else, if an object, use defined properties and sets undefined ones to 0.
 * @returns {object} The padding values (top, right, bottom, left, width, height)
 * @since 2.7.0
 */
export function toPadding(
  value?: number | { top?: number; left?: number; right?: number; bottom?: number; x?:number, y?: number }
): { top: number; left: number; right: number; bottom: number; width: number; height: number };

/**
 * Evaluates the given `inputs` sequentially and returns the first defined value.
 * @param inputs - An array of values, falling back to the last value.
 * @param [context] - If defined and the current value is a function, the value
 * is called with `context` as first argument and the result becomes the new input.
 * @param [index] - If defined and the current value is an array, the value
 * at `index` become the new input.
 * @param [info] - object to return information about resolution in
 * @param [info.cacheable] - Will be set to `false` if option is not cacheable.
 * @since 2.7.0
 */
export function resolve<T, C>(
	inputs: undefined | T | ((c: C) => T) | readonly T[],
	context?: C,
	index?: number,
	info?: { cacheable?: boolean }
): T | undefined;


/**
 * Create a context inheriting parentContext
 * @since 3.6.0
 */
export function createContext<P, T>(parentContext: P, context: T): P extends null ? T : P & T;
