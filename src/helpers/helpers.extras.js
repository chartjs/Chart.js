export function fontString(pixelSize, fontStyle, fontFamily) {
	return `${fontStyle} ${pixelSize}px ${fontFamily}`;
}

/**
* Request animation polyfill
*/
export const requestAnimFrame = (function() {
	if(typeof window === 'undefined') {
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
	const updateArgs = updateFn || ((args) => Reflect.apply(Array.prototype.slice, args, []));
	let ticking = false;
	let args = [];

	return function(...rest) {
		args = updateArgs(rest);

		if(!ticking) {
			ticking = true;
			Reflect.apply(requestAnimFrame, window, [() => {
				ticking = false;
				Reflect.apply(fn, thisArg, args);
			}]);
		}
	};
}
