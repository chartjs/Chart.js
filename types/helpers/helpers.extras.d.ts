export function fontString(pixelSize: number, fontStyle: string, fontFamily: string): string;

/**
 * Request animation polyfill
 */
export function requestAnimFrame(cb: () => void): void;

/**
 * Throttles calling `fn` once per animation frame
 * Latest argments are used on the actual call
 * @param {function} fn
 * @param {*} thisArg
 * @param {function} [updateFn]
 */
export function throttled(fn: (...args: any[]) => void, thisArg: any, updateFn?: (...args: any[]) => any[]): (...args: any[]) => void;

/**
 * Debounces calling `fn` for `delay` ms
 * @param {function} fn - Function to call. No arguments are passed.
 * @param {number} delay - Delay in ms. 0 = immediate invocation.
 * @returns {function}
 */
export function debounce(fn: () => void, delay: number): () => number;
