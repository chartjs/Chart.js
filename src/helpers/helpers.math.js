'use strict';

/**
 * @alias Chart.helpers.math
 * @namespace
 */
/**
 * Returns an array of factors sorted from 1 to sqrt(value)
 * @private
 */
export function _factorize(value) {
	var result = [];
	var sqrt = Math.sqrt(value);
	var i;

	for (i = 1; i < sqrt; i++) {
		if (value % i === 0) {
			result.push(i);
			result.push(value / i);
		}
	}
	if (sqrt === (sqrt | 0)) { // if value is a square number
		result.push(sqrt);
	}

	result.sort(function(a, b) {
		return a - b;
	}).pop();
	return result;
}

export const log10 = Math.log10 || function(x) {
	var exponent = Math.log(x) * Math.LOG10E; // Math.LOG10E = 1 / Math.LN10.
	// Check for whole powers of 10,
	// which due to floating point rounding error should be corrected.
	var powerOf10 = Math.round(exponent);
	var isPowerOf10 = x === Math.pow(10, powerOf10);

	return isPowerOf10 ? powerOf10 : exponent;
};
