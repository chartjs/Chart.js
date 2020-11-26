export function fontString(pixelSize, fontStyle, fontFamily) {
	return fontStyle + ' ' + pixelSize + 'px ' + fontFamily;
}

/**
* Request animation polyfill
*/
export const requestAnimFrame = (function() {
	if (typeof window === 'undefined') {
		return function(callback) {
			return callback();
		};
	}
	return window.requestAnimationFrame;
}());

/**
 * Throttles calling `fn` once per animation frame
 * Latest argments are used on the actual call
 * @param {function} fn
 * @param {*} thisArg
 * @param {function} [updateFn]
 */
export function throttled(fn, thisArg, updateFn) {
	const updateArgs = updateFn || ((args) => Array.prototype.slice.call(args));
	let ticking = false;
	let args = [];

	return function(...rest) {
		args = updateArgs(rest);

		if (!ticking) {
			ticking = true;
			requestAnimFrame.call(window, () => {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}


/**
 * Converts 'start' to 'left', 'end' to 'right' and others to 'center'
 * @param {string} align start, end, center
 * @private
 */
export const _toLeftRightCenter = (align) => align === 'start' ? 'left' : align === 'end' ? 'right' : 'center';

/**
 * Returns `start`, `end` or `(start + end) / 2` depending on `align`
 * @param {string} align start, end, center
 * @param {number} start value for start
 * @param {number} end value for end
 * @private
 */
export const _alignStartEnd = (align, start, end) => align === 'start' ? start : align === 'end' ? end : (start + end) / 2;
