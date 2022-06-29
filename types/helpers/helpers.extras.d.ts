export function fontString(pixelSize: number, fontStyle: string, fontFamily: string): string;

/**
 * Request animation polyfill
 */
export function requestAnimFrame(cb: () => void): void;

/**
 * Throttles calling `fn` once per animation frame
 * Latest arguments are used on the actual call
 * @param {function} fn
 * @param {*} thisArg
 * @param {function} [updateFn]
 */
export function throttled(fn: (...args: unknown[]) => void, thisArg: unknown, updateFn?: (...args: unknown[]) => unknown[]): (...args: unknown[]) => void;

/**
 * Debounces calling `fn` for `delay` ms
 * @param {function} fn - Function to call. No arguments are passed.
 * @param {number} delay - Delay in ms. 0 = immediate invocation.
 * @returns {function}
 */
export function debounce(fn: () => void, delay: number): () => number;

/**
 * Return start and count of visible points.
 * @param {object} meta - dataset meta.
 * @param {array} points - array of point elements.
 * @param {boolean} animationsDisabled - if true animation is disabled.
 * @returns {{start: number; count: number}}
 */
export function getStartAndCountOfVisiblePoints(meta?: unknown, points?: unknown[], animationsDisabled?: boolean): {start: number; count: number};

/**
 * Checks if the scale ranges have changed.
 * @param {object} meta - dataset meta.
 * @returns {boolean}
 */
export function scaleRangesChanged(meta?: unknown): boolean;
