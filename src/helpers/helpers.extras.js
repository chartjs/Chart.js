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
 */
export function throttled(fn, thisArg) {
	let ticking = false;
	let args = [];

	return function(...rest) {
		args = Array.prototype.slice.call(rest);

		if (!ticking) {
			ticking = true;
			requestAnimFrame.call(window, () => {
				ticking = false;
				fn.apply(thisArg, args);
			});
		}
	};
}
