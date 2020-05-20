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
